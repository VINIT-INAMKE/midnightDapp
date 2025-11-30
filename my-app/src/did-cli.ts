import "dotenv/config";
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { setNetworkId, NetworkId, getZswapNetworkId, getLedgerNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import { encodeCoinPublicKey, decodeCoinPublicKey } from "@midnight-ntwrk/compact-runtime";
import { Transaction } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import { WebSocket } from "ws";
import { MidnightProviders } from './providers/midnight-providers.js';
import { EnvironmentManager } from './utils/environment.js';
import * as bip39 from 'bip39';
import * as crypto from 'crypto';
import chalk from 'chalk';
import * as fs from 'fs';
import * as Rx from 'rxjs';

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

interface OracleWitness {
    student_credential: {
        id: string;
        is_eligible: boolean;
        salt: string;
    };
    issuer_signature: string;
}

class DIDCli {
    private providers: any;
    private adminWallet: Wallet | undefined;  // For admin operations
    private userWallet: Wallet | undefined;   // Single user wallet
    private contract: any;

    async initialize() {
        console.log(chalk.blue('🌙 Initializing DID CLI...'));

        // Configure network
        setNetworkId(NetworkId.TestNet);
        const networkConfig = EnvironmentManager.getNetworkConfig();

        // Setup admin wallet (from deployment seed)
        const adminSeed = process.env.WALLET_SEED;
        if (!adminSeed) {
            throw new Error('WALLET_SEED environment variable not set');
        }

        this.adminWallet = await this.createWallet(adminSeed);

        // Generate single user wallet for testing
        const userSeed = crypto.randomBytes(32).toString('hex');
        this.userWallet = await this.createWallet(userSeed);

        // Start wallets and wait for sync with funds
        console.log(chalk.gray('🔄 Starting and syncing wallets...'));
        (this.adminWallet as any).start();
        (this.userWallet as any).start();

        // Wait for admin wallet to sync and have funds
        await this.waitForFunds(this.adminWallet);
        console.log(chalk.gray('✅ Admin wallet synced and funded'));

        // Setup contract - try to load existing deployment
        try {
            // Try to load contract address from deployment.json or env
            let contractAddress = process.env.CONTRACT_ADDRESS;

            // If not in env, try deployment.json
            if (!contractAddress && fs.existsSync('./deployment.json')) {
                const deploymentData = JSON.parse(fs.readFileSync('./deployment.json', 'utf8'));
                contractAddress = deploymentData.contractAddress;
            }

            if (!contractAddress) {
                console.log(chalk.yellow('⚠️ No contract address found. Deploy contract first with: npm run deploy'));
                process.exit(1);
            }

            // Create wallet provider for admin wallet (we'll use this for contract calls)
            const adminState = await this.getWalletState(this.adminWallet!);
            const walletProvider = {
                coinPublicKey: adminState.coinPublicKey,
                encryptionPublicKey: adminState.encryptionPublicKey,
                balanceTx: (tx: any, newCoins: any) => {
                    return this.adminWallet!
                        .balanceTransaction(
                            ZswapTransaction.deserialize(
                                tx.serialize(getLedgerNetworkId()),
                                getZswapNetworkId()
                            ),
                            newCoins
                        )
                        .then((tx) => this.adminWallet!.proveTransaction(tx))
                        .then((zswapTx) =>
                            Transaction.deserialize(
                                zswapTx.serialize(getZswapNetworkId()),
                                getLedgerNetworkId()
                            )
                        )
                        .then(createBalancedTx);
                },
                submitTx: (tx: any) => {
                    return this.adminWallet!.submitTransaction(tx);
                },
            };

            // Setup providers
            this.providers = MidnightProviders.create({
                contractName: "uidai-auth",
                walletProvider,
                networkConfig,
            });

            // Load contract
            const contractModule = await import('../contracts/managed/uidai-auth/contract/index.cjs');
            console.log(chalk.gray('Contract module keys:', Object.keys(contractModule)));

            const Contract = contractModule.Contract || contractModule.default?.Contract || contractModule.default;
            console.log(chalk.gray('Contract constructor:', typeof Contract));

            // Use findDeployedContract to get a properly connected contract with callTx methods
            const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts');

            this.contract = await findDeployedContract(this.providers, {
                contractAddress,
                contract: new Contract({}),
                privateStateId: 'uidaiAuthState',
                initialPrivateState: {}
            });

            console.log(chalk.gray('Contract instance methods:', Object.getOwnPropertyNames(this.contract)));
            console.log(chalk.gray('Contract callTx methods:', Object.keys((this.contract as any).callTx || {})));

            // Get wallet addresses for display
            const userState = await this.getWalletState(this.userWallet!);

            console.log(chalk.green('✅ DID CLI initialized'));
            console.log(chalk.cyan(`📍 Contract: ${contractAddress}`));
            console.log(chalk.cyan(`👑 Admin Wallet: ${adminState.address}`));
            console.log(chalk.cyan(`👤 User Wallet: ${userState.address}`));
            console.log(chalk.gray(`🔑 User Seed: ${userSeed}`));

        } catch (error) {
            console.error(chalk.red('❌ Failed to load contract. Compile and deploy first:'));
            console.error(chalk.gray('npm run compile && npm run deploy'));
            throw error;
        }
    }

    private async createWallet(seed: string): Promise<Wallet> {
        const networkConfig = EnvironmentManager.getNetworkConfig();

        return await WalletBuilder.buildFromSeed(
            networkConfig.indexer,
            networkConfig.indexerWS,
            networkConfig.proofServer,
            networkConfig.node,
            seed,
            getZswapNetworkId(),
            "info"
        );
    }

    private async getWalletState(wallet: Wallet) {
        return await Rx.firstValueFrom(wallet.state());
    }

    private async getWalletAddress(wallet: Wallet): Promise<string> {
        const state = await this.getWalletState(wallet);
        return state.address;
    }

    private async waitForFunds(wallet: Wallet): Promise<void> {
        const nativeToken = (await import('@midnight-ntwrk/ledger')).nativeToken;
        await Rx.firstValueFrom(
            wallet.state().pipe(
                Rx.tap((state) => {
                    if (state.syncProgress && !state.syncProgress.synced) {
                        console.log(chalk.gray(`   Sync: synced=${state.syncProgress.synced}, gap=${state.syncProgress.lag.applyGap}`));
                    }
                }),
                Rx.filter((state) => state.syncProgress?.synced === true),
                Rx.filter((state) => (state.balances[nativeToken()] ?? 0n) > 0n)
            )
        );
    }

    // Use real oracle witness
    private getRealOracleWitness(useRandomSalt: boolean = false): OracleWitness {
        console.log(chalk.gray(`🔗 Using real oracle witness data ${useRandomSalt ? '(random salt)' : ''}`));

        // Generate random salt to avoid duplicate nullifiers
        const salt = useRandomSalt
            ? crypto.randomBytes(32).toString('hex')
            : "cfec3abb3451b79c42292aa72d635f919b943e8c14508cb2307b62083d39f24a";

        return {
            student_credential: {
                id: "775362598aacc4a1b1c23ae32bd79e43022f1c7981e2a9cd8cd80a68ccd538b4",
                is_eligible: true,
                salt: salt
            },
            issuer_signature: "f0dc765bd1295c1a31c11a89189142d0801bc8c495063c68d816a40dde18494b7b95bf8630ae157266cd55cbef0926ca5849e316c77c9367897af033f3341d0d"
        };
    }

    // Convert hex string to Bytes<32>
    private hexToBytes32(hex: string): Uint8Array {
        // Remove 0x prefix if present
        const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
        // Pad to 64 characters (32 bytes)
        const paddedHex = cleanHex.padEnd(64, '0');
        return Buffer.from(paddedHex, 'hex');
    }

    // Register a new DID for the user or admin
    async registerDID(witness?: OracleWitness, forAdmin: boolean = false, useRandomSalt: boolean = true): Promise<string> {
        if (!this.adminWallet || !this.userWallet || !this.contract) {
            throw new Error('CLI not initialized');
        }

        console.log(chalk.blue(`🔐 Registering new DID${forAdmin ? ' (Admin)' : ' (User)'}...`));

        // Use provided witness or use real oracle data
        const oracleWitness = witness || this.getRealOracleWitness(useRandomSalt);

        console.log(chalk.gray(`👤 Student ID: ${oracleWitness.student_credential.id.substring(0, 16)}...`));
        console.log(chalk.gray(`🔐 Salt: ${oracleWitness.student_credential.salt.substring(0, 16)}...`));
        console.log(chalk.gray(`✅ Eligible: ${oracleWitness.student_credential.is_eligible}`));

        // Choose wallet based on forAdmin flag
        const targetWallet = forAdmin ? this.adminWallet : this.userWallet;
        const targetAddress = await this.getWalletAddress(targetWallet);
        const targetState = await this.getWalletState(targetWallet);

        console.log(chalk.gray(`👛 ${forAdmin ? 'Admin' : 'User'} Wallet: ${targetAddress}`));
        console.log(chalk.gray(`👛 coinPublicKey: ${targetState.coinPublicKey}`));
        console.log(chalk.gray(`👛 encryptionPublicKey: ${targetState.encryptionPublicKey}`));

        // Generate a mock public key for verification (32 bytes raw key)
        const { publicKey } = crypto.generateKeyPairSync('ed25519');
        const publicKeyRaw = publicKey.export({ type: 'spki', format: 'der' });
        // Extract the 32-byte raw key from the DER format (last 32 bytes)
        const publicKeyBytes = publicKeyRaw.slice(-32);

        // Get wallet hash for DID registration
        const walletHash = crypto.createHash('sha256').update(targetState.coinPublicKey).digest('hex');
        console.log(chalk.gray(`🔍 Registration - Wallet hash: ${walletHash}`));

        // Prepare circuit inputs - register DID to the target wallet
        const circuitInputs = {
            student_id: this.hexToBytes32(oracleWitness.student_credential.id),
            salt: this.hexToBytes32(oracleWitness.student_credential.salt),
            is_eligible: oracleWitness.student_credential.is_eligible,
            wallet_address: this.hexToBytes32(walletHash), // Register to target wallet
            public_key: publicKeyBytes,
            is_owner_init: forAdmin   // Only set contract owner if registering for admin
        };

        try {
            console.log(chalk.gray('🚀 Submitting DID registration transaction...'));

            // contract.callTx.register() is a high-level API that:
            // 1. Creates the transaction
            // 2. Balances it (using the wallet provider configured in this.providers)
            // 3. Proves it
            // 4. Submits it
            // 5. Returns the completed transaction result
            // So we don't need to manually balance/prove/submit!
            const txResult = await (this.contract as any).callTx.register(
                circuitInputs.student_id,
                circuitInputs.salt,
                circuitInputs.is_eligible,
                circuitInputs.wallet_address,
                circuitInputs.public_key,
                circuitInputs.is_owner_init
            );

            // DEBUG: Print entire transaction result
            console.log(chalk.yellow('\n🐛 DEBUG: Complete txResult object:'));
            console.log(txResult);
            console.log(chalk.yellow('🐛 DEBUG: End\n'));


            // Extract transaction hash from the completed result
            const txHash = txResult.public?.txHash || txResult.public?.hash || 'unknown';

            // Extract the DID from txResult.private.result (Uint8Array)
            let didHex = 'unknown';
            if (txResult.private?.result) {
                didHex = Buffer.from(txResult.private.result).toString('hex');
            }

            console.log(chalk.green('🎉 DID Registration Successful!'));
            console.log(chalk.cyan(`📜 Transaction Hash: ${txHash}`));

            if (didHex !== 'unknown') {
                console.log(chalk.yellow(`🆔 New DID: ${didHex}`));
                console.log(chalk.gray(`   (Full DID URI: did:midnight:testnet:${didHex})`));
            } else {
                console.log(chalk.yellow('💡 To view your DID, use option 3 (Check Authentication)'));
            }

            if (forAdmin) {
                console.log(chalk.cyan(`👑 Registered to admin wallet (now contract owner)`));
            } else {
                console.log(chalk.cyan(`👤 Registered to user wallet`));
            }

            return txHash;
        } catch (error) {
            console.error(chalk.red('❌ Registration failed:'));

            if (error instanceof Error) {
                const errorMsg = error.message;

                if (errorMsg.includes('Identity already registered')) {
                    console.error(chalk.yellow('💡 Nullifier already on-chain.'));
                    console.error(chalk.yellow('   • Using random salt (should work)'));
                    console.error(chalk.yellow('   • Or deploy new contract'));
                } else if (errorMsg.includes('Wallet already has a DID')) {
                    console.error(chalk.yellow('💡 Each wallet can only have ONE DID.'));
                    console.error(chalk.yellow('   • Use different wallet OR revoke existing'));
                } else if (errorMsg.includes('banned')) {
                    console.error(chalk.yellow('💡 Identity banned by admin.'));
                } else {
                    console.error(chalk.red(errorMsg));
                }
            } else {
                console.error(chalk.red(String(error)));
            }

            throw error;
        }
    }

    // Ban an Aadhaar identity (admin only)
    async banIdentity(identityHash: string): Promise<void> {
        if (!this.adminWallet || !this.contract) {
            throw new Error('CLI not initialized');
        }

        console.log(chalk.blue(`🚫 Banning identity: ${identityHash.substring(0, 16)}...`));
        const adminAddress = await this.getWalletAddress(this.adminWallet);
        console.log(chalk.gray(`👑 Using admin wallet: ${adminAddress}`));

        try {
            const adminState = await this.getWalletState(this.adminWallet!);

            console.log(chalk.gray('� Creating ban transaction...'));
            const unprovenTx = await (this.contract as any).callTx.banIdentity(
                this.hexToBytes32(crypto.createHash('sha256').update(adminState.coinPublicKey).digest('hex')),
                this.hexToBytes32(identityHash)
            );

            console.log(chalk.gray('⚡ Proving transaction...'));
            const balancedTx = await this.providers.walletProvider.balanceTx(unprovenTx, []);

            console.log(chalk.gray('📤 Submitting to blockchain...'));
            const txHash = await this.providers.walletProvider.submitTx(balancedTx);

            console.log(chalk.green('✅ Identity banned successfully'));
            console.log(chalk.cyan(`📜 Transaction Hash: ${txHash}`));
        } catch (error) {
            console.error(chalk.red('❌ Ban failed:'), error);
            throw error;
        }
    }

    // Unban an Aadhaar identity (admin only)
    async unbanIdentity(identityHash: string): Promise<void> {
        if (!this.adminWallet || !this.contract) {
            throw new Error('CLI not initialized');
        }

        console.log(chalk.blue(`✅ Unbanning identity: ${identityHash.substring(0, 16)}...`));
        const adminAddress = await this.getWalletAddress(this.adminWallet);
        console.log(chalk.gray(`👑 Using admin wallet: ${adminAddress}`));

        try {
            const adminState = await this.getWalletState(this.adminWallet!);

            console.log(chalk.gray('� Creating unban transaction...'));
            const unprovenTx = await (this.contract as any).callTx.unbanIdentity(
                this.hexToBytes32(crypto.createHash('sha256').update(adminState.coinPublicKey).digest('hex')),
                this.hexToBytes32(identityHash)
            );

            console.log(chalk.gray('⚡ Proving transaction...'));
            const balancedTx = await this.providers.walletProvider.balanceTx(unprovenTx, []);

            console.log(chalk.gray('📤 Submitting to blockchain...'));
            const txHash = await this.providers.walletProvider.submitTx(balancedTx);

            console.log(chalk.green('✅ Identity unbanned successfully'));
            console.log(chalk.cyan(`📜 Transaction Hash: ${txHash}`));
        } catch (error) {
            console.error(chalk.red('❌ Unban failed:'), error);
            throw error;
        }
    }

    // Check if identity is banned
    async checkIdentityBan(identityHash: string): Promise<boolean> {
        if (!this.contract) {
            throw new Error('CLI not initialized');
        }

        console.log(chalk.blue(`🔍 Checking ban status: ${identityHash.substring(0, 16)}...`));

        try {
            const identityBytes = this.hexToBytes32(identityHash);
            const result = await (this.contract as any).callTx.isIdentityBanned(identityBytes);

            // Extract boolean result from circuit output
            // For circuits that return values, the result is in result.private.result
            const isBanned = result.private?.result?.[0] === 1 || result.private?.result === true;

            if (isBanned) {
                console.log(chalk.red('🚫 Identity is BANNED'));
            } else {
                console.log(chalk.green('✅ Identity is not banned'));
            }

            return isBanned;
        } catch (error) {
            console.error(chalk.red('❌ Ban check failed:'), error);
            throw error;
        }
    }

    // Check if DID exists
    async checkDIDExists(didId: string): Promise<boolean> {
        if (!this.contract) {
            throw new Error('CLI not initialized');
        }

        console.log(chalk.blue(`🔍 Checking if DID exists: ${didId.substring(0, 16)}...`));

        try {
            const result = await (this.contract as any).callTx.didExists(
                this.hexToBytes32(didId)
            );

            // Extract boolean result from circuit output
            // For circuits that return values, the result is in result.private.result
            const exists = result.private?.result?.[0] === 1 || result.private?.result === true;

            if (exists) {
                console.log(chalk.green('✅ DID exists in registry'));
            } else {
                console.log(chalk.red('❌ DID not found in registry'));
            }

            return exists;
        } catch (error) {
            console.error(chalk.red('❌ DID check failed:'), error);
            throw error;
        }
    }

    // Check if user wallet is authenticated (has DID)
    async checkAuthentication(): Promise<boolean> {
        if (!this.userWallet || !this.contract) {
            throw new Error('CLI not initialized');
        }

        console.log(chalk.blue('🔐 Checking user wallet authentication...'));
        const userAddress = await this.getWalletAddress(this.userWallet);
        console.log(chalk.gray(`👛 Checking wallet: ${userAddress}`));

        try {
            const userState = await this.getWalletState(this.userWallet!);
            const walletHash = crypto.createHash('sha256').update(userState.coinPublicKey).digest('hex');

            const result = await (this.contract as any).callTx.isAuthenticated(
                this.hexToBytes32(walletHash)
            );

            // Extract boolean result from circuit output
            // For circuits that return values, the result is in result.private.result
            const isAuthenticated = result.private?.result?.[0] === 1 || result.private?.result === true;

            if (isAuthenticated) {
                console.log(chalk.green('✅ User wallet is authenticated (has DID)'));
            } else {
                console.log(chalk.red('❌ User wallet is not authenticated (no DID found)'));
            }

            return isAuthenticated;
        } catch (error) {
            console.error(chalk.red('❌ Authentication check failed:'), error);
            return false;
        }
    }

    // Revoke a DID (admin only)
    async revokeDID(didId: string): Promise<void> {
        if (!this.adminWallet || !this.contract) {
            throw new Error('CLI not initialized');
        }

        console.log(chalk.blue(`🗑️ Revoking DID: ${didId.substring(0, 16)}...`));
        const adminAddress = await this.getWalletAddress(this.adminWallet);

        try {
            const adminState = await this.getWalletState(this.adminWallet!);
            const adminWalletHash = crypto.createHash('sha256').update(adminState.coinPublicKey).digest('hex');
            console.log(chalk.gray(`🔍 Admin wallet hash: ${adminWalletHash}`));

            console.log(chalk.gray('� Creating revoke transaction...'));
            const unprovenTx = await (this.contract as any).callTx.revokeDID(
                this.hexToBytes32(adminWalletHash),
                this.hexToBytes32(didId)
            );

            console.log(chalk.gray('⚡ Proving transaction...'));
            const balancedTx = await this.providers.walletProvider.balanceTx(unprovenTx, []);

            console.log(chalk.gray('📤 Submitting to blockchain...'));
            const txHash = await this.providers.walletProvider.submitTx(balancedTx);

            console.log(chalk.green('✅ DID revoked successfully!'));
            console.log(chalk.cyan(`📜 Transaction Hash: ${txHash}`));
        } catch (error) {
            console.error(chalk.red('❌ DID revocation failed:'), error);
            throw error;
        }
    }

    // Show the oracle identity hash for admin operations
    showOracleIdentity() {
        const oracleWitness = this.getRealOracleWitness();
        console.log(chalk.cyan('\n📋 Oracle Identity Information:'));
        console.log(chalk.yellow(`🆔 Identity Hash: ${oracleWitness.student_credential.id}`));
        console.log(chalk.gray(`   (Use this hash for ban/unban operations)`));
    }

    // Interactive CLI menu
    async runInteractive() {
        console.log(chalk.magenta('\n🌙 Midnight DID Registry CLI'));
        console.log(chalk.magenta('================================'));

        // Show oracle identity for admin reference
        this.showOracleIdentity();

        while (true) {
            console.log(chalk.blue('\nChoose an option:'));
            console.log('1. Register new DID (User)');
            console.log('2. Register new DID (Admin - sets contract owner)');
            console.log('3. Check Authentication');
            console.log('4. Check if DID exists');
            console.log('5. Admin: Ban Aadhaar identity');
            console.log('6. Admin: Unban Aadhaar identity');
            console.log('7. Check if identity is banned');
            console.log('8. Show oracle identity hash');
            console.log('9. Admin: Revoke DID');
            console.log('10. Exit');

            const choice = await this.getInput('Enter choice (1-10): ');

            switch (choice.trim()) {
                case '1':
                    try {
                        await this.registerDID(undefined, false, true); // User registration with random salt
                    } catch (error) {
                        console.error(chalk.red('Registration failed:'), error);
                    }
                    break;

                case '2':
                    try {
                        await this.registerDID(undefined, true, true); // Admin registration with random salt
                    } catch (error) {
                        console.error(chalk.red('Registration failed:'), error);
                    }
                    break;

                case '3':
                    await this.checkAuthentication();
                    break;

                case '4':
                    const didInput = await this.getInput('Enter DID ID (hex): ');
                    try {
                        await this.checkDIDExists(didInput.trim());
                    } catch (error) {
                        console.error(chalk.red('DID check failed:'), error);
                    }
                    break;

                case '5':
                    const identityToBan = await this.getInput('Enter identity hash to ban: ');
                    try {
                        await this.banIdentity(identityToBan.trim());
                    } catch (error) {
                        console.error(chalk.red('Ban failed:'), error);
                    }
                    break;

                case '6':
                    const identityToUnban = await this.getInput('Enter identity hash to unban: ');
                    try {
                        await this.unbanIdentity(identityToUnban.trim());
                    } catch (error) {
                        console.error(chalk.red('Unban failed:'), error);
                    }
                    break;

                case '7':
                    const identityToCheck = await this.getInput('Enter identity hash to check: ');
                    try {
                        await this.checkIdentityBan(identityToCheck.trim());
                    } catch (error) {
                        console.error(chalk.red('Ban check failed:'), error);
                    }
                    break;

                case '8':
                    this.showOracleIdentity();
                    break;

                case '9':
                    const didToRevoke = await this.getInput('Enter DID ID to revoke (hex): ');
                    try {
                        await this.revokeDID(didToRevoke.trim());
                    } catch (error) {
                        console.error(chalk.red('Revoke failed:'), error);
                    }
                    break;

                case '10':
                    console.log(chalk.green('👋 Goodbye!'));
                    process.exit(0);
                    break;

                default:
                    console.log(chalk.red('Invalid choice. Please try again.'));
            }
        }
    }

    private getInput(prompt: string): Promise<string> {
        return new Promise((resolve) => {
            process.stdout.write(chalk.yellow(prompt));
            process.stdin.once('data', (data) => {
                resolve(data.toString());
            });
        });
    }
}

// CLI entry point
async function main() {
    const cli = new DIDCli();

    try {
        await cli.initialize();

        // Check if command line arguments provided
        const args = process.argv.slice(2);

        if (args.length === 0) {
            // Interactive mode
            await cli.runInteractive();
        } else {
            // Command mode
            switch (args[0]) {
                case 'register':
                    await cli.registerDID();
                    break;
                case 'auth':
                    await cli.checkAuthentication();
                    break;
                case 'check':
                    if (args[1]) {
                        await cli.checkDIDExists(args[1]);
                    } else {
                        console.error(chalk.red('Please provide DID ID'));
                    }
                    break;
                default:
                    console.log(chalk.red('Usage: npm run did-cli [register|auth|check <did-id>]'));
            }
        }
    } catch (error) {
        console.error(chalk.red('CLI error:'), error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
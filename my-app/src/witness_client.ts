import "dotenv/config";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import {
    setNetworkId,
    getZswapNetworkId,
    getLedgerNetworkId,
    NetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import { Transaction } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import { WebSocket } from "ws";
import * as Rx from "rxjs";
import chalk from "chalk";
import { XMLParser } from "fast-xml-parser";
import { MidnightProviders } from "./providers/midnight-providers.js";
import { EnvironmentManager } from "./utils/environment.js";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

// Configure for Midnight Testnet
setNetworkId(NetworkId.TestNet);

async function main() {
    console.log();
    console.log(chalk.blue.bold("━".repeat(60)));
    console.log(chalk.blue.bold("🕵️  Witness Client - Register User"));
    console.log(chalk.blue.bold("━".repeat(60)));
    console.log();

    try {
        // 1. Load Deployment Info
        const deploymentPath = path.join(process.cwd(), "deployment.json");
        if (!fs.existsSync(deploymentPath)) {
            console.error("❌ Deployment file not found! Run: npm run deploy");
            process.exit(1);
        }
        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
        const contractAddress = deploymentInfo.contractAddress;
        const contractName = deploymentInfo.contractName || "uidai-auth";

        console.log(chalk.cyan(`📍 Contract Address: ${contractAddress}`));

        // 2. Initialize Wallet
        const networkConfig = EnvironmentManager.getNetworkConfig();
        const walletSeed = process.env.WALLET_SEED!;
        if (!walletSeed) {
            console.error("❌ WALLET_SEED not found in .env");
            process.exit(1);
        }

        console.log("Building wallet...");
        const wallet = await WalletBuilder.buildFromSeed(
            networkConfig.indexer,
            networkConfig.indexerWS,
            networkConfig.proofServer,
            networkConfig.node,
            walletSeed,
            getZswapNetworkId(),
            "error"
        );
        wallet.start();

        // Wait for sync
        const state = await Rx.firstValueFrom(
            wallet.state().pipe(
                Rx.filter((s) => s.syncProgress?.synced === true)
            )
        );
        console.log(chalk.green("✅ Wallet Synced"));

        // 3. Setup Providers
        const contractPath = path.join(process.cwd(), "contracts");
        const contractModulePath = path.join(
            contractPath,
            "managed",
            contractName,
            "contract",
            "index.cjs"
        );
        const ContractModule = await import(contractModulePath);

        const walletProvider = {
            coinPublicKey: state.coinPublicKey,
            encryptionPublicKey: state.encryptionPublicKey,
            balanceTx(tx: any, newCoins: any) {
                return wallet
                    .balanceTransaction(
                        ZswapTransaction.deserialize(
                            tx.serialize(getLedgerNetworkId()),
                            getZswapNetworkId()
                        ),
                        newCoins
                    )
                    .then((tx) => wallet.proveTransaction(tx))
                    .then((zswapTx) =>
                        Transaction.deserialize(
                            zswapTx.serialize(getZswapNetworkId()),
                            getLedgerNetworkId()
                        )
                    )
                    .then(createBalancedTx);
            },
            submitTx(tx: any) {
                return wallet.submitTransaction(tx);
            },
        };

        const providers = MidnightProviders.create({
            contractName,
            walletProvider,
            networkConfig,
        });

        // 4. Connect to Deployed Contract
        console.log(chalk.gray("🔗 Connecting to contract..."));
        const contract = await findDeployedContract(providers, {
            contractAddress,
            contract: new ContractModule.Contract({}),
            privateStateId: "uidaiAuthState",
            initialPrivateState: {},
        });
        console.log(chalk.green("✅ Connected to contract"));

        // 5. Read and Parse XML (Real Data)
        console.log(chalk.yellow("\n� Reading XML Data..."));
        // Find the XML file in the current directory
        const files = fs.readdirSync(process.cwd());
        const xmlFile = files.find(f => f.startsWith("offlineaadhaar") && f.endsWith(".xml"));

        if (!xmlFile) {
            throw new Error("No offlineaadhaar XML file found in current directory.");
        }
        console.log(`   Found file: ${xmlFile}`);

        const xmlData = fs.readFileSync(path.join(process.cwd(), xmlFile), 'utf8');
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
        const jsonObj = parser.parse(xmlData);
        const uidData = jsonObj.OfflinePaperlessKyc.UidData;

        // Extract Data
        const dob = uidData.Poi.dob; // e.g., "13-05-2004"
        const mobileRaw = uidData.Poi.m;

        // Compute Mobile Hash (SHA-256)
        const mobileHash = crypto.createHash('sha256').update(mobileRaw).digest();

        // Compute Eligibility
        const birthYear = parseInt(dob.split('-')[2]);
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        const isEligible = age > 18;

        console.log(`   DOB: ${dob} (Age: ${age})`);
        console.log(`   Eligible: ${isEligible}`);
        console.log(`   Mobile Hash: ${mobileHash.toString('hex').substring(0, 20)}...`);

        // 6. Sign Data (Bridge Simulation)
        // We generate an ephemeral key to represent the "Issuer" for this demo.
        // In a real scenario, this signature would come from the Oracle.
        console.log("\n🔐 Signing Data (Bridge)...");
        const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

        // Extract raw 32-byte public key
        const publicKeyBytes = publicKey.export({ type: 'spki', format: 'der' });
        const rawPublicKey = publicKeyBytes.subarray(publicKeyBytes.length - 32);

        const salt = crypto.randomBytes(32);

        // Construct message to sign: mobileHash + salt + isEligible (padded)
        const eligibilityByte = Buffer.alloc(32);
        eligibilityByte[31] = isEligible ? 1 : 0;

        const messageToSign = Buffer.concat([mobileHash, salt, eligibilityByte]);
        const signature = crypto.sign(null, messageToSign, privateKey);

        console.log("   Signed message with ephemeral key.");

        // 7. Call Contract
        console.log("\n🚀 Calling register()...");

        // Step A: Create Unproven Transaction
        const unprovenTx = await (contract as any).callTx.register(
            new Uint8Array(mobileHash),
            new Uint8Array(salt),
            isEligible,
            new Uint8Array(signature),
            new Uint8Array(rawPublicKey)
        );
        console.log("   Unproven Transaction created.");

        // Step B: Balance and Prove Transaction
        console.log("   Balancing and Proving transaction...");
        const balancedTx = await providers.walletProvider.balanceTx(unprovenTx, []);
        console.log("   Transaction Proven.");

        // Step C: Submit Transaction
        console.log("   Submitting transaction...");
        const txHash = await providers.walletProvider.submitTx(balancedTx);

        console.log(chalk.green.bold("\n✅ Transaction Submitted!"));
        console.log(chalk.cyan(`   Tx Hash: ${txHash}`));

        // Close wallet
        await wallet.close();

    } catch (e) {
        console.error(chalk.red("❌ Error:"), e);
        process.exit(1);
    }
}

main();

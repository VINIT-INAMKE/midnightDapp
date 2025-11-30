import "dotenv/config";
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { getZswapNetworkId, NetworkId, setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { HDWallet, Roles } from "@midnight-ntwrk/wallet-sdk-hd";

// Set Network to TestNet
setNetworkId(NetworkId.TestNet);
import * as bip39 from "bip39";
import chalk from "chalk";

// REPLACE THIS WITH YOUR 24-WORD MNEMONIC
const mnemonic = "million travel melt wolf warrior average time accuse gloom sweet buddy stand success gas crystal bridge two exchange advice wonder crazy purse media this";

// Hardcoded Network Config (Testnet)
const networkConfig = {
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: process.env.PROOF_SERVER_URL || "http://127.0.0.1:6300",
  name: "Testnet",
};

async function deriveAndVerify() {
  console.log(chalk.blue.bold("━".repeat(60)));
  console.log(chalk.blue.bold("🔑 Midnight Seed Derivation Tool"));
  console.log(chalk.blue.bold("━".repeat(60)));

  if (!bip39.validateMnemonic(mnemonic)) {
    console.error(chalk.red("❌ Invalid Mnemonic! Please check your words."));
    return;
  }

  // 1. Generate BIP39 Seed (64 bytes)
  const bip39Seed = bip39.mnemonicToSeedSync(mnemonic);
  console.log(chalk.gray(`BIP39 Seed (First 16 bytes): ${bip39Seed.subarray(0, 16).toString('hex')}...`));

  // 2. Create HD Wallet
  const hdWalletResult = HDWallet.fromSeed(bip39Seed);
  
  if (hdWalletResult.type === 'seedError') {
      console.error(chalk.red("❌ Failed to create HD Wallet from seed"));
      return;
  }

  const hdWallet = hdWalletResult.hdWallet;

  // 3. Derive Key: Account 0, Role Zswap (3), Index 0
  // This is the standard derivation path for the main Zswap key
  const derivationResult = hdWallet
      .selectAccount(0)
      .selectRole(Roles.Zswap)
      .deriveKeyAt(0);

  if (derivationResult.type === 'keyOutOfBounds') {
      console.error(chalk.red("❌ Key derivation out of bounds"));
      return;
  }

  const derivedSeed = Buffer.from(derivationResult.key).toString('hex');
  
  console.log();
  console.log(chalk.yellow.bold("✅ Derived Midnight Seed (32 bytes / 64 hex):"));
  console.log(chalk.green.bold(derivedSeed));
  console.log();
  console.log(chalk.gray("Use this seed in your .env file as WALLET_SEED"));
  console.log();

  // 4. Verify with WalletBuilder
  console.log(chalk.blue.bold("━".repeat(30)));
  console.log(chalk.cyan("   Verifying with WalletBuilder..."));
  
  try {
    const wallet = await WalletBuilder.buildFromSeed(
      networkConfig.indexer,
      networkConfig.indexerWS,
      networkConfig.proofServer,
      networkConfig.node,
      derivedSeed,
      getZswapNetworkId(),
      "error"
    );

    wallet.start();
    
    const state = await new Promise<any>((resolve, reject) => {
        const sub = wallet.state().subscribe({
            next: (s) => {
                sub.unsubscribe();
                resolve(s);
            },
            error: (err) => {
                sub.unsubscribe();
                reject(err);
            }
        });
    });

    console.log(chalk.green("   ✅ Wallet built successfully!"));
    console.log(chalk.white.bold(`   📍 Address: ${state.address}`));
    
    await wallet.close();

  } catch (error) {
    console.error(chalk.red("   ❌ Failed to build wallet:"));
    console.error(chalk.red(`      ${error instanceof Error ? error.message : String(error)}`));
  }
  
  console.log(chalk.blue.bold("━".repeat(60)));
}

deriveAndVerify().catch(console.error);

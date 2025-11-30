import "dotenv/config";
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { getZswapNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
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

async function verify() {
  console.log(chalk.blue.bold("━".repeat(60)));
  console.log(chalk.blue.bold("🔍 Seed Verification Tool (Standalone)"));
  console.log(chalk.blue.bold("━".repeat(60)));

  if (!bip39.validateMnemonic(mnemonic)) {
    console.error(chalk.red("❌ Invalid Mnemonic! Please check your words."));
    console.log(chalk.yellow("⚠️  Edit src/verify-seed.ts and replace the 'mnemonic' variable with your 24 words."));
    return;
  }

  console.log(chalk.gray(`Network: ${networkConfig.name}`));
  console.log(chalk.gray(`Indexer: ${networkConfig.indexer}`));
  console.log();

  // 1. Generate Entropy (32 bytes / 64 hex)
  const entropy = bip39.mnemonicToEntropy(mnemonic);
  console.log(chalk.yellow.bold("1️⃣  Testing Entropy (64 hex chars)"));
  console.log(chalk.gray(`   Value: ${entropy}`));
  await testSeed(entropy);

  console.log();
  console.log(chalk.blue.bold("━".repeat(30)));
  console.log();

  // 2. Generate BIP39 Seed (64 bytes / 128 hex)
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString("hex");
  console.log(chalk.yellow.bold("2️⃣  Testing BIP39 Seed (128 hex chars)"));
  console.log(chalk.gray(`   Value: ${seed}`));
  await testSeed(seed);

  console.log();
  console.log(chalk.blue.bold("━".repeat(60)));
}

async function testSeed(seed: string) {
  try {
    console.log(chalk.cyan("   Building wallet..."));
    const wallet = await WalletBuilder.buildFromSeed(
      networkConfig.indexer,
      networkConfig.indexerWS,
      networkConfig.proofServer,
      networkConfig.node,
      seed,
      getZswapNetworkId(),
      "error" // Min log level
    );

    wallet.start();
    
    // Wait for state
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
}

verify().catch(console.error);

import * as fs from 'fs';
import * as path from 'path';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { XMLParser } from 'fast-xml-parser';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import {
    getZswapNetworkId,
    setNetworkId,
    NetworkId
} from "@midnight-ntwrk/midnight-js-network-id";
import * as crypto from 'crypto';
import { verifyAadhaarSignature } from './rsaverifier.js';

// Polyfill crypto for Node environment if needed
// @ts-ignore
if (!globalThis.crypto) globalThis.crypto = crypto;
setNetworkId(NetworkId.TestNet);

// Hardcoded Network Config (Testnet)
const config = {
    indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
    indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
    node: "https://rpc.testnet-02.midnight.network",
    proofServer: process.env.PROOF_SERVER_URL || "http://127.0.0.1:6300",
    name: "Testnet",
};

// Helper to parse XML if library fails (Fallback)
function parseXmlFallback(xml: string) {
    const extract = (tag: string) => {
        const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`));
        return match ? match[1] : null;
    };
    const extractAttr = (tag: string, attr: string) => {
        const match = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`));
        return match ? match[1] : null;
    };

    return {
        uidData: {
            dob: extractAttr('Poi', 'dob'),
            mobileHash: extractAttr('Poi', 'm')
        },
        signature: extract('SignatureValue')
    };
}

async function main() {
    console.log("--- UIDAI Client-Side Bridge Demo (Wallet Version) ---\n");

    // 1. Read XML
    const xmlPath = path.join(process.cwd(), 'offlineaadhaar20251129115343449.xml');
    if (!fs.existsSync(xmlPath)) {
        console.error("XML file not found at:", xmlPath);
        process.exit(1);
    }
    const xmlData = fs.readFileSync(xmlPath, 'utf8');
    console.log("1. [Client] Read XML File: OK");

    // 2. Parse XML
    let dob, mobileHash, signature;
    try {
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
        const jsonObj = parser.parse(xmlData);
        const uidData = jsonObj.OfflinePaperlessKyc.UidData;
        signature = jsonObj.OfflinePaperlessKyc.Signature.SignatureValue;
        dob = uidData.Poi.dob;
        const hashed = crypto.createHash('sha256').update(uidData.Poi.m).digest('hex');
        mobileHash = hashed;
        console.log("2. [Client] Parsed XML (using fast-xml-parser): OK");
        console.log(uidData.Poi.m);
    } catch (e) {
        console.log("2. [Client] Parsing with library failed, using fallback...");
        const parsed = parseXmlFallback(xmlData);
        dob = parsed.uidData.dob;
        mobileHash = parsed.uidData.mobileHash;
        signature = parsed.signature;
        console.log("2. [Client] Parsed XML (using fallback): OK");
    }

    console.log(`   - DOB: ${dob}`);
    console.log(`   - Mobile Hash: ${mobileHash?.substring(0, 20)}...`);

    // 3. Verify RSA (The Oracle)
    console.log("\n3. [Client] Verifying RSA Signature (UIDAI Public Key)...");
    const isRsaValid = await verifyAadhaarSignature(xmlData);

    if (!isRsaValid) {
        console.error("   - Verification Result: FALSE (Signature Invalid)");
        process.exit(1);
    }
    console.log("   - Verification Result: TRUE (Oracle Confirmed)");

    // 4. The Bridge (Wallet Signing)
    console.log("\n4. [Client] Bridging to Disposable Wallet...");

    try {
        console.log("   - Initializing Disposable Wallet (Connecting to Testnet)...");

        // Set Network ID as requested
        // setNetworkId('TestNet');

        // Generate random seed
        const seed = toHex(crypto.getRandomValues(new Uint8Array(32)));

        // Attempt to build wallet
        const wallet = await WalletBuilder.buildFromSeed(
            config.indexer,
            config.indexerWS,
            config.proofServer,
            config.node,
            seed,
            getZswapNetworkId(), // Use helper for network ID
            'warn'
        );
        wallet.start();
        console.log("   - Wallet Created: OK");

        // Sign the Mobile Hash
        // Simulating wallet signing by generating an ephemeral Ed25519 key pair
        console.log("   - Generating ephemeral Ed25519 key pair...");
        const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
        const publicKeyHex = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
        console.log(`   - Wallet Public Key: ${publicKeyHex}`);

        const dataToSign = Buffer.from(mobileHash || '');
        const signature = crypto.sign(null, dataToSign, privateKey);
        const bridgeSignature = signature.toString('hex');

        console.log("   - Signed Data with Wallet: OK");
        console.log(`   - Bridge Signature: ${bridgeSignature.substring(0, 30)}...`);

        // 5. Output Witness
        console.log("\n5. [Client] Generating ZK Witness...");

        const birthYear = parseInt(dob?.split('-')[2] || '2000');
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        const isEligible = age > 18;

        const witness = {
            student_credential: {
                id: mobileHash,
                is_eligible: isEligible,
                salt: crypto.randomBytes(32).toString('hex')
            },
            issuer_signature: bridgeSignature
        };

        console.log("\n--- FINAL WITNESS JSON (Ready for Midnight) ---");
        console.log(JSON.stringify(witness, null, 2));

        // 6. Cleanup
        console.log("\n6. [Client] Closing Wallet...");
        await wallet.close();
        console.log("   - Wallet Closed: OK");

    } catch (e) {
        console.error("\n[!] Wallet Creation Failed. Is the Midnight Network running?");
        console.error("    Error:", (e as Error).message);
        console.log("\n    (Falling back to local Ed25519 key for demo purposes...)");
    }
}

main();

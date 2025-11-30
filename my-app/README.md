# UIDAI DID Authentication System

A privacy-preserving Decentralized Identity (DID) system built on Midnight Network that uses UIDAI (Aadhaar) credentials for identity verification while maintaining privacy through zero-knowledge proofs.

## Overview

This application demonstrates how to build a privacy-preserving identity system where:
- Users can register DIDs using UIDAI (Aadhaar) credentials verified by an oracle
- Each UIDAI identity can only register once (privacy-preserving uniqueness)
- Wallet addresses are linked to DIDs for authentication
- Administrators can ban/unban UIDAI identities and revoke DIDs
- All operations preserve privacy using zero-knowledge proofs

## Getting Started

### Prerequisites

- Node.js 22+ installed
- Docker installed (for proof server)
- Testnet tokens (get from faucet)

### Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup and deploy**:
   ```bash
   npm run setup
   ```

   This will:
   - Compile the `uidai-auth.compact` contract
   - Build TypeScript to JavaScript
   - Deploy contract to the testnet

3. **Interact with the DID system**:
   ```bash
   npm run did-cli
   ```

### Available Scripts

- `npm run setup` - Compile, build, and deploy contract
- `npm run compile` - Compile Compact contract
- `npm run build` - Build TypeScript
- `npm run deploy` - Deploy contract to testnet
- `npm run did-cli` - Interactive DID CLI
- `npm run check-balance` - Check wallet balance
- `npm run reset` - Reset all compiled/built files
- `npm run clean` - Clean build artifacts

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `WALLET_SEED` - Your 64-character wallet seed (auto-generated)
- `MIDNIGHT_NETWORK` - Network to use (testnet)
- `PROOF_SERVER_URL` - Proof server URL
- `CONTRACT_NAME` - Contract name

### Project Structure

```
my-app/
├── contracts/
│   ├── uidai-auth.compact    # DID authentication contract
│   └── managed/               # Compiled contract artifacts
├── src/
│   ├── deploy.ts             # Contract deployment script
│   ├── did-cli.ts            # Interactive DID CLI
│   ├── check-balance.ts      # Wallet balance checker
│   ├── providers/            # Midnight network providers
│   └── utils/                # Environment & utility functions
├── .env                      # Environment config (keep private!)
├── deployment.json           # Deployed contract address
└── package.json
```

### Getting Testnet Tokens

1. Run `npm run deploy` to see your wallet address
2. Visit [https://midnight.network/test-faucet](https://midnight.network/test-faucet)
3. Enter your address to receive test tokens

### Learn More

- [Midnight Documentation](https://docs.midnight.network)
- [Compact Language Guide](https://docs.midnight.network/compact)
- [Tutorial Series](https://docs.midnight.network/tutorials)

## DID System Features

### User Operations

1. **Register DID**
   - Users provide UIDAI credentials (verified by oracle)
   - System generates a unique DID linked to their wallet
   - Privacy-preserving: uses nullifiers to prevent duplicate registrations
   - Each wallet can have only ONE DID

2. **Check Authentication**
   - Verify if a wallet has a registered DID
   - Used for gating access to services

3. **Verify DID Ownership**
   - Prove ownership of a specific DID with a wallet

### Admin Operations (Contract Owner Only)

1. **Ban/Unban UIDAI Identities**
   - Prevent specific UIDAI identities from creating DIDs
   - Can unban if needed
   - Banned identities cannot register new DIDs

2. **Revoke DIDs**
   - Remove a DID from the registry
   - Revoked DIDs cannot be used for authentication
   - Nullifiers are retained to prevent re-registration

### CLI Commands

When you run `npm run did-cli`, you get an interactive menu:

1. Register new DID (User) - Register a DID to a user wallet
2. Register new DID (Admin) - Register DID and set contract owner
3. Check Authentication - See if user wallet has a DID
4. Check if DID exists - Query if a specific DID is registered
5. Admin: Ban Aadhaar identity - Block an identity from registration
6. Admin: Unban Aadhaar identity - Allow a banned identity to register
7. Check if identity is banned - Query ban status
8. Show oracle identity hash - Display the test identity hash
9. Admin: Revoke DID - Remove a DID from the registry
10. Exit

## Smart Contract Architecture

### Ledger State

- `nullifiers: Set<Bytes<32>>` - Privacy nullifiers for uniqueness
- `dids: Map<Bytes<32>, DIDDocument>` - DID registry
- `walletToDID: Map<Bytes<32>, Bytes<32>>` - Wallet to DID mapping
- `bannedIdentities: Set<Bytes<32>>` - Banned UIDAI identities
- `contractOwner: Set<Bytes<32>>` - Contract owner address

### DID Document Structure

```compact
struct DIDDocument {
    id: Bytes<32>,                  // Unique DID identifier
    controller: Bytes<32>,          // Wallet that controls this DID
    verification_method: Bytes<32>, // Public key for signing
    is_verified: Boolean,           // Aadhaar verified flag
    created_at: Field              // Creation timestamp
}
```

### Privacy Features

- **Zero-knowledge proofs** - All transactions use ZK proofs
- **Privacy-preserving nullifiers** - Prevent duplicate registrations without revealing identity
- **Hashed wallet addresses** - Wallet privacy maintained on-chain
- **Oracle-verified credentials** - UIDAI eligibility checked off-chain

## How It Works

1. **DID Registration Flow**:
   - Oracle verifies UIDAI credentials off-chain
   - User submits registration with oracle witness (student_id, salt, signature)
   - Circuit verifies eligibility and generates nullifier
   - Circuit creates unique DID: `hash(student_id, salt, wallet_address)`
   - DID document stored on ledger with wallet mapping

2. **Privacy Guarantees**:
   - Nullifier prevents same identity from registering twice
   - Each wallet limited to one DID
   - Zero-knowledge proofs hide sensitive data
   - Only disclosed data goes on-chain

3. **Admin Controls**:
   - First registration can set contract owner
   - Owner can ban/unban UIDAI identities
   - Owner can revoke DIDs
   - All admin actions verified via ZK circuits

## Learn More

- [Midnight Documentation](https://docs.midnight.network)
- [Compact Language Guide](https://docs.midnight.network/compact)
- [Zero-Knowledge Proofs](https://docs.midnight.network/tutorials/zkp)
- [DID Standards](https://www.w3.org/TR/did-core/)
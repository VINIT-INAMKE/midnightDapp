# UIDAI DID Authentication Platform

A complete privacy-preserving decentralized identity system that combines Aadhaar verification with zero-knowledge proofs on the Midnight Network. This platform enables users to create DIDs (Decentralized Identifiers) backed by government-issued UIDAI (Aadhaar) credentials while maintaining privacy through cryptographic proofs.

## Repository Structure

This repository contains two main components:

```
midnight/
├── oracle/              # Aadhaar Oracle Server
│   └── Verifies UIDAI credentials and generates witnesses
│
└── my-app/              # DID Authentication DApp
    └── Midnight Network smart contract and frontend
```

## Overview

### How It Works

1. **Oracle Verification** (`oracle/`): Users submit their encrypted Aadhaar documents to a trusted oracle server that verifies the UIDAI signature and generates a cryptographic witness
2. **DID Registration** (`my-app/`): Users submit the oracle witness to the Midnight Network smart contract to register a privacy-preserving DID
3. **Authentication**: Users can prove DID ownership without revealing personal information through zero-knowledge proofs

### Key Features

- **Privacy-First**: Zero-knowledge proofs hide sensitive identity data
- **Government-Backed**: Leverages India's UIDAI Aadhaar system for identity verification
- **Decentralized**: DIDs stored on Midnight Network blockchain
- **Admin Controls**: Ban/unban identities, revoke DIDs
- **One Identity, One DID**: Privacy-preserving duplicate prevention

---

## Component 1: Aadhaar Oracle Server (`oracle/`)

A trusted oracle that verifies Aadhaar offline XML documents and generates cryptographic witnesses for zero-knowledge proof systems.

### Features

- ✅ **Aadhaar Signature Verification**: Validates RSA-SHA1 signatures using UIDAI certificate pinning
- ✅ **Age Eligibility Check**: Verifies user is 18+ years old
- ✅ **Privacy-Preserving**: Hashes mobile numbers (SHA256) before processing
- ✅ **Witness Generation**: Creates Ed25519-signed witnesses for ZK circuits
- ✅ **REST API**: Simple HTTP endpoint for document verification

### Quick Start

```bash
cd oracle

# Install dependencies
npm install

# Start oracle server
npm start

# Test (in another terminal)
npm test
```

The server runs on `http://localhost:3000`

### API Endpoint

**POST** `/verify-aadhaar`

```bash
curl -X POST http://localhost:3000/verify-aadhaar \
  -F "file=@offlineaadhaar.zip" \
  -F "password=YOUR_PASSWORD"
```

**Response:**
```json
{
  "student_credential": {
    "id": "abc123def456...789",
    "is_eligible": true,
    "salt": "random32bytehexstring..."
  },
  "issuer_signature": "ed25519signaturehex..."
}
```

### Architecture

```
┌─────────────┐
│   Client    │  Upload encrypted Aadhaar ZIP + Password
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Oracle Server (Port 3000)      │
│  1. Decrypt ZIP with password       │
│  2. Extract XML document            │
│  3. Verify UIDAI signature          │
│  4. Extract DOB & Mobile Hash       │
│  5. Check age eligibility           │
│  6. Generate witness with Ed25519   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Witness   │  JSON credentials + signature
└─────────────┘
```

### Security Features

- **Certificate Pinning**: Hardcoded UIDAI certificate prevents MITM attacks
- **Multi-Layer Verification**: SHA256 digest + RSA-SHA1 signature + X509 cert validation
- **Privacy Protection**: Mobile numbers hashed, no PII logged/stored
- **Ephemeral Keys**: Ed25519 keys generated per session

### Core Files

- `oracle-server.ts` - Main Express server handling ZIP uploads
- `rsaverifier.ts` - UIDAI signature verification logic
- `test-oracle.ts` - Test client script
- `uidaidemo.ts` - Midnight Network integration example

---

## Component 2: DID Authentication DApp (`my-app/`)

A Midnight Network smart contract system that registers and manages DIDs backed by UIDAI credentials.

### Features

- ✅ **DID Registration**: Create DIDs linked to verified Aadhaar credentials
- ✅ **Privacy-Preserving Uniqueness**: Each UIDAI identity can register only once
- ✅ **Wallet Authentication**: Link wallet addresses to DIDs
- ✅ **Admin Controls**: Ban/unban identities, revoke DIDs
- ✅ **Zero-Knowledge Proofs**: All operations preserve privacy

### Quick Start

```bash
cd my-app

# Install dependencies
npm install

# Compile contract, build, and deploy
npm run setup

# Interact with DID system
npm run did-cli
```

### Getting Testnet Tokens

1. Run `npm run deploy` to see your wallet address
2. Visit [https://midnight.network/test-faucet](https://midnight.network/test-faucet)
3. Enter your address to receive test tokens

### CLI Commands

The interactive CLI (`npm run did-cli`) provides:

1. **Register new DID (User)** - Register DID to user wallet
2. **Register new DID (Admin)** - Register DID and set contract owner
3. **Check Authentication** - Verify if wallet has a DID
4. **Check if DID exists** - Query DID registration status
5. **Admin: Ban Aadhaar identity** - Block identity from registration
6. **Admin: Unban Aadhaar identity** - Allow banned identity to register
7. **Check if identity is banned** - Query ban status
8. **Show oracle identity hash** - Display test identity hash
9. **Admin: Revoke DID** - Remove DID from registry
10. **Exit**

### Smart Contract Architecture

**Ledger State:**
```compact
ledger state {
    nullifiers: Set<Bytes<32>>,           // Privacy nullifiers
    dids: Map<Bytes<32>, DIDDocument>,    // DID registry
    walletToDID: Map<Bytes<32>, Bytes<32>>, // Wallet mappings
    bannedIdentities: Set<Bytes<32>>,     // Banned UIDAI IDs
    contractOwner: Set<Bytes<32>>         // Contract owner
}
```

**DID Document:**
```compact
struct DIDDocument {
    id: Bytes<32>,                  // Unique DID
    controller: Bytes<32>,          // Controlling wallet
    verification_method: Bytes<32>, // Public key
    is_verified: Boolean,           // Aadhaar verified
    created_at: Field              // Timestamp
}
```

### DID Registration Flow

1. Oracle verifies UIDAI credentials off-chain → generates witness
2. User submits registration with witness (student_id, salt, signature)
3. Circuit verifies eligibility → generates nullifier
4. Circuit creates unique DID: `hash(student_id, salt, wallet_address)`
5. DID document stored on ledger with wallet mapping

### Privacy Guarantees

- **Zero-Knowledge Proofs**: All transactions use ZK circuits
- **Privacy-Preserving Nullifiers**: Prevent duplicates without revealing identity
- **Hashed Wallet Addresses**: Wallet privacy maintained on-chain
- **Oracle-Verified Credentials**: UIDAI eligibility checked off-chain

### Core Files

- `contracts/uidai-auth.compact` - Smart contract defining DID logic
- `src/deploy.ts` - Contract deployment script
- `src/did-cli.ts` - Interactive CLI for DID operations
- `src/providers/` - Midnight Network provider setup
- `src/utils/` - Environment and utility functions

---

## Complete End-to-End Flow

### 1. User Gets Oracle Witness

```bash
cd oracle
npm start

# User submits Aadhaar ZIP
curl -X POST http://localhost:3000/verify-aadhaar \
  -F "file=@offlineaadhaar.zip" \
  -F "password=1234"

# Response: { student_credential: {...}, issuer_signature: "..." }
```

### 2. User Registers DID

```bash
cd my-app
npm run did-cli

# Select: "1. Register new DID (User)"
# Enter oracle witness data:
# - student_id (from oracle)
# - salt (from oracle)
# - issuer_signature (from oracle)

# DID is created and linked to wallet
```

### 3. User Authenticates with DID

```bash
# Check authentication
npm run did-cli
# Select: "3. Check Authentication"

# Returns: wallet has valid DID
```

### 4. Admin Management (Optional)

```bash
# Ban a UIDAI identity
npm run did-cli
# Select: "5. Admin: Ban Aadhaar identity"

# Revoke a DID
npm run did-cli
# Select: "9. Admin: Revoke DID"
```

---

## Prerequisites

- **Node.js**: 18+ (oracle), 22+ (my-app)
- **TypeScript**: 5.3+
- **Docker**: For Midnight proof server
- **Testnet Tokens**: From Midnight faucet

## Installation (Full Stack)

```bash
# Clone repository
git clone <your-repo-url>
cd midnight

# Setup Oracle
cd oracle
npm install
npm start  # Keep running

# Setup DApp (new terminal)
cd ../my-app
npm install
npm run setup
npm run did-cli
```

## Environment Configuration

### Oracle (`oracle/.env`)
No environment variables required - runs on port 3000 by default

### DApp (`my-app/.env`)
```env
WALLET_SEED=<64-char-hex-seed>  # Auto-generated
MIDNIGHT_NETWORK=testnet
PROOF_SERVER_URL=http://127.0.0.1:6300
CONTRACT_NAME=uidai-auth
```

## Available Scripts

### Oracle
- `npm start` - Start oracle server
- `npm test` - Test oracle verification
- `npm run build` - Build TypeScript

### DApp
- `npm run setup` - Compile, build, deploy
- `npm run compile` - Compile Compact contract
- `npm run build` - Build TypeScript
- `npm run deploy` - Deploy to testnet
- `npm run did-cli` - Interactive CLI
- `npm run check-balance` - Check wallet balance
- `npm run reset` - Clean all artifacts

## Security Considerations

### Oracle Security
- ✅ Certificate pinning prevents MITM attacks
- ✅ Multi-layer signature verification
- ✅ No PII logged or stored
- ⚠️ Certificate expires 2024-02-27 (needs update)
- ⚠️ No rate limiting (add for production)
- ⚠️ No API authentication (add for production)

### DApp Security
- ✅ Zero-knowledge proofs protect privacy
- ✅ Nullifiers prevent duplicate registrations
- ✅ Admin controls for identity management
- ⚠️ Keep `.env` and wallet seeds private
- ⚠️ Test on testnet before mainnet

## Limitations

### Oracle
- Single UIDAI certificate supported
- No persistent storage of witnesses
- Ephemeral signing keys
- No built-in rate limiting
- No API authentication

### DApp
- One DID per wallet address
- Requires testnet tokens
- Oracle witness must be fresh
- Admin operations require owner wallet

## Future Enhancements

- [ ] Multi-certificate support for UIDAI
- [ ] Persistent oracle signing keys with rotation
- [ ] Witness audit trail database
- [ ] Rate limiting and DDoS protection
- [ ] API authentication (JWT/OAuth)
- [ ] Support for multiple identity documents
- [ ] On-chain oracle integration
- [ ] DID recovery mechanisms
- [ ] Multi-signature admin controls
- [ ] Frontend web interface

## Troubleshooting

### Oracle Issues
- **"Invalid signature"**: Check if UIDAI certificate is current
- **"Wrong password"**: Verify ZIP password is correct
- **"Port 3000 in use"**: Change port in `oracle-server.ts`

### DApp Issues
- **"Insufficient balance"**: Get tokens from testnet faucet
- **"Contract not deployed"**: Run `npm run deploy`
- **"Proof server error"**: Ensure Docker is running proof server
- **"Duplicate registration"**: Identity already registered (expected)

## Resources

- [Midnight Network Documentation](https://docs.midnight.network)
- [Compact Language Guide](https://docs.midnight.network/compact)
- [UIDAI Aadhaar](https://uidai.gov.in/)
- [DID Standards](https://www.w3.org/TR/did-core/)
- [Ed25519 Signatures](https://ed25519.cr.yp.to/)

## License

This is educational/research software. Ensure compliance with:
- UIDAI regulations for Aadhaar usage
- Data privacy laws (GDPR, local regulations)
- Identity verification regulations

## Disclaimer

⚠️ **This platform is for educational and research purposes only.**

- Do NOT use in production without proper security auditing
- Ensure compliance with UIDAI terms of service
- Verify legal requirements for identity data processing
- Implement proper key management for production deployments
- Consult legal counsel for production use

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly on testnet
4. Submit a pull request

## Support

For issues or questions:
1. Check error logs in console output
2. Verify prerequisites are installed
3. Ensure testnet connectivity
4. Review documentation links above

---

Built with ❤️ using Midnight Network and UIDAI Aadhaar

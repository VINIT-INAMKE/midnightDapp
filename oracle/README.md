# Aadhaar Oracle Server

A trusted oracle server that verifies Aadhaar identity documents for zero-knowledge proof systems. This server validates government-issued Aadhaar XML signatures and generates cryptographic witnesses for privacy-preserving identity verification.

## Overview

This oracle server acts as a bridge between India's Aadhaar identity system (UIDAI) and blockchain-based zero-knowledge applications. It verifies the authenticity of Aadhaar offline XML documents and generates witness data for ZK proof systems like Midnight Network.

### Key Features

- **Aadhaar Signature Verification**: Validates RSA-SHA1 signatures from UIDAI using certificate pinning
- **Age Eligibility Check**: Calculates age from date of birth and checks eligibility (18+ years)
- **Privacy-Preserving**: Hashes sensitive mobile numbers (SHA256) before processing
- **Witness Generation**: Creates cryptographic witnesses with Ed25519 signatures
- **REST API**: Simple HTTP endpoint for document verification

## Architecture

```
┌─────────────┐
│   Client    │  Upload encrypted Aadhaar ZIP
│             │  + Password
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Oracle Server (Port 3000)      │
│                                     │
│  1. Decrypt ZIP with password       │
│  2. Extract XML document            │
│  3. Verify UIDAI signature          │
│     - Check certificate pinning     │
│     - Validate RSA-SHA1 signature   │
│     - Verify SHA256 digest          │
│  4. Extract DOB & Mobile Hash       │
│  5. Check age eligibility           │
│  6. Generate witness with Ed25519   │
│                                     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Witness   │  JSON with credentials
│             │  + issuer signature
└─────────────┘
```

## Installation

### Prerequisites

- Node.js 18+
- TypeScript 5.3+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Build (if needed)
npm run build
```

## Usage

### Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### API Endpoint

**POST** `/verify-aadhaar`

Upload an encrypted Aadhaar ZIP file for verification.

#### Request

- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: Encrypted Aadhaar ZIP file (required)
  - `password`: ZIP file password (required)

#### Example with cURL

```bash
curl -X POST http://localhost:3000/verify-aadhaar \
  -F "file=@offlineaadhaar.zip" \
  -F "password=YOUR_PASSWORD"
```

#### Success Response (200 OK)

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

#### Error Responses

- **400 Bad Request**: Missing file/password, invalid XML, or signature verification failure
- **401 Unauthorized**: Incorrect ZIP password
- **500 Internal Server Error**: Server processing error

## Testing

### Run Test Client

```bash
npm test
```

This will:
1. Prompt for the ZIP password
2. Upload the test Aadhaar file to the server
3. Display the returned witness JSON

### Manual Testing

```bash
# Start the server
npm start

# In another terminal, run the test
npm test
```

## Project Structure

```
oracle/
├── oracle-server.ts      # Main Express server
├── rsaverifier.ts        # UIDAI signature verification logic
├── test-oracle.ts        # Test client script
├── uidaidemo.ts          # Midnight Network integration demo
├── debug-mismatch.ts     # Certificate debugging utility
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

### Core Modules

#### oracle-server.ts

The main HTTP server that:
- Accepts encrypted ZIP uploads via multipart form
- Decrypts ZIP files with user password
- Extracts and validates XML documents
- Calculates age eligibility
- Generates Ed25519-signed witnesses

#### rsaverifier.ts

Cryptographic verification module that:
- Implements UIDAI certificate pinning
- Validates XML digital signatures
- Verifies SHA256 digest integrity
- Checks RSA-SHA1 signature authenticity
- Uses canonical XML processing

#### test-oracle.ts

Simple test client that:
- Reads local Aadhaar ZIP file
- Prompts for password
- Posts to oracle endpoint
- Validates witness response

#### uidaidemo.ts

Integration example showing:
- Midnight Network wallet setup
- XML parsing and signature verification
- Witness generation for ZK proofs
- Testnet configuration

## Security Features

### Certificate Pinning

The server uses hardcoded UIDAI certificate pinning to prevent man-in-the-middle attacks:

```typescript
const TRUSTED_UIDAI_CERT = `MIIHwjCCBqqgAwIBAgIE...`
```

Only documents signed by the exact UIDAI certificate will pass verification.

### Multi-Layer Verification

1. **Digest Verification**: SHA256 hash of signed data must match
2. **Signature Verification**: RSA-SHA1 signature must be valid
3. **Certificate Verification**: X509 certificate must match trusted UIDAI cert

### Privacy Protection

- Mobile numbers are hashed (SHA256) before processing
- Ephemeral Ed25519 keys are generated per session
- No personal data is logged or stored

## Technical Details

### Aadhaar XML Structure

```xml
<OfflinePaperlessKyc>
  <UidData>
    <Poi dob="DD-MM-YYYY" m="mobile_hash" />
  </UidData>
  <Signature>
    <SignedInfo>...</SignedInfo>
    <SignatureValue>...</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>...</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>
</OfflinePaperlessKyc>
```

### Verification Process

1. **Extract Components**: Parse XML to extract UidData, SignatureValue, X509Certificate, DigestValue
2. **Certificate Check**: Compare X509 cert with pinned UIDAI certificate
3. **Digest Validation**: Calculate SHA256(UidData) and compare with DigestValue
4. **Signature Validation**: Verify RSA-SHA1 signature of SignedInfo using public key from certificate
5. **Data Extraction**: Extract DOB and mobile hash from verified XML
6. **Eligibility**: Calculate age and check if ≥18 years
7. **Witness Generation**: Create signed witness with ephemeral Ed25519 key

### Cryptographic Algorithms

- **XML Digest**: SHA256
- **XML Signature**: RSA-SHA1 (2048-bit)
- **Mobile Hash**: SHA256
- **Witness Signature**: Ed25519

## Dependencies

### Core Dependencies

- **express**: HTTP server framework
- **multer**: Multipart form data handling
- **adm-zip**: ZIP file decryption and extraction
- **fast-xml-parser**: XML parsing
- **axios**: HTTP client for testing
- **form-data**: Multipart form construction

### Midnight Network (Optional)

- **@midnight-ntwrk/wallet**: Blockchain wallet integration
- **@midnight-ntwrk/midnight-js-\***: ZK proof infrastructure

## Configuration

### Port

Default: `3000`

To change, modify `oracle-server.ts`:
```typescript
const port = 3000;
```

### Age Threshold

Default: `18` years

To change, modify `oracle-server.ts`:
```typescript
const isEligible = age >= 18;
```

## Development

### Add Logging

The server includes console logging for debugging:

```typescript
console.log("Verifying Aadhaar XML signature...");
```

### Certificate Updates

If UIDAI rotates certificates, update `TRUSTED_UIDAI_CERT` in `rsaverifier.ts`.

### Debug Certificate Mismatch

Use the debug utility:

```bash
npx ts-node debug-mismatch.ts
```

## Limitations

- **Certificate Expiry**: UIDAI certificate expires 2024-02-27 (hardcoded)
- **Single Certificate**: Only one UIDAI signing certificate supported
- **No Persistence**: Witness data is not stored
- **Ephemeral Keys**: Oracle signing keys are regenerated per request
- **No Rate Limiting**: No built-in request throttling
- **No Authentication**: Endpoint is publicly accessible

## Future Enhancements

- [ ] Support multiple UIDAI certificates with validity periods
- [ ] Persistent oracle signing keys with key rotation
- [ ] Database for witness audit trail
- [ ] Rate limiting and DDoS protection
- [ ] API authentication (JWT/OAuth)
- [ ] Support for other identity documents
- [ ] Integration with on-chain verification

## Midnight Network Integration

The `uidaidemo.ts` demonstrates integration with Midnight Network for privacy-preserving identity verification:

1. Connect to Midnight Testnet
2. Generate disposable wallet
3. Sign identity attestation
4. Create ZK proof witness
5. Submit to smart contract

### Testnet Configuration

```typescript
const config = {
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://127.0.0.1:6300"
}
```

## License

This is educational/research software. Ensure compliance with:
- UIDAI regulations for Aadhaar usage
- Data privacy laws (GDPR, local regulations)
- Identity verification regulations

## Disclaimer

This oracle server is for **educational and research purposes only**.

- Do NOT use in production without proper security auditing
- Ensure compliance with UIDAI terms of service
- Verify legal requirements for identity data processing
- Implement proper key management for production deployments

## Support

For issues or questions:
1. Check the error logs in console output
2. Verify XML file format matches UIDAI specifications
3. Ensure ZIP password is correct
4. Confirm UIDAI certificate hasn't expired

## References

- [UIDAI Aadhaar](https://uidai.gov.in/)
- [Midnight Network](https://midnight.network/)
- [XML Digital Signatures](https://www.w3.org/TR/xmldsig-core/)
- [Ed25519 Signatures](https://ed25519.cr.yp.to/)

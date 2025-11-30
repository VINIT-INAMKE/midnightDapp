# Midnight Network Education & Identity Platform

A comprehensive ecosystem combining privacy-preserving decentralized identity with blockchain-powered learning management. This platform integrates UIDAI (Aadhaar) verification, zero-knowledge proofs on the Midnight Network, and a full-featured Web3 Learning Management System.

## Repository Structure

This repository contains three main components:

```
midnight/
├── oracle/              # Aadhaar Oracle Server
│   └── Verifies UIDAI credentials and generates witnesses
│
├── my-app/              # DID Authentication DApp
│   └── Midnight Network smart contract and frontend
│
└── Web3LMS-combined/    # Full-Stack Learning Management System
    └── Django backend + Next.js frontend with blockchain integration
```

## Overview

### Platform Components

1. **Oracle Verification** (`oracle/`): Trusted oracle server that verifies encrypted Aadhaar documents, validates UIDAI signatures, and generates cryptographic witnesses for zero-knowledge proof systems
2. **DID Authentication** (`my-app/`): Midnight Network smart contract and CLI for registering privacy-preserving DIDs backed by verified Aadhaar credentials
3. **Web3 LMS** (`Web3LMS-combined/`): Complete Learning Management System with Django backend and Next.js frontend, featuring blockchain-anchored certificates, course management, and e-commerce capabilities

### Platform Integration Flow

```
┌──────────────────────────────────────────────────────────────┐
│  Students verify identity via Aadhaar (oracle/)             │
│         ↓                                                     │
│  Register privacy-preserving DID (my-app/)                   │
│         ↓                                                     │
│  Enroll in courses and earn blockchain certificates          │
│  (Web3LMS-combined/)                                         │
└──────────────────────────────────────────────────────────────┘
```

### Key Features

**Identity & Privacy:**
- **Privacy-First**: Zero-knowledge proofs hide sensitive identity data
- **Government-Backed**: Leverages India's UIDAI Aadhaar system for identity verification
- **Decentralized DIDs**: Identity stored on Midnight Network blockchain
- **Admin Controls**: Ban/unban identities, revoke DIDs
- **One Identity, One DID**: Privacy-preserving duplicate prevention

**Learning Management:**
- **Complete LMS**: Course creation, enrollment, progress tracking
- **Blockchain Certificates**: Immutable, verifiable course completion certificates
- **E-commerce**: Payment integration with Razorpay, shopping cart, coupons
- **NFT Integration**: Mint course completion NFTs on Cardano blockchain
- **Multi-role Support**: Separate dashboards for students, instructors, and admins

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

## Component 3: Web3 Learning Management System (`Web3LMS-combined/`)

A full-stack Learning Management System with blockchain integration for verifiable credentials and course completion certificates.

### Features

- ✅ **Complete LMS Platform**: Course creation, enrollment, progress tracking
- ✅ **Blockchain Certificates**: Immutable certificates stored on Cardano blockchain
- ✅ **NFT Minting**: Course completion NFTs as verifiable credentials
- ✅ **E-commerce Ready**: Shopping cart, payment gateway (Razorpay), coupon system
- ✅ **Multi-role Dashboard**: Separate interfaces for students, instructors, and admins
- ✅ **Rich Content**: CKEditor integration, video uploads, quiz management
- ✅ **Email System**: Mailgun integration for notifications and password reset
- ✅ **Modern UI**: Next.js 14 with TypeScript, Tailwind CSS, and shadcn/ui

### Quick Start

```bash
cd Web3LMS-combined

# Backend Setup
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database and API keys

# Initialize database
python manage.py migrate
python manage.py createsuperuser

# Start backend server
python manage.py runserver
# Runs on http://localhost:8000

# Frontend Setup (new terminal)
cd ../frontend/next14frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with API URLs

# Start frontend server
npm run dev
# Runs on http://localhost:3000
```

### Tech Stack

**Frontend:**
- Next.js 14 with App Router
- TypeScript, Tailwind CSS
- shadcn/ui components
- Zustand for state management
- CKEditor for rich text

**Backend:**
- Django 4.2 + Django REST Framework
- PostgreSQL database
- JWT authentication
- Mailgun email service
- Razorpay payment integration
- Jazzmin admin interface

### Key Features

**For Students:**
- Browse and enroll in courses
- Track learning progress
- Complete quizzes and assessments
- Earn blockchain-verified certificates
- Receive course completion NFTs
- Manage wishlist and shopping cart

**For Instructors:**
- Create and manage courses
- Build curriculum with modules and lectures
- Upload video content
- Create quizzes and assessments
- Track earnings and enrollments
- Manage student interactions

**For Administrators:**
- Comprehensive admin panel (Jazzmin)
- User and course management
- Payment and order tracking
- Platform analytics
- Certificate verification system

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js 14 + TypeScript)                     │
│  - Student/Instructor/Admin Dashboards                  │
│  - Course Pages, Video Player, Quizzes                  │
│  - Shopping Cart, Payment Integration                   │
└────────────────┬────────────────────────────────────────┘
                 │ REST API (Axios)
┌────────────────▼────────────────────────────────────────┐
│  Backend (Django + DRF)                                  │
│  - User Authentication (JWT)                             │
│  - Course & Enrollment Management                        │
│  - Payment Processing (Razorpay)                         │
│  - Certificate Generation                                │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌─────────┐          ┌──────────────────┐
│PostgreSQL│          │ Cardano Blockchain│
│ Database │          │  - Certificates   │
└──────────┘          │  - NFT Minting    │
                      └───────────────────┘
```

### Core Models

- **User & Profile**: Authentication and user management
- **Teacher**: Instructor profiles and social links
- **Course**: Course content, pricing, curriculum
- **Variant & VariantItem**: Course modules and lectures
- **EnrolledCourse**: Student enrollment tracking
- **Certificate**: Blockchain-anchored certificates
- **Cart & CartOrder**: E-commerce functionality
- **NFT**: Course completion NFT records

### API Endpoints

Access comprehensive API documentation:
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/
- **Admin Panel**: http://localhost:8000/admin/

### Deployment

**Backend (Render):**
```bash
# Configured for Render deployment
# Root directory: backend/
# Build command: ./build.sh
# Start command: gunicorn backend.wsgi:application
```

**Frontend (Vercel):**
```bash
# Optimized for Vercel deployment
# Root directory: frontend/next14frontend/
# Framework: Next.js
# Build command: npm run build
```

**📚 See [Web3LMS-combined/README.md](Web3LMS-combined/README.md) for detailed setup, configuration, and deployment instructions.**

---

## Complete End-to-End Flow

### Full Platform Integration

This flow demonstrates how all three components work together to create a complete education platform with privacy-preserving identity verification.

### 1. Student Identity Verification (Oracle)

```bash
cd oracle
npm start

# Student submits Aadhaar ZIP for verification
curl -X POST http://localhost:3000/verify-aadhaar \
  -F "file=@offlineaadhaar.zip" \
  -F "password=1234"

# Response: { student_credential: {...}, issuer_signature: "..." }
```

### 2. DID Registration (Midnight Network)

```bash
cd my-app
npm run did-cli

# Select: "1. Register new DID (User)"
# Enter oracle witness data:
# - student_id (from oracle)
# - salt (from oracle)
# - issuer_signature (from oracle)

# Privacy-preserving DID is created and linked to wallet
```

### 3. Verify DID Authentication

```bash
# Check DID authentication status
npm run did-cli
# Select: "3. Check Authentication"

# Returns: wallet has valid DID ✓
```

### 4. Enroll in Courses (Web3 LMS)

```bash
# Start LMS platform
cd Web3LMS-combined

# Backend
cd backend
python manage.py runserver  # Port 8000

# Frontend (new terminal)
cd frontend/next14frontend
npm run dev  # Port 3000

# Student can now:
# 1. Browse courses at http://localhost:3000
# 2. Enroll in courses using verified DID
# 3. Complete coursework and quizzes
# 4. Earn blockchain-anchored certificates
# 5. Mint NFTs for course completion
```

### 5. Course Completion & Certification

```
Student Journey:
┌────────────────────────────────────────────────────────┐
│ 1. Verify Aadhaar → Oracle generates witness          │
│ 2. Register DID → Midnight Network stores ZK proof    │
│ 3. Authenticate → Access Web3 LMS with verified DID   │
│ 4. Complete Course → Progress tracked in PostgreSQL   │
│ 5. Earn Certificate → Anchored on Cardano blockchain  │
│ 6. Mint NFT → Permanent credential on-chain           │
└────────────────────────────────────────────────────────┘
```

### 6. Admin Management (Optional)

**DID Management:**
```bash
cd my-app
npm run did-cli

# Ban a UIDAI identity
# Select: "5. Admin: Ban Aadhaar identity"

# Revoke a DID
# Select: "9. Admin: Revoke DID"
```

**LMS Management:**
```bash
# Access Django admin panel
# Navigate to: http://localhost:8000/admin

# Manage:
# - Users and roles
# - Courses and content
# - Enrollments and payments
# - Certificates and NFTs
# - Platform analytics
```

---

## Prerequisites

**Identity Platform (oracle/ & my-app/):**
- **Node.js**: 18+ (oracle), 22+ (my-app)
- **TypeScript**: 5.3+
- **Docker**: For Midnight proof server
- **Testnet Tokens**: From Midnight faucet

**Learning Platform (Web3LMS-combined/):**
- **Node.js**: 18+ and npm/yarn
- **Python**: 3.9+
- **PostgreSQL**: 13+ (or other Django-supported database)
- **pip**: Python package manager

## Installation (Full Stack)

```bash
# Clone repository
git clone <your-repo-url>
cd midnight

# ============================================
# Component 1: Setup Oracle Server
# ============================================
cd oracle
npm install
npm start  # Keep running on port 3000

# ============================================
# Component 2: Setup DID DApp (new terminal)
# ============================================
cd my-app
npm install
npm run setup
npm run did-cli

# ============================================
# Component 3: Setup Web3 LMS (new terminal)
# ============================================
cd Web3LMS-combined

# Backend setup
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Configure database and environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver  # Port 8000

# Frontend setup (new terminal)
cd frontend/next14frontend
npm install
cp .env.example .env.local
# Edit .env.local with API URLs
npm run dev  # Port 3000
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

### Web3 LMS Backend (`Web3LMS-combined/backend/.env`)
```env
# Database
DB_CONN_URL=postgresql://user:password@localhost:5432/web3lms

# Email (Mailgun)
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_SENDER_DOMAIN=your-domain.com
FROM_EMAIL=noreply@your-domain.com

# Payments
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Frontend URL
FRONTEND_SITE_URL=http://localhost:3000

# Storage (False = local disk, True = Cloudinary)
USE_CLOUDINARY=False

# Django Superuser (auto-creation)
CREATE_SUPERUSER=True
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your-secure-password
DJANGO_SUPERUSER_USERNAME=admin
```

### Web3 LMS Frontend (`Web3LMS-combined/frontend/next14frontend/.env.local`)
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1/
NEXT_PUBLIC_MINT_API_BASE_URL=https://vinitmint.vercel.app/

# Payment
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## Available Scripts

### Oracle (`oracle/`)
- `npm start` - Start oracle server (port 3000)
- `npm test` - Test oracle verification
- `npm run build` - Build TypeScript

### DApp (`my-app/`)
- `npm run setup` - Compile, build, deploy contract
- `npm run compile` - Compile Compact contract
- `npm run build` - Build TypeScript
- `npm run deploy` - Deploy to testnet
- `npm run did-cli` - Interactive DID CLI
- `npm run check-balance` - Check wallet balance
- `npm run reset` - Clean all artifacts

### Web3 LMS Backend (`Web3LMS-combined/backend/`)
- `python manage.py runserver` - Start development server
- `python manage.py migrate` - Apply database migrations
- `python manage.py makemigrations` - Create new migrations
- `python manage.py createsuperuser` - Create admin user
- `python manage.py collectstatic` - Collect static files
- `python manage.py test` - Run tests
- `./build.sh` - Production build script (Render)

### Web3 LMS Frontend (`Web3LMS-combined/frontend/next14frontend/`)
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

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

### Web3 LMS Security
- ✅ JWT-based authentication with token refresh
- ✅ Password hashing with Django's PBKDF2
- ✅ CORS configuration for API protection
- ✅ SQL injection protection via Django ORM
- ✅ XSS protection with Django templates
- ⚠️ Keep `.env` files secure (API keys, database credentials)
- ⚠️ Use HTTPS in production
- ⚠️ Configure allowed hosts in Django settings
- ⚠️ Regular security updates for dependencies

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

### Web3 LMS
- DID integration not yet implemented (future enhancement)
- Payment gateway limited to Razorpay (extensible)
- Cardano blockchain only (multi-chain support planned)
- Email requires Mailgun account
- PostgreSQL recommended (other databases supported)

## Future Enhancements

### Identity Platform
- [ ] Multi-certificate support for UIDAI
- [ ] Persistent oracle signing keys with rotation
- [ ] Witness audit trail database
- [ ] Rate limiting and DDoS protection
- [ ] API authentication (JWT/OAuth)
- [ ] Support for multiple identity documents
- [ ] On-chain oracle integration
- [ ] DID recovery mechanisms
- [ ] Multi-signature admin controls

### Platform Integration
- [ ] **Connect DID with Web3 LMS**: Use Midnight DID for LMS authentication
- [ ] **Unified Student Profile**: Link Aadhaar-verified identity to LMS enrollment
- [ ] **Cross-chain Certificates**: Store LMS certificates on both Midnight and Cardano
- [ ] **Privacy-preserving Enrollment**: Use ZK proofs for age/eligibility verification
- [ ] **Single Sign-On**: Use DID wallet for seamless LMS access

### Web3 LMS Enhancements
- [ ] Multi-chain support (Ethereum, Solana, Polygon)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics for instructors
- [ ] Community forum integration
- [ ] Live video classes (WebRTC)
- [ ] Internationalization (i18n) support
- [ ] Automated testing and CI/CD
- [ ] Additional payment gateways (Stripe, PayPal)
- [ ] Certificate NFT marketplace
- [ ] Peer-to-peer learning features

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

### Web3 LMS Issues
- **Database connection error**: Verify PostgreSQL is running and DB_CONN_URL is correct
- **"No module named 'X'"**: Activate virtual environment and run `pip install -r requirements.txt`
- **Static files not loading**: Run `python manage.py collectstatic`
- **CORS errors**: Check CORS settings in Django and NEXT_PUBLIC_API_BASE_URL
- **Payment failures**: Verify Razorpay API keys in both frontend and backend
- **Email not sending**: Check Mailgun API key and domain configuration
- **Frontend build errors**: Delete `.next` folder and `node_modules`, then reinstall

## Resources

### Documentation
- [Midnight Network Documentation](https://docs.midnight.network)
- [Compact Language Guide](https://docs.midnight.network/compact)
- [UIDAI Aadhaar](https://uidai.gov.in/)
- [DID Standards](https://www.w3.org/TR/did-core/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js Documentation](https://nextjs.org/docs)

### Blockchain & Cryptography
- [Ed25519 Signatures](https://ed25519.cr.yp.to/)
- [Cardano Developer Portal](https://developers.cardano.org/)
- [Zero-Knowledge Proofs](https://zkp.science/)

### Deployment Platforms
- [Render (Backend)](https://render.com/)
- [Vercel (Frontend)](https://vercel.com/)
- [Midnight Testnet Faucet](https://midnight.network/test-faucet)

## License

This is educational/research software. Ensure compliance with:
- UIDAI regulations for Aadhaar usage
- Data privacy laws (GDPR, local regulations)
- Identity verification regulations

## Disclaimer

⚠️ **This platform is for educational and research purposes only.**

- Do NOT use in production without proper security auditing
- Ensure compliance with UIDAI terms of service and data protection regulations
- Verify legal requirements for identity data processing in your jurisdiction
- Implement proper key management and secure credential storage for production deployments
- Test payment integrations thoroughly before handling real transactions
- Consult legal and security experts before production use

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Test thoroughly (testnet for blockchain components, local testing for LMS)
4. Follow code style guidelines (PEP 8 for Python, ESLint for TypeScript)
5. Update documentation as needed
6. Submit a pull request with clear description

## Support

For issues or questions:
1. **Check documentation**: Review README files in each component folder
2. **Review logs**: Check console output and application logs
3. **Verify setup**: Ensure all prerequisites are installed and configured
4. **Test connectivity**: Verify testnet connectivity and database connections
5. **Search issues**: Check existing GitHub issues for similar problems
6. **Ask for help**: Open a new issue with detailed information

## Project Structure Summary

```
midnight/
├── oracle/              📡 Aadhaar verification oracle
├── my-app/              🔐 Midnight DID authentication
└── Web3LMS-combined/    🎓 Full-stack learning platform
    ├── backend/         🐍 Django REST API
    └── frontend/        ⚛️  Next.js 14 application
```

---

Built with ❤️ using:
- **Midnight Network** for privacy-preserving identity
- **UIDAI Aadhaar** for government-backed verification
- **Cardano Blockchain** for immutable credentials
- **Django & Next.js** for modern web development

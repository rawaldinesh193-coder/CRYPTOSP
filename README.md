# CRYPTOSP — Production-Grade Full-Stack Digital Wallet & Platform

**CRYPTOSP** is a production-ready, full-stack digital wallet and internal cryptocurrency/payment platform featuring liquid glass visual aesthetics, double-entry accounting, live market feeds, and a completely separated Administrator Control Panel with full RBAC and immutable audit logging.

---

## 🌟 Key Platform Features

- **Liquid Glass Visual Foundation**: Cinematic black background (`#030305`), thin luminous glass borders, `Instrument Serif` editorial headings, and `Barlow` typography.
- **Phoenix Coin (PHX)**: Native internal digital asset with an administrator-configurable reference valuation ($10.00 USD initial value).
- **PostgreSQL Double-Entry Accounting**: Financial transactions generate atomic `DEBIT` and `CREDIT` entries in PostgreSQL. Balances are derived from historical ledger summation (`sum(credit) - sum(debit)`), guaranteeing strict zero-imbalance accounting invariants.
- **User Digital Wallet & Transfers**:
  - Unique `CSP-XXXXXXXXXXXX` Wallet IDs.
  - User-to-user transfers with atomic row-level locks (`SELECT FOR UPDATE`).
  - QR Code payment generation & scanner payload resolution.
  - Idempotency key protection (`Idempotency-Key` headers) to prevent duplicate submissions.
- **Separated Admin Control System**:
  - Completely isolated Administrator Control Center (`apps/admin`).
  - Strict RBAC (`SUPER_ADMIN`, `FINANCE_ADMIN`, `OPERATIONS_ADMIN`, `SUPPORT_ADMIN`, `AUDITOR`).
  - Finance Control Center: Administrative Deposit/Credit & Transaction Reversals via compensating double-entry transactions.
  - User Control: Wallet freeze & account suspension states (`ACTIVE`, `RESTRICTED`, `SUSPENDED`, `CLOSED`).
  - Immutable Audit Trail: Cryptographic audit logs recording admin actions, target IDs, timestamps, and compliance reasons.
- **Live Cryptocurrency Market Data**:
  - Public market provider abstraction for BTC, ETH, USDT, BNB, SOL, XRP, ADA, DOGE.
  - Robust caching and graceful fallback to offline status banners.

---

## 🏗️ Application Monorepo Architecture

```text
cryptosp/
├── apps/
│   ├── api/             # Express REST API Server + Ledger Engine
│   ├── web/             # User Digital Wallet & Public Landing Page (Port 3000)
│   └── admin/           # Privileged Administrator Control Center (Port 3001)
├── packages/
│   ├── ui/              # Liquid Glassmorphism Component Library (GlassCard, WalletQR, etc.)
│   ├── database/        # PostgreSQL Schema, Prisma Client & Double-Entry Ledger Service
│   ├── types/           # Shared TypeScript Interfaces, DTOs & Contracts
│   ├── validation/      # Zod Validation Schemas
│   └── config/          # Platform Constants & Default System Settings
├── prisma/              # PostgreSQL Schema & Migrations
├── docs/                # Backup/Recovery Procedures & Legal/Compliance Specs
└── infrastructure/      # Dockerfile, docker-compose.yml, Vercel & Render manifests
```

---

## ⚡ Quick Start & Development

### 1. Prerequisites
- Node.js v18+ and npm 10+
- PostgreSQL connection string (Neon DB / Supabase / local PostgreSQL)

### 2. Environment Setup
The root `.env` file contains your Neon PostgreSQL connection string:

```env
DATABASE_URL="postgresql://neondb_owner:npg_CZO6dgtDT3bX@ep-odd-dust-axohavgb.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
PORT=4000
JWT_SECRET="cryptosp_production_jwt_secret_key_2026_super_secure_998877665544332211"
PHOENIX_COIN_PRICE=10.00
NODE_ENV="development"
```

### 3. Run Build & Start
```bash
# Push database schema to Neon PostgreSQL
npm run db:push

# Build all monorepo workspaces
npm run build

# Start services
npm run dev:api    # REST API (Port 4000)
npm run dev:web    # User App (Port 3000)
npm run dev:admin  # Admin App (Port 3001)
```

---

## 🚀 Production Deployment Guidelines

### Deploying Frontend to Vercel
1. Connect `cryptosp` repository to Vercel.
2. Select Root Directory: `./`
3. Build Command: `npm run build:web`
4. Output Directory: `apps/web/dist`

### Deploying Backend API to Render
1. Create a Web Service on Render using `render.yaml`.
2. Set Environment Variables: `DATABASE_URL`, `JWT_SECRET`.
3. Health Check Path: `/health`

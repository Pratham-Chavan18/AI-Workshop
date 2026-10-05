# AI Workshop — Campus Referral & Leaderboard

[![CI Quality Gates](https://github.com/Pratham-Chavan18/AI-Workshop/actions/workflows/ci.yml/badge.svg)](https://github.com/Pratham-Chavan18/AI-Workshop/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-98%2F98_Passing-729B1B?logo=vitest&logoColor=white)](https://vitest.dev/)

> Production-grade viral campus referral and leaderboard platform designed to acquire **500 verified final-year engineering student registrations** for the free online workshop:  
> **"Build Your First AI Project in 60 Minutes"** (organized for NxtWave).

---

## ⚡ The Viral Growth Loop

The platform leverages an organic peer-to-peer campus growth loop with real-time gamification:

```text
┌────────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Landing Page  │ ──> │ Registration │ ──> │ Student Dashboard│ ──> │ WhatsApp Share │
│ (Value & FAQs) │     │ (College/Yr) │     │ (Milestones 0/3) │     │ (1-Tap Message)│
└────────────────┘     └──────────────┘     └──────────────────┘     └────────────────┘
                                                                              │
                                                                              ▼
┌──────────────────┐   ┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
│ College/Student  │ <── Referral     │ <── │ Friend Register  │ <── │ Dynamic Link   │
│   Leaderboard    │   │  Attribution │     │ (with Ref Code)  │     │ (/r/:code)     │
└──────────────────┘   └──────────────┘     └──────────────────┘     └────────────────┘
```

1. **Student Registers**: Chooses their campus and graduation year (2024–2030), instantly receiving a session.
2. **Personalized Referral Hub**: Receives a unique alphanumeric referral code and prefilled 1-tap WhatsApp share link.
3. **Peer Registration**: Friends follow the referral link (`/register?ref=CODE`) to enroll.
4. **Atomic Attribution**: On valid registration, referral attribution is verified and credited atomically inside a PostgreSQL transaction.
5. **Campus & Student Leaderboard**: Points update dynamically on public leaderboards, igniting campus competition.

---

## 🚀 Key Features

### 🎓 Student Experience
- **Fluid Registration Form**: Fast registration with searchable college combobox (100+ accredited Indian engineering institutes).
- **Format-Resilient Phone Handling**: Automatic whitespace removal and E.164 normalization, preserving leading `+` only for country codes while handling 10-digit domestic formats.
- **Graduation Year Guard**: Strictly validated graduation years (2024–2030) ensuring target final-year student acquisition.
- **Gamified Milestone Tracker**: Live progress meter tracking milestones toward the 3-referral reward tier with confetti celebrations.
- **One-Click Social Sharing**: Custom WhatsApp share action pre-populated with compelling workshop invitations and deep links.

### 🏆 Public Campus & Student Leaderboard
- **College Rankings**: Real-time aggregation of campus registrations, showing top participating engineering colleges.
- **Top Referrers**: Student referral leaderboard recognizing top campus ambassadors.
- **Accessible Dual-Tab Navigation**: WAI-ARIA compliant tablist with roving `tabIndex` and keyboard arrow-key navigation (`ArrowLeft` / `ArrowRight`).
- **Strict Student PII Shielding**: Zero exposure of sensitive registrant details (emails and phone numbers are never transmitted over public endpoints).

### 🛡️ Admin Management & Analytics
- **Role-Based Access Control (RBAC)**: Secure access tiers (`admin`, `operator`, `viewer`) authenticated via Argon2id hashed credentials and signed HttpOnly cookies.
- **Campaign Health & Velocity**: Live aggregate KPIs (total students, verified referrals, active campaigns, daily trend charts).
- **Streaming CSV Export**: Memory-efficient chunked CSV export with **Formula Injection Sanitization** (stripping and escaping unsafe leading `=`, `+`, `-`, `@` characters).

---

## 🔒 Security Architecture & Hardening

| Security Pillar | Production Implementation |
|---|---|
| **Zero-IDOR Student Auth** | Authenticated via signed `HttpOnly`, `SameSite=Lax` cookie session (`aiw_student_session`). URL or query `:userId` manipulation is strictly impossible. |
| **Referral Scoping & Isolation** | Database schema enforces `(campaignId, referredUserId)` compound unique constraints. Cross-campaign attribution and double crediting are blocked at the engine level. |
| **Concurrency & Race Defenses** | Registration transactions handle concurrent duplicate submissions (email/phone) and map Prisma `P2002` collisions cleanly to `409 Conflict`. |
| **Fail-Closed Config Validation** | Strict Zod validation on boot: enforces minimum 32-character session secrets, minimum 12-character admin passwords, valid port ranges (1–65535), and explicit CORS domains in production. |
| **Secret Scanning in CI** | TruffleHog pinned to immutable commit SHA runs on all pushes and PRs across commit history. |
| **Public Database RLS** | Row-Level Security policies active on Supabase PostgreSQL tables; public frontend access to internal tables is disabled. |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui primitives, Framer Motion, TanStack Query, React Hook Form, Zod, Lucide Icons, Recharts |
| **Backend** | Node.js 20, Express, TypeScript, Prisma ORM, PostgreSQL (Supabase-compatible), Argon2id, Pino logger, Helmet, express-rate-limit |
| **Testing** | Vitest, Supertest (10 test suites, 98 automated unit/integration/security tests) |
| **Workspaces** | npm Workspaces (`ai-workshop-backend`, `ai-workshop-frontend`) |

---

## 📂 Repository Structure

```text
AI-Workshop/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI: TruffleHog, migrations, audits, lint, build & tests
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema with relations & compound indexes
│   │   ├── migrations/          # Version-controlled SQL migration history
│   │   └── seed.ts              # Seed colleges, initial campaign, and bootstrap admin
│   ├── src/
│   │   ├── config/              # Zod-validated environment configuration (env.ts)
│   │   ├── controllers/         # Express route controllers (registrations, leaderboard, admin)
│   │   ├── middleware/          # Admin RBAC, student auth, rate limiters, error handling
│   │   ├── routes/              # Modular API routes (/api/v1/...)
│   │   ├── services/            # Core business logic (registration, referral attribution, export)
│   │   ├── utils/               # Cryptography, phone normalization, referral codes, logger
│   │   ├── validators/          # Zod request validators
│   │   └── server.ts            # Graceful shutdown server entrypoint
│   └── vitest.config.ts         # Backend test configuration with forks isolation
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components (Registration form, Leaderboards, Nav)
│   │   ├── pages/               # LandingPage, RegistrationPage, DashboardPage, LeaderboardPage, AdminPage
│   │   ├── lib/                 # Axios API client, query client, formatting utilities
│   │   └── styles/              # Tailwind CSS styling and theme configuration
│   └── vite.config.ts           # Vite bundler configuration
├── docs/                        # Complete technical and product documentation specifications
├── .env.example                 # Root environment variables template
└── package.json                 # Monorepo root configuration with npm workspaces
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later
- **PostgreSQL**: `v15+` (local PostgreSQL instance or Supabase project)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Pratham-Chavan18/AI-Workshop.git
cd AI-Workshop
npm install
```

### 2. Configure Environment Variables

Create `.env` inside `backend/` and `frontend/`:

**`backend/.env`**:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/aiworkshop?schema=public"
FRONTEND_URL="http://localhost:5173"
CORS_ORIGIN="http://localhost:5173"
SESSION_SECRET="your-development-session-secret-must-be-at-least-32-chars-long!"
ADMIN_BOOTSTRAP_EMAIL="admin@aiworkshop.nxtwave.com"
ADMIN_BOOTSTRAP_PASSWORD="Admin@Workshop2026!"
```

**`frontend/.env`**:
```env
VITE_API_BASE_URL="http://localhost:4000/api/v1"
```

### 3. Database Migration & Seeding

```bash
# From workspace root:
npm run prisma:generate --workspace=backend
npm run prisma:migrate --workspace=backend
npm run seed --workspace=backend
```

This seeds 100+ top engineering colleges, initializes the active AI Workshop campaign, and sets up the bootstrap admin account.

### 4. Start Local Development

```bash
# Run both backend and frontend concurrently
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000/api/v1`
- **Health Probes**: `http://localhost:4000/health/live` & `http://localhost:4000/health/ready`
- **Admin Portal**: `http://localhost:5173/admin`

---

## 🔑 Environment Variables Reference

| Variable | Workspace | Required | Default / Constraints | Description |
|---|---|:---:|---|---|
| `PORT` | Backend | No | `3000` (1–65535) | HTTP port the Express server listens on |
| `NODE_ENV` | Backend | No | `development` (`development`, `test`, `production`) | Runtime environment mode |
| `DATABASE_URL` | Backend | **Yes** | Valid PostgreSQL URL | Connection string for PostgreSQL or Supabase |
| `SESSION_SECRET` | Backend | **Yes** | Min 32 chars | Secret key used for signing session cookies |
| `CORS_ORIGIN` | Backend | **Yes (Prod)** | Comma-separated URLs | Allowed origin domains for CORS headers |
| `FRONTEND_URL` | Backend | No | `http://localhost:5173` | Canonical URL used for referral link generation |
| `ADMIN_BOOTSTRAP_PASSWORD` | Backend | No | Min 12 chars | Password used for initial admin seeding |
| `VITE_API_BASE_URL` | Frontend | No | `http://localhost:4000/api/v1` | Base URL for frontend API client requests |

---

## 📡 API Specification Summary

### Public Endpoints
- `POST /api/v1/registrations` — Register student; issues signed session cookie and referral code.
- `GET /api/v1/colleges` — Searchable listing of colleges for autocomplete combobox.
- `GET /api/v1/leaderboard/campuses` — Aggregated campus rankings (college name, total registrations, rank).
- `GET /api/v1/leaderboard/students` — Top student referrers (first name + initial, referrals count, rank).
- `GET /health/live` — Service liveness check (`200 OK`).
- `GET /health/ready` — Database connection readiness probe (`200 { status: "ready", database: "connected" }`).

### Student Session Endpoints (Requires `aiw_student_session` cookie)
- `GET /api/v1/users/me` — Authenticated student profile, referral code, and share URLs.
- `GET /api/v1/users/me/referrals` — Real-time list of friends referred and milestone progress.

### Admin Endpoints (Requires `aiw_admin_session` cookie)
- `POST /api/v1/admin/login` — Authenticate admin account via Argon2id; issues HttpOnly cookie.
- `POST /api/v1/admin/logout` — Revokes current admin session.
- `GET /api/v1/admin/campaigns/:id/stats` — High-level campaign KPIs and daily registration trends.
- `GET /api/v1/admin/campaigns/:id/export?format=csv` — Streaming CSV export with formula injection sanitization.

---

## 🧪 Testing & Verification

The test suite covers unit logic, concurrency races, security boundaries, and API integration:

```bash
# Run complete test suite across workspaces
npm run test

# Run backend test suite with Vitest
npm run test --workspace=backend

# Typecheck and validate TypeScript across all workspaces
npm run lint

# Compile production bundles
npm run build
```

### Test Coverage Highlights
- **Phone Normalization**: Tests verifying domestic/international formats, leading plus preservation, whitespace stripping, and duplicate collision.
- **Race Condition Testing**: Concurrent registration attempts with duplicate email or phone numbers properly resolving with `409 Conflict`.
- **Atomic Rollbacks**: Failure during referral crediting triggers full transaction rollback so no orphan registrations persist.
- **Negative Security Tests**: IDOR prevention, double-attribution prevention, self-referral prevention, and unauthenticated admin route rejections.

---

## 📖 Additional Documentation

- [Production Readiness Audit](docs/production-readiness.md) — Comprehensive checklist and security verification.
- [Security Architecture & Threat Mitigation](docs/security.md) — RLS policies, RBAC specifications, and vulnerability analysis.
- [API Contract Specification](docs/05-api-specification.md) — Full request/response payloads and error schemas.
- [Database Design & Schema](docs/04-database-design.md) — Relational schema design and indexing strategy.
- [UI/UX & Design Guidelines](docs/design.md) — Slush design aesthetic tokens, typography, and responsive component contracts.

---

## 📄 License

This repository is maintained for the **AI Workshop** initiative by NxtWave. All rights reserved.

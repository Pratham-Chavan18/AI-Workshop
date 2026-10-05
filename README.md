# AI Workshop — Campus Referral & Leaderboard

## Project Goal

Build a lightweight campaign platform that helps NxtWave acquire 500 final-year engineering student registrations for the free online workshop **“Build Your First AI Project in 60 Minutes.”**

The core growth loop is:

**Landing Page → Registration → Unique Referral Link → WhatsApp Sharing → Friend Registration → Referral Credit → Campus Leaderboard**

## MVP

### Student-facing

- Landing page with workshop value proposition
- Registration form
- Unique referral code and referral URL
- WhatsApp share button
- Referral progress counter
- Campus leaderboard
- Registration confirmation page

### Ambassador/admin-facing

- Basic campus leaderboard
- Registration totals
- Referral totals
- Top students/referrers
- Campus-level registration counts
- Ability to export registration data

## Recommended Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Node.js + Express + TypeScript
- Database: Supabase PostgreSQL
- ORM: Prisma
- Validation: Zod
- Deployment: Vercel (frontend) + Render/Railway (backend)

## Suggested Project Structure

```text
ai-workshop/
├── frontend/
├── backend/
├── docs/
├── README.md
└── .env.example
```

## Documentation

- `docs/production-readiness.md` — Complete production readiness, security architecture, and launch verification
- `docs/security.md` — Security architecture, RLS policy audit, and threat mitigations
- `docs/05-api-specification.md` — Backend API contract and auth mechanisms
- `docs/01-product-requirements.md` — Product requirements and scope
- `docs/02-campaign-strategy.md` — Campaign and acquisition model
- `docs/03-system-architecture.md` — Architecture and data flow
- `docs/04-database-design.md` — Database schema and relationships
- `docs/06-ui-ux-requirements.md` — Screens and UX requirements
- `docs/07-implementation-plan.md` — Development phases and tasks
- `docs/08-qa-test-plan.md` — Testing checklist

## Production Hardening Highlights

- **Zero-IDOR Student Auth**: Student dashboard uses signed HttpOnly cookies (`aiw_student_session`), eliminating URL/query `:userId` tampering.
- **Argon2id Admin RBAC**: Role-based access control (`admin`, `operator`, `viewer`) replaces static `X-Admin-Key` with secure sessions.
- **Referral Campaign Isolation**: Composite foreign keys and unique constraints enforce `referrer campaign == referral campaign == referred user campaign` at the database engine level.
- **Safe Export & Formula Injection Defense**: Chunked streaming CSV export sanitizes potential formula injection characters (`=`, `+`, `-`, `@`).
- **Observability**: Process liveness (`/health/live`) and database readiness (`/health/ready`) probes with bounded timeouts.
- **WAI-ARIA Accessibility**: Accessible combobox, tab panels, progress bars, and properly styled interactive links.

## Development & Verification Commands

```bash
# Root commands across workspaces
npm run build      # Builds both backend and frontend for production
npm run lint       # Typechecks backend and frontend (tsc --noEmit)
npm run test       # Runs backend automated test suite

# Backend specific
cd backend
npm run dev        # Run backend server in watch mode
npx prisma validate
npx prisma migrate deploy
npm run test       # Run 85 unit and integration tests

# Frontend specific
cd frontend
npm run dev        # Run Vite development server
npm run build      # Build frontend production bundle (frontend/dist)
```



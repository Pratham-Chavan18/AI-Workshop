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

- `docs/01-product-requirements.md` — product requirements and scope
- `docs/02-campaign-strategy.md` — campaign and acquisition model
- `docs/03-system-architecture.md` — architecture and data flow
- `docs/04-database-design.md` — database schema and relationships
- `docs/05-api-specification.md` — backend API contract
- `docs/06-ui-ux-requirements.md` — screens and UX requirements
- `docs/07-implementation-plan.md` — development phases and tasks
- `docs/08-qa-test-plan.md` — testing checklist

## Success Metrics

Primary KPI:

- 500 valid workshop registrations within 7 days

Secondary KPIs:

- Referral registration rate
- Average referrals per registrant
- Number of active campuses
- Registration conversion rate
- WhatsApp share rate
- Top-performing campus ambassadors

## Definition of Done for MVP

## Testing

Automated testing is configured using Vitest and Supertest in `backend`:

- **Environment Setup**: Tests run against a dedicated local configuration loaded via `backend/.env.test`.
  - In `vitest.config.ts`, `setupFiles: ['./src/tests/setup.ts']` ensures `.env.test` is initialized prior to application module evaluation.
  - `DATABASE_URL` is required and validated by Zod in all environments, preventing accidental fallback writes to shared or production databases.
- **Running Tests**:
  ```bash
  # Run all backend tests
  cd backend && npm run test

  # Run tests in watch mode
  cd backend && npx vitest
  ```


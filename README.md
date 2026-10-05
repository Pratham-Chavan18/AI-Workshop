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
A student can land on the site, understand the workshop in under 10 seconds, register successfully, receive a referral link, share it through WhatsApp, and have a friend’s valid registration automatically credited to the correct referrer and campus.

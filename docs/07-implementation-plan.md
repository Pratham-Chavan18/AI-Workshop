# Implementation Plan

## Phase 1 — Project Setup
- Create frontend and backend apps
- Configure TypeScript
- Configure Tailwind/shadcn
- Configure Prisma + Supabase
- Create environment files
- Configure Git and linting

## Phase 2 — Database
- Create campaign table
- Create college table
- Create users table
- Create referrals table
- Seed sample campaign and colleges
- Add indexes and unique constraints

## Phase 3 — Registration API
Implement:
- POST /registrations
- GET /colleges
- Validation with Zod
- Duplicate handling
- Referral attribution

## Phase 4 — Landing Page
Build:
- Hero
- Benefits
- Agenda
- Campus challenge
- Registration CTA

## Phase 5 — Referral Experience
Build:
- Success page
- Referral code
- Copy link
- WhatsApp share
- Referral progress

## Phase 6 — Leaderboard
Build:
- Campus leaderboard
- Referrer leaderboard
- Ranking calculation
- Auto-refresh / polling if desired

## Phase 7 — Admin Dashboard
Build:
- Campaign metrics
- Top campuses
- Top referrers
- Daily registration chart
- Export

## Phase 8 — QA + Deployment
- Unit tests
- API integration tests
- Mobile testing
- Referral edge cases
- Production environment setup
- Vercel deployment
- Render deployment
- Supabase production database

## Recommended Build Order
1. Database
2. Registration API
3. Landing page
4. Registration form
5. Referral dashboard
6. Leaderboard
7. Admin dashboard
8. Analytics/polish

## Git Branch Strategy
```text
main
 ├── feat/landing-page
 ├── feat/registration
 ├── feat/referral-system
 ├── feat/leaderboard
 └── feat/admin-dashboard
```

## First Milestone
The first working slice should be:

**Landing page → registration → referral URL → second registration → referral count increases.**

Do not build the complete admin dashboard before this loop works.

# Roadmap: AI 60 × 500 — Campus Referral & Leaderboard

## Overview

Build the complete, production-grade campaign platform for NxtWave's "Build Your First AI Project in 60 Minutes" workshop. Structured in horizontal layers: establishing the monorepo and database infrastructure first, constructing robust validated backend domain services and referral attribution, building the Meta-inspired frontend landing page and interactive registration/referral flow, and finishing with public leaderboards, admin analytics, and end-to-end testing.

## Phases

- [x] **Phase 1: Project Scaffolding & Infrastructure** - Initialize monorepo structure, TypeScript configs, dependencies, and environment pipelines.
- [x] **Phase 2: Database Schema, Migrations & College Seeding** - Implement Prisma models, constraints, migrations, and seed script for colleges and active campaign.
- [x] **Phase 3: Registration API & Duplicate Protection** - Build registration endpoint, college lookup, Zod validation, unique referral code generation, and duplicate rejection.
- [x] **Phase 4: Referral Attribution Engine & Leaderboard APIs** - Build referral tracking, anti-abuse checks, student referral summary, and public leaderboard queries.
- [x] **Phase 5: Admin Analytics & Data Export APIs** - Implement admin authentication header, KPI stats endpoint, and authorized CSV/JSON export.
- [x] **Phase 6: Meta Design System & Workshop Landing Page** - Setup Meta tokens (`#0064e0`), Tailwind/shadcn primitives, Framer Motion, and high-conversion landing page.
- [x] **Phase 7: Registration UI & Student Referral Dashboard** - Implement registration form with college search, referral code URL capture, and dashboard with 1-click WhatsApp share.
- [x] **Phase 8: Public Leaderboard UI, Admin Dashboard & E2E Verification** - Build campus/student leaderboards, admin KPI dashboard, and execute comprehensive integration tests.

## Phase Details

### Phase 1: Project Scaffolding & Infrastructure
**Goal**: Establish clean production monorepo workspace for frontend (React + Vite + TypeScript + Tailwind) and backend (Node.js + Express + TypeScript + Prisma).
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-03
**UI hint**: no
**Success Criteria**:
  1. Monorepo directory structure (`frontend/` and `backend/`) initializes cleanly with isolated `package.json` and strict TypeScript configurations.
  2. Backend Express application boots with Helmet, CORS, health check endpoint (`/health`), and structured request logging.
  3. Frontend Vite app builds without errors with Tailwind CSS configured and ready for component integration.
**Plans**: 2 plans

Plans:
- [x] 01-01: Initialize monorepo, backend Express server, TypeScript setup, and environment config.
- [x] 01-02: Initialize frontend Vite React TypeScript application and configure Tailwind CSS foundation.

### Phase 2: Database Schema, Migrations & College Seeding
**Goal**: Design and deploy relational database schema supporting campaigns, colleges, users, referrals, and admin access.
**Depends on**: Phase 1
**Requirements**: INFRA-01, INFRA-02
**UI hint**: no
**Success Criteria**:
  1. Prisma schema declares models for `Campaign`, `College`, `User`, `Referral`, and `AdminUser` with proper UUIDs, foreign keys, and indexes.
  2. Database migrations execute successfully against PostgreSQL.
  3. Seed script populates default active campaign and directory of major Indian engineering colleges with autocomplete indexes.
**Plans**: 2 plans

Plans:
- [x] 02-01: Define Prisma schema with entities, relations, constraints, and execute initial migration.
- [x] 02-02: Implement idempotent database seed script populating campaign parameters and curated college directory.

### Phase 3: Registration API & Duplicate Protection
**Goal**: Implement bulletproof student registration endpoint, college search, input normalization, and duplicate prevention.
**Depends on**: Phase 2
**Requirements**: REG-01, REG-02, REG-04, REG-05, REF-01
**UI hint**: no
**Success Criteria**:
  1. `GET /api/v1/colleges?search=query` returns matching colleges with fast text search.
  2. `POST /api/v1/registrations` validates input via Zod, normalizes email/phone, and generates unique 6-character referral code.
  3. Duplicate registration with same email returns structured error `EMAIL_ALREADY_REGISTERED` with HTTP 409.
**Plans**: 2 plans

Plans:
- [x] 03-01: Implement college search endpoint and Zod registration request validator.
- [x] 03-02: Implement registration controller and service with email uniqueness check and referral code generator.

### Phase 4: Referral Attribution Engine & Leaderboard APIs
**Goal**: Implement safe referral tracking upon friend registration, student referral status, and cached/optimized leaderboard endpoints.
**Depends on**: Phase 3
**Requirements**: REF-05, REF-06, LEAD-01, LEAD-02, LEAD-04
**UI hint**: no
**Success Criteria**:
  1. Friend registering with valid `referralCode` creates explicit `Referral` record and increments referrer's total.
  2. Self-referrals and circular referrals are safely rejected without breaking friend registration.
  3. `GET /api/v1/users/:userId/referrals` returns referral count, goal target (3), and campus rank.
  4. `GET /api/v1/leaderboard/campuses` and `GET /api/v1/leaderboard/referrers` return ranked lists without exposing emails or phones.
**Plans**: 2 plans

Plans:
- [x] 04-01: Implement referral attribution service with transactional integrity and anti-abuse safeguards.
- [x] 04-02: Implement user referral dashboard and public campus/referrer leaderboard endpoints.

### Phase 5: Admin Analytics & Data Export APIs
**Goal**: Expose secure operational endpoints for campaign metrics, trends, and full registration data exports.
**Depends on**: Phase 4
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04
**UI hint**: no
**Success Criteria**:
  1. Unauthenticated requests to `/api/v1/admin/*` are rejected with HTTP 401/403.
  2. `GET /api/v1/admin/campaigns/:id/stats` returns total registrations, progress toward 500 target, active campuses, and referral conversion rate.
  3. `GET /api/v1/admin/campaigns/:id/export` streams complete verified registration records in CSV and JSON formats.
**Plans**: 2 plans

Plans:
- [x] 05-01: Implement admin authentication middleware and campaign analytics service.
- [x] 05-02: Implement streaming CSV and JSON registration data export endpoints.

### Phase 6: Meta Design System & Workshop Landing Page
**Goal**: Implement Meta design tokens (`DESIGN.md`), shadcn component primitives, Framer Motion animations, and the high-conversion workshop landing page.
**Depends on**: Phase 1
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05
**UI hint**: yes
**Success Criteria**:
  1. Design system establishes Meta tokens (`#0064e0`, pill CTAs, 24px cards, clean typography, dark/light compatibility).
  2. Landing page displays hero headline ("Build Your First AI Project in 60 Minutes"), value proposition, and prominent CTAs.
  3. Curriculum agenda, takeaways, live registration ticker, and campus challenge callout render responsively across mobile and desktop.
**Plans**: 2 plans

Plans:
- [x] 06-01: Implement Meta design system tokens, Tailwind theme extensions, and core UI primitives.
- [x] 06-02: Build complete workshop landing page sections (Hero, Value Prop, Agenda, Campus Challenge, CTAs).

### Phase 7: Registration UI & Student Referral Dashboard
**Goal**: Deliver seamless registration modal/flow, URL referral parameter capture, and viral student referral dashboard.
**Depends on**: Phase 3, Phase 4, Phase 6
**Requirements**: REG-03, REF-02, REF-03, REF-04, LEAD-03
**UI hint**: yes
**Success Criteria**:
  1. Registration form captures input with inline validation, college search autocomplete, and automatically detects `?ref=CODE`.
  2. Post-registration referral screen shows confirmed status, unique referral code, and 1-click clipboard copy button.
  3. WhatsApp share button opens WhatsApp with pre-filled engaging message and student's personal referral URL.
  4. Student dashboard reflects real-time progress toward the 3-referral goal with visual progress bar.
**Plans**: 2 plans

Plans:
- [x] 07-01: Build registration form component with college autocomplete and referral URL parameter detection.
- [x] 07-02: Build student referral dashboard with WhatsApp share, copy link, and 0/3 progress tracker.

### Phase 8: Public Leaderboard UI, Admin Dashboard & E2E Verification
**Goal**: Build public leaderboard views, admin reporting UI, and execute full end-to-end QA test suite across all user loops.
**Depends on**: Phase 5, Phase 7
**Requirements**: INFRA-04
**UI hint**: yes
**Success Criteria**:
  1. Public leaderboard page displays ranked colleges and top referrers with search and filter controls.
  2. Admin dashboard displays KPI cards, daily registration trend charts, and functional export buttons.
  3. Automated end-to-end test suite validates the full viral loop: Landing Page ➔ Registration ➔ Referral Link ➔ Friend Registration ➔ Referral Credited ➔ Leaderboard Updated.
**Plans**: 2 plans

Plans:
- [x] 08-01: Build public leaderboard and admin analytics dashboard frontend views.
- [x] 08-02: Create automated integration and end-to-end tests validating the full campaign loop and edge cases.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 6 ➔ 7 ➔ 8

| Phase | Plans Complete | Status | Completed |
|---|---|---|---|
| 1. Project Scaffolding & Infrastructure | 2/2 | Complete | 2026-10-04 |
| 2. Database Schema, Migrations & College Seeding | 2/2 | Complete | 2026-10-04 |
| 3. Registration API & Duplicate Protection | 2/2 | Complete | 2026-10-04 |
| 4. Referral Attribution Engine & Leaderboard APIs | 2/2 | Complete | 2026-10-04 |
| 5. Admin Analytics & Data Export APIs | 2/2 | Complete | 2026-10-04 |
| 6. Meta Design System & Workshop Landing Page | 2/2 | Complete | 2026-10-04 |
| 7. Registration UI & Student Referral Dashboard | 2/2 | Complete | 2026-10-04 |
| 8. Public Leaderboard UI, Admin Dashboard & E2E Verification | 2/2 | Complete | 2026-10-04 |

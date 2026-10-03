# Requirements: AI 60 × 500 — Campus Referral & Leaderboard

**Defined:** 2026-10-03
**Core Value:** A student lands on the site, registers in under 10 seconds, receives a unique referral link, shares it via WhatsApp, and every friend registering through it automatically credits the referrer and updates their campus leaderboard in real-time.

## v1 Requirements

Requirements committed for initial release.

### Landing Experience & Design System (LAND)

- [ ] **LAND-01**: User sees high-impact workshop landing page with hero headline ("Build Your First AI Project in 60 Minutes"), value proposition ("One hour. One real project. Zero cost."), and prominent registration CTA.
- [ ] **LAND-02**: User can review the 60-minute workshop agenda breakdown, key takeaways, and beginner-friendly prerequisites.
- [ ] **LAND-03**: User sees live social proof counter reflecting progress toward the 500-registration campaign goal and active campus challenge callout.
- [ ] **LAND-04**: Interface implements Meta design tokens (`#0064e0` primary accent, pill buttons, 24px card rounding, clean hierarchy) with mobile-first responsive layout.
- [ ] **LAND-05**: Interface provides purposeful Framer Motion micro-interactions with full support for `prefers-reduced-motion`.

### Registration & Validation (REG)

- [ ] **REG-01**: Student can submit registration form with full name, email, phone (optional), college, and graduation year.
- [ ] **REG-02**: Student can select their college via searchable autocomplete or enter an unlisted college.
- [ ] **REG-03**: Registration form automatically detects, preserves, and populates incoming referral code from `?ref=CODE` URL parameter.
- [ ] **REG-04**: Backend validates all registration inputs with Zod, normalizes email and phone, and rejects invalid data.
- [ ] **REG-05**: Backend detects and gracefully rejects duplicate registrations by email within the campaign with clear error messaging.

### Referral Engine & Viral Loop (REF)

- [ ] **REF-01**: System generates a unique, deterministic referral code and shareable referral URL (`/register?ref=CODE`) for every registered student.
- [ ] **REF-02**: Registered student lands on personal referral dashboard with copyable referral link and 1-click clipboard button.
- [ ] **REF-03**: Student can click 1-touch WhatsApp share button with pre-filled engaging copy containing their unique referral link.
- [ ] **REF-04**: Student dashboard visually displays referral progress toward the `0/3` friends goal with dynamic status feedback.
- [ ] **REF-05**: Backend creates an explicit referral record and credits the referrer when a referred student completes valid registration.
- [ ] **REF-06**: Referral engine enforces anti-abuse safeguards: self-referral rejection, non-duplicate attribution, and idempotent processing.

### Leaderboards & Public Rankings (LEAD)

- [ ] **LEAD-01**: User can view public campus leaderboard ranking colleges by valid registrations in descending order with deterministic tie-breaking.
- [ ] **LEAD-02**: User can view public student referral leaderboard highlighting top referrers across campuses.
- [ ] **LEAD-03**: Registered student can view their college's current rank and total registrations on their dashboard.
- [ ] **LEAD-04**: Public leaderboard endpoints strictly protect privacy by never exposing student emails, phone numbers, or private metadata.

### Campaign Administration & Reporting (ADMIN)

- [ ] **ADMIN-01**: Admin endpoints are protected via secure `X-Admin-Key` header authentication.
- [ ] **ADMIN-02**: Admin can view campaign KPI summary cards (total registrations, 500-goal progress %, referral registrations, active campuses, referral rate %).
- [ ] **ADMIN-03**: Admin can view daily registration trends and acquisition source breakdowns.
- [ ] **ADMIN-04**: Admin can export complete verified registration records in CSV and JSON formats.

### Architecture, Database & Testing (INFRA)

- [ ] **INFRA-01**: PostgreSQL database schema managed via Prisma ORM with models for Campaign, College, User, Referral, and AdminUser with required indexes and constraints.
- [ ] **INFRA-02**: Database seed script populates active workshop campaign, initial colleges directory, and sample test data.
- [ ] **INFRA-03**: Node.js/Express backend configured with Helmet, strict CORS origins, rate limiting on registration endpoints, and structured logging.
- [ ] **INFRA-04**: Automated test suite validates registration input validation, referral attribution logic, duplicate detection, and leaderboard query accuracy.

## v2 Requirements

Deferred to future releases.

### Gamification & Badges
- **GAME-01**: Automated unlockable digital achievement badges upon reaching 3, 5, and 10 successful referrals.
- **GAME-02**: Real-time WebSocket / SSE push notifications on the referral dashboard when a friend completes registration.

### Communications & Reminders
- **COMM-01**: Automated email confirmation and calendar invite (.ics) sent to student upon registration.
- **COMM-02**: Automated WhatsApp notification sent to referrer notifying them of successful referral credit.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-level referral marketing (MLM) | Single-tier direct referral is standard and clean for student campaign; prevents gaming and spam |
| Payment Gateway Integration | Workshop is 100% free; zero financial transaction overhead |
| SMS OTP Verification | Excluded for MVP to avoid latency drop-off and third-party SMS gateway billing |
| Native Mobile Apps (iOS/Android) | Mobile web responsive app handles WhatsApp click-throughs with zero install barrier |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 8 | Pending |
| LAND-01 | Phase 2 | Pending |
| LAND-02 | Phase 2 | Pending |
| LAND-03 | Phase 2 | Pending |
| LAND-04 | Phase 2 | Pending |
| LAND-05 | Phase 2 | Pending |
| REG-01 | Phase 3 | Pending |
| REG-02 | Phase 3 | Pending |
| REG-03 | Phase 3 | Pending |
| REG-04 | Phase 3 | Pending |
| REG-05 | Phase 3 | Pending |
| REF-01 | Phase 4 | Pending |
| REF-02 | Phase 4 | Pending |
| REF-03 | Phase 4 | Pending |
| REF-04 | Phase 4 | Pending |
| REF-05 | Phase 4 | Pending |
| REF-06 | Phase 4 | Pending |
| LEAD-01 | Phase 5 | Pending |
| LEAD-02 | Phase 5 | Pending |
| LEAD-03 | Phase 5 | Pending |
| LEAD-04 | Phase 5 | Pending |
| ADMIN-01 | Phase 6 | Pending |
| ADMIN-02 | Phase 6 | Pending |
| ADMIN-03 | Phase 6 | Pending |
| ADMIN-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 🟢

---
*Requirements defined: 2026-10-03*
*Last updated: 2026-10-03 after initial definition*

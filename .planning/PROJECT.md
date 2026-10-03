# AI 60 × 500 — Campus Referral & Leaderboard

## What This Is

A high-converting, lightweight campaign platform built for NxtWave to acquire 500 verified final-year engineering student registrations within 7 days for the free live workshop "Build Your First AI Project in 60 Minutes." The platform turns every registration into a viral campus distribution engine through instant personalized referral codes, one-click WhatsApp sharing, and a dynamic public campus leaderboard.

## Core Value

A student lands on the site, understands the workshop value proposition in under 10 seconds, registers with their campus, immediately receives a shareable referral link, and every friend registering through that link automatically credits the referrer and updates their campus leaderboard ranking in real-time.

## Business Context

- **Customer**: NxtWave (Growth & Marketing Team targeting final-year engineering students across Indian colleges)
- **Revenue model**: Free acquisition funnel / workshop registration converting attendees into advanced programs
- **Success metric**: 500 valid, unique engineering student registrations within a 7-day campaign window
- **Strategy notes**: Organic viral referral loop driven by college pride and a public campus ranking contest on ₹2,000 budget ([docs/02-campaign-strategy.md](file:///d:/Project/Refferal%20tracker/docs/02-campaign-strategy.md))

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] High-conversion workshop landing page with hero, outcome preview, 60-min agenda, and clear registration CTAs
- [ ] Responsive student registration form capturing full name, email, phone, college (with autocomplete), graduation year, and auto-populated referral code
- [ ] Strict duplicate prevention rejecting existing email addresses and normalizing phone/email formatting
- [ ] Deterministic unique referral code and URL generation per registrant (`https://<domain>/register?ref=CODE`)
- [ ] 1-click WhatsApp share button with pre-filled engaging copy containing the personal referral link
- [ ] Real-time student referral dashboard displaying referral count, goal progress (`0/3`), campus rank, and copy link CTA
- [ ] Robust backend referral attribution crediting the referrer only upon verified, non-duplicate, non-self friend registration
- [ ] Public campus leaderboard aggregating valid registrations per college in descending order with deterministic tie-breaking
- [ ] Secondary top-student referrers leaderboard respecting privacy (no emails/phones exposed)
- [ ] Admin dashboard with secure API key access showing KPIs (total registrations, goal progress, referral rate, active campuses) and charts
- [ ] Admin export endpoint generating full registration records (CSV/JSON) for authorized operators
- [ ] Anti-abuse and security protections (rate limiting on registrations, server-side validation with Zod, parameterized queries)
- [ ] Meta-inspired design system (`DESIGN.md`) integrated with modern Tailwind CSS, shadcn/ui components, and Framer Motion micro-interactions

### Out of Scope

- Multi-level referral commissions (MLM) — Unnecessary complexity for a 7-day student campaign
- Paid registration / payment gateway integration — Workshop is 100% free
- Heavy SMS/OTP verification gateway — Excluded for MVP to avoid latency and SMS vendor costs; email uniqueness and client/server validation enforced
- Gamified token/currency wallet beyond registration counts — Simple `0/3` referral milestone is sufficient
- Native iOS/Android mobile apps — Mobile-first web application satisfies all WhatsApp-driven traffic needs

## Context

- The campaign operates under a strict 7-day timeline with a low direct ad spend, relying primarily on viral peer-to-peer sharing in college WhatsApp groups.
- The UI must look like a high-end developer product rather than a generic webinar page, adopting Meta design tokens (`#0064e0` primary, pill CTAs, 24px-32px card radius, crisp typography, and purposeful motion).
- The full technical architecture encompasses a React + Vite + TypeScript frontend and a Node.js + Express + Prisma ORM + PostgreSQL backend.
- Full specifications, API contracts, database schemas, and QA test plans are detailed in `docs/` and `ANTIGRAVITY_PROMPT.md`.

## Constraints

- **Tech Stack**: Frontend: React 18+, Vite, TypeScript, Tailwind CSS, shadcn/ui primitives, Framer Motion. Backend: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Supabase-compatible), Zod.
- **Design System**: Meta design system tokens from `DESIGN.md` combined with composable UI architecture specified in `docs/design.md`.
- **Performance**: Registration API response time < 1.5s under concurrent traffic spikes; landing page LCP < 2.0s on 4G mobile.
- **Privacy & Security**: Zero exposure of private emails, phone numbers, or database secrets on public endpoints or client bundles.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monorepo with `frontend/` and `backend/` | Clear separation of concerns while keeping schemas and types unified in one workspace | 🟢 Good |
| Prisma ORM with PostgreSQL | Strong type safety, auto-generated migrations, and direct compatibility with Supabase | 🟢 Good |
| Meta Design Tokens (`getdesign add meta`) | Clean product-merchandising visual language, high contrast, crisp pill CTAs, and trustworthy aesthetic | 🟢 Good |
| Explicit Referral Entity in Database | Storing referral events as relational records prevents counter drift and enables auditability | 🟢 Good |
| Admin Token Auth for MVP | Simple `X-Admin-Key` header with optional password login avoids session complexity while securing operator endpoints | 🟢 Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? ➔ Move to Out of Scope with reason
2. Requirements validated? ➔ Move to Validated with phase reference
3. New requirements emerged? ➔ Add to Active
4. Decisions to log? ➔ Add to Key Decisions
5. "What This Is" still accurate? ➔ Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check ➔ still the right priority?
3. Audit Out of Scope ➔ reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-03 after initialization*

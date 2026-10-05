# AI Workshop — Campus Referral & Leaderboard

## Project Context
This repository contains the full source code and documentation for the **AI Workshop** platform built for NxtWave. The goal is to acquire 500 verified final-year engineering student registrations for the free online workshop *"Build Your First AI Project in 60 Minutes"* via a viral campus referral loop and public college leaderboard.

## Key Documents
- [PROJECT.md](file:///d:/Project/Refferal%20tracker/.planning/PROJECT.md): Project definition, core value, active requirements, and key decisions.
- [REQUIREMENTS.md](file:///d:/Project/Refferal%20tracker/.planning/REQUIREMENTS.md): Functional and non-functional requirements with requirement traceability.
- [ROADMAP.md](file:///d:/Project/Refferal%20tracker/.planning/ROADMAP.md): Phase breakdown, plan structure, and current execution progress.
- [STATE.md](file:///d:/Project/Refferal%20tracker/.planning/STATE.md): Current position, session continuity, and velocity metrics.
- [DESIGN.md](file:///d:/Project/Refferal%20tracker/DESIGN.md): Meta design system tokens (cobalt `#0064e0` accent, pill CTAs, rounded surfaces, crisp typography).
- [docs/design.md](file:///d:/Project/Refferal%20tracker/docs/design.md): Composable UI/UX specifications, Framer Motion rules, and responsive design guidelines.
- [ANTIGRAVITY_PROMPT.md](file:///d:/Project/Refferal%20tracker/ANTIGRAVITY_PROMPT.md): Master technical specifications and architecture contracts.

## Technology Stack
- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS, shadcn/ui primitives, Framer Motion, TanStack Query, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Supabase-compatible), Zod, Helmet, CORS, express-rate-limit.
- **Testing**: Vitest, Supertest.

## GSD Workflow Rules
- Always consult `.planning/STATE.md` to identify the active phase and plan before executing tasks.
- Keep commits atomic and traceable back to the corresponding phase and plan.
- Maintain production code quality: no placeholder stubs, no fake mocks in production routes, strict server-side validation.
- Uphold student privacy: never expose emails or phone numbers on public endpoints or client bundles.

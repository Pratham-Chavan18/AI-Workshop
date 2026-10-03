# Antigravity Master Prompt — AI 60 × 500 Campus Referral & Leaderboard

You are the lead production software engineer responsible for building the entire **AI 60 × 500 — Campus Referral & Leaderboard** application from the ground up.

The product supports NxtWave's simulated 7-day campaign to obtain **500 valid final-year engineering student registrations** for:

> **Build Your First AI Project in 60 Minutes**

The central growth loop is:

**Landing Page → Registration → Unique Referral Link → WhatsApp Sharing → Friend Registration → Valid Referral Credit → Campus Leaderboard → More Sharing**

---

## 0. NON-NEGOTIABLE EXECUTION RULES

### Build the real product. Do NOT generate a scaffold.

You must implement a complete, runnable, production-quality application.

Do **not**:
- create placeholder pages
- leave TODO comments instead of implementation
- leave fake API responses
- use mock data in production paths
- create empty service/controller files
- use `alert()` for important UX
- hardcode leaderboard counts
- hardcode referral counts
- hardcode fake registration success
- store secrets in source code
- expose private user data to public APIs
- expose database credentials to the frontend
- implement security only in the UI
- create an endpoint solely because it was listed in the docs if the endpoint design is insecure; improve it while preserving the intended product behavior

Every feature that is marked MVP in the documentation must work end-to-end.

If a requirement is ambiguous, choose the safest production-ready interpretation, document the decision, and continue. Do not stop implementation merely because a minor detail is unspecified.

Do not ask me to manually implement missing pieces that are within your responsibility as the coding agent.

---

# 1. REQUIRED DOCUMENTS — READ THESE FIRST

Treat these repository documents as the primary product specification and keep implementation aligned with them:

1. `README.md`
2. `docs/01-product-requirements.md`
3. `docs/02-campaign-strategy.md`
4. `docs/03-system-architecture.md`
5. `docs/04-database-design.md`
6. `docs/05-api-specification.md`
7. `docs/06-ui-ux-requirements.md`
8. `docs/07-implementation-plan.md`
9. `docs/08-qa-test-plan.md`

Also use:
10. `.env.example`

Read all of them before writing application code.

After reading them, inspect the repository for any existing source files. Reuse good existing code where appropriate, but do not preserve insecure or inconsistent implementation merely for compatibility.

If the repository is empty, initialize the full project structure yourself.

---

# 2. PRODUCT OUTCOME

The finished application must let a student:

1. Open the campaign landing page.
2. Understand the workshop value proposition in seconds.
3. Register successfully.
4. Receive a unique referral link/code.
5. Share the referral link through WhatsApp or copy it.
6. See referral progress.
7. See their campus position.
8. View the public campus leaderboard.
9. Have valid friends registering through their link automatically credited to them.

The campaign operator must be able to:

1. Authenticate securely as an admin.
2. Create/configure a campaign.
3. View registration statistics.
4. View campus statistics.
5. View referral statistics.
6. View daily registration trends.
7. View sources.
8. View top referrers.
9. Export authorized registration data.
10. Detect suspicious/spam activity where possible.

---

# 3. RECOMMENDED TECHNOLOGY STACK

Use this stack unless a repository constraint makes a better equivalent necessary:

## Frontend
- React
- Vite
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query for server state
- React Hook Form
- Zod validation

## Backend
- Node.js
- Express
- TypeScript strict mode
- Prisma ORM
- Zod
- PostgreSQL / Supabase PostgreSQL
- Pino or equivalent structured logging

## Security
- Argon2id for password hashing where passwords are used
- Secure, HttpOnly cookies for authenticated browser sessions
- CSRF protection appropriate to the chosen cookie strategy
- Helmet/security headers
- CORS with explicit allowed origins
- Rate limiting
- Input validation and normalization
- Parameterized database queries through Prisma
- Safe error handling
- No secret leakage through logs or responses

## Testing
- Vitest or Jest for unit tests
- Supertest for API integration tests
- Playwright for critical end-to-end flows

## Deployment target
- Frontend: Vercel
- Backend: Render or equivalent Node hosting
- Database: Supabase PostgreSQL

Do not add unnecessary dependencies merely for abstraction.

---

# 4. ARCHITECTURE REQUIREMENTS

Use a clean production architecture.

Recommended structure:

```text
ai60-campus-referral/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── main.tsx
│   └── ...
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── modules/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── ...
├── docs/
├── .env.example
├── README.md
└── ...
```

Use feature-oriented modules where practical rather than a giant controller/service file.

Keep business logic out of Express route handlers.

Expected flow:

```text
HTTP Request
   ↓
Route
   ↓
Validation Middleware
   ↓
Authentication / Authorization Middleware where required
   ↓
Controller
   ↓
Service / Domain Logic
   ↓
Prisma Repository/Data Access
   ↓
PostgreSQL
```

---

# 5. DATABASE — PRODUCTION IMPLEMENTATION

Implement the entities described in `docs/04-database-design.md`.

Minimum models:

- Campaign
- College
- User/Registrant
- Referral
- AdminUser

Use proper PostgreSQL UUIDs or equivalent safe IDs.

Use timestamps consistently and prefer UTC at the database/application boundary.

Add appropriate indexes for:
- campaign ID
- normalized email
- normalized phone when present
- referral code
- college ID
- referred-by user ID
- referral status
- created_at

Use database-level unique constraints, not only application checks.

At minimum:

```text
unique(campaign_id, normalized_email)
unique(referral_code)
unique(referred_user_id)
```

Phone uniqueness must be enforced when phone is collected, using normalized E.164-compatible representation where practical.

Do not rely on `COUNT(*)` counters stored as mutable denormalized fields unless there is a clear consistency strategy. The source of truth for referrals must be referral records and valid registrations.

If cached aggregate values are introduced for performance, update them transactionally and provide a reconciliation path.

---

# 6. REFERRAL SYSTEM — CRITICAL BUSINESS LOGIC

This is the most important backend component.

## Referral creation rules

A referral may be credited only when:

1. The referral code exists.
2. The campaign is active.
3. The new registration is valid.
4. The registrant is not already registered for that campaign.
5. The referrer is not the same registrant.
6. The referred registration is successfully persisted.
7. The referral is not already associated with another referrer.

## Transaction requirement

Registration + referral attribution must happen inside a database transaction where appropriate.

The application must be safe under concurrent requests.

Example race condition to protect against:

```text
Request A: same email
Request B: same email

Both check "not registered"
Both attempt insert
```

The database unique constraint must be the final protection.

Gracefully convert constraint conflicts into deterministic API errors.

## Referral code generation

Generate cryptographically safe, collision-resistant referral codes.

Do not use sequential database IDs as referral codes.

Referral codes must be:
- URL-safe
- short enough for sharing
- case-normalized
- unique
- difficult to guess at scale

## Self-referral

Do not allow self-referral.

Do not treat an invalid referral code as a reason to reject an otherwise valid registration unless explicitly required by product rules.

The safe behavior is:

```text
invalid referral → valid registration without referral credit
```

unless the product explicitly chooses strict mode.

---

# 7. STUDENT SESSION / DASHBOARD SECURITY

Do not implement an insecure endpoint such as:

```text
GET /users/:userId/referrals
```

where possession of a user ID is sufficient to retrieve a student's dashboard.

The initial documentation uses a `userId` example for simplicity. For the production implementation, use a secure browser session or an opaque, high-entropy dashboard token delivered through a secure HttpOnly cookie.

The client must not be able to enumerate another student's dashboard by changing an ID in the URL.

Never expose:
- email
- phone
- private registration metadata
- internal database identifiers unnecessarily

in the public leaderboard.

---

# 8. ADMIN AUTHENTICATION & AUTHORIZATION

Do not implement production admin access using a static `ADMIN_API_KEY` as the primary browser authentication mechanism.

Implement proper admin authentication.

Minimum requirements:

- Admin email + password login
- Argon2id password hashing
- Secure HttpOnly session cookie
- Session expiration
- Logout/revocation
- Role-based authorization
- Rate limiting on login
- Generic login failure messages
- No password hashes in responses
- No secrets in frontend code

If refresh tokens are used, store them safely and rotate/revoke according to the chosen design.

Admin endpoints must enforce authentication server-side.

---

# 9. CSRF, CORS & COOKIE SECURITY

Because the application will use browser cookies where appropriate:

- configure `SameSite` intentionally
- use `Secure` in production
- use `HttpOnly` for authentication cookies
- configure exact allowed frontend origins
- reject unknown CORS origins
- implement CSRF protection for state-changing authenticated browser requests if required by the cookie deployment model
- never use `Access-Control-Allow-Origin: *` with credentialed requests

Document the final deployment-specific cookie/CORS model in `docs` or README.

---

# 10. INPUT VALIDATION & NORMALIZATION

Validate every untrusted request on the backend.

Use Zod schemas or equivalent for:
- registration
- college search
- referral codes
- admin login
- campaign configuration
- pagination
- sorting
- export parameters

Normalize:
- email → trim + lowercase
- referral code → uppercase or one canonical format
- phone → normalized phone representation
- text fields → trim and enforce length limits

Apply maximum lengths to all user-controlled text.

Reject malformed data with structured error responses.

Never trust frontend validation.

---

# 11. API DESIGN

Implement versioned REST APIs under:

```text
/api/v1
```

At minimum implement the product capabilities described in:

`docs/05-api-specification.md`

Required functional areas:

- registration
- college search/list
- student referral dashboard
- campus leaderboard
- optional student/referrer leaderboard
- admin stats
- admin export
- admin authentication
- campaign configuration as needed

Use a consistent response format.

Success example:

```json
{
  "success": true,
  "data": {}
}
```

Error example:

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_REGISTERED",
    "message": "This email is already registered for this campaign."
  }
}
```

Do not leak stack traces or internal database errors in production responses.

Use HTTP status codes correctly.

---

# 12. RATE LIMITING & ABUSE PREVENTION

Implement practical rate limits.

At minimum protect:
- admin login
- student registration
- college search
- public leaderboard APIs
- referral/dashboard endpoints

Consider IP + route limits and, where appropriate, account/email identifiers.

Avoid overly aggressive limits that make the normal student flow unusable.

Add anti-abuse measures appropriate to the simulation without introducing unnecessary paid infrastructure.

Potential measures:
- email uniqueness
- phone uniqueness when collected
- referral uniqueness
- IP/request rate limits
- suspicious registration logging
- basic bot/honeypot field on registration

Do not expose internal abuse-detection signals publicly.

---

# 13. SECURITY HEADERS & HTTP HARDENING

Configure a security middleware such as Helmet appropriately.

At minimum consider:
- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Strict-Transport-Security in production HTTPS
- frame protection

Do not blindly paste a restrictive CSP that breaks the production app. Configure it based on actual assets and APIs.

Disable unnecessary Express fingerprinting.

Set reasonable body-size limits.

---

# 14. LOGGING & ERROR HANDLING

Use structured logging.

Log:
- startup/shutdown
- important application failures
- registration events at a privacy-safe level
- referral attribution failures
- admin authentication events without credentials

Never log:
- passwords
- password hashes
- full authentication cookies
- session tokens
- secrets
- full phone numbers where unnecessary

Create a single error-handling layer.

Distinguish:
- operational errors
- validation errors
- authentication errors
- authorization errors
- database constraint conflicts
- unexpected errors

Unexpected errors should produce a safe generic message to the client while preserving diagnostic details in server logs.

---

# 15. LANDING PAGE IMPLEMENTATION

Build the real landing page described in `docs/06-ui-ux-requirements.md`.

Core message:

> **Build Your First AI Project in 60 Minutes**
>
> One hour. One real project. Zero cost.

Required sections:

1. Hero
2. What the student will build
3. Who should join
4. 60-minute workshop agenda
5. What the student takes away
6. Social proof / registration count
7. Campus challenge
8. Registration CTA
9. Footer

Requirements:
- mobile-first
- fast loading
- accessible
- polished
- clear hierarchy
- strong CTA
- no excessive animations
- no generic template feel

Use shadcn/ui for reusable UI primitives where it improves consistency.

Do not make the page look like a generic AI-generated SaaS template.

---

# 16. REGISTRATION UX

Registration should be short.

Required/expected information:
- full name
- email
- college
- graduation year
- phone only where enabled by product configuration

Preserve referral attribution from:

```text
?ref=CODE
```

Do not rely only on client state. Re-submit the referral code to the backend and validate it there.

On success:
- show clear confirmation
- create the student's referral capability
- provide WhatsApp CTA
- provide copy-link CTA
- show referral progress
- show campus information/rank where appropriate

On duplicate registration:
- do not create a second record
- show an understandable message
- avoid revealing more information than necessary

---

# 17. WHATSAPP SHARING

Create the share message dynamically.

Example:

> 🚀 I'm joining a free session to build my first AI project in 60 minutes. You should join too!
>
> Register here: [REFERRAL_URL]

Use a proper URL-safe WhatsApp share link.

Do not hardcode a referral code into the frontend bundle.

Use the student's current referral URL.

The share feature must work from mobile browsers and degrade gracefully on desktop.

---

# 18. CAMPUS LEADERBOARD

Public leaderboard must display safe fields only.

Minimum:
- rank
- college name
- valid registrations

Ranking rules:

1. descending valid registration count
2. deterministic alphabetical college-name tie breaker

Never rely on frontend sorting for correctness.

The backend should return the authoritative rank and count.

Do not expose private student data.

If the campaign is not active, respect the campaign status rules.

---

# 19. ADMIN DASHBOARD

Build a real dashboard.

Cards:
- total valid registrations
- target progress
- referral registrations
- active campuses
- referral rate

Charts/analytics:
- registrations by day
- registrations by source
- top campuses
- top referrers

Features:
- campaign selection if multiple campaigns exist
- pagination for large tables
- search/filter where useful
- secure export
- logout

The dashboard must use real API data.

No fake statistics in the final product.

---

# 20. ADMIN EXPORT

Export only for authorized admins.

Support CSV initially unless another format is justified.

Do not expose passwords, tokens, internal secrets, or authentication information.

Apply pagination/chunking or streaming for exports rather than loading an unbounded dataset into memory.

Validate export filters.

Audit export actions if practical.

---

# 21. CAMPAIGN CONFIGURATION

Do not hardcode the 500 target in application logic everywhere.

Campaign should own:
- name
- slug
- target registrations
- start time
- end time
- status

Use campaign configuration for the target and lifecycle.

Registration must respect campaign state/date rules.

Use UTC internally and convert to local display timezone deliberately.

---

# 22. FRONTEND ENGINEERING QUALITY

Use:
- reusable components
- feature modules
- typed API clients
- centralized query configuration
- consistent loading states
- empty states
- error states
- success states
- skeletons where useful
- accessible form labels
- keyboard navigation
- semantic HTML

Do not duplicate API calls or business rules in random components.

Do not store sensitive auth data in localStorage if a secure HttpOnly cookie can be used.

Never place secrets in `VITE_*` environment variables.

---

# 23. BACKEND ENGINEERING QUALITY

Use:
- typed request/response models
- service boundaries
- repository/data-access boundaries where useful
- centralized validation
- centralized errors
- transaction boundaries around critical business logic
- database constraints
- testable business services

Keep controllers thin.

Avoid giant files.

Use dependency injection lightly where it materially helps testing; do not overengineer.

---

# 24. PERFORMANCE

Optimize the important path:

**Landing → Registration → Referral Dashboard**

Requirements:
- database indexes for lookup fields
- efficient leaderboard queries
- pagination on admin data
- no N+1 query patterns
- no unnecessary refetch loops
- sensible frontend caching
- gzip/brotli through hosting where available
- optimized images/assets

The leaderboard can use a short client refresh interval only if needed. Do not create an aggressive polling loop.

---

# 25. ACCESSIBILITY

Target WCAG-aligned baseline behavior.

Ensure:
- sufficient contrast
- visible focus state
- labels for inputs
- keyboard-accessible controls
- semantic landmarks
- accessible modal/dialog behavior
- proper error messaging
- no information conveyed by color alone

---

# 26. SEO / SHARING METADATA

The landing page should have:
- meaningful title
- meta description
- Open Graph title/description
- social preview image placeholder that can be replaced with final creative
- canonical URL configuration

Do not expose referral tokens in page title or metadata unnecessarily.

---

# 27. TESTING — MUST BE IMPLEMENTED, NOT JUST DOCUMENTED

Use automated tests.

## Unit tests
Test:
- normalization
- referral code generation
- referral validation
- self-referral detection
- ranking logic
- campaign state logic

## API integration tests
Test:
- successful registration
- duplicate email
- duplicate phone if enabled
- invalid referral code
- valid referral attribution
- self-referral
- concurrent duplicate registration
- campaign closed
- rate limited request
- unauthorized admin request
- authorized admin request

## End-to-end tests
At minimum:

```text
Landing page
   ↓
Student A registers
   ↓
Student A receives referral link
   ↓
Student B uses referral link
   ↓
Student B registers
   ↓
Student A referral count becomes 1
   ↓
Campus leaderboard count increases
```

Also test:

```text
Student A tries own referral
→ no referral credit
```

and:

```text
Student B refreshes / revisits referral URL
→ no duplicate registration/referral
```

---

# 28. QA & SECURITY CHECKLIST

Before calling the project complete, verify:

### Registration
- required fields validated
- duplicate registration handled
- normalization correct
- rate limiting active

### Referral
- referral code cryptographically safe
- self-referral blocked
- referral stored explicitly
- duplicate referral impossible at DB level
- race conditions handled

### Privacy
- public leaderboard has no email/phone
- admin-only data protected
- logs contain no secrets

### Authentication
- admin password hashed with Argon2id
- session cookies secure
- logout works
- authorization enforced server-side

### Web security
- CORS restricted
- CSRF addressed where relevant
- Helmet/security headers configured
- XSS-safe rendering
- request body limits configured
- input validation server-side

### Database
- migrations work from clean database
- seed script works
- indexes present
- unique constraints present

### Production
- build succeeds
- frontend build succeeds
- backend build succeeds
- no TypeScript errors
- lint passes
- tests pass
- environment variables documented
- production start scripts work

---

# 29. ERROR HANDLING UX

The frontend must handle at least:

- network failure
- timeout
- duplicate registration
- invalid referral code
- campaign closed
- rate limited
- server error

Do not display raw backend stack traces.

Give users actionable, human-readable messages.

---

# 30. SEED DATA

Create a safe development seed script containing:

- one sample campaign
- several sample colleges
- representative development registrations
- representative referral records
- one admin development account if environment variables provide seed credentials

Clearly distinguish development seed data from production.

Never seed fake campaign statistics into production unless explicitly requested.

---

# 31. ENVIRONMENT CONFIGURATION

Create/update `.env.example` with clear categories.

Example categories:

```env
# Backend
NODE_ENV=development
PORT=4000
DATABASE_URL=
CORS_ORIGIN=
SESSION_SECRET=

# Admin seed / bootstrap only
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=

# Frontend
VITE_API_BASE_URL=
VITE_APP_URL=
```

Do not commit real secrets.

Validate required environment variables at startup and fail fast with a useful message.

Do not print secret values in startup logs.

---

# 32. DEVELOPMENT WORKFLOW

Implement in this order:

## Phase 1
Repository initialization + TypeScript + tooling + environments

## Phase 2
Prisma schema + migrations + seed

## Phase 3
Registration domain logic + API

## Phase 4
Referral domain logic + secure student session/dashboard

## Phase 5
Landing page + registration UI

## Phase 6
Campus leaderboard

## Phase 7
WhatsApp sharing + referral UX

## Phase 8
Admin auth + dashboard

## Phase 9
Export + analytics

## Phase 10
Security hardening + tests + responsive QA

## Phase 11
Production build + deployment configuration + documentation

Do not move forward from a foundational phase with known compile/runtime failures.

---

# 33. GIT PRACTICES

Use small logical commits/branches if Git is configured.

Suggested branches:

```text
feat/project-foundation
feat/database
feat/registration
feat/referral-system
feat/landing-page
feat/leaderboard
feat/admin-dashboard
feat/security-hardening
feat/testing
```

Never commit `.env` files containing secrets.

---

# 34. DEFINITION OF DONE

The project is only complete when ALL of the following are true:

1. A clean checkout can install dependencies.
2. Environment setup is documented.
3. Database migrations run successfully.
4. Seed command works in development.
5. Frontend builds successfully.
6. Backend builds successfully.
7. No TypeScript compile errors remain.
8. Registration works end-to-end.
9. Referral attribution works end-to-end.
10. Duplicate/referral race cases are protected.
11. Campus leaderboard uses real data.
12. Student dashboard is not accessible by arbitrary user ID enumeration.
13. Admin authentication is secure.
14. Admin authorization is enforced server-side.
15. Registration endpoint is rate-limited.
16. Public APIs do not expose private student data.
17. WhatsApp sharing works.
18. Admin dashboard uses real API data.
19. CSV export works for authorized admins.
20. Unit/integration/E2E tests cover critical flows.
21. Security headers/CORS/cookie settings are configured.
22. Production environment variables are documented.
23. No placeholder/TODO implementation remains in production paths.
24. README contains exact local setup and deployment instructions.
25. The final UI is polished and responsive.

---

# 35. FINAL AGENT BEHAVIOR

Work like a senior engineer performing an actual production implementation.

Before coding:
1. Read every listed document.
2. Inspect the repository.
3. Identify inconsistencies or insecure assumptions.
4. Resolve them using secure engineering judgment.
5. Write a brief implementation checklist into `docs/implementation-status.md`.

While coding:
1. Implement working features end-to-end.
2. Run tests after meaningful milestones.
3. Fix failures before continuing.
4. Keep types strict.
5. Keep security server-enforced.
6. Keep business logic testable.

After coding:
1. Run frontend typecheck/build/lint.
2. Run backend typecheck/build/lint.
3. Run unit tests.
4. Run integration tests.
5. Run critical E2E tests.
6. Review dependency/security warnings.
7. Inspect the production build for obvious runtime/configuration problems.
8. Update README with exact setup commands.
9. Update `docs/implementation-status.md` with completed items and any genuinely remaining limitations.

If a test fails, debug and fix it rather than merely reporting the failure.

If a dependency or API has changed, use the currently installed/documented version and adapt the implementation rather than inventing APIs.

Do not stop at architecture diagrams or scaffolding. **The expected output is functioning source code.**

---

# 36. FIRST TASK — START NOW

Start by doing the following in the repository:

### Step 1
Read:

```text
README.md
docs/01-product-requirements.md
docs/02-campaign-strategy.md
docs/03-system-architecture.md
docs/04-database-design.md
docs/05-api-specification.md
docs/06-ui-ux-requirements.md
docs/07-implementation-plan.md
docs/08-qa-test-plan.md
.env.example
```

### Step 2
Inspect the existing source tree.

### Step 3
Create:

```text
docs/implementation-status.md
```

and record:
- current repository state
- implementation phases
- security decisions
- any conflicts resolved from the initial docs

### Step 4
Initialize/repair the application foundation.

### Step 5
Implement the first complete vertical slice:

```text
Landing Page
   ↓
Registration Form
   ↓
POST /api/v1/registrations
   ↓
Database Transaction
   ↓
Unique Referral Code
   ↓
Secure Student Session
   ↓
Referral Dashboard
```

### Step 6
Add the referred-student flow:

```text
Referral Link
   ↓
Preserve ?ref=CODE
   ↓
Registration
   ↓
Validate Referrer
   ↓
Create Referral Record
   ↓
Update Leaderboard Through Source-of-Truth Queries
```

### Step 7
Run tests and fix all failures.

Do not move on while the vertical slice is broken.

---

# FINAL INSTRUCTION

**Build the actual production-ready AI 60 × 500 Campus Referral & Leaderboard application now.**

Do not give me a tutorial instead of implementation.
Do not give me only a folder structure.
Do not generate a scaffold and stop.
Do not leave fake data in production flows.
Do not weaken security for convenience.

**Read the documents, implement the system, test it, harden it, and leave the repository in a runnable state.**

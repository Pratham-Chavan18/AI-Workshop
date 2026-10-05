# AI Workshop — Production Readiness & Security Verification

## 1. Security Architecture
The **AI Workshop** application implements defense-in-depth across frontend, backend, and PostgreSQL layers.

```
┌────────────────────────────────────────────────────────┐
│                   Client Browser (SPA)                 │
│              React 18 + Vite + Tailwind CSS            │
│         HttpOnly Cookies (Credentials withCredentials)  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS (Strict CORS, Origin Validation)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Backend Express API                  │
│  - Helmet (CSP, HSTS, X-Content-Type-Options, Frame)   │
│  - Fail-Closed Production CORS (explicit origins)      │
│  - Rate Limiting (Route-specific window & burst caps)  │
│  - Zod Validation Schemas (Strict server-side parsing) │
│  - HMAC-SHA256 Signed HttpOnly Session Cookies         │
│  - Argon2id Password Hashing (OWASP recommended)       │
│  - Role-Based Access Control (admin, operator, viewer) │
│  - Streaming Bounded CSV Export with Formula Defense   │
│  - Campaign Time Window & State Guards                 │
│  - Bounded Health & Readiness Probes                   │
└───────────────────────────┬────────────────────────────┘
                            │ Direct Pooled Connection (Prisma)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Supabase / PostgreSQL                  │
│  - Row Level Security (RLS Enabled on ALL tables)      │
│  - Strict Revocation from anon & authenticated roles   │
│  - Composite Foreign Keys & Multi-column Unique Keys   │
│  - Engine-level CHECK Constraints (Grad Year, Self-Ref)│
│  - Atomic ACID Transactions with Prisma P2002 Mapping  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Architecture

### 2.1 Student Authentication (Zero-IDOR Session Model)
- **Elimination of IDOR**: The deprecated `/dashboard/:userId` route has been replaced with `/dashboard` (frontend) and `GET /api/v1/users/me/dashboard` (backend).
- **Session Issuance**: Upon successful registration or campaign entry, the backend issues an `aiw_student_session` cookie containing an HMAC-SHA256 signed payload:
  - `sub`: User ID
  - `camp`: Campaign ID
  - `iat`: Timestamp
  - `exp`: 14 days expiration
- **Cookie Attributes**:
  - `HttpOnly: true` (inaccessible to JavaScript)
  - `Secure: true` in production (`NODE_ENV === 'production'`)
  - `SameSite: 'lax'` (or `'none'` when deployed across separate subdomains with HTTPS)
  - `Path: '/'`
- **Session Verification**: `requireStudentSession` middleware validates signature, expiry, and retrieves the active user record. If user ID from URL or query is attempted, it is ignored or verified against `req.user.id`.

### 2.2 Admin Authentication (Argon2id + RBAC)
- **Shared Key Removal**: `X-Admin-Key` and `ADMIN_API_KEY` are eliminated from production paths.
- **Credential Storage**: Admin accounts store passwords hashed with **Argon2id** (`type: 2`, `memoryCost: 65536` [64 MB], `timeCost: 3`, `parallelism: 4`).
- **Admin Session**: Authenticated via `POST /api/v1/admin/auth/login`. Sets `aiw_admin_session` cookie:
  - `sub`: Admin User ID
  - `role`: Role (`admin` | `operator` | `viewer`)
  - `exp`: 8 hours short-lived
- **Revocation / Logout**: `POST /api/v1/admin/auth/logout` clears the session cookie immediately.

---

## 3. Authorization & Role Matrix

| Endpoint | Method | Required Role / Identity | Purpose |
|---|---|---|---|
| `/api/v1/registrations` | POST | Public (Rate limited) | Register student & establish student session |
| `/api/v1/users/me/dashboard` | GET | Authenticated Student (`aiw_student_session`) | Retrieve student's own referral code, stats & referral list |
| `/api/v1/users/:userId/referrals` | GET | Authenticated Student (Must match `:userId`) | Legacy compatibility route with strict IDOR verification |
| `/api/v1/leaderboard/campuses` | GET | Public | Aggregated campus ranking (No PII) |
| `/api/v1/leaderboard/referrers` | GET | Public | Safe top referrers (`First Name + Last Initial`, No PII) |
| `/api/v1/campaigns/:campaignId/stats` | GET | Public (Active campaigns only) | Safe campaign totals |
| `/api/v1/admin/auth/login` | POST | Public (Strict rate limit) | Admin credential authentication |
| `/api/v1/admin/auth/logout` | POST | Authenticated Admin | Session termination |
| `/api/v1/admin/auth/me` | GET | `viewer`, `operator`, `admin` | Current admin session verification |
| `/api/v1/admin/campaigns/:id/stats` | GET | `viewer`, `operator`, `admin` | Admin dashboard analytics |
| `/api/v1/admin/campaigns/:id/trend` | GET | `viewer`, `operator`, `admin` | Parameterized trend series (1-90 days) |
| `/api/v1/admin/campaigns/:id/export` | GET | `operator`, `admin` (`viewer` 403 Forbidden) | Bounded streaming CSV export |

---

## 4. Row Level Security (RLS) & Database Access

### RLS Policies
- `College`: RLS enabled. Read-only policy `allow_public_read_colleges` for public directory lookup. Mutations revoked.
- `Campaign`: RLS enabled. Policy `allow_public_read_active_campaigns` restricted to `status = 'active'`. Paused/closed campaigns hidden from direct PostgREST scraping.
- `User`: RLS enabled. All direct PostgREST access (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) is **REVOKED** from `anon` and `authenticated`.
- `Referral`: RLS enabled. Direct PostgREST access is **REVOKED**.
- `AdminUser`: RLS enabled. Direct PostgREST access is **REVOKED**.

### Least Privilege Database Role
- Direct PostgREST client traffic cannot read or modify student records or admin credentials.
- Backend connects using dedicated PostgreSQL credentials with access scoped to the application database.

---

## 5. Referral Integrity & Cross-Campaign Isolation

To prevent cross-campaign referral theft or attribution pollution:
1. **Scoped Referral Code Lookup**: Referral codes are resolved strictly with `where: { campaignId, referralCode }`. A code generated in Campaign A is invalid in Campaign B.
2. **Database Invariants**:
   - `User` has compound uniqueness `@@unique([id, campaignId])`.
   - `Referral` enforces composite foreign keys:
     - `(referrerUserId, campaignId) REFERENCES User(id, campaignId)`
     - `(referredUserId, campaignId) REFERENCES User(id, campaignId)`
   - PostgreSQL guarantees at the storage engine level that `referrer campaign == referral campaign == referred user campaign`.
3. **Self-Referral & Double-Attribution Guards**:
   - Self-referrals are rejected via email normalization comparison and database `CHECK ("referrerUserId" != "referredUserId")`.
   - Compound unique constraint `@@unique([referredUserId, campaignId])` ensures a student cannot be referred more than once.
4. **Campaign Window Enforcement**: Registrations are verified against `startsAt <= now` and `endsAt >= now` in addition to `status === 'active'`.
5. **Atomic Transactions & Prisma P2002 Handling**: All registration and referral logic executes in an interactive transaction with automatic translation of `P2002` violations into HTTP `409 Conflict`.

---

## 6. PII Handling & Privacy Preservation

1. **Public APIs**:
   - Public campus leaderboard exposes only college name, city, state, and registration count.
   - Public referrer leaderboard returns privacy-safe `displayName` (e.g. `Rahul S.`), `collegeName`, and `referralCount`. Internal UUIDs, email addresses, phone numbers, and referral codes are completely excluded.
   - Registration response returns only `{ id, fullName, referralCode, referralUrl }`.
2. **Admin CSV Export Hardening**:
   - Role-gated (`operator` and `admin` only; `viewer` rejected with HTTP 403).
   - Sanitized against **CSV Injection (Formula Injection)**: Fields starting with `=`, `+`, `-`, or `@` are prefixed with `'` to prevent execution in spreadsheet software.
   - Streaming cursor pagination (500 rows per chunk) eliminates unbounded memory consumption.
3. **Structured Logging**:
   - Passwords, admin secrets, session tokens, and complete phone numbers are never logged. Email is redacted where appropriate.

---

## 7. Rate Limiting Matrix

- **General API**: 100 requests per 15-minute window per IP.
- **Registration**: 10 registrations per 15-minute window per IP.
- **Leaderboards**: 60 requests per minute per IP.
- **Admin Authentication**: 10 login attempts per 15 minutes per IP.
- **Admin Operations**: 30 requests per minute per authenticated admin.

---

## 8. Production Environment Variables Reference

| Variable | Required | Minimum Specification / Format | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `production` | Enables secure cookies, strict CORS, and disables debug logging |
| `PORT` | Optional | `4000` (default) | HTTP port for backend server |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/db?schema=public` | PostgreSQL connection string |
| `CORS_ORIGIN` | Yes | `https://workshop.nxtwave.com,https://nxtwave.com` | Comma-separated allowed production origins |
| `SESSION_SECRET` | Yes | ≥ 32 characters random string | Key for HMAC-SHA256 session token signatures |
| `ADMIN_BOOTSTRAP_EMAIL` | Optional | `admin@nxtwave.com` | Seed bootstrap admin email |
| `ADMIN_BOOTSTRAP_PASSWORD` | Optional | ≥ 12 characters | Seed bootstrap admin initial password (never logged) |
| `VITE_API_BASE_URL` | Yes (Frontend) | `https://api-workshop.nxtwave.com/api/v1` | Public API base URL for client bundle |

---

## 9. Migration & Deployment Process

1. **Database Schema & Migrations**:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
2. **Initial Admin Bootstrapping**:
   ```bash
   ADMIN_BOOTSTRAP_EMAIL="admin@aiworkshop.nxtwave.com" \
   ADMIN_BOOTSTRAP_PASSWORD="SuperSecretProductionPassword123!" \
   npx ts-node prisma/seed.ts
   ```
   *Note: If an admin already exists, seed will leave the existing password untouched.*
3. **Backend Build & Start**:
   ```bash
   cd backend
   npm run build
   npm run start
   ```
4. **Frontend Build & Deployment**:
   ```bash
   cd frontend
   npm run build
   # Deploy frontend/dist to static hosting (Vercel, Cloudflare Pages, Netlify) with SPA fallback
   ```

---

## 10. Backup & Rollback Procedures

- **Point-in-Time Recovery**: Supabase PITR or automated daily PostgreSQL snapshots.
- **Schema Migration Rollback**:
  - Down migrations must be reviewed before deployment.
  - Foreign key constraints can be rolled back via explicit SQL migration scripts without data loss.

---

## 11. Monitoring & Observability

- **Liveness Probe**: `GET /health/live` (Returns HTTP 200 `{ status: "ok" }`).
- **Readiness Probe**: `GET /health/ready` (Executes bounded `SELECT 1` ping with 3-second timeout; returns HTTP 200 `{ status: "ok", database: "connected" }` or HTTP 503 on database unavailability).

---

## 12. Incident Response Basics

1. **Suspected Admin Credential Compromise**:
   - Invalidate all active admin sessions immediately by rotating `SESSION_SECRET`.
   - Update admin password directly using Argon2id utility.
2. **Suspected Denial of Service / Registration Flooding**:
   - Adjust `registrationLimiter` threshold in `backend/src/middleware/rateLimiter.ts`.
   - Activate edge protection (Cloudflare WAF / Turnstile).

---

## 13. Pre-Launch Checklist

- [x] All 85 unit and integration tests passing.
- [x] Concurrency integration tests verifying atomic registration and race condition mitigation.
- [x] Student dashboard IDOR eliminated; authenticated session established upon registration.
- [x] Shared `X-Admin-Key` eliminated; Argon2id RBAC (`admin`, `operator`, `viewer`) operational.
- [x] Cross-campaign referral attribution prevention verified at application and database schema levels.
- [x] Referrer leaderboard scoped to requested campaign; student PII redacted.
- [x] Bounded streaming CSV export implemented with spreadsheet formula injection defense.
- [x] Fail-closed production CORS configuration.
- [x] Accessibility (WAI-ARIA) compliant combobox, tabs, progress bar, and link-buttons.
- [x] Liveness (`/health/live`) and readiness (`/health/ready`) probes active.
- [x] GitHub Actions CI pipeline configured with secret scanning, Prisma migration checks, and tests.

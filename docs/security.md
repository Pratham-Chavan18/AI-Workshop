# Security Architecture & Supabase Hardening Guide

## 1. Executive Summary

This document specifies the security architecture, Row Level Security (RLS) strategy, data classification policies, and threat mitigations for the **AI Workshop** platform built for NxtWave.

The database runs on Supabase PostgreSQL. To eliminate critical Database Advisor findings (**"RLS Disabled in Public"**) and guard against unauthorized direct PostgREST data scraping, all tables in the `public` schema have Row Level Security enabled with strict least-privilege policies.

---

## 2. Architecture & Data Flow

Sensitive operations and database mutations are strictly controlled through the backend API. The browser client never interacts directly with Supabase APIs using privileged credentials.

```
┌─────────────────────────────────┐
│     Client Browser (SPA)        │
│   (React + Vite + Tailwind)     │
└────────────────┬────────────────┘
                 │ HTTP (CORS restricted, Rate Limited)
                 │ Only VITE_API_BASE_URL known
                 ▼
┌─────────────────────────────────┐
│       Backend Express API       │
│  - Helmet Security Headers      │
│  - Strict Origin CORS           │
│  - Endpoint Rate Limiting       │
│  - Zod Input Validation         │
│  - Timing-Safe Admin Auth       │
└────────────────┬────────────────┘
                 │ Direct PostgreSQL Connection (Prisma)
                 │ Private server DATABASE_URL
                 ▼
┌─────────────────────────────────┐
│    Supabase / PostgreSQL        │
│  - Row Level Security (RLS)     │
│  - Default Deny on Private Data │
│  - CHECK Constraints            │
│  - PostgREST Direct Access Deny │
└─────────────────────────────────┘
```

---

## 3. Data Classification & Access Model Matrix

All tables in the `public` schema have been audited for sensitivity and PII exposure:

| Table | Contains Sensitive / PII | Public PostgREST Read | User Read | User Write | Admin Ops | Backend Only | RLS Status |
|---|---|---|---|---|---|---|---|
| `Campaign` | No (Metadata) | Yes (Active Only) | Yes (Active Only) | No | Yes | Mutations Backend Only | **ENABLED** |
| `College` | No (Directory) | Yes | Yes | No | Yes | Mutations Backend Only | **ENABLED** |
| `User` | **YES** (Email, Phone, Name) | **NO** | Via API (Own Stats) | Via API Only | Yes | **YES** | **ENABLED** |
| `Referral` | **YES** (Attribution Graph) | **NO** | Aggregated Only | No | Yes | **YES** | **ENABLED** |
| `AdminUser` | **CRITICAL** (Password Hashes) | **NO** | No | No | Via API Key | **YES** | **ENABLED** |
| `_prisma_migrations` | Internal Schema Meta | **NO** | No | No | No | **YES** | **ENABLED** |

---

## 4. Supabase Row Level Security (RLS) Strategy

### RLS Policies
1. **`College`**:
   - RLS is **ENABLED**.
   - Public directory information required for student college selection.
   - Policy: `allow_public_read_colleges` allows `SELECT` to `anon` and `authenticated`.
   - `INSERT`, `UPDATE`, and `DELETE` permissions are revoked from `anon` and `authenticated`.
2. **`Campaign`**:
   - RLS is **ENABLED**.
   - Allows public read of active campaigns only. Paused, closed, or draft campaigns remain hidden.
   - Policy: `allow_public_read_active_campaigns` allows `SELECT` to `anon` and `authenticated` with predicate `USING (status = 'active')`.
   - Mutations remain backend-only.
3. **`User` (Student Profile & PII)**:
   - RLS is **ENABLED**.
   - All permissions (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) are explicitly revoked from `anon` and `authenticated`.
   - PostgREST direct HTTP endpoints return empty sets or access denied to any request using anonymous API keys.
   - Backend Express API handles student registration and profile retrieval via Prisma.
4. **`Referral` (Attribution Graph)**:
   - RLS is **ENABLED**.
   - All permissions are revoked from `anon` and `authenticated`. No direct client manipulation is possible.
5. **`AdminUser` (Admin Credentials)**:
   - RLS is **ENABLED**.
   - Strictly revoked from `anon` and `authenticated`. Protected from any exposure.

---

## 5. Database Integrity & Constraints

In addition to application validation, PostgreSQL enforces business logic integrity at the engine level:

1. **Self-Referral Prevention**:
   - Constraint `user_no_self_referral`: `CHECK ("id" != "referredByUserId")`
   - Constraint `referral_no_self_referral`: `CHECK ("referrerUserId" != "referredUserId")`
2. **Graduation Year Range**:
   - Constraint `user_valid_graduation_year`: `CHECK ("graduationYear" >= 2024 AND "graduationYear" <= 2030)`
3. **Unique Registration Per Campaign**:
   - Unique index `User_campaignId_emailNormalized_key` ensures a student email cannot be registered multiple times for the same campaign.
4. **Referral Attribution Uniqueness**:
   - Unique index `Referral_referredUserId_key` guarantees that a referred student can only ever have exactly one referrer attributed.

---

## 6. Registration & Referral Security Flow

Referral attribution and registration are executed atomically within a database transaction:

```
Student Registration Request
       │
       ▼
1. Validate input with Zod (email format, normalized name, phone regex, valid UUID college)
       │
       ▼
2. Check campaign status (active check)
       │
       ▼
3. Check referral code (reject self-referral via email comparison, verify code exists)
       │
       ▼
4. Check email uniqueness in campaign (reject duplicate registration)
       │
       ▼
5. BEGIN TRANSACTION
   ├─ Insert User record
   ├─ Insert Referral attribution record (status = 'valid')
   └─ COMMIT TRANSACTION
       │
       ▼
6. Filter response: Return ONLY safe public fields ({ id, fullName, referralCode, referralUrl })
   NEVER return email, phone number, or internal tokens.
```

---

## 7. Public Leaderboard Security & Privacy

The public leaderboard endpoints (`/api/v1/leaderboard/campuses` and `/api/v1/leaderboard/referrers`) are designed for complete privacy preservation:

- **Campus Leaderboard**: Exposes only `rank`, `collegeId`, `collegeName`, `city`, `state`, and `registrations` (server-aggregated count).
- **Referrer Leaderboard**: Exposes only `rank`, `userId`, `fullName`, `collegeName`, and `referralCount`.
- **Absolute Privacy**: Student phone numbers, email addresses, student IDs, and private profile attributes are **NEVER** queried or exposed on public leaderboard endpoints.
- **Derived Counts**: Leaderboard totals are computed via SQL aggregation (`COUNT`, `ROW_NUMBER() OVER`) on trusted database records. The client cannot send arbitrary increments (`count += 1`).

---

## 8. Admin Authentication & Protection

- **Argon2id Password Storage**: Admin credentials are authenticated via `POST /api/v1/admin/auth/login` and hashed with Argon2id (`memoryCost: 65536`, `timeCost: 3`, `parallelism: 4`).
- **Role-Based Access Control (RBAC)**: Supports `admin`, `operator`, and `viewer` roles. All routes enforce `requireAdminSession` and role-specific permissions via `requireAdminRole`.
- **HttpOnly Session Cookies**: Authenticated sessions use signed HMAC-SHA256 HttpOnly cookies (`aiw_admin_session`) with short 8-hour lifecycles. Shared static API keys (`X-Admin-Key`) have been decommissioned.
- **Role Permissions**:
  - `viewer`: Read-only access to analytics dashboards and trend charts.
  - `operator`: Analytics + bounded, sanitized CSV export.
  - `admin`: Full administrative access.
- **Rate Limiting**: Admin endpoints are strictly rate limited to prevent brute-force attacks.

---

## 9. Environment Variable & Secret Separation Rules

### Server Secrets (`backend/.env`)
These variables must **NEVER** be committed to version control or included in frontend client bundles:
- `DATABASE_URL`: Full PostgreSQL connection string with password.
- `SESSION_SECRET`: Cryptographically secure HMAC-SHA256 signing secret (minimum 32 characters).
- `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`: Initial bootstrap admin credentials for seeding.
- `SUPABASE_SERVICE_ROLE_KEY`: Service-role key for backend automation.

### Frontend Variables (`frontend/.env`)
Only public configuration prefixed with `VITE_` is allowed:
- `VITE_API_BASE_URL`: Base URL for the Express backend API.

---

## 10. Migration & Deployment Instructions

### Applying Security Migrations
The migration is located at:
`backend/prisma/migrations/20261005000000_enable_rls_and_security_hardening/migration.sql`

To apply in production:
```bash
cd backend
npx prisma migrate deploy
```

To run security regression tests:
```bash
cd backend
npm test
```

---

## 11. Verification Checklist

- [x] Every public table (`Campaign`, `College`, `User`, `Referral`, `AdminUser`) has RLS enabled (`rowsecurity = true`).
- [x] Least-privilege policies applied to `College` and `Campaign`.
- [x] Sensitive tables (`User`, `Referral`, `AdminUser`) have direct PostgREST access completely revoked.
- [x] Database check constraints prevent self-referrals at the SQL engine level.
- [x] Atomic transactions prevent duplicate referral claims and attribution race conditions.
- [x] Public leaderboard queries redact all student contact info and PII.
- [x] Strict CORS origin validation implemented.
- [x] Rate limiters protect registration, leaderboard, admin, and user endpoints.
- [x] All 85 automated tests (including 14 security, student IDOR, campaign isolation, and concurrency integration tests) pass with 0 failures.
- [x] Frontend and backend production builds compile with zero errors.

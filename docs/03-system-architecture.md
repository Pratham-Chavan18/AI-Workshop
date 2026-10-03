# System Architecture

## 1. Architecture

```text
                     ┌──────────────────────┐
                     │      React/Vite      │
                     │  Landing + Dashboard │
                     └──────────┬───────────┘
                                │ HTTPS / REST
                                ▼
                     ┌──────────────────────┐
                     │   Node + Express API │
                     │ Validation + Rules   │
                     └──────────┬───────────┘
                                │ Prisma
                                ▼
                     ┌──────────────────────┐
                     │   Supabase Postgres  │
                     │ Users / Colleges /   │
                     │ Referrals / Campaign │
                     └──────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
             WhatsApp Share          Admin Analytics
```

## 2. Frontend Responsibilities
- Render campaign landing page
- Capture registration form
- Preserve referral code from URL
- Call registration API
- Render referral dashboard
- Render leaderboard
- Generate WhatsApp share link

## 3. Backend Responsibilities
- Validate requests
- Normalize email/phone/college values
- Prevent duplicate registrations
- Generate referral code
- Attribute referrals safely
- Update campaign statistics through database queries
- Expose leaderboard and admin endpoints
- Apply rate limiting

## 4. Security
- Validate all input server-side
- Never trust `college_id` or `referral_code` without lookup
- Never expose phone/email in public leaderboard APIs
- Add rate limiting to registration and admin endpoints
- Keep database credentials server-side
- Use environment variables for secrets

## 5. Referral Attribution Rule
A referral is valid when:
1. Referral code exists.
2. New registration is valid.
3. New email is not already registered.
4. Referrer is not the same person.
5. Registration completes successfully.

The referral should be persisted as an explicit record rather than inferred only from a counter.

## 6. Deployment
Recommended:
- Frontend → Vercel
- Backend → Render
- Database → Supabase

## 7. Environment Variables

Frontend:
```env
VITE_API_BASE_URL=
```

Backend:
```env
PORT=4000
DATABASE_URL=
CORS_ORIGIN=
ADMIN_API_KEY=
```

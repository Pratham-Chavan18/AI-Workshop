# API Specification — AI Workshop

Base URL:
```text
/api/v1
```

All authenticated routes use **HttpOnly** cookies with credentialed requests (`credentials: 'include'`).

---

## 1. Register Student

`POST /registrations`

Rate Limit: 10 per 15 minutes per IP.

### Request Body:
```json
{
  "fullName": "Pratham Chavan",
  "email": "student@example.com",
  "phone": "+919999999999",
  "collegeId": "00000000-0000-0000-0000-000000000001",
  "graduationYear": 2026,
  "referralCode": "AI27X4",
  "source": "whatsapp"
}
```

### Response (201 Created):
*Sets `Set-Cookie: aiw_student_session=...; HttpOnly; SameSite=Lax; Path=/`*
```json
{
  "success": true,
  "user": {
    "id": "user_uuid",
    "fullName": "Pratham Chavan",
    "referralCode": "AI27X4",
    "referralUrl": "https://example.com/register?ref=AI27X4"
  }
}
```
*Note: Sensitive PII (email, phone) is never returned in registration or public payloads.*

---

## 2. Get Authenticated Student Dashboard

`GET /users/me/dashboard`

Authentication: Requires `aiw_student_session` cookie.

### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "referralCode": "AI27X4",
    "referralUrl": "https://example.com/register?ref=AI27X4",
    "referralCount": 2,
    "targetGoal": 3,
    "completedGoal": false,
    "campusRank": 4,
    "referrals": [
      {
        "id": "ref_uuid",
        "createdAt": "2026-10-06T00:00:00.000Z",
        "status": "valid"
      }
    ]
  }
}
```

*Legacy route `GET /users/:userId/referrals` is gated by `requireStudentSession` and returns 403 Forbidden if `:userId` does not match the authenticated session.*

---

## 3. Campus Leaderboard

`GET /leaderboard/campuses?campaignId=:campaignId`

Public endpoint. Rate limit: 60 per minute per IP.

### Response (200 OK):
```json
{
  "items": [
    {
      "rank": 1,
      "collegeId": "college_uuid",
      "collegeName": "College of Engineering",
      "registrations": 64
    }
  ]
}
```

---

## 4. Student Referral Leaderboard

`GET /leaderboard/referrers?campaignId=:campaignId`

Public endpoint. Redacts student identifiers, emails, phones, and referral codes for privacy.

### Response (200 OK):
```json
{
  "items": [
    {
      "rank": 1,
      "displayName": "Rahul S.",
      "collegeName": "College of Engineering",
      "referralCount": 12
    }
  ]
}
```

---

## 5. Colleges Directory

`GET /colleges?search=tech`

Public endpoint for searchable combobox directory.

---

## 6. Admin Authentication & Role-Based Access Control

### 6.1 Admin Login
`POST /admin/auth/login`

Request:
```json
{
  "email": "admin@aiworkshop.nxtwave.com",
  "password": "SecurePassword123!"
}
```

Response (200 OK):
*Sets `Set-Cookie: aiw_admin_session=...; HttpOnly; SameSite=Lax; Path=/`*
```json
{
  "success": true,
  "admin": {
    "id": "admin_uuid",
    "email": "admin@aiworkshop.nxtwave.com",
    "role": "admin"
  }
}
```

### 6.2 Admin Current Identity
`GET /admin/auth/me`

Requires `aiw_admin_session`. Returns active admin info and role.

### 6.3 Admin Logout
`POST /admin/auth/logout`

Clears `aiw_admin_session` cookie.

---

## 7. Admin Analytics & Export

### 7.1 Campaign Stats
`GET /admin/campaigns/:campaignId/stats`

Requires: Role `viewer`, `operator`, or `admin`.
```json
{
  "target": 500,
  "registrations": 327,
  "campuses": 31,
  "referralRegistrations": 143,
  "referralRate": 43.73
}
```

### 7.2 Daily Registration Trend
`GET /admin/campaigns/:campaignId/trend?days=14`

Requires: Role `viewer`, `operator`, or `admin`. Parameter `days` validated between 1 and 90.

### 7.3 Bounded CSV Export
`GET /admin/campaigns/:campaignId/export?format=csv`

Requires: Role `operator` or `admin` (`viewer` returns HTTP 403 Forbidden).
Streams paginated CSV records (500 per chunk). Formula characters (`=`, `+`, `-`, `@`) are sanitized to prevent CSV injection.

---

## 8. Health & Observability Probes

- `GET /health/live`: Process liveness probe (200 OK `{ status: "ok" }`).
- `GET /health/ready`: Database readiness probe with 3-second bounded timeout (200 OK `{ status: "ok", database: "connected" }`).

---

## 9. Error Contract

Standard response format:
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_REGISTERED",
    "message": "This email is already registered."
  }
}
```

Domain Error Codes:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `EMAIL_ALREADY_REGISTERED` (409)
- `PHONE_ALREADY_REGISTERED` (409)
- `INVALID_REFERRAL_CODE` (400)
- `SELF_REFERRAL` (400)
- `CAMPAIGN_CLOSED` (400)
- `RATE_LIMITED` (429)
- `INTERNAL_ERROR` (500)

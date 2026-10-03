# API Specification

Base URL:
```text
/api/v1
```

## 1. Register Student

`POST /registrations`

Request:
```json
{
  "fullName": "Pratham Chavan",
  "email": "student@example.com",
  "phone": "+919999999999",
  "collegeId": "college_uuid",
  "graduationYear": 2027,
  "referralCode": "AI27X4",
  "source": "whatsapp"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "user_uuid",
    "name": "Pratham Chavan",
    "referralCode": "AI27X4",
    "referralUrl": "https://example.com/register?ref=AI27X4"
  }
}
```

## 2. Get Referral Dashboard

`GET /users/:userId/referrals`

Response:
```json
{
  "referralCode": "AI27X4",
  "referralUrl": "https://example.com/register?ref=AI27X4",
  "referralCount": 2,
  "goal": 3,
  "campusRank": 4
}
```

## 3. Campus Leaderboard

`GET /leaderboard/campuses?campaignId=:campaignId`

Response:
```json
{
  "items": [
    {
      "rank": 1,
      "collegeId": "1",
      "collegeName": "College A",
      "registrations": 64
    }
  ]
}
```

## 4. Student Referral Leaderboard

`GET /leaderboard/referrers?campaignId=:campaignId`

Return only safe public fields.

## 5. Colleges

`GET /colleges?search=msrit`

## 6. Campaign Stats

`GET /admin/campaigns/:campaignId/stats`

Response:
```json
{
  "target": 500,
  "registrations": 327,
  "campuses": 31,
  "referralRegistrations": 143,
  "referralRate": 43.73
}
```

## 7. Admin Export

`GET /admin/campaigns/:campaignId/export`

Returns CSV or JSON containing registration records for authorized admins only.

## Error Contract

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_REGISTERED",
    "message": "This email is already registered."
  }
}
```

Recommended error codes:
- VALIDATION_ERROR
- EMAIL_ALREADY_REGISTERED
- INVALID_REFERRAL_CODE
- SELF_REFERRAL
- CAMPAIGN_CLOSED
- RATE_LIMITED
- INTERNAL_ERROR

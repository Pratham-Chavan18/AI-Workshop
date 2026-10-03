# Database Design

## Entities

### campaigns
Stores campaign-level configuration.

Fields:
- id
- name
- slug
- target_registrations
- starts_at
- ends_at
- status
- created_at

### colleges
Stores normalized college data.

Fields:
- id
- name
- city
- state
- created_at

### users
Stores registrants and referral information.

Fields:
- id
- campaign_id
- college_id
- full_name
- email
- phone
- graduation_year
- referral_code
- referred_by_user_id
- source
- created_at

Constraints:
- unique(campaign_id, email)
- unique(referral_code)

### referrals
Stores explicit referral events.

Fields:
- id
- campaign_id
- referrer_user_id
- referred_user_id
- referral_code
- status
- created_at

Constraints:
- unique(referred_user_id)

### admin_users
Optional MVP table for admin authentication.

Fields:
- id
- email
- password_hash
- role
- created_at

## Relationships

```text
Campaign 1 ──── * Users
Campaign 1 ──── * Referrals
College  1 ──── * Users
User     1 ──── * Referrals (as referrer)
User     1 ──── 0..1 Referrals (as referred user)
```

## Leaderboard Query Logic
Campus ranking:

```sql
SELECT
  c.id,
  c.name,
  COUNT(u.id) AS registration_count
FROM colleges c
JOIN users u ON u.college_id = c.id
WHERE u.campaign_id = $1
GROUP BY c.id, c.name
ORDER BY registration_count DESC, c.name ASC;
```

Referrer ranking:

```sql
SELECT
  u.id,
  u.full_name,
  u.college_id,
  COUNT(r.id) AS referral_count
FROM users u
LEFT JOIN referrals r ON r.referrer_user_id = u.id
WHERE u.campaign_id = $1
GROUP BY u.id, u.full_name, u.college_id
ORDER BY referral_count DESC;
```

## Privacy
Public APIs should return only:
- name where appropriate
- college name
- registration/referral count
- rank

Do not return email or phone publicly.

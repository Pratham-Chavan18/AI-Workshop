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

## Global User Identity vs. Campaign-Scoped Users (Future Architecture)

### Current Design
The `users` table enforces a compound uniqueness constraint:
```sql
CONSTRAINT unique_campaign_email UNIQUE (campaign_id, email_normalized)
```
This isolates users strictly per-campaign:
- **Pros**: Clean data partitioning, independent campaign lifecycle, campaign-isolated referral codes, and zero collision across concurrent or sequential workshops.
- **Trade-off**: When the same student registers for multiple campaigns, two separate `User` rows are created with distinct referral codes and independent referral counts.

### Proposed Future Architecture ("Person" Model)
To unify student identities globally across multiple campaigns while preserving discrete campaign registrations:
1. **`Person` / `StudentProfile`**:
   - `id`: UUID (Primary Key)
   - `email`: Normalized lowercase unique email (`UNIQUE`)
   - `phone`: Normalized E.164 phone number
   - `college_id`: Reference to global `colleges`
   - `created_at`: Timestamp
2. **`CampaignRegistration` (replaces or refactors `User`)**:
   - `id`: UUID
   - `person_id`: Foreign key to `Person(id)`
   - `campaign_id`: Foreign key to `Campaign(id)`
   - `referral_code`: Campaign-specific unique referral code
   - `referred_by_person_id`: Foreign key to referring `Person`
   - `created_at`: Timestamp
   - Unique constraint: `UNIQUE (person_id, campaign_id)`

This separation allows persistent cross-campaign student reputation, single sign-on/profile management, and unified analytics without compromising campaign-level attribution.

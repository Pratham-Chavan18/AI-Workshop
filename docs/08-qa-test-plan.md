# QA Test Plan

## Registration
- Valid student can register.
- Empty required fields are rejected.
- Invalid email is rejected.
- Duplicate email is rejected.
- Whitespace/casing normalization works.
- Registration outside campaign dates is handled correctly.

## Referral
- Valid referral code is credited.
- Invalid referral code does not break registration.
- Self-referral is rejected or ignored.
- Duplicate referral cannot be credited twice.
- Referrer count matches referral records.
- Referral URL persists through registration.

## Campus Leaderboard
- Campus count increments after valid registration.
- Duplicate registration does not increment count.
- Ordering is descending by registration count.
- Ties have deterministic ordering.
- Private information is not exposed.

## WhatsApp
- Share button creates valid WhatsApp URL.
- Message includes campaign title and referral URL.
- Works on mobile and desktop web.

## Admin
- Unauthorized users cannot access admin endpoints.
- Stats match database counts.
- Export contains expected columns.

## Security
- SQL injection attempts fail safely.
- XSS payloads are escaped.
- Rate limiting works on registration endpoint.
- Secrets are not exposed to frontend bundles.

## Responsive QA
Test at minimum:
- 360px mobile
- 390px mobile
- 768px tablet
- 1280px desktop

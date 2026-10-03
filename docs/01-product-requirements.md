# Product Requirements Document (PRD)

## 1. Product Name
**AI 60 × 500 — Campus Referral & Leaderboard**

## 2. Problem
NxtWave needs 500 final-year engineering students to register for a free online workshop in only seven days with a budget of ₹2,000. Traditional advertising may create awareness but gives limited leverage at this budget. The product therefore needs to turn registrations into a distribution mechanism.

## 3. Product Hypothesis
If a student receives a personalized referral link immediately after registering, and campuses compete on a public leaderboard, students and college communities will have a reason to actively share the workshop.

## 4. Target User
Primary user:
- Final-year engineering student
- Preparing for placements or internships
- Has basic programming knowledge
- Interested in AI/GenAI
- Wants a practical project for GitHub/resume

Secondary users:
- Coding club leaders
- Placement/student coordinators
- Tech-community admins
- Campus ambassadors

Admin:
- Campaign operator from NxtWave

## 5. Core Value Proposition
**Build Your First AI Project in 60 Minutes. One hour. One real project. Zero cost.**

## 6. User Journey
1. Student sees campaign page.
2. Student understands outcome, duration and audience.
3. Student submits registration form.
4. System validates unique email/phone.
5. System creates a unique referral code.
6. Student sees referral dashboard.
7. Student shares referral link via WhatsApp.
8. Friend registers using the referral link.
9. Referral is credited only after valid registration.
10. Campus and referrer counts update.
11. Public leaderboard reflects the latest counts.

## 7. Functional Requirements

### FR-01 Landing page
The landing page must explain the workshop, target audience, agenda, benefits and registration CTA.

### FR-02 Registration
The system must collect:
- Full name
- Email
- Phone number (optional for MVP if OTP is not implemented)
- College
- Graduation year
- Referral code (optional)

### FR-03 Duplicate prevention
Email must be unique. Phone should be unique when collected.

### FR-04 Referral code
Each registered student must receive a unique code and shareable URL.

### FR-05 Referral attribution
A referred registration must be attributed to the original referrer when the referral code is valid.

### FR-06 Campus attribution
Every registration must belong to a campus/college. Campus counts must aggregate automatically.

### FR-07 WhatsApp share
The system should generate a prefilled WhatsApp message containing the referral URL.

### FR-08 Leaderboard
The public leaderboard must rank campuses by valid registrations. Optional secondary leaderboard ranks individual referrers.

### FR-09 Dashboard
A registered user should see registration status, referral code, referral count and campus rank.

### FR-10 Admin reporting
Admin should see totals by day, campus, referral source and referrer.

## 8. Non-Functional Requirements
- Mobile-first responsive design
- Registration API response target: < 1.5 seconds under normal load
- Basic rate limiting on registration endpoint
- Server-side validation
- Referral URLs must be deterministic and easy to share
- Leaderboard should not expose private student information

## 9. MVP Exclusions
- Full CRM integration
- Payment
- Complex OTP provider integration
- Multi-level referral commissions
- Gamified points beyond registrations
- Native mobile app

## 10. Acceptance Criteria
The MVP passes when:
- A new student can register successfully.
- Duplicate registrations are rejected gracefully.
- Each valid student receives a unique referral code.
- A friend registering through the referral link increments the correct referrer.
- Campus totals update automatically.
- Leaderboard rankings are correct.
- WhatsApp sharing works on mobile and desktop web.
- Admin can retrieve/export registration data.

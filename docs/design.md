# AI 60 × 500 — Design System & UI/UX Specification

## 1. Purpose

This document is the visual and interaction contract for the **AI 60 × 500 Campus Referral & Leaderboard** application.

The application should feel like a polished modern developer product, not a generic webinar landing page.

Primary design goals:

- High-conversion workshop landing page
- Clear “build your first AI project in 60 minutes” value proposition
- Strong campus/referral mechanics
- Premium but lightweight visual language
- shadcn/ui-compatible component architecture
- 21st.dev/shadcn-style composable UI
- Framer Motion primitives for purposeful motion
- Excellent mobile experience
- Accessible and keyboard-friendly
- Production-ready component reuse

The source component provided for this task explicitly expects a shadcn-style project structure, Tailwind CSS, TypeScript, and reusable components under `/components/ui`. It also recommends using Lucide icons and integrating the supplied globe/landing components as reusable pieces. See the supplied source for the exact integration expectations. fileciteturn0file0L3-L12 fileciteturn0file0L507-L522

---

# 2. Design Direction

## Product personality

The visual identity should communicate:

- AI-native
- Developer-focused
- Ambitious
- Modern
- Technical without becoming visually noisy
- Trustworthy
- Student-friendly

Avoid:

- Generic education-site layouts
- Excessive gradients
- Overuse of glassmorphism
- Decorative animations that distract from registration
- Stock-photo-heavy hero sections
- Giant paragraphs
- Too many competing CTAs

The primary CTA is always registration.

---

# 3. Visual Language

## Color strategy

Use the existing shadcn semantic tokens instead of hard-coded colors wherever possible.

Primary semantic tokens:

```text
background
foreground
card
card-foreground
popover
popover-foreground
primary
primary-foreground
secondary
secondary-foreground
muted
muted-foreground
accent
accent-foreground
destructive
border
input
ring
```

Visual direction:

- Base: neutral/slate background
- Foreground: near-black in light mode
- Dark mode: near-white foreground on deep neutral background
- Primary accent: blue/indigo AI signal
- Success: restrained green
- Warning: amber
- Error: red

Do not introduce a large custom palette unless required by the existing brand system.

---

# 4. Typography

Use the project's existing modern sans-serif font if already configured.

Recommended hierarchy:

```text
Display: 4rem–7rem
H1:      3rem–4.5rem
H2:      2rem–3rem
H3:      1.25rem–1.75rem
Body:    1rem–1.125rem
Small:   0.8125rem–0.9375rem
```

Rules:

- Headlines should be short.
- Use tight tracking for large headings.
- Keep body copy around 60–75 characters per line.
- Use font weight rather than many different font families.
- Never use more than one primary font family unless the existing product already requires it.

---

# 5. Spacing System

Use Tailwind's spacing scale consistently.

Preferred rhythm:

```text
4px    micro
8px    icon/inline
12px   compact
16px   default
24px   card
32px   section grouping
48px   large grouping
64px   section
96px   hero/large section
128px  major landing-page transitions
```

Landing-page sections should have generous vertical spacing but remain compact enough that the registration CTA appears early.

---

# 6. Border Radius

Use shadcn radius tokens.

Recommended:

```text
Buttons: 0.625rem–0.75rem
Inputs:  0.625rem–0.75rem
Cards:   0.875rem–1rem
Badges:  9999px
```

Do not use a different radius for every component.

---

# 7. Component Architecture

Use the shadcn-style component structure:

```text
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── progress.tsx
│   │   ├── separator.tsx
│   │   ├── tooltip.tsx
│   │   ├── aurora-background.tsx
│   │   ├── globe.tsx
│   │   └── landing-page.tsx
│   │
│   ├── layout/
│   │   ├── site-header.tsx
│   │   ├── site-footer.tsx
│   │   └── mobile-nav.tsx
│   │
│   ├── landing/
│   │   ├── hero-section.tsx
│   │   ├── outcome-section.tsx
│   │   ├── workshop-timeline.tsx
│   │   ├── referral-section.tsx
│   │   ├── campus-leaderboard-preview.tsx
│   │   ├── faq-section.tsx
│   │   └── final-cta.tsx
│   │
│   ├── registration/
│   │   ├── registration-form.tsx
│   │   ├── referral-code-card.tsx
│   │   └── registration-success.tsx
│   │
│   ├── student/
│   │   ├── student-header.tsx
│   │   ├── referral-progress-card.tsx
│   │   ├── student-stats.tsx
│   │   └── referral-share-card.tsx
│   │
│   ├── leaderboard/
│   │   ├── campus-leaderboard.tsx
│   │   ├── leaderboard-row.tsx
│   │   └── leaderboard-filter.tsx
│   │
│   └── admin/
│       ├── admin-sidebar.tsx
│       ├── kpi-cards.tsx
│       ├── registration-chart.tsx
│       ├── referral-source-table.tsx
│       └── ambassador-table.tsx
│
├── lib/
│   ├── utils.ts
│   └── motion.ts
│
└── styles/
    └── globals.css
```

`/components/ui` should contain only reusable primitives or imported shadcn/21st.dev-style components.

Page-specific compositions belong outside `/components/ui`.

---

# 8. 21st.dev / shadcn Component Strategy

The supplied design reference contains a reusable scroll-globe landing composition and a globe primitive. It uses Tailwind utility classes, `cn()`, section props, and a reusable `Globe` component. fileciteturn0file0L16-L39 fileciteturn0file0L349-L400

Use these components as inspiration and reusable primitives, but adapt the content to the AI 60 × 500 campaign.

Do not copy a demo's generic marketing copy into production.

The application should compose:

```text
shadcn primitives
        +
21st.dev visual primitives
        +
product-specific sections
        +
Framer Motion interactions
```

---

# 9. Required Landing Experience

## Hero

The hero should communicate the entire proposition within the first viewport.

Suggested structure:

```text
[small badge]
FREE LIVE AI WORKSHOP

Build Your First
AI Project in 60 Minutes

One hour. One real project.
Zero cost.

[ Reserve My Free Seat ]

500 final-year engineers
• Beginner friendly
• Live build
• Practical project
```

Hero priority:

1. Headline
2. Outcome
3. Registration CTA
4. Trust / proof
5. Visual experience

---

# 10. Globe / Interactive Background

The supplied globe component provides a visual anchor that moves through the page as sections become active. The reference implementation tracks scroll progress, detects the active section, and updates the globe position with responsive transforms. fileciteturn0file0L59-L77 fileciteturn0file0L79-L111

Use the globe as a supporting visual, never as the primary content.

Recommended section mapping:

```text
Hero
  Globe → right / background

Why this workshop
  Globe → subtle upper-right

How it works
  Globe → center-right

Campus challenge
  Globe → large background

Final CTA
  Globe → centered / low opacity
```

For mobile:

- Reduce scale substantially.
- Reduce opacity.
- Prevent it from covering text.
- Keep `pointer-events-none`.
- Respect reduced-motion preferences.

---

# 11. Aurora Background

Use the Aurora background only for major moments:

- Hero
- Final CTA
- Optional registration-success screen

Do not use Aurora behind every section.

The visual effect should establish depth rather than compete with text.

---

# 12. Framer Motion Rules

Use Framer Motion primitives for purposeful interactions.

Preferred primitives:

```tsx
<motion.div />
<motion.section />
<motion.button />
<AnimatePresence />
```

Recommended techniques:

- `whileInView`
- `viewport={{ once: true, amount: 0.2 }}`
- `initial`
- `animate`
- `transition`
- `whileHover`
- `whileTap`

Example:

```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  ...
</motion.div>
```

The supplied reference uses Framer Motion-style entrance behavior for its hero content. fileciteturn0file0L408-L414

---

# 13. Motion Principles

### Use motion to:

- Establish hierarchy
- Explain state changes
- Reinforce interaction
- Reveal sections
- Make referral progress feel rewarding
- Give leaderboard rank changes a subtle sense of activity

### Avoid motion for:

- Every button
- Every paragraph
- Continuous decoration
- Long entrance delays
- Important form content
- Anything that makes users wait before interacting

Maximum initial hero animation delay:

```text
< 400ms
```

Prefer:

```text
0.4s–0.8s
```

for section reveal animations.

---

# 14. Reduced Motion

The entire application must respect:

```css
@media (prefers-reduced-motion: reduce)
```

When reduced motion is enabled:

- Remove decorative continuous animations
- Disable large transform transitions
- Reduce globe movement
- Replace animated counters with instant values
- Keep state changes visible without motion

Motion must never be required to understand the interface.

---

# 15. Registration Experience

Registration should feel like a product action, not a form dump.

Recommended fields:

```text
Full name
Email
Phone
College
Branch
Graduation year
Referral code (optional)
```

Only collect data necessary for the campaign.

Form behavior:

- Validate inline.
- Show clear server errors.
- Preserve valid input after failed submission.
- Disable duplicate submission.
- Show loading state.
- Give immediate success confirmation.

---

# 16. Registration Success

After successful registration:

```text
You're in 🎉

You're registered for:

Build Your First AI Project in 60 Minutes

Your referral code

AI27X4

[ Copy Referral Link ]
[ Invite on WhatsApp ]

2 / 3 friends joined
```

Use a `Card` + `Badge` + `Progress` + `Button` composition.

Make the referral action visually stronger than secondary options.

---

# 17. Referral Progress

The referral progress component should visually communicate:

```text
0 / 3
1 / 3
2 / 3
3 / 3
```

Use:

- Progress bar
- Numeric count
- Success state
- Optional subtle confetti/celebration

Do not use excessive gamification.

At 3/3:

```text
🎉 You completed your campus challenge.
```

---

# 18. WhatsApp Sharing

Primary mobile share CTA:

```text
Invite on WhatsApp
```

Use Lucide's share/send icon.

The message should be pre-filled with the unique referral URL.

Example structure:

```text
I'm joining a free live workshop to build my first AI project in 60 minutes.

Join me:
{referral_url}
```

Do not expose internal user IDs.

---

# 19. Campus Leaderboard

The public leaderboard should be immediately understandable.

Desktop:

```text
Rank   Campus                  Registrations
1      Example Institute       64
2      Example University      51
3      Example College         47
```

Mobile:

Use stacked rows/cards.

Leaderboard states:

- Loading
- Populated
- Empty
- Error
- Updated

The current user's campus may receive a subtle highlight.

---

# 20. Leaderboard Animation

When leaderboard data updates:

- Animate only changed rows.
- Use small vertical movement.
- Use opacity transition.
- Avoid dramatic reordering animations.

Suggested behavior:

```tsx
<AnimatePresence initial={false}>
  ...
</AnimatePresence>
```

Do not animate large sections when one ranking changes.

---

# 21. Admin Dashboard

Admin UI should be substantially denser than the marketing pages.

Use:

- Sidebar
- Header
- KPI cards
- Tables
- Tabs
- Filters
- Date range controls
- Pagination
- Dialogs for destructive actions

Dashboard KPI cards:

```text
Registrations
500 Target
Conversion Rate
Campuses
Ambassadors
Referral Registrations
```

Use semantic trend indicators.

---

# 22. shadcn Components to Prefer

Use existing shadcn components before creating custom equivalents.

Primary list:

```text
Button
Badge
Card
Input
Label
Textarea
Select
Combobox
Form
Dialog
Sheet
Tabs
Tooltip
Popover
Progress
Table
DropdownMenu
Avatar
Separator
Skeleton
Alert
AlertDialog
Pagination
Calendar
```

Do not recreate these primitives from scratch.

---

# 23. Icons

Use `lucide-react` for interface icons.

Examples:

```text
ArrowRight
ArrowUpRight
Check
Users
Trophy
Share2
Copy
Sparkles
Calendar
Clock
Github
ExternalLink
Menu
ChevronDown
X
ShieldCheck
```

Icons should support meaning, not decorate every label.

The supplied integration guidance explicitly recommends Lucide icons when SVG/iconography is needed. fileciteturn0file0L518-L522

---

# 24. Responsive Rules

Breakpoints:

```text
mobile:  < 640px
tablet:  640px–1023px
desktop: >= 1024px
large:   >= 1280px
```

## Mobile

Priority:

1. Headline
2. CTA
3. Registration form
4. Referral action
5. Content
6. Decorative visuals

Rules:

- Avoid horizontal scrolling.
- Buttons should generally be full-width in forms.
- Keep touch targets >= 44px.
- Navigation collapses to a sheet/menu.
- Globe becomes much smaller and lower opacity.

## Tablet

Use two-column layouts selectively.

## Desktop

Use max-width containers:

```text
max-w-6xl
max-w-7xl
```

Avoid extremely wide text blocks.

---

# 25. Accessibility

Every interactive element must have:

- Visible focus state
- Accessible label
- Keyboard support
- Semantic HTML

Requirements:

- `button` for actions
- `a` for navigation
- Proper heading hierarchy
- `aria-label` where visual context is insufficient
- Sufficient color contrast
- Form error association
- Do not rely on color alone
- Respect reduced motion

The reference globe navigation already demonstrates explicit `aria-label` usage for section navigation. fileciteturn0file0L193-L208

---

# 26. Loading States

Never show an empty page while data is loading.

Use:

- Skeletons for dashboard cards
- Button spinner/disabled state for submissions
- Table skeletons
- Placeholder leaderboard rows

Do not use blocking full-page spinners for simple operations.

---

# 27. Error States

Every asynchronous component should define:

```text
idle
loading
success
error
empty
```

Example:

```text
Unable to load leaderboard.

[ Try again ]
```

Do not display raw API errors or stack traces to users.

---

# 28. Toasts

Use toasts for:

- Referral link copied
- Registration saved
- Invite link generated
- Minor update confirmations

Do not use toasts for:

- Important validation errors
- Destructive confirmations
- Authentication failures that require visible explanation

---

# 29. Cards

Cards should have:

- Clear title
- Supporting text
- Strong spacing
- Semantic grouping
- Minimal decoration

Avoid cards nested inside cards unless hierarchy truly requires it.

---

# 30. Landing Page Section Structure

Recommended production sequence:

```text
1. Announcement / badge
2. Hero
3. “What you'll build”
4. Why this matters for final-year students
5. 60-minute workshop timeline
6. Campus challenge / referral loop
7. Live leaderboard preview
8. Social proof / registrations
9. FAQ
10. Final registration CTA
11. Footer
```

The referral loop should appear before the final CTA so users understand why registration has an additional action.

---

# 31. Suggested Workshop Timeline UI

Display the one-hour experience as:

```text
0–10 min
Understand the problem

10–25 min
Set up the project

25–45 min
Build the AI workflow

45–55 min
Connect everything

55–60 min
Test + share your project
```

Use a horizontal timeline on desktop and a vertical timeline on mobile.

Use subtle scroll-reveal motion.

---

# 32. Campus Challenge Visual

Use a prominent section:

```text
Your campus can be #1

Register
↓
Invite 3 friends
↓
Your campus climbs
↓
Reach the top
```

Visual treatment:

- Large number
- Progress
- Campus rank
- Leaderboard
- CTA

---

# 33. Empty / First-Time States

When no referral exists:

```text
Your referral network starts here.

Invite 3 classmates and start moving your campus up the leaderboard.

[ Invite Friends ]
```

When no campus leaderboard data exists:

```text
The campus leaderboard is warming up.

Be one of the first campuses to register.
```

---

# 34. Dark Mode

Dark mode should be fully supported if the existing shadcn system supports it.

Do not simply invert colors.

Review:

- Borders
- Shadows
- Muted text
- Aurora visibility
- Globe opacity
- Input backgrounds
- Tables
- Dialogs
- Focus rings

The supplied visual reference already uses Tailwind dark-mode patterns for its backgrounds and gradient effects. fileciteturn0file0L151-L169

---

# 35. Background Effects

Use visual effects sparingly:

### Allowed

- Aurora
- Soft radial gradients
- Subtle grid
- Globe
- Small gradient accent
- Light blur behind hero

### Avoid

- Constant moving particles everywhere
- Multiple animated backgrounds simultaneously
- Heavy blur over content
- Decorative 3D elements behind form controls

---

# 36. Image / Asset Rules

Use images only where they improve understanding.

For supplied globe assets:

- Keep the visual as an isolated UI primitive.
- Avoid depending on an external image URL in production without reviewing licensing/caching requirements.
- Prefer locally hosted assets or a controlled CDN before production.

The supplied globe reference currently references an external `cdn.21st.dev` image URL; treat that as a development/reference asset rather than a production dependency. fileciteturn0file0L436-L443

Do not use random stock photos simply to fill space.

---

# 37. Performance

The visual layer must not compromise the registration flow.

Requirements:

- Lazy-load non-critical visuals
- Avoid giant image payloads
- Keep animation transform/opacity based
- Use `will-change` only when justified
- Avoid expensive layout-triggering animations
- Avoid continuously running effects on mobile
- Do not block rendering with decorative assets

---

# 38. SEO / Social Preview

Landing page must define:

```text
title
description
Open Graph title
Open Graph description
Open Graph image
Twitter card metadata
canonical URL
```

Suggested title:

```text
Build Your First AI Project in 60 Minutes | Free Live Workshop
```

Suggested description:

```text
A free live workshop for final-year engineering students. Build your first AI project in 60 minutes and invite your campus to the challenge.
```

---

# 39. Design Tokens / CSS Layer

Do not scatter arbitrary values across components.

Centralize:

- Colors
- Radius
- Shadows
- Typography
- Motion durations
- Container widths

If the project already has a shadcn token system, extend it rather than replacing it.

---

# 40. Motion Token Recommendations

Define shared values in:

```text
src/lib/motion.ts
```

Example:

```ts
export const motionTokens = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.7,
  section: 0.6,
} as const;

export const reveal = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export const viewport = {
  once: true,
  amount: 0.2,
};
```

This makes motion consistent across the app.

---

# 41. Component Rules

Every custom component should:

- Have typed props
- Use semantic HTML
- Be reusable where practical
- Avoid hidden global state
- Accept `className` when composition is expected
- Use `cn()` for conditional class merging
- Keep data fetching outside pure presentational primitives
- Keep UI primitives free from campaign-specific business logic

Example:

```tsx
interface ReferralProgressProps {
  referrals: number;
  target?: number;
  className?: string;
}
```

---

# 42. Data / UI Separation

Do not make the landing components directly depend on API URLs.

Preferred:

```text
API layer
   ↓
page/container
   ↓
presentational component
```

For example:

```text
useLeaderboard()
      ↓
CampusLeaderboard
```

not:

```text
CampusLeaderboard
      ↓
fetch("/api/leaderboard")
```

unless the project architecture explicitly requires it.

---

# 43. Design-to-Implementation Priority

Implementation priority:

### P0 — Conversion

- Hero
- Registration CTA
- Registration form
- Success screen
- Referral link
- WhatsApp share

### P1 — Growth

- Referral progress
- Campus leaderboard
- Student dashboard
- Campus ranking

### P2 — Operations

- Admin dashboard
- Analytics
- Ambassador management
- Export

### P3 — Enhancement

- Advanced motion
- Additional visual effects
- Extra marketing sections

Do not spend time on P3 before P0/P1 are complete.

---

# 44. Quality Bar

The finished UI should pass this test:

### First 5 seconds

A student knows:

- What this is
- Why they should care
- That it is free
- That it takes 60 minutes
- How to register

### First 30 seconds after registration

A student knows:

- They are registered
- Their referral code
- How to invite friends
- How many referrals they need
- Their campus position

### Admin

An organizer knows:

- How many registrations exist
- Which campuses are performing
- Which ambassadors are driving registrations
- How referrals contribute to the 500 target

---

# 45. Non-Negotiables

Do not:

- Build a generic template without adapting it to AI 60 × 500
- Recreate shadcn primitives unnecessarily
- Put page-specific components inside `/components/ui`
- Hard-code leaderboard data in production
- Hide loading/error states
- Expose internal identifiers in public UI
- Use animation that blocks interaction
- Use external assets without a production decision
- Create inaccessible icon-only controls
- Overload the page with visual effects

Do:

- Reuse shadcn patterns
- Keep components composable
- Use Framer Motion for meaningful interaction
- Keep the CTA obvious
- Keep the referral loop visible
- Optimize for mobile
- Respect reduced motion
- Keep the visual system consistent

---

# 46. Definition of Done

The design implementation is complete only when:

- [ ] shadcn component structure is respected
- [ ] `/components/ui` contains reusable primitives
- [ ] 21st.dev-inspired components are adapted to product content
- [ ] Globe experience is responsive
- [ ] Aurora is used selectively
- [ ] Framer Motion is used for meaningful transitions
- [ ] Reduced motion is respected
- [ ] Mobile layout is production-ready
- [ ] Keyboard navigation works
- [ ] Registration UI is complete
- [ ] Referral UI is complete
- [ ] Leaderboard UI is complete
- [ ] Admin UI is consistent
- [ ] Loading states exist
- [ ] Error states exist
- [ ] Empty states exist
- [ ] Dark mode is correct where enabled
- [ ] No console errors
- [ ] No placeholder copy remains
- [ ] No broken interactive controls remain

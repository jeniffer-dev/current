# CLAUDE.md

# CURRENT Frontend 🌊

Frontend for CURRENT — a calm elite athlete operating system focused on long-term athletic preparation, macrocycles, training planning, strength progression, testing, and lessons learned.

CURRENT is not a generic workout tracker.

It is:
- cycle-centric
- preparation-focused
- progression-aware
- reflective
- calm
- premium
- cognitively lightweight

Core philosophy:

> Support the process.

---

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase Auth
- Supabase client
- Recharts for future charts
- lucide-react for icons

---

## Product Feeling

The UI should feel:

- calm
- intentional
- premium
- minimal
- spacious
- aquatic
- athlete-focused
- emotionally intelligent

It should NOT feel like:

- a bodybuilding app
- a hustle/productivity app
- a gamified habit tracker
- a spreadsheet
- a noisy fitness dashboard

---

## Design Direction

CURRENT blends:

- Linear / Notion structure
- WHOOP / Apple Fitness athlete feel
- Oura / Rise Sleep softness

The app should feel like:

> calm elite performance

---

## Color Palette

Use these colors consistently:

```css
--current-soft: #ADEEE3;
--current-recovery: #86DEB7;
--current-primary: #63B995;
--current-load: #F5A65B;
--current-peak: #FCD581;
```

Preferred background: `#FAFAF8`

Avoid harsh pure white when possible.

---

## Typography

- Clean sans-serif
- Generous spacing
- Clear hierarchy
- Avoid overly decorative type
- Use calm, confident copy

---

## UI Rules

- Use TailwindCSS
- Use shadcn/ui components
- Prefer cards with soft borders and rounded corners
- Use subtle shadows only
- Use whitespace generously
- Avoid clutter
- Avoid loud animations
- Avoid excessive emojis in production UI
- Icons should be minimal and thin

---

## Component Rules

- Use functional React components
- Prefer Server Components by default
- Use Client Components only when interactivity is needed
- Keep components small and composable
- Avoid deeply nested UI logic
- Use TypeScript strictly
- Avoid `any`

---

## File Naming

Use kebab-case for files:
- `training-day-card.tsx`
- `macrocycle-progress.tsx`
- `readiness-card.tsx`

Use PascalCase for components:
- `TrainingDayCard`
- `MacrocycleProgress`
- `ReadinessCard`

---

## Folder Structure

```
src/
  app/
  components/
    ui/
    layout/
    shared/
  features/
    dashboard/
    planner/
    performance/
    training/
    testing/
    macrocycles/
    libraries/
    profile/
  lib/
    supabase/
    utils.ts
  hooks/
  types/
```

Feature-specific components live inside `features/`.

Shared visual components live inside `components/`.

---

## Page Roles

Every page has a psychological role.

### Dashboard

Purpose: orientation.

Question it answers: **Where am I in the process?**

Shows:
- current phase
- countdown
- today's sessions
- readiness context
- small progress highlights

### Planner

Purpose: strategy.

Question it answers: **Where is this preparation going?**

Should feel: calm · strategic · macrocycle-aware.

Planner should not feel like a productivity to-do list.

### Day View

Purpose: execution.

Question it answers: **What matters today?**

Rules:
- Main lifts should feel important
- Accessories should be compact
- Logging should be fast
- Do not add timers
- Do not overtrack live workout details

### Performance

Purpose: reflection.

Question it answers: **Am I evolving?**

Shows:
- strength progression
- test history
- phase snapshots
- PRs
- lessons learned

Tone should be reflective, not obsessive.

### Macrocycle

Purpose: long-term preparation narrative.

Shows:
- phases
- key dates
- phase reviews
- lessons learned
- cycle summary

---

## Core UX Principles

- Reduce cognitive load
- Remember previous weights
- Show recommended vs actual loads clearly
- Make progression visible but not stressful
- Keep the interface emotionally calm
- Avoid performance anxiety UX

---

## Logging UX

**Main lifts:**
- displayed as premium cards
- show prescription
- show recommended weight
- show last performed weight
- allow actual weight logging

**Accessories:**
- compact rows
- quick edit
- low visual weight

The session should feel lighter as it gets completed.

---

## Testing UX

Tests are dynamic. Do not hardcode specific sport tests.

Testing UI supports:
- strength tests
- swim tests
- conditioning tests
- custom test templates
- result history

Testing feeds future percentage calculations.

---

## Accessibility

- Semantic HTML
- Keyboard accessible interactions
- Visible focus states
- Sufficient contrast
- Respect reduced motion preferences
- Inputs must have labels
- Buttons must be descriptive

---

## Auth UI

Auth pages should be:
- minimal
- calm
- spacious
- premium

No generic SaaS clutter.

---

## State Management

- Prefer server data from Supabase
- Keep local state minimal
- Do not introduce global state unless needed
- Use React Query/TanStack Query later only if useful

---

## Things to Avoid

Do not add:
- social features
- gamification-heavy mechanics
- timers
- nutrition tracking
- AI coaching
- noisy dashboards
- excessive analytics in V1

CURRENT should stay focused.

---

## Product Constraint

CURRENT should feel like a quiet high-performance workspace.

Not a workout entertainment app.

The goal is to help athletes execute and learn from long-term preparation cycles.

# Visual Source of Truth

Dashboard is the visual source of truth for CURRENT.

All future pages must inherit:

- container width
- spacing system
- card treatment
- typography hierarchy
- badge styling
- color palette

Avoid introducing new visual patterns unless explicitly requested.

When in doubt:
match Dashboard.
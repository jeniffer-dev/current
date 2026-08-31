---
name: current-ui-components
description: Building or editing UI in the CURRENT app — React components, pages, session cards, bottom sheets, forms, logging inputs, charts, or anything under frontend/src/components and frontend/src/app. Use this skill whenever a task involves rendering, layout, styling, shadcn/ui, Tailwind classes, mobile behaviour, or "make this look/feel better". The app has a deliberate minimal aesthetic and a strict rule that components contain no business logic, and both are easy to erode one small change at a time.
---

# UI conventions in CURRENT

The athlete opens a session mid-training, on an iPhone, possibly wet. The UI's job is to
**reduce thinking**: what to train, in what order, what weight, whether progress is on track.

## Components hold no business logic

Components receive resolved data. They do not query, calculate, match strings, or decide.

`gym-session-card.tsx` receives a pre-resolved `prescriptionsByExerciseId` map rather than
working out prescriptions itself. Follow that pattern: if a component needs derived data,
resolve it server-side and pass it in.

Purely visual computation is fine — formatting a number for display, deciding a chart's
tick count. Anything that answers a training question is not visual.

Default to server components. Reach for `"use client"` only when there is real interactivity,
and push the boundary as far down the tree as possible.

## Visual language

The app is intentionally quiet:

- Muted colours, subtle borders, calm typography, low visual noise.
- Information hierarchy over decoration.
- No dashboards packed with cards. No decorative graphics. No gradients or accent colours
  introduced for their own sake.

Use existing shadcn/ui primitives and the project's Tailwind tokens. Do not add a new colour,
shadow, or radius that isn't already in the system.

**No hardcoded pixel values.** Use Tailwind's spacing and sizing scale. If a layout seems to
require a magic number, the layout mechanism is probably wrong — investigate before
hardcoding, and explain what you found.

## Don't redesign

Small, focused UX improvements only. Do not restructure a page, change its layout, or
"modernise" its styling unless the user explicitly asked for that. Preserve existing
behaviour.

If while doing a small change you notice a larger problem, say so — don't fix it unasked.

## Mobile

Planner, Day View, exercise logging, bottom sheets and session completion all need to work
comfortably one-handed on an iPhone during training. Check touch target size and whether
inputs are reachable above the keyboard.

## Logging inputs

Main lifts display: target, suggested weight, and a source badge (`[Test-based]` or
`[Last session]`). Weight and reps are prefilled but always editable. A field must never
show a value whose origin isn't visible to the athlete.

## Before writing component code

1. Search for an existing component or utility that already does this. Reuse beats creating.
2. Read how the current version gets its data, and explain that mechanism back to the user.
3. Describe the proposed change and its risk.
4. Then implement.

Skipping step 2 is how business logic ends up back inside components.

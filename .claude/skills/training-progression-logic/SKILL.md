---
name: training-progression-logic
description: Any work touching CURRENT's training domain — weekly prescriptions, suggested weights, exposure counts, phases and macrocycles, 1RM estimation, progression charts, source badges, or the weekly recommendation feature. Use this skill whenever a task mentions Accumulation or Adaptation, "suggested weight", "prescription", "progression", "1RM", "exposure", "phase", or asks to add/change how the app decides what the athlete should lift. The domain rules here are non-obvious and easy to violate accidentally — inventing a progression algorithm or reusing the wrong clock produces code that looks correct and gives the athlete wrong numbers.
---

# Training and progression logic in CURRENT

The app answers one question: *"Am I progressing toward my target competition?"*
(Currently: Berlin Champions Cup, November 2026.)

It behaves like a coach, not a calculator. Every number shown to the athlete must be
traceable to either the program or the athlete's own logged history.

## Hard rules

**Never invent training logic.** No automatic progression algorithms, no auto-increasing
weights, no AI-generated loads, no "smart" defaults. If a prescription doesn't exist in the
program, the correct output is *no suggestion*, not a guess.

**Suggestions never overwrite logs.** Inputs are prefilled but editable. Saving stores what
the athlete actually performed, never the suggestion.

**Always explain the source.** Every suggested weight carries a badge — `[Test-based]` or
`[Last session]`. A number without a visible origin is not shippable.

**Percentages live in the service, not in components.** `getWeeklyPrescription()` owns them.
If a percentage appears in a React component, that's a defect.

## The two clocks

These are separate and must not be conflated:

1. **Macrocycle calendar progression** — where the athlete is in time (phases, weeks, the
   run-up to the competition).
2. **Execution-based training progression** — how many times the athlete has actually
   completed a given exposure.

A feature that reads the calendar clock when it needs the execution clock will silently
prescribe the wrong load. Whenever you touch progression, state which clock the feature
depends on before writing code.

**`getWeeklyPrescription()`'s second argument is a step index, never a calendar week.**
This is the single most common mistake in this codebase. Check every call site.

## Exposure counts

`getCompletedExposureCounts()` in `frontend/src/lib/progression.ts`:

- Uses the query builder plus `Set` deduplication. No raw SQL, no `.rpc()`.
- **Must exclude the session currently being rendered** — filter `date < currentDayDate`.
  Including it produces an off-by-one that shifts the whole prescription.
- A failed count and a genuine zero are different states and must remain distinguishable
  all the way to the UI.
- **On failure, do not fall back to the historical log.** Surface the failure instead. A
  silent fallback shows a plausible-but-wrong weight, which is worse than showing nothing.

## Suggested weight priority

```
1. Exercise has primary_test_template_id
   → latest test_result → estimated_1rm_kg → weekly prescription
   → round to nearest 2.5 kg → prefill        [Test-based]

2. No linked strength test
   → latest exercise_log → prefill            [Last session]

3. Neither
   → empty input, no badge
```

`estimated_1rm_kg` is calculated **once, when the test is recorded** — never recomputed at
render time.

## 1RM estimation

The Epley formula already exists in the codebase. Reuse it. Do not write a second
implementation, and do not switch formulas without the user asking.

For strength progression charts, estimated 1RM is the correct Y-axis metric — it reuses
existing logic rather than introducing a parallel notion of "progress".

## Phases

- `page.tsx` has three distinct code paths: Accumulation with a valid count, Accumulation
  with a failed count, and all other phases. Keep them distinct; don't collapse them.
- Only one Accumulation phase instance exists in the data today, but the architecture must
  support several. Never write code that assumes a single instance.
- Weekly session structure varies **by week within a phase** — it is not fixed. Any feature
  that assumes a repeating weekly template is wrong.
- Phase boundary warnings are per-lift and self-clearing. They are not "show on the first
  day of the new phase" banners.
- Accumulation ↔ Adaptation transitions affect continuity of the progression curve. Known,
  non-blocking, but worth naming if a chart task comes up.

## Changes that must ship together

Label logic and weight logic each have **two call sites**. Changing one without the other
produces a UI that contradicts itself — e.g. a badge saying `[Test-based]` next to a weight
derived from the last log. Any change to either must update both in the same commit. Say so
explicitly in your plan.

## Weekly recommendation feature

Scoped but blocked. Prerequisites, in order:
1. ~~Migration history repaired~~ — done Aug 2026. Migrations live in `supabase/` at the
   repo root and local files match the remote database.
2. Full training program migrated from Excel into the database.
3. Natation has `energy_system` and `sequence_index` columns.
4. Conditioning moved out of the hardcoded TypeScript catalog.

If asked to start this, report which prerequisites are unmet rather than building against
placeholder data.

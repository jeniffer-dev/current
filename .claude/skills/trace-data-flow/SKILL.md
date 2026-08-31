---
name: trace-data-flow
description: Debugging wrong or missing data in the CURRENT app — a suggested weight that looks wrong, an exposure count that's off by one, a session that doesn't render, a chart with a gap, a badge showing the wrong source, a value that's stale or zero when it shouldn't be. Use this skill whenever the user reports that something "shows the wrong number", "isn't appearing", "used to work", or asks why a value is what it is. Also use it before proposing any fix to a data bug — the point is to locate exactly where the pipeline breaks instead of guessing, because a plausible-looking patch at the wrong layer is the main way this codebase accumulates duplicated business logic.
---

# Tracing a data bug in CURRENT

The rule here: **find where the value first becomes wrong, then fix it at that layer.**
Fixing a symptom one layer downstream is how duplicated logic gets introduced.

Do not propose a fix until you have completed the trace and reported findings.

## The pipeline

```
Database
   ↓
Pure utilities        (frontend/src/lib/*)
   ↓
Server-side calc      (server components, server actions)
   ↓
Presentation          (React components)
   ↓
UI
```

Every value in this app should originate at the top and flow down unchanged in meaning.
If a component is computing something, that is already a finding worth reporting.

## Procedure

### 1. Pin down the observed vs. expected value

Get concrete: which exercise, which date, which session, what number is shown, what number
should be shown. Vague bug reports produce vague traces. Ask if this isn't clear.

### 2. Read the database

Query the actual rows involved. Do not infer what is in the database from what the code
appears to do.

```bash
supabase db query --linked "select * from exercise_logs where exercise_id = '...' order by created_at desc limit 10;"
```

Verify table names against the live schema — the project docs are stale and reference tables
that no longer exist (see the `supabase-migrations` skill for the live/dead list).

State plainly whether the database is correct. If it is, the bug is downstream and you can
stop looking here.

### 3. Read the pure utilities

Check `frontend/src/lib/` for the function that transforms this data. Read the whole
function, including its arguments' units and semantics — argument confusion is a recurring
source of bugs in this codebase. In particular:

- `getWeeklyPrescription()`'s second argument is a **step index**, never a calendar week.
  If a caller is passing a week number, that is the bug.
- Exposure counts must exclude the session currently being rendered
  (`date < currentDayDate`). An off-by-one exposure count is almost always this filter.

Trace the return value by hand for the specific case in step 1. Show your arithmetic.

### 4. Read the server-side layer

Check what the page or server action passes down. Look for:
- A failed query that silently returns `null`/`0` and gets rendered as a genuine zero.
  Error states and real zeros must be distinguishable — if they aren't, that's the bug.
- A fallback that shouldn't exist. When an exposure count fails, the code must **not** fall
  back to the historical log; it should surface the failure.
- Which of the three code paths in `page.tsx` this case takes: Accumulation with a valid
  count, Accumulation with a failed count, or other phases. Name the path explicitly.

### 5. Read the presentation layer

Components should receive resolved data, not derive it. `gym-session-card.tsx` receives a
pre-resolved `prescriptionsByExerciseId` map for exactly this reason. If the component is
doing lookups, matching strings, or recalculating, report it — that is likely the bug and
also a structural problem.

### 6. Report before fixing

Write up:
- **Fact:** what the data actually is at each layer (with the values you observed).
- **The break point:** the first layer where the value stops being correct.
- **Assumption:** anything you could not verify, marked as such.
- **Proposed fix:** at the break-point layer, and why fixing it downstream would be wrong.
- **Risk:** what else calls this code path.

Then wait for the user before implementing, unless they've already said to go ahead.

## Recurring traps in this codebase

- **Two clocks.** Macrocycle calendar progression and execution-based training progression
  are separate. A bug that looks like "wrong week" is often the wrong clock being consulted.
- **Both call sites.** Label logic and weight logic each have two call sites. If you change
  one, the other will contradict it. Any fix must ship both together in one commit.
- **Phase transitions.** Accumulation ↔ Adaptation boundaries can create apparent gaps in
  the progression chart. This is known and non-blocking — confirm whether the reported bug is
  actually this before treating it as new.
- **Multiple phase instances.** Only one Accumulation phase currently exists in the data, so
  code can appear correct while silently assuming there's only ever one. Check for that
  assumption.

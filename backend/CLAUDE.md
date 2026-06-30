# CLAUDE.md — Backend

Supabase/PostgreSQL backend for CURRENT. See root CLAUDE.md for product philosophy and general architecture.

---

# Stack

- Supabase
- PostgreSQL
- TypeScript
- Supabase Auth
- Row Level Security (RLS)

---

# Architecture Principles

## Keep business logic explicit
Avoid hidden magic.

## Prefer composable systems
Tests and programming should be template-driven.

## Support future flexibility
Do not hardcode sport-specific assumptions.

## Database-first architecture
The relational model is core to the product.

---

# Schema Philosophy

- Tables model domain concepts directly — no over-abstraction
- Every record belongs to a user, enforced via RLS
- UUIDs everywhere for IDs
- snake_case for all tables and columns

---

# Core Tables

## users
Athlete accounts.

## macrocycles
Long-term preparation cycles (e.g. "Road to Berlin").

## phases
Sub-cycles within a macrocycle (e.g. Adaptation, Accumulation, Transmutation, Realization).

## training_days
Core operational entity. Contains readiness, reflections, linked sessions, linked tests.

## gym_session_templates
Reusable strength session blueprints.

## gym_session_exercises
Stores exercise, sets, reps, and percentage prescriptions per template.

## swim_session_templates
Reusable swim sessions.

## exercises
Master exercise library.

## strength_logs
Actual performed work. Must support prescribed load, actual load, RPE, and completion state.

## test_templates
Defines reusable tests (e.g. Back Squat 3RM, 400m Swim).

## test_results
Stores actual testing outcomes linked to test_templates and training_days.

## lessons_learned
Long-term preparation intelligence across macrocycles.

---

# Percentage System

```text
3RM → estimated 1RM → percentage prescriptions
```

- Session templates store **percentages**, NOT fixed weights
- The backend calculates: estimated 1RM · recommended load · intelligent rounding
- Recommended and actual loads must be stored separately

---

# Weight Logic

Support:
- Percentage-based prescriptions
- Manual override
- Intelligent rounding per equipment type

Examples:
- Barbell → nearest 2.5kg
- Dumbbells → nearest 1kg
- Cable → nearest machine increment

---

# Completion States

Training sessions support:

- `completed`
- `modified`
- `partial`
- `skipped`

Avoid binary completion logic.

---

# RLS Rules

- Every table with user data must have RLS enabled
- Policies must scope reads and writes to the authenticated user
- Never expose service role keys to the client
- Never trust client-side calculations

---

# Validation

- Validate all inputs server-side
- Use TypeScript types + Zod where applicable
- Never trust the client

---

# Migration Philosophy

- Small, focused migrations
- Explicit descriptive naming
- No destructive migrations without backups

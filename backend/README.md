# CURRENT — Backend

Backend foundation for CURRENT, a calm elite athlete operating system.

---

## Purpose

This backend powers the data layer for CURRENT using Supabase and PostgreSQL.

It is responsible for:
- Database schema and migrations
- Row Level Security (RLS) policies
- Auth (via Supabase Auth)
- Percentage-based weight calculation logic
- All athlete data: macrocycles, phases, training days, sessions, logs, tests, lessons learned

---

## Stack

- **Supabase** — hosted PostgreSQL + Auth + RLS
- **PostgreSQL** — relational database
- **TypeScript** — type safety for any scripts or logic
- **Supabase CLI** — for local development and migrations

---

## Supabase Setup

> Setup steps will be documented here once the Supabase project is created.

Placeholder:
1. Install Supabase CLI: `npm install -g supabase`
2. Link project: `supabase link --project-ref <your-project-ref>`
3. Pull remote schema: `supabase db pull`
4. Run migrations: `supabase db push`

---

## Folder Structure

```
<repo root>/
  supabase/
    config.toml   ← project link — run every `supabase` command from the repo root
    migrations/   ← SQL migration files
  backend/
    .env.example  ← required environment variables
```

---

## Migrations

All schema changes go through `supabase/migrations/` **at the repo root**, not under
`backend/`. Run the CLI from the repo root, where the project is linked.

See `.claude/skills/supabase-migrations/SKILL.md` for the current history state and the
verification steps to run before writing a migration.

Rules:
- One concern per migration file
- Descriptive naming: `<timestamp>_<description>.sql`
- No destructive changes without a backup plan
- Never edit a migration that has already been applied

---

## Next Step

**Step 2** — Implement the core database schema:
- `users`
- `macrocycles`
- `phases`
- `training_days`
- `gym_session_templates`
- `gym_session_exercises`
- `swim_session_templates`
- `exercises`
- `strength_logs`
- `test_templates`
- `test_results`
- `lessons_learned`

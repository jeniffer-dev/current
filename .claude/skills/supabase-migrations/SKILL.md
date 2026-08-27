---
name: supabase-migrations
description: Database schema work in the CURRENT app — creating or editing Supabase migrations, adding or altering tables/columns/enums/indexes, writing RLS policies, or running any `supabase db` / `supabase migration` command. Use this skill whenever a task touches the database schema, even indirectly: adding a column to support a feature, seeding program data, renaming a field, or reading table structure before writing a query. Migrations live in `supabase/` at the repo root and the CLI must be run from there.
---

# Supabase migrations in CURRENT

The database is the source of truth for this app. Schema mistakes are expensive because
utilities, server calculations and UI all derive from it. Work slowly here.

## Where migrations live

All migrations are in **`supabase/migrations/`** at the repo root, and the project is linked
from the repo root (`supabase/config.toml`). Run every `supabase` command from there.

This was consolidated on 2026-08-27. Before that, files were split across
`backend/supabase/migrations/` (001–009) and `supabase/migrations/`, while the project link
lived in `frontend/supabase/` — so the CLI saw no local migrations from where it was linked,
and could not find the link from where the migrations were. `backend/supabase/migrations/`
now holds only `008_seed_content.text`, a plain-text copy of the seed kept for reference.

## History state: healthy

As of the consolidation, `supabase migration list` shows all 11 migrations matched on both
sides, with no skipped files. `supabase db push` is safe.

An earlier version of this skill claimed migrations `003`–`009` were unregistered. **That was
wrong** — they were registered all along. The real gaps were two migrations that were applied
by hand and never recorded, both repaired on 2026-08-27:
- `20260707040229_suggested_weights`
- `20260101000000_seed_testing` — previously named `008b_seed_testing.sql`, a filename the CLI
  silently skipped because it doesn't match `<version>_<name>.sql`.

**Before writing or pushing any migration**, verify the state yourself rather than trusting
this file:

```bash
cd <repo root> && supabase migration list
```

Every row should have matching `local` and `remote` versions, and the command should print no
`Skipping migration ...` lines. A skipped file is invisible to the CLI — it will never be
pushed, and its absence from the history is silent.

If a migration is applied in the database but missing from the remote history, repair it:

```bash
supabase migration repair --status applied <version>
supabase migration list   # confirm
```

Do not run `repair` unattended. Report the current `migration list` output to the user and
get confirmation before repairing — repair rewrites history metadata and the user needs to
know it happened.

Never work around a history problem by writing raw SQL against the live database, and never
move the data into a TypeScript constant to avoid the migration.

## Live vs. dead tables

Confirm table names against the live schema before writing queries — the older project docs
are stale and name tables that do not exist.

Active tables:
- `gym_session_templates`
- `gym_session_exercises`
- `swim_session_templates`
- `exercise_logs`

Dead / unused:
- `strength_logs` — do not read from it, write to it, or reference it in new code. If you
  find existing references, flag them rather than silently deleting.

To verify current structure rather than trusting any document:

```bash
supabase db dump --schema public --data-only=false -f /tmp/schema.sql
# or query the live schema directly (there is no `db psql` subcommand)
supabase db query --linked "select column_name, data_type, is_nullable
  from information_schema.columns
  where table_schema = 'public' and table_name = 'gym_session_exercises'
  order by ordinal_position;"
```

## Writing a migration

1. Inspect the current schema for the affected tables first, and report what you found.
2. Explain the proposed change and its risk to existing rows before writing SQL.
3. Create the migration through the CLI so history stays consistent:
   ```bash
   supabase migration new <descriptive_snake_case_name>
   ```
4. Write forward SQL that is safe to apply to a database that already has production data:
   - New columns are nullable, or have a default — never `NOT NULL` without a default on a
     populated table.
   - Backfill in the same migration when a column will later be required.
   - Add indexes for any column used in a `WHERE` or join in the app.
5. Add or update RLS policies in the same migration. Every table in this app is
   user-scoped; a table without RLS is a bug, not a TODO.
6. Apply locally and verify before pushing:
   ```bash
   supabase db reset      # local only — verifies the migration replays from scratch
   supabase db push       # remote
   ```

## Query patterns in application code

- Use the Supabase query builder. Do not add `.rpc()` calls or raw SQL in `frontend/src/lib`
  — the existing code deliberately avoids both, and mixing styles makes the data flow harder
  to trace.
- Deduplicate in TypeScript with a `Set` where the query builder can't express it, as
  `getCompletedExposureCounts()` in `frontend/src/lib/progression.ts` already does. Follow
  that pattern rather than inventing a new one.
- Queries belong in `lib/` or server components, never inside a client component.

## Known pending schema work

No longer blocked — the history repair is done. Still unstarted:
- Natation needs `energy_system` and `sequence_index` columns.
- Conditioning data needs to move out of the hardcoded TypeScript catalog into the database.
- The full training program (from the Excel source) needs to exist in the database before
  the weekly recommendation feature is possible.

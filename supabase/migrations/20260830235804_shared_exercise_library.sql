-- ============================================================
-- THE EXERCISE LIBRARY BELONGS TO THE APP, NOT TO AN ATHLETE
--
-- "Back Squat" is vocabulary, not programme. Every athlete means the
-- same movement by it, and a movement that means the same thing should
-- be the same row.
--
-- Until now `exercises` was owned per user, which had two costs:
--
--   1. A macrocycle shared between athletes referenced exercise ids that
--      meant nothing on the other side. Copying one would have needed a
--      name-matching step that creates whatever is missing — the kind of
--      code that fails silently and mismatches "Back Squat" with "Back
--      Squat (High Bar)". With a shared catalog that code does not need
--      to exist.
--   2. Every athlete would rebuild the same 118 rows by hand.
--
-- Ownership is now expressed by NULL rather than by a flag: a row with
-- no user_id belongs to the app. That way a row cannot be both — and the
-- existing per-user policies keep meaning exactly what they meant for
-- the personal rows they still cover.
--
-- Athletes keep private exercises of their own. Only a curator writes
-- the shared catalog.
-- ============================================================

alter table profiles
  add column if not exists is_curator boolean not null default false;

comment on column profiles.is_curator is
  'May create, edit and delete rows in the shared exercise catalog.';

-- Reads the caller''s own flag. SECURITY DEFINER so the policies below do
-- not depend on profiles'' own RLS, and search_path is pinned so the
-- function cannot be redirected by a caller-supplied schema.
create or replace function public.is_curator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_curator from profiles p where p.id = auth.uid()), false);
$$;

revoke all on function public.is_curator() from public;
grant execute on function public.is_curator() to authenticated;

-- ── the catalog ───────────────────────────────────────────────

alter table exercises alter column user_id drop not null;

comment on column exercises.user_id is
  'NULL means the row belongs to the shared catalog. A non-NULL owner is an athlete''s private exercise.';

-- The 118 seeded exercises become the catalog the app ships with.
update exercises set user_id = null where user_id is not null;

-- ── policies ──────────────────────────────────────────────────

drop policy if exists "exercises: owner all" on exercises;

create policy "exercises: read shared and own"
  on exercises for select
  using (user_id is null or user_id = auth.uid());

-- An athlete's own exercises. The `with check` clauses pin user_id to the
-- caller, so nobody can hand a row to the catalog — or take one from it —
-- by editing the column.
create policy "exercises: create own"
  on exercises for insert
  with check (user_id = auth.uid());

create policy "exercises: update own"
  on exercises for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "exercises: delete own"
  on exercises for delete
  using (user_id = auth.uid());

-- The shared catalog.
--
-- Deleting from it is safe by construction rather than by policy:
-- gym_session_exercises and strength_logs reference exercises with
-- RESTRICT and exercise_logs with NO ACTION, so the database refuses to
-- remove an exercise anybody has actually used. A curator cannot destroy
-- another athlete's history by tidying the catalog.
create policy "exercises: curator creates shared"
  on exercises for insert
  with check (user_id is null and public.is_curator());

create policy "exercises: curator updates shared"
  on exercises for update
  using (user_id is null and public.is_curator())
  with check (user_id is null and public.is_curator());

create policy "exercises: curator deletes shared"
  on exercises for delete
  using (user_id is null and public.is_curator());

create index if not exists idx_exercises_shared on exercises(user_id) where user_id is null;

-- The athlete who authored the catalog curates it.
update profiles set is_curator = true
where id = '797dde8a-5ad0-427b-a2ce-99f73805b030';

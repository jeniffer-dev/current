-- ============================================================
-- THE TEST CATALOG BELONGS TO THE APP TOO
--
-- Same argument as the exercise library: a 400m Swim is a 400m Swim, and
-- a shared macrocycle whose testing references per-user template ids
-- would need name-matching code that quietly mismatches similar names.
--
-- ── and one difference that matters ──────────────────────────
--
-- exercises was safe to share partly by luck: gym_session_exercises and
-- strength_logs reference it with RESTRICT, so the database refuses to
-- delete a movement anybody has used.
--
-- test_templates had no such protection. test_results referenced it with
-- ON DELETE CASCADE, which is defensible while a template belongs to one
-- athlete — deleting your own test takes your own results with it. It
-- stops being defensible the moment the row is shared: a curator tidying
-- the catalog would silently delete every athlete's history for that
-- test, with no warning and no way back.
--
-- So the rule changes to RESTRICT before the table is shared. Deleting a
-- test that has results is refused outright, which is the correct rule
-- even for a private template: results record something that happened,
-- and removing a definition should never erase them.
--
-- The other two references keep CASCADE on purpose. test_battery_items
-- and testing_session_items are prescriptions rather than history — a
-- test removed from the catalog should leave the plans that named it.
-- ============================================================

alter table test_results
  drop constraint if exists test_results_test_template_id_fkey;

alter table test_results
  add constraint test_results_test_template_id_fkey
  foreign key (test_template_id) references test_templates(id) on delete restrict;

-- ── the catalog ───────────────────────────────────────────────

alter table test_templates alter column user_id drop not null;

comment on column test_templates.user_id is
  'NULL means the row belongs to the shared catalog. A non-NULL owner is an athlete''s private test.';

update test_templates set user_id = null where user_id is not null;

-- ── policies ──────────────────────────────────────────────────

drop policy if exists "test_templates: owner all" on test_templates;

create policy "test_templates: read shared and own"
  on test_templates for select
  using (user_id is null or user_id = auth.uid());

create policy "test_templates: create own"
  on test_templates for insert
  with check (user_id = auth.uid());

create policy "test_templates: update own"
  on test_templates for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "test_templates: delete own"
  on test_templates for delete
  using (user_id = auth.uid());

create policy "test_templates: curator creates shared"
  on test_templates for insert
  with check (user_id is null and public.is_curator());

create policy "test_templates: curator updates shared"
  on test_templates for update
  using (user_id is null and public.is_curator())
  with check (user_id is null and public.is_curator());

create policy "test_templates: curator deletes shared"
  on test_templates for delete
  using (user_id is null and public.is_curator());

create index if not exists idx_test_templates_shared on test_templates(user_id) where user_id is null;

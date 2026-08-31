-- ============================================================
-- A PLAN CAN BE ARCHIVED, AND SOMETIMES DELETED
--
-- Until now a macrocycle could be created and never removed. A typo in
-- the wizard was permanent unless somebody opened the database by hand,
-- and three stray "test" cycles were created that way — one of which
-- covered today and took over the dashboard from the real season.
--
-- Three things, and they interlock:
--
--   1. archived_at        a cycle can be set aside without being destroyed
--   2. no overlaps        two live cycles cannot claim the same day
--   3. a delete guard     a cycle with training in it cannot be deleted
-- ============================================================

alter table macrocycles
  add column if not exists archived_at timestamptz;

comment on column macrocycles.archived_at is
  'Set aside: keeps its history but no longer competes to be the current cycle.';

create index if not exists idx_macrocycles_live
  on macrocycles(user_id, start_date) where archived_at is null;

-- ── 2 · no two live cycles may share a day ────────────────────
--
-- Enforced here rather than in the wizard because the wizard is one of
-- several ways a row can arrive, and because the failure it prevents is
-- silent: the app picks the current cycle by date, and when two overlap
-- the tiebreak — most recently started wins — hands the season to
-- whichever was created last. That is exactly backwards for a plan
-- created by mistake.
--
-- Bounds are inclusive on both ends: a day belongs to one cycle, so a
-- cycle ending the same day another begins is an overlap, not a handoff.
--
-- Archived cycles are exempt. Setting a block aside and starting a new
-- one over the same weeks is a real thing an athlete does.
create extension if not exists btree_gist;

alter table macrocycles
  drop constraint if exists macrocycles_no_overlap;

alter table macrocycles
  add constraint macrocycles_no_overlap
  exclude using gist (
    user_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (archived_at is null);

-- ── 3 · deleting a cycle must not delete a season ─────────────
--
-- training_days references macrocycles with ON DELETE CASCADE, and
-- training_day_sessions and exercise_logs cascade from there. So a single
-- delete of a cycle with history behind it would take the sessions and
-- the logged sets with it, without a word. For the one real cycle in this
-- database that is 53 training days, 57 completed sessions and 67 logged
-- sets.
--
-- A cycle nobody has trained in is a different matter — those three
-- "test" rows had phases and nothing else, and deleting them is right.
-- So the rule is about evidence of training, not about age.
create or replace function public.refuse_delete_of_trained_macrocycle()
returns trigger
language plpgsql
as $$
declare
  day_count int;
  result_count int;
begin
  select count(*) into day_count   from training_days where macrocycle_id = old.id;
  select count(*) into result_count from test_results  where macrocycle_id = old.id;

  if day_count > 0 or result_count > 0 then
    raise exception
      'This plan has % training day(s) and % test result(s) behind it. Archive it instead of deleting it.',
      day_count, result_count
      using errcode = 'restrict_violation',
            hint = 'Set archived_at instead. Deleting would cascade to the sessions and logged sets.';
  end if;

  return old;
end;
$$;

drop trigger if exists trg_macrocycles_refuse_delete_when_trained on macrocycles;

create trigger trg_macrocycles_refuse_delete_when_trained
  before delete on macrocycles
  for each row execute function public.refuse_delete_of_trained_macrocycle();

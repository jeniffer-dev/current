-- ============================================================
-- CURRENT — Active macrocycle
-- ============================================================
-- Until now the app picked "the" macrocycle with
-- `order by start_date desc limit 1` in ~10 read paths. Once an
-- athlete can create a second macrocycle from the UI, that rule
-- silently switches the whole app over to the newest one and
-- leaves no way to keep the previous cycle as history.
--
-- One macrocycle per athlete is active; the rest are kept, not
-- deleted. Enforced in the database rather than in application
-- code, because every read path depends on the invariant.
-- ============================================================

-- 1. Add the flag. Existing rows default to active; step 2 narrows that.
alter table macrocycles
  add column if not exists is_active boolean not null default true;

-- 2. Backfill: keep only the most recent macrocycle per athlete active.
--    Ordered by start_date, with created_at then id as deterministic
--    tiebreakers so the result does not depend on row order.
update macrocycles m
set is_active = false
where exists (
  select 1
  from macrocycles other
  where other.user_id = m.user_id
    and (
         other.start_date  >  m.start_date
      or (other.start_date  =  m.start_date and other.created_at >  m.created_at)
      or (other.start_date  =  m.start_date and other.created_at =  m.created_at and other.id > m.id)
    )
);

-- 3. Enforce at most one active macrocycle per athlete.
--    Partial index: inactive rows are unconstrained, so an athlete may
--    keep any number of past cycles.
create unique index if not exists macrocycles_one_active_per_user
  on macrocycles(user_id)
  where is_active;

-- 4. Read paths filter on (user_id, is_active).
create index if not exists idx_macrocycles_user_active
  on macrocycles(user_id, is_active);

-- ============================================================
-- CURRENT — Goal event date
-- ============================================================
-- `goal_event` records WHAT the athlete is preparing for, but not
-- WHEN. The dashboard countdown stood in for it with `end_date`,
-- which is where the plan's phases run out — a different date, and
-- one the athlete does not choose directly.
--
-- The builder asks for a target event date, so it needs somewhere
-- to live. Nullable: an athlete may be preparing without a fixed
-- date yet, and every existing row is in exactly that position.
-- ============================================================

alter table macrocycles
  add column if not exists goal_event_date date;

-- Backfill nothing on purpose. The existing end_date is the end of the
-- planned phases; assuming it is also the competition date would invent
-- a fact the athlete never entered. Countdown falls back to end_date
-- while this is null.

comment on column macrocycles.goal_event_date is
  'Date of the target competition. Null when unknown; distinct from end_date, which is where the phases run out.';

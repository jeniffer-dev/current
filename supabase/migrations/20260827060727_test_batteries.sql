-- ============================================================
-- TEST BATTERIES
--
-- A battery is the recurring thing an athlete actually thinks about:
-- "my water testing", "my gym testing". It has a fixed list of tests and
-- happens at several points in the season — land testing brackets
-- Accumulation, water testing runs all the way through.
--
-- The split is authoring vs. schedule:
--
--   test_batteries / _items / _anchors   what the athlete EDITS
--   testing_blocks / _sessions / _items  what the app RENDERS
--
-- The second set is generated from the first. It already existed and is
-- kept as it is, because test_results point at it: regenerating a
-- schedule must never orphan a result the athlete has already logged.
--
-- This replaces features/tests/sessions-config.ts, which held one
-- athlete's week 2 as a hardcoded TypeScript literal and carried the
-- note "V1: hardcoded config. Future: move to DB junction table".
-- ============================================================

create table test_batteries (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references profiles(id)    on delete cascade,
  macrocycle_id uuid        not null references macrocycles(id) on delete cascade,
  name          text        not null,
  -- Mirrors testing_sessions.session_type, which already uses these
  -- values. 'mixed' is a battery that runs both in one sitting.
  kind          text        not null check (kind in ('in_water', 'strength', 'mixed')),
  description   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- The tests in the battery, in the order they are performed.
create table test_battery_items (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references profiles(id)      on delete cascade,
  battery_id       uuid        not null references test_batteries(id) on delete cascade,
  test_template_id uuid        not null references test_templates(id) on delete cascade,
  order_index      smallint    not null default 0,
  created_at       timestamptz not null default now(),
  unique (battery_id, test_template_id)
);

-- When the battery happens. Two ways to say it, because the athlete
-- thinks both ways: "at the end of Accumulation" moves when the phase
-- moves, while "March 14" is a date someone else set — a competition,
-- a lab booking — and must not drift when the plan is reshaped.
create table test_battery_anchors (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references profiles(id)       on delete cascade,
  battery_id     uuid        not null references test_batteries(id) on delete cascade,
  anchor_kind    text        not null check (anchor_kind in ('phase', 'date')),
  phase_id       uuid        references phases(id) on delete cascade,
  position       text        check (position in ('start', 'end')),
  scheduled_date date,
  created_at     timestamptz not null default now(),
  -- Each kind carries its own fields and only its own.
  constraint test_battery_anchors_shape check (
    (anchor_kind = 'phase' and phase_id is not null and position is not null and scheduled_date is null)
    or
    (anchor_kind = 'date'  and scheduled_date is not null and phase_id is null and position is null)
  )
);

-- ============================================================
-- The generated side gains two things.
-- ============================================================

-- Which battery produced a session. Regeneration replaces the sessions
-- it generated and leaves alone anything created by hand.
alter table testing_sessions
  add column if not exists battery_id uuid references test_batteries(id) on delete set null;

-- Which tests a generated session prescribes. testing_sessions had no
-- link to test_templates at all — test_results referenced both, but a
-- result is a record of what happened, not a prescription of what to do,
-- so a session nobody had performed yet listed nothing.
create table testing_session_items (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references profiles(id)          on delete cascade,
  testing_session_id uuid        not null references testing_sessions(id)  on delete cascade,
  test_template_id   uuid        not null references test_templates(id)    on delete cascade,
  order_index        smallint    not null default 0,
  created_at         timestamptz not null default now(),
  unique (testing_session_id, test_template_id)
);

create index idx_test_batteries_macrocycle       on test_batteries(macrocycle_id);
create index idx_test_batteries_user             on test_batteries(user_id);
create index idx_test_battery_items_battery      on test_battery_items(battery_id);
create index idx_test_battery_anchors_battery    on test_battery_anchors(battery_id);
create index idx_test_battery_anchors_phase      on test_battery_anchors(phase_id);
create index idx_testing_sessions_battery        on testing_sessions(battery_id);
create index idx_testing_session_items_session   on testing_session_items(testing_session_id);
create index idx_testing_session_items_user      on testing_session_items(user_id);

create trigger trg_test_batteries_updated_at
  before update on test_batteries
  for each row execute function set_updated_at();

alter table test_batteries        enable row level security;
alter table test_battery_items    enable row level security;
alter table test_battery_anchors  enable row level security;
alter table testing_session_items enable row level security;

create policy "test_batteries: owner all"
  on test_batteries for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "test_battery_items: owner all"
  on test_battery_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "test_battery_anchors: owner all"
  on test_battery_anchors for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "testing_session_items: owner all"
  on testing_session_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

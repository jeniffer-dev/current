-- ============================================================
-- TESTING SESSIONS
-- Individual days within a testing block.
-- A testing block spans a week; sessions represent the specific
-- days on which tests are performed (e.g. gym day vs pool day).
-- Status: planned → completed (no in-progress at session level).
-- ============================================================

create table testing_sessions (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references profiles(id)       on delete cascade,
  testing_block_id  uuid        not null references testing_blocks(id) on delete cascade,
  date              date        not null,
  session_type      text        not null,   -- 'strength' | 'in_water' | 'mixed'
  session_label     text,                   -- "Strength Session 1", used as stable identifier
  status            text        not null default 'planned',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint testing_sessions_unique_label_per_block unique (testing_block_id, session_label)
);

create index idx_testing_sessions_user_id          on testing_sessions(user_id);
create index idx_testing_sessions_testing_block_id on testing_sessions(testing_block_id);
create index idx_testing_sessions_date             on testing_sessions(date);

create trigger trg_testing_sessions_updated_at
  before update on testing_sessions
  for each row execute function set_updated_at();

alter table testing_sessions enable row level security;

create policy "testing_sessions: owner all"
  on testing_sessions for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- LINK test_results → testing_sessions
-- testing_block_id is kept (intentional denormalization for
-- performance comparisons across blocks without join chains).
-- ============================================================

alter table test_results
  add column if not exists testing_session_id uuid references testing_sessions(id) on delete set null;

create index if not exists idx_test_results_testing_session_id
  on test_results(testing_session_id);

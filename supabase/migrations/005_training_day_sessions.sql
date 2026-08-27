-- ============================================================
-- TRAINING DAY SESSIONS
-- Tracks completion status for each individual session within
-- a training day. A day with "Gym ADP – Day 1 / Swim Endurance"
-- creates two rows — one per session — allowing independent
-- completion tracking.
--
-- Status lifecycle: planned → completed | skipped → planned
-- ============================================================

create table training_day_sessions (
  id               uuid        primary key default gen_random_uuid(),
  training_day_id  uuid        not null references training_days(id) on delete cascade,
  user_id          uuid        not null references profiles(id)      on delete cascade,
  session_type     text        not null,   -- 'gym' | 'swim' | 'recovery' | 'other'
  session_name     text        not null,   -- e.g. "Gym ADP – Day 1", "Swim Endurance"
  template_id      uuid,                   -- optional link to gym/swim template
  status           text        not null default 'planned',
  completed_at     timestamptz,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Indexes
create index idx_training_day_sessions_training_day_id on training_day_sessions(training_day_id);
create index idx_training_day_sessions_user_id         on training_day_sessions(user_id);
create index idx_training_day_sessions_status          on training_day_sessions(status);
create index idx_training_day_sessions_session_type    on training_day_sessions(session_type);

-- Auto-update updated_at (reuses the set_updated_at() function from migration 001)
create trigger trg_training_day_sessions_updated_at
  before update on training_day_sessions
  for each row execute function set_updated_at();

-- RLS
alter table training_day_sessions enable row level security;

create policy "training_day_sessions: owner all"
  on training_day_sessions for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- BACKFILL
-- For each existing training_day with a session_type string,
-- parse the slash-delimited sessions and create one row each.
-- The session_type field values look like:
--   "Gym ADP – Day 1 / Swim Endurance / Recovery"
-- ============================================================

insert into training_day_sessions (training_day_id, user_id, session_type, session_name, status)
select
  td.id                                                    as training_day_id,
  td.user_id                                               as user_id,
  case
    when trim(part.session_name) ~* '^gym\s+'    then 'gym'
    when trim(part.session_name) ~* '\bswim\b'   then 'swim'
    when trim(part.session_name) ~* '^recovery'  then 'recovery'
    else 'other'
  end                                                      as session_type,
  trim(part.session_name)                                  as session_name,
  'planned'                                                as status
from training_days td
cross join lateral
  unnest(string_to_array(td.session_type, '/')) as part(session_name)
where td.session_type is not null
  and trim(part.session_name) <> ''
  and not exists (
    select 1 from training_day_sessions tds
    where tds.training_day_id = td.id
  );

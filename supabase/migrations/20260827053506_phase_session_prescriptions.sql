-- ============================================================
-- SESSION PRESCRIPTIONS PER PHASE (and per week within a phase)
--
-- The training mix is a property of the PHASE, not of the season:
-- Accumulation asks for more volume than Competition does. And within
-- a phase, individual weeks step away from that baseline — a deload
-- week is the ordinary case.
--
-- Two tables, deliberately:
--   phase_session_prescriptions — the typical week of a phase. Dense:
--     one row per activity the athlete trains in that phase.
--   phase_week_prescriptions    — only the weeks that DIFFER. Sparse:
--     absence means "the typical week applies", which is the common
--     case and should cost no rows.
--
-- activity_key, not session_type, is the identity here. The planner
-- distinguishes activities by (session_type, session_name) — UWR
-- Training and a generic "other" session share session_type 'other'
-- but are not the same activity (see recurring-activities.ts). The
-- resolution from key to those two columns lives in one place in the
-- frontend catalog; this table stores the key the athlete chose.
-- ============================================================

create table phase_session_prescriptions (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references profiles(id) on delete cascade,
  phase_id          uuid        not null references phases(id)   on delete cascade,
  activity_key      text        not null,   -- 'gym' | 'swim' | 'conditioning' | 'uwr' | 'recovery' | 'other'
  label             text,                   -- the athlete's own name, when the key alone doesn't say it
  sessions_per_week smallint    not null check (sessions_per_week between 0 and 14),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (phase_id, activity_key)
);

create table phase_week_prescriptions (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references profiles(id) on delete cascade,
  phase_id       uuid        not null references phases(id)   on delete cascade,
  -- 0-based, counted from the first week of the phase.
  week_index     smallint    not null check (week_index >= 0),
  activity_key   text        not null,
  sessions_count smallint    not null check (sessions_count between 0 and 14),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (phase_id, week_index, activity_key)
);

create index idx_phase_session_prescriptions_phase on phase_session_prescriptions(phase_id);
create index idx_phase_session_prescriptions_user  on phase_session_prescriptions(user_id);
create index idx_phase_week_prescriptions_phase    on phase_week_prescriptions(phase_id, week_index);
create index idx_phase_week_prescriptions_user     on phase_week_prescriptions(user_id);

create trigger trg_phase_session_prescriptions_updated_at
  before update on phase_session_prescriptions
  for each row execute function set_updated_at();

create trigger trg_phase_week_prescriptions_updated_at
  before update on phase_week_prescriptions
  for each row execute function set_updated_at();

alter table phase_session_prescriptions enable row level security;
alter table phase_week_prescriptions    enable row level security;

create policy "phase_session_prescriptions: owner all"
  on phase_session_prescriptions for all
  using      (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "phase_week_prescriptions: owner all"
  on phase_week_prescriptions for all
  using      (user_id = auth.uid())
  with check (user_id = auth.uid());

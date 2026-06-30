-- ============================================================
-- EXERCISE LOGS
-- Stores the athlete's top set for each strength exercise
-- within a training day session. One log per exercise per
-- session — not a full set-by-set journal.
-- ============================================================

create table exercise_logs (
  id                       uuid        primary key default gen_random_uuid(),
  user_id                  uuid        not null references profiles(id)             on delete cascade,
  training_day_session_id  uuid        not null references training_day_sessions(id) on delete cascade,
  exercise_id              uuid        not null references exercises(id),
  weight                   numeric,
  reps                     integer,
  notes                    text,
  logged_at                timestamptz not null default now(),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Indexes
create index idx_exercise_logs_training_day_session_id on exercise_logs(training_day_session_id);
create index idx_exercise_logs_exercise_id             on exercise_logs(exercise_id);
create index idx_exercise_logs_user_id                 on exercise_logs(user_id);

-- Auto-update updated_at (reuses set_updated_at() from migration 001)
create trigger trg_exercise_logs_updated_at
  before update on exercise_logs
  for each row execute function set_updated_at();

-- RLS
alter table exercise_logs enable row level security;

create policy "exercise_logs: owner all"
  on exercise_logs for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

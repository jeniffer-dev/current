-- ============================================================
-- CURRENT — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================


-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ============================================================
-- PROFILES
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

alter table profiles enable row level security;

create policy "profiles: owner select"
  on profiles for select
  using (id = auth.uid());

create policy "profiles: owner update"
  on profiles for update
  using (id = auth.uid());

create policy "profiles: owner insert"
  on profiles for insert
  with check (id = auth.uid());


-- ============================================================
-- MACROCYCLES
-- ============================================================

create table macrocycles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  name        text not null,
  goal_event  text,
  start_date  date not null,
  end_date    date not null,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint macrocycles_dates_check check (end_date >= start_date)
);

create index idx_macrocycles_user_id on macrocycles(user_id);
create index idx_macrocycles_start_date on macrocycles(start_date);

create trigger trg_macrocycles_updated_at
  before update on macrocycles
  for each row execute function set_updated_at();

alter table macrocycles enable row level security;

create policy "macrocycles: owner all"
  on macrocycles for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- PHASES
-- ============================================================

create table phases (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  macrocycle_id   uuid not null references macrocycles(id) on delete cascade,
  name            text not null,
  phase_type      text not null,
  start_date      date not null,
  end_date        date not null,
  volume          text,
  intensity       text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint phases_dates_check check (end_date >= start_date)
);

create index idx_phases_user_id on phases(user_id);
create index idx_phases_macrocycle_id on phases(macrocycle_id);
create index idx_phases_start_date on phases(start_date);

create trigger trg_phases_updated_at
  before update on phases
  for each row execute function set_updated_at();

alter table phases enable row level security;

create policy "phases: owner all"
  on phases for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- TRAINING DAYS
-- ============================================================

create table training_days (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  macrocycle_id   uuid not null references macrocycles(id) on delete cascade,
  phase_id        uuid references phases(id) on delete set null,
  date            date not null,
  session_type    text,
  status          text not null default 'planned',
  readiness_score numeric,
  reflection      text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint training_days_unique_user_date unique (user_id, date)
);

create index idx_training_days_user_id on training_days(user_id);
create index idx_training_days_macrocycle_id on training_days(macrocycle_id);
create index idx_training_days_phase_id on training_days(phase_id);
create index idx_training_days_date on training_days(date);

create trigger trg_training_days_updated_at
  before update on training_days
  for each row execute function set_updated_at();

alter table training_days enable row level security;

create policy "training_days: owner all"
  on training_days for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- EXERCISES
-- ============================================================

create table exercises (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles(id) on delete cascade,
  name                  text not null,
  movement_pattern      text,
  category              text,
  main_muscle           text,
  bilateral_unilateral  text,
  track_load            boolean not null default true,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint exercises_unique_name_per_user unique (user_id, name)
);

create index idx_exercises_user_id on exercises(user_id);

create trigger trg_exercises_updated_at
  before update on exercises
  for each row execute function set_updated_at();

alter table exercises enable row level security;

create policy "exercises: owner all"
  on exercises for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- GYM SESSION TEMPLATES
-- ============================================================

create table gym_session_templates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  name        text not null,
  focus       text,
  phase_type  text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint gym_session_templates_unique_name_per_user unique (user_id, name)
);

create index idx_gym_session_templates_user_id on gym_session_templates(user_id);

create trigger trg_gym_session_templates_updated_at
  before update on gym_session_templates
  for each row execute function set_updated_at();

alter table gym_session_templates enable row level security;

create policy "gym_session_templates: owner all"
  on gym_session_templates for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- GYM SESSION EXERCISES
-- ============================================================

create table gym_session_exercises (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references profiles(id) on delete cascade,
  gym_session_template_id   uuid not null references gym_session_templates(id) on delete cascade,
  exercise_id               uuid not null references exercises(id) on delete restrict,
  order_index               integer not null default 0,
  sets                      integer,
  reps                      text,
  tempo                     text,
  rpe                       text,
  intensity_type            text not null default 'none',
  intensity_value           numeric,
  notes                     text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index idx_gym_session_exercises_user_id on gym_session_exercises(user_id);
create index idx_gym_session_exercises_template_id on gym_session_exercises(gym_session_template_id);
create index idx_gym_session_exercises_exercise_id on gym_session_exercises(exercise_id);

create trigger trg_gym_session_exercises_updated_at
  before update on gym_session_exercises
  for each row execute function set_updated_at();

alter table gym_session_exercises enable row level security;

create policy "gym_session_exercises: owner all"
  on gym_session_exercises for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- SWIM SESSION TEMPLATES
-- ============================================================

create table swim_session_templates (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  name             text not null,
  swim_type        text not null,
  distance_meters  integer,
  focus            text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint swim_session_templates_unique_name_per_user unique (user_id, name)
);

create index idx_swim_session_templates_user_id on swim_session_templates(user_id);

create trigger trg_swim_session_templates_updated_at
  before update on swim_session_templates
  for each row execute function set_updated_at();

alter table swim_session_templates enable row level security;

create policy "swim_session_templates: owner all"
  on swim_session_templates for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- STRENGTH LOGS
-- ============================================================

create table strength_logs (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references profiles(id) on delete cascade,
  training_day_id           uuid not null references training_days(id) on delete cascade,
  exercise_id               uuid not null references exercises(id) on delete restrict,
  gym_session_exercise_id   uuid references gym_session_exercises(id) on delete set null,
  set_number                integer,
  prescribed_weight_kg      numeric,
  actual_weight_kg          numeric,
  reps                      integer,
  rpe                       numeric,
  status                    text not null default 'completed',
  notes                     text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index idx_strength_logs_user_id on strength_logs(user_id);
create index idx_strength_logs_training_day_id on strength_logs(training_day_id);
create index idx_strength_logs_exercise_id on strength_logs(exercise_id);

create trigger trg_strength_logs_updated_at
  before update on strength_logs
  for each row execute function set_updated_at();

alter table strength_logs enable row level security;

create policy "strength_logs: owner all"
  on strength_logs for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- TEST TEMPLATES
-- ============================================================

create table test_templates (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references profiles(id) on delete cascade,
  name                    text not null,
  category                text not null,
  metric_type             text not null,
  unit                    text not null,
  protocol                text,
  linked_exercise_id      uuid references exercises(id) on delete set null,
  calculates_estimated_1rm boolean not null default false,
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint test_templates_unique_name_per_user unique (user_id, name)
);

create index idx_test_templates_user_id on test_templates(user_id);
create index idx_test_templates_linked_exercise_id on test_templates(linked_exercise_id);

create trigger trg_test_templates_updated_at
  before update on test_templates
  for each row execute function set_updated_at();

alter table test_templates enable row level security;

create policy "test_templates: owner all"
  on test_templates for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- TEST RESULTS
-- ============================================================

create table test_results (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles(id) on delete cascade,
  test_template_id    uuid not null references test_templates(id) on delete cascade,
  training_day_id     uuid references training_days(id) on delete set null,
  phase_id            uuid references phases(id) on delete set null,
  macrocycle_id       uuid references macrocycles(id) on delete set null,
  result_value        numeric not null,
  estimated_1rm_kg    numeric,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_test_results_user_id on test_results(user_id);
create index idx_test_results_test_template_id on test_results(test_template_id);
create index idx_test_results_training_day_id on test_results(training_day_id);
create index idx_test_results_phase_id on test_results(phase_id);
create index idx_test_results_macrocycle_id on test_results(macrocycle_id);

create trigger trg_test_results_updated_at
  before update on test_results
  for each row execute function set_updated_at();

alter table test_results enable row level security;

create policy "test_results: owner all"
  on test_results for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- LESSONS LEARNED
-- ============================================================

create table lessons_learned (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  macrocycle_id   uuid not null references macrocycles(id) on delete cascade,
  phase_id        uuid references phases(id) on delete set null,
  training_day_id uuid references training_days(id) on delete set null,
  title           text not null,
  body            text,
  lesson_type     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_lessons_learned_user_id on lessons_learned(user_id);
create index idx_lessons_learned_macrocycle_id on lessons_learned(macrocycle_id);
create index idx_lessons_learned_phase_id on lessons_learned(phase_id);
create index idx_lessons_learned_training_day_id on lessons_learned(training_day_id);

create trigger trg_lessons_learned_updated_at
  before update on lessons_learned
  for each row execute function set_updated_at();

alter table lessons_learned enable row level security;

create policy "lessons_learned: owner all"
  on lessons_learned for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

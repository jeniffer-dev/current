-- ============================================================
-- EXERCISE LOGGABLE FLAG
-- Adds is_loggable to exercises so the product controls which
-- movements show Exercise Logging Lite UI without requiring
-- frontend code changes.
--
-- Default: false (opt-in, not opt-out)
-- ============================================================

alter table exercises
  add column if not exists is_loggable boolean not null default false;

-- ── Backfill: mark known load-bearing strength movements ─────
-- Only exercises where progressive overload is trackable and
-- meaningful. Bodyweight, activation, prehab, and conditioning
-- drills stay false.

update exercises
set is_loggable = true
where lower(name) in (
  -- Squat pattern
  'back squat',
  'front squat',
  'goblet squat',
  'bulgarian split squat',
  'leg press',
  'hack squat',
  -- Hinge pattern
  'deadlift',
  'romanian deadlift',
  'rdl',
  'single leg rdl',
  'stiff leg deadlift',
  'trap bar deadlift',
  -- Hip thrust / glute
  'bb hip thrust',
  'barbell hip thrust',
  'hip thrust',
  'weighted hip thrust',
  -- Push pattern
  'bench press',
  'incline bench press',
  'decline bench press',
  'overhead press',
  'db shoulder press',
  'db bench press',
  'push press',
  -- Pull pattern
  'pull up',
  'chin up',
  'weighted pull up',
  'lat pulldown',
  'seated row',
  'cable row',
  'barbell row',
  'db row',
  'pendlay row',
  -- Step / lunge
  'weighted step ups',
  'step ups',
  'walking lunge',
  'reverse lunge',
  'lateral lunge'
);

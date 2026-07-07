-- ============================================================
-- CURRENT — Suggested Weights
-- Adds primary_test_template_id to exercises so the Day View
-- can look up a test-based 1RM for each main lift.
-- Also ensures test_templates.linked_exercise_id is populated
-- (name-based, one-time), then derives the inverse link.
-- ============================================================

-- 1. Add primary_test_template_id to exercises
alter table exercises
  add column if not exists primary_test_template_id uuid
  references test_templates(id) on delete set null;

-- 2. Ensure linked_exercise_id is populated on test_templates
--    (idempotent: only fills nulls)
update test_templates tt
set linked_exercise_id = e.id
from exercises e
where tt.user_id = e.user_id
  and tt.linked_exercise_id is null
  and (
       (tt.name = 'Back Squat 3RM'          and e.name = 'Back Squat')
    or (tt.name = 'Deadlift 3RM'            and e.name = 'Deadlift')
    or (tt.name = 'Bench Press 3RM'         and e.name = 'Bench Press')
    or (tt.name = 'Supinated Pull Up 1RM'   and e.name = 'Supinated Pull Up')
  );

-- 3. Derive primary_test_template_id from the now-established
--    linked_exercise_id — ID-to-ID, no string matching
update exercises e
set primary_test_template_id = tt.id
from test_templates tt
where tt.linked_exercise_id = e.id
  and tt.user_id = e.user_id
  and e.primary_test_template_id is null;

-- 4. A 1RM test measures the 1RM directly — mark it accordingly
update test_templates
set calculates_estimated_1rm = true
where name like '%1RM%'
  and calculates_estimated_1rm = false;

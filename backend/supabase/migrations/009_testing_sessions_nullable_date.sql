-- ============================================================
-- Make testing_sessions.date nullable
-- Historical testing blocks (e.g. week 0 pre-macrocycle baseline)
-- have no known session date. The NOT NULL constraint was too strict.
-- ============================================================

ALTER TABLE testing_sessions
  ALTER COLUMN date DROP NOT NULL;

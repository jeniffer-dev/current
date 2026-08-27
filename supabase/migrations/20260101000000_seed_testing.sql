-- ============================================================
-- CURRENT — Testing Blocks & Sessions Seed
-- Standalone extract from 008_seed_content.sql
-- Run AFTER 009_testing_sessions_nullable_date.sql
-- Testing starts at Week 2. No historical baseline (Week 0).
-- ============================================================

DO $$
DECLARE
  _uid    uuid;
  _mac_id uuid;
  _blk_w2  uuid; _blk_w7  uuid;
  _blk_w12 uuid; _blk_w15 uuid; _blk_w16 uuid; _blk_w18 uuid;
BEGIN
  SELECT id INTO _uid    FROM profiles    LIMIT 1;
  SELECT id INTO _mac_id FROM macrocycles ORDER BY start_date DESC LIMIT 1;

  -- ── TESTING BLOCKS ────────────────────────────────────────
  INSERT INTO testing_blocks (user_id, macrocycle_id, week_number, scheduled_date, status, purpose)
    VALUES (_uid, _mac_id, 2, '2026-07-29', 'pending', 'Baseline — End of Adaptation')
    ON CONFLICT (user_id, macrocycle_id, week_number) DO UPDATE SET purpose = EXCLUDED.purpose
    RETURNING id INTO _blk_w2;
  IF _blk_w2 IS NULL THEN SELECT id INTO _blk_w2 FROM testing_blocks WHERE user_id = _uid AND macrocycle_id = _mac_id AND week_number = 2; END IF;

  INSERT INTO testing_blocks (user_id, macrocycle_id, week_number, scheduled_date, status, purpose)
    VALUES (_uid, _mac_id, 7, '2026-09-02', 'pending', 'Mid Accumulation — In-Water only')
    ON CONFLICT (user_id, macrocycle_id, week_number) DO UPDATE SET purpose = EXCLUDED.purpose
    RETURNING id INTO _blk_w7;
  IF _blk_w7 IS NULL THEN SELECT id INTO _blk_w7 FROM testing_blocks WHERE user_id = _uid AND macrocycle_id = _mac_id AND week_number = 7; END IF;

  INSERT INTO testing_blocks (user_id, macrocycle_id, week_number, scheduled_date, status, purpose)
    VALUES (_uid, _mac_id, 12, '2026-10-07', 'pending', 'End Accumulation checkpoint')
    ON CONFLICT (user_id, macrocycle_id, week_number) DO UPDATE SET purpose = EXCLUDED.purpose
    RETURNING id INTO _blk_w12;
  IF _blk_w12 IS NULL THEN SELECT id INTO _blk_w12 FROM testing_blocks WHERE user_id = _uid AND macrocycle_id = _mac_id AND week_number = 12; END IF;

  INSERT INTO testing_blocks (user_id, macrocycle_id, week_number, scheduled_date, status, purpose)
    VALUES (_uid, _mac_id, 15, '2026-10-28', 'pending', 'End Transmutation checkpoint')
    ON CONFLICT (user_id, macrocycle_id, week_number) DO UPDATE SET purpose = EXCLUDED.purpose
    RETURNING id INTO _blk_w15;
  IF _blk_w15 IS NULL THEN SELECT id INTO _blk_w15 FROM testing_blocks WHERE user_id = _uid AND macrocycle_id = _mac_id AND week_number = 15; END IF;

  INSERT INTO testing_blocks (user_id, macrocycle_id, week_number, scheduled_date, status, purpose)
    VALUES (_uid, _mac_id, 16, '2026-11-04', 'pending', 'Start Realization — In-Water only')
    ON CONFLICT (user_id, macrocycle_id, week_number) DO UPDATE SET purpose = EXCLUDED.purpose
    RETURNING id INTO _blk_w16;
  IF _blk_w16 IS NULL THEN SELECT id INTO _blk_w16 FROM testing_blocks WHERE user_id = _uid AND macrocycle_id = _mac_id AND week_number = 16; END IF;

  INSERT INTO testing_blocks (user_id, macrocycle_id, week_number, scheduled_date, status, purpose)
    VALUES (_uid, _mac_id, 18, '2026-11-18', 'pending', 'Pre Berlin — In-Water only')
    ON CONFLICT (user_id, macrocycle_id, week_number) DO UPDATE SET purpose = EXCLUDED.purpose
    RETURNING id INTO _blk_w18;
  IF _blk_w18 IS NULL THEN SELECT id INTO _blk_w18 FROM testing_blocks WHERE user_id = _uid AND macrocycle_id = _mac_id AND week_number = 18; END IF;

  -- ── TESTING SESSIONS ─────────────────────────────────────
  -- Week 2
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w2, '2026-07-29', 'strength', 'Strength Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w2, '2026-08-01', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;

  -- Week 7 — in-water only
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w7, '2026-09-05', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;

  -- Week 12
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w12, '2026-10-07', 'strength', 'Strength Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w12, '2026-10-10', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;

  -- Week 15
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w15, '2026-10-28', 'strength', 'Strength Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w15, '2026-10-31', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;

  -- Week 16 — in-water only
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w16, '2026-11-07', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;

  -- Week 18 — in-water only
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w18, '2026-11-21', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;

END $$;

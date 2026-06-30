-- ============================================================
-- CURRENT — Content Seed
-- Migration: 008_seed_content.sql
-- Generated from: current_complete_macrocycle_export_v3.json
-- ============================================================

DO $$
DECLARE
  _uid uuid; _mac_id uuid;
  _tpl_adp1 uuid; _tpl_adp2 uuid;
  _tpl_acc1 uuid; _tpl_acc2 uuid; _tpl_acc3 uuid;
  _tpl_trn1 uuid; _tpl_trn2 uuid; _tpl_trn3 uuid;
  _tpl_rlz1 uuid; _tpl_rlz2 uuid;
  _blk_w0 uuid; _blk_w2 uuid; _blk_w7 uuid;
  _blk_w12 uuid; _blk_w15 uuid; _blk_w16 uuid; _blk_w18 uuid;
BEGIN
  SELECT id INTO _uid FROM profiles LIMIT 1;
  SELECT id INTO _mac_id FROM macrocycles ORDER BY start_date DESC LIMIT 1;

  -- ── 1. RENAME test template ──────────────────────────────
  UPDATE test_templates SET name = 'Supinated Pull Up 1RM'
    WHERE user_id = _uid AND name = 'Pull Up 1RM';

  -- ── 2. EXERCISES ─────────────────────────────────────────
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, '1 and a half Back Squat', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, '3 sec eccentric + 2sec hold Front Squat drill', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, '5 sec Eccentric Push Up', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, '5 sec Squat Hold', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Alt DB Bicep Curls', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Alternating Supermans', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Arm Circles w/ plates', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Back Extension with Rotation', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Back Extensions', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Back Squat', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Banded Deadlift', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Banded Good Mornings', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Banded Side Steps', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Banded Spead aparts', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'BB Hip Thrust', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'BB Shoulder Press', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Bench Press', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Bench Press (fast concentric)', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Bench Pull', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Bent Over Row w/ DB', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Bicep curl to Arnold Press', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Body Weight Squat 3-2-0', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Boxers Sit Ups', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Bungee Push Up', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Butchers Block', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Cable Chops', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Cable punch w/ Rotation', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Cable Row', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Calf Raise', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Child Pose and side reaches', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Clean Pulls from the hang', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Cossac Squat', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'DB Bent over Row', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'DB Bulgarian Split Squat', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'DB Bulgarian Split Squat + Jumps', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'DB Hang Snatch', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'DB Skull Crusher', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Deadlift', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Deep Goblet Squat Hold', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Deep Squat Hold + Rocks', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Deep Squat Hold to Thoracic Rotations', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Dorsiflexion against wall', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Downdward to Upward dog', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Downward dog to Runner Lunges', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Dragon Flag slow eccentric', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Eccentric Push Up', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Explosive Inverted Rows', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Extended Cat-Camell', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Extended Cat-Cow (elbows or hands on bench)', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Front Squat', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Half Back Squat (fast concentric)', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Half Hindu Push Up', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Hanging Active Hold', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Hanging Leg raises', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Hindu Push Up', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Hip Thrust', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Hollow Body Hold', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Hollow Body Kicks', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Hollow Body Rocks', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Incline Bench Press w/ DB', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Incline DB Bench', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Inverted Row', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Jefferson Curl', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'KB Single leg RDL', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'L Sit Hold', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Lat Pull Down', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Leg Curl', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Max Height box jumps', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Med Ball Fwd Throw (8-10Kg)', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'OH Press w/ band (5sec up/ 5sec down)', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Paused Deadlift', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Plate around head', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Plate around head (10kg)', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Plate Overhead Press (10kg)', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Pronated IYTW''s', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Pronated Pull Up', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Push Press w/ BB', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'RDL', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Rear Delt Flys', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Reverse Hyper', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Rotator cuff Ext rotation Horizontal', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Rotator cuff Ext rotation Vertical', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Rotator cuff Row, Rotate, Press', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Russian DeadLifts', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Scapular Pull Ups', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Seated DB Bicep Curl', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Shoulder Taps', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Shoulders around wrists from plank', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Side Plank Rotations', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Single arm A frames', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Single Arm DB Push Press', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Single Leg Box Jump (land 2 feet)', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Single Leg Calf Raises', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Single Leg RDL w/ KB', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Spread Aparts w/ band', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Standing Knee Raise w/ band', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Standing Pancakes', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Straddle Leg Passes', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Superman Hold', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Supinated Pull Up', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Surfer''s Lunges', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Weighted Chest to Floor Strict Push Up', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Weighted Push Up', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Weighted Sit Up (10Kg)', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Weighted Sit Up (5Kg)', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Weighted step ups', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'World''s Greatest Stretch', false)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;
  INSERT INTO exercises (user_id, name, is_loggable) VALUES (_uid, 'Zercher Squat', true)
    ON CONFLICT (user_id, name) DO UPDATE SET is_loggable = EXCLUDED.is_loggable;

  -- ── 3. GYM SESSION TEMPLATES ────────────────────────────
  SELECT id INTO _tpl_adp1 FROM gym_session_templates WHERE user_id = _uid AND name = 'ADP – Day 1';
  SELECT id INTO _tpl_adp2 FROM gym_session_templates WHERE user_id = _uid AND name = 'ADP – Day 2';
  INSERT INTO gym_session_templates (user_id, name, focus, phase_type)
    VALUES (_uid, 'ACC – Day 1', 'Maximal Strength', 'accumulation')
    ON CONFLICT (user_id, name) DO UPDATE SET focus = EXCLUDED.focus, phase_type = EXCLUDED.phase_type
    RETURNING id INTO _tpl_acc1;
  IF _tpl_acc1 IS NULL THEN SELECT id INTO _tpl_acc1 FROM gym_session_templates WHERE user_id = _uid AND name = 'ACC – Day 1'; END IF;
  INSERT INTO gym_session_templates (user_id, name, focus, phase_type)
    VALUES (_uid, 'ACC – Day 2', 'Maximal Strength', 'accumulation')
    ON CONFLICT (user_id, name) DO UPDATE SET focus = EXCLUDED.focus, phase_type = EXCLUDED.phase_type
    RETURNING id INTO _tpl_acc2;
  IF _tpl_acc2 IS NULL THEN SELECT id INTO _tpl_acc2 FROM gym_session_templates WHERE user_id = _uid AND name = 'ACC – Day 2'; END IF;
  INSERT INTO gym_session_templates (user_id, name, focus, phase_type)
    VALUES (_uid, 'ACC – Day 3', 'Maximal Strength', 'accumulation')
    ON CONFLICT (user_id, name) DO UPDATE SET focus = EXCLUDED.focus, phase_type = EXCLUDED.phase_type
    RETURNING id INTO _tpl_acc3;
  IF _tpl_acc3 IS NULL THEN SELECT id INTO _tpl_acc3 FROM gym_session_templates WHERE user_id = _uid AND name = 'ACC – Day 3'; END IF;
  INSERT INTO gym_session_templates (user_id, name, focus, phase_type)
    VALUES (_uid, 'TRN – Day 1', 'Strength-Power', 'transmutation')
    ON CONFLICT (user_id, name) DO UPDATE SET focus = EXCLUDED.focus, phase_type = EXCLUDED.phase_type
    RETURNING id INTO _tpl_trn1;
  IF _tpl_trn1 IS NULL THEN SELECT id INTO _tpl_trn1 FROM gym_session_templates WHERE user_id = _uid AND name = 'TRN – Day 1'; END IF;
  INSERT INTO gym_session_templates (user_id, name, focus, phase_type)
    VALUES (_uid, 'TRN – Day 2', 'Strength-Power', 'transmutation')
    ON CONFLICT (user_id, name) DO UPDATE SET focus = EXCLUDED.focus, phase_type = EXCLUDED.phase_type
    RETURNING id INTO _tpl_trn2;
  IF _tpl_trn2 IS NULL THEN SELECT id INTO _tpl_trn2 FROM gym_session_templates WHERE user_id = _uid AND name = 'TRN – Day 2'; END IF;
  INSERT INTO gym_session_templates (user_id, name, focus, phase_type)
    VALUES (_uid, 'TRN – Day 3', 'Strength-Power', 'transmutation')
    ON CONFLICT (user_id, name) DO UPDATE SET focus = EXCLUDED.focus, phase_type = EXCLUDED.phase_type
    RETURNING id INTO _tpl_trn3;
  IF _tpl_trn3 IS NULL THEN SELECT id INTO _tpl_trn3 FROM gym_session_templates WHERE user_id = _uid AND name = 'TRN – Day 3'; END IF;
  INSERT INTO gym_session_templates (user_id, name, focus, phase_type)
    VALUES (_uid, 'RLZ – Day 1', 'Power-Speed', 'realization')
    ON CONFLICT (user_id, name) DO UPDATE SET focus = EXCLUDED.focus, phase_type = EXCLUDED.phase_type
    RETURNING id INTO _tpl_rlz1;
  IF _tpl_rlz1 IS NULL THEN SELECT id INTO _tpl_rlz1 FROM gym_session_templates WHERE user_id = _uid AND name = 'RLZ – Day 1'; END IF;
  INSERT INTO gym_session_templates (user_id, name, focus, phase_type)
    VALUES (_uid, 'RLZ – Day 2', 'Power-Speed', 'realization')
    ON CONFLICT (user_id, name) DO UPDATE SET focus = EXCLUDED.focus, phase_type = EXCLUDED.phase_type
    RETURNING id INTO _tpl_rlz2;
  IF _tpl_rlz2 IS NULL THEN SELECT id INTO _tpl_rlz2 FROM gym_session_templates WHERE user_id = _uid AND name = 'RLZ – Day 2'; END IF;

  -- ── 4. GYM SESSION EXERCISES ─────────────────────────────
  DELETE FROM gym_session_exercises WHERE user_id = _uid AND gym_session_template_id = _tpl_adp1;
  DELETE FROM gym_session_exercises WHERE user_id = _uid AND gym_session_template_id = _tpl_adp2;
  DELETE FROM gym_session_exercises WHERE user_id = _uid AND gym_session_template_id = _tpl_acc1;
  DELETE FROM gym_session_exercises WHERE user_id = _uid AND gym_session_template_id = _tpl_acc2;
  DELETE FROM gym_session_exercises WHERE user_id = _uid AND gym_session_template_id = _tpl_acc3;
  DELETE FROM gym_session_exercises WHERE user_id = _uid AND gym_session_template_id = _tpl_trn1;
  DELETE FROM gym_session_exercises WHERE user_id = _uid AND gym_session_template_id = _tpl_trn2;
  DELETE FROM gym_session_exercises WHERE user_id = _uid AND gym_session_template_id = _tpl_trn3;
  DELETE FROM gym_session_exercises WHERE user_id = _uid AND gym_session_template_id = _tpl_rlz1;
  DELETE FROM gym_session_exercises WHERE user_id = _uid AND gym_session_template_id = _tpl_rlz2;

  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Deep Squat Hold to Thoracic Rotations'), 1, 3, '10 e.s.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Banded Side Steps'), 2, 3, '8out/8back', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Extended Cat-Cow (elbows or hands on bench)'), 3, 3, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Body Weight Squat 3-2-0'), 11, 3, '5', 'none', NULL, NULL, 'Lower Prep · Tempo: 3-2-0');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Back Squat'), 21, NULL, '8', 'rpe', NULL, 'RPE 7-8', 'Lower Circuit x3 · 10 sec btw exercises / 1min btw rounds');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Weighted step ups'), 22, NULL, '16 alternating', 'rpe', NULL, 'RPE 7', 'Lower Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Banded Good Mornings'), 23, NULL, '10', 'none', NULL, NULL, 'Lower Circuit x3 · Light band');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Scapular Pull Ups'), 31, 3, '8', 'none', NULL, NULL, 'Upper Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Pronated Pull Up'), 41, NULL, '6', 'rpe', NULL, 'RPE 7-8', 'Upper Circuit x3 · 10 sec btw exercises / 1min btw rounds');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Eccentric Push Up'), 42, NULL, '6', 'none', NULL, NULL, 'Upper Circuit x3 · Tempo: 5sec descent');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Inverted Row'), 43, NULL, '12', 'rpe', NULL, 'RPE 7', 'Upper Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Hollow Body Hold'), 51, NULL, '30sec', 'none', NULL, NULL, 'Core Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Superman Hold'), 52, NULL, '20', 'none', NULL, NULL, 'Core Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Rotator cuff Row, Rotate, Press'), 61, 3, '6', 'none', NULL, NULL, 'Prehab · Tempo: Slow tempo');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Standing Pancakes'), 1, 3, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Plate Overhead Press (10kg)'), 2, 3, '8 e.s.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Spread Aparts w/ band'), 3, 3, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Banded Deadlift'), 11, 2, '8', 'none', NULL, NULL, 'Lower Prep · w/ stick or empty BB');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Russian DeadLifts'), 21, NULL, '8', 'rpe', NULL, 'RPE 7-8', 'Lower Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'BB Hip Thrust'), 22, NULL, '10', 'rpe', NULL, 'RPE 7', 'Lower Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Calf Raise'), 23, NULL, '15 e.s.', 'none', NULL, NULL, 'Lower Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Half Hindu Push Up'), 31, 3, '6', 'none', NULL, NULL, 'Upper Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Incline Bench Press w/ DB'), 41, NULL, '8', 'rpe', NULL, 'RPE 7-8', 'Upper Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Bent Over Row w/ DB'), 42, NULL, '10 e.s.', 'rpe', NULL, 'RPE 7', 'Upper Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Rear Delt Flys'), 43, NULL, '10', 'none', NULL, NULL, 'Upper Circuit x3 · 2.5Kg');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Weighted Sit Up (5Kg)'), 51, NULL, '12', 'none', NULL, NULL, 'Core Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Superman Hold'), 52, NULL, '40sec', 'none', NULL, NULL, 'Core Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_adp2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Dorsiflexion against wall'), 61, 3, '15', 'none', NULL, NULL, 'Prehab');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Downward dog to Runner Lunges'), 1, NULL, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Deep Squat Hold to Thoracic Rotations'), 2, NULL, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Child Pose and side reaches'), 3, NULL, '10 e.s.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = '5 sec Squat Hold'), 11, 3, '4', 'none', NULL, NULL, 'Main 1 Prep · 20/30/40kg');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Back Squat'), 21, NULL, 'Macro Vol', 'percentage', NULL, 'Macro %', 'Main 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'DB Bulgarian Split Squat'), 31, 3, '10', 'rpe', NULL, 'RPE 8', 'Accessory 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Scapular Pull Ups'), 41, 3, '6', 'none', NULL, NULL, 'Main 2 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Pronated Pull Up'), 51, NULL, 'Macro Vol', 'rpe', NULL, 'RPE 10', 'Main 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Cable Row'), 61, NULL, '12', 'none', NULL, NULL, 'Accessories Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Incline DB Bench'), 62, NULL, '12', 'none', NULL, NULL, 'Accessories Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Alt DB Bicep Curls'), 63, NULL, '20', 'none', NULL, NULL, 'Accessories Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Hanging Leg raises'), 71, NULL, '10', 'none', NULL, NULL, 'Core x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Superman Hold'), 72, NULL, '45sec', 'none', NULL, NULL, 'Core x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Boxers Sit Ups'), 73, NULL, '15', 'none', NULL, NULL, 'Core x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Rotator cuff Ext rotation Horizontal'), 81, 3, '12', 'none', NULL, NULL, 'Prehab');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Standing Pancakes'), 1, NULL, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Surfer''s Lunges'), 2, NULL, '10 e s.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Plate around head (10kg)'), 3, NULL, '10 e.s.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Single Leg RDL w/ KB'), 11, 3, '6 e.s.', 'none', NULL, NULL, 'Main 1 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Deadlift'), 21, NULL, 'Macro Vol', 'percentage', NULL, 'Macro %', 'Main 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Hindu Push Up'), 31, 3, '6', 'none', NULL, NULL, 'Main 2 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'BB Shoulder Press'), 41, 3, '6', 'rpe', NULL, 'RPE 8', 'Main 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Weighted Chest to Floor Strict Push Up'), 51, NULL, '10', 'none', NULL, NULL, 'Accessories Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Lat Pull Down'), 52, NULL, '10', 'none', NULL, NULL, 'Accessories Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Rear Delt Flys'), 53, NULL, '12', 'none', NULL, NULL, 'Accessories Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Hollow Body Hold'), 61, NULL, '60sec', 'none', NULL, NULL, 'Core x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Standing Knee Raise w/ band'), 62, NULL, '20', 'none', NULL, NULL, 'Core x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Back Extension with Rotation'), 63, NULL, '15 e.s.', 'none', NULL, NULL, 'Core x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Rotator cuff Ext rotation Vertical'), 71, 3, '12', 'none', NULL, NULL, 'Prehab');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Banded Spead aparts'), 72, 3, '12', 'none', NULL, NULL, 'Prehab');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Banded Side Steps'), 1, 4, '8 steps e.s.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Single arm A frames'), 2, NULL, '10 e.s.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Rotator cuff Row, Rotate, Press'), 3, NULL, '10 e.s.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = '3 sec eccentric + 2sec hold Front Squat drill'), 11, 3, '4', 'none', NULL, NULL, 'Main 1 Prep · 20/30/40kg');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Front Squat'), 21, 3, '8', 'rpe', NULL, 'RPE 8', 'Main 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Leg Curl'), 31, 3, '10', 'rpe', NULL, 'RPE 8', 'Accessory 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = '5 sec Eccentric Push Up'), 41, 3, '6', 'none', NULL, NULL, 'Main 2 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Bench Press'), 51, NULL, 'Macro Vol', 'percentage', NULL, 'Macro %', 'Main 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Single Arm DB Push Press'), 61, NULL, '8 e.s.', 'none', NULL, NULL, 'Accessories Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'DB Bent over Row'), 62, NULL, '12 e.s.', 'none', NULL, NULL, 'Accessories Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'DB Skull Crusher'), 63, NULL, '15', 'none', NULL, NULL, 'Accessories Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Hollow Body Rocks'), 71, NULL, '25', 'none', NULL, NULL, 'Core x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Reverse Hyper'), 72, NULL, '20', 'none', NULL, NULL, 'Core x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Cable Chops'), 73, NULL, '10 e.s.', 'none', NULL, NULL, 'Core x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_acc3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Butchers Block'), 81, NULL, NULL, 'none', NULL, NULL, 'Prehab');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Deep Squat Hold to Thoracic Rotations'), 1, 3, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Banded Side Steps'), 2, 3, '3x4 steps e.s.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Extended Cat-Camell'), 3, 3, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Max Height box jumps'), 11, 4, '4', 'none', NULL, NULL, 'Plyo');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Clean Pulls from the hang'), 21, 4, '3', 'rpe', NULL, 'RPE 7', 'Oly 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = '1 and a half Back Squat'), 31, 3, '4', 'none', NULL, NULL, 'Main 1 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Back Squat'), 41, NULL, 'Macro Vol', 'percentage', NULL, 'Macro %', 'Main 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Weighted step ups'), 51, 3, '8 e.l.', 'rpe', NULL, 'RPE 7', 'Accessory 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Hanging Active Hold'), 61, 3, '30sec', 'none', NULL, NULL, 'Main 2 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Supinated Pull Up'), 71, NULL, 'Macro Vol', 'rpe', NULL, 'RPE 9', 'Main 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Incline Bench Press w/ DB'), 81, 3, '8', 'rpe', NULL, 'RPE 8', 'Accessory 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Seated DB Bicep Curl'), 91, 3, '10', 'rpe', NULL, 'RPE 8', 'Accessory 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Dragon Flag slow eccentric'), 101, 3, '5', 'none', NULL, NULL, 'Core');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Alternating Supermans'), 102, 3, '40', 'none', NULL, NULL, 'Core');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Side Plank Rotations'), 103, 3, '12 e.s.', 'none', NULL, NULL, 'Core');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Rotator cuff Row, Rotate, Press'), 111, 3, '6', 'none', NULL, NULL, 'Prehab');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Standing Pancakes'), 1, 3, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'OH Press w/ band (5sec up/ 5sec down)'), 2, 3, '5 e.s.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Arm Circles w/ plates'), 3, 3, '10 e.d.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Bungee Push Up'), 11, 4, '6', 'none', NULL, NULL, 'Plyo');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Push Press w/ BB'), 21, 4, '4', 'rpe', NULL, 'RPE 7', 'Oly 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Paused Deadlift'), 31, 3, '5', 'percentage', 50, NULL, 'Main 1 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'RDL'), 41, 3, '8', 'percentage', 60, NULL, 'Main 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Hip Thrust'), 51, 3, '10', 'rpe', NULL, '2rir', 'Accessory 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Half Hindu Push Up'), 61, 3, '6', 'none', NULL, NULL, 'Main 2 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Bench Press'), 71, NULL, 'Macro Vol', 'percentage', NULL, 'Macro %', 'Main 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Inverted Row'), 81, 3, '12', 'rpe', NULL, 'RPE 7', 'Accessory 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Rear Delt Flys'), 91, 3, '10', 'none', NULL, NULL, 'Accessory 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Reverse Hyper'), 101, 3, '20', 'none', NULL, NULL, 'Core');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Hollow Body Kicks'), 102, 3, '40', 'none', NULL, NULL, 'Core');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'World''s Greatest Stretch'), 103, 3, '20', 'none', NULL, NULL, 'Core');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Jefferson Curl'), 111, 6, '30sec hold', 'none', NULL, NULL, 'Prehab');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'World''s Greatest Stretch'), 1, 3, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Plate around head'), 2, 3, '20', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Pronated IYTW''s'), 3, 3, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Med Ball Fwd Throw (8-10Kg)'), 11, 4, '5', 'none', NULL, NULL, 'Plyo 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Single Leg Box Jump (land 2 feet)'), 21, 4, '8', 'none', NULL, NULL, 'Plyo 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Deep Goblet Squat Hold'), 31, 3, '30sec', 'none', NULL, NULL, 'Main 1 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Zercher Squat'), 41, NULL, '5-4-3-3', 'rpe', NULL, 'RPE 8', 'Main 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Cossac Squat'), 51, 4, '10 e.s.', 'rpe', NULL, 'RPE 7', 'Accessory 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Weighted Push Up'), 61, 3, '5', 'rpe', NULL, 'RPE 8', 'Main 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Bench Pull'), 71, 3, '10', 'rpe', NULL, 'RPE 8', 'Accessory 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Bicep curl to Arnold Press'), 81, 3, '10', 'rpe', NULL, 'RPE 8', 'Accessory 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'L Sit Hold'), 91, 3, '(3x max holds)', 'none', NULL, NULL, 'Core');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Straddle Leg Passes'), 92, 3, '20 e.l.', 'none', NULL, NULL, 'Core');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Back Extensions'), 93, 3, '10', 'none', NULL, NULL, 'Core');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Dorsiflexion against wall'), 101, 3, '15', 'none', NULL, NULL, 'Prehab');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_trn3, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Single Leg Calf Raises'), 102, 3, '15', 'none', NULL, NULL, 'Prehab');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Downdward to Upward dog'), 1, 3, '10', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Shoulder Taps'), 2, 3, '16 alt', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Deep Squat Hold + Rocks'), 3, 3, '30sec', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Single Arm DB Push Press'), 11, 3, '5 e.s.', 'rpe', NULL, 'RPE 6', 'Oly 1 · 90sec rest');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Banded Side Steps'), 21, 2, '8 e.d.', 'none', NULL, NULL, 'Main 1 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Half Back Squat (fast concentric)'), 31, NULL, 'Macro Vol', 'percentage', NULL, 'Macro %', 'Main 1 · 2min rest');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'DB Bulgarian Split Squat + Jumps'), 41, 3, '4+4', 'none', NULL, NULL, 'Accessory 1 · 2min rest');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Scapular Pull Ups'), 51, 3, '6', 'none', NULL, NULL, 'Main 2 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Explosive Inverted Rows'), 61, 4, '5', 'none', NULL, NULL, 'Main 2 · 90sec rest · Tempo: Slow Eccentric');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Pronated Pull Up'), 62, 3, '5', 'rpe', NULL, 'RPE 6-7', 'Main 2 · 2min rest');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Cable punch w/ Rotation'), 71, 3, '10 e.s.', 'none', NULL, NULL, 'Accessory 1 · 90sec rest');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Hollow Body Hold'), 81, NULL, '30/40/50sec', 'none', NULL, NULL, 'Core Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Superman Hold'), 82, NULL, '20', 'none', NULL, NULL, 'Core Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz1, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Rotator cuff Row, Rotate, Press'), 91, 3, '6', 'none', NULL, NULL, 'Prehab · Tempo: Slow tempo');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'World''s Greatest Stretch'), 1, 3, '10 alternating', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Banded Good Mornings'), 2, 3, '10 alternating', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Shoulders around wrists from plank'), 3, 3, '10 e.s.', 'none', NULL, NULL, 'Mobility and Strength Prep drills');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'DB Hang Snatch'), 11, 3, '5 e.s.', 'rpe', NULL, 'RPE 6', 'Oly 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'KB Single leg RDL'), 21, 3, '8 e.s.', 'none', NULL, NULL, 'Main 1 Prep');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Deadlift'), 31, NULL, 'Macro Vol', 'percentage', NULL, 'Macro %', 'Main 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Bungee Push Up'), 41, 3, '5', 'none', NULL, NULL, 'Main 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Bench Press (fast concentric)'), 42, NULL, 'Macro Vol', 'percentage', NULL, 'Macro %', 'Main 2');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Rear Delt Flys'), 51, 3, '10', 'none', NULL, NULL, 'Accessory 1');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Weighted Sit Up (10Kg)'), 61, NULL, '12', 'none', NULL, NULL, 'Core Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Superman Hold'), 62, NULL, '40/50/60sec', 'none', NULL, NULL, 'Core Circuit x3');
  INSERT INTO gym_session_exercises (user_id, gym_session_template_id, exercise_id, order_index, sets, reps, intensity_type, intensity_value, rpe, notes)
    VALUES (_uid, _tpl_rlz2, (SELECT id FROM exercises WHERE user_id = _uid AND name = 'Dorsiflexion against wall'), 71, 3, '15', 'none', NULL, NULL, 'Prehab');

  -- ── 5. SWIM SESSION TEMPLATES ───────────────────────────
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Endurance Swim 1', 'endurance', 2400, 'Warm up | 4x 100 Alternating: | 50 Flutter / 50 Bounce (up & down) | 20-30 sec rest | Easy Pace
50 Dolphin / 50 Quarters (uw/sf by 12.5''s)
Main 1 | 4x 150 | 50 Fs / 50 Bounce / 50 Quarters | find a :15 rest cycle | At @75%
100 easy
Main 2 | x4 Rounds back to back:
3x 50 | x3 Fs / x3 Quarters / x3 Dolphin on back | on 1:00 cycle | x1 easy/x1 medium/x1 hard
finish 50 easy
Main 3 | 12x 25 | Underwater | on 35sec cycle | medium pace
Cool Down | 200.0 | Choice | 2.4K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Endurance Swim 2', 'endurance', 2400, 'Warm up | 4x 100 Alternating: | 50 Flutter / 50 Bounce (up & down) | 20-30 sec rest | Easy Pace
50 Dolphin / 50 Quarters (uw/sf by 12.5''s)
Main 1 | 8x 100 Alternating: | x1 50 Dolphin / 50 Fs | find a :10 rest cycle | At @75%
x1 50 Bounce / 50 Quarters
100 easy
Main 2 | 10x 50 Alternating | 50 Fs | on 1:10 cycle | at 80%
25 Quarters / 25 Flutter | Quarters at 95% / Flutter easy
100 easy
Main 3 | 12x 25 | Underwater | x6 on 35sec / x6 on 30sec | medium pace
Cool Down | 200.0 | Choice | 2.4K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Endurance Swim 3', 'endurance', 2500, 'Warm up | 4x 100 Alternating: | 50 Flutter / 50 Bounce (up & down) | 20-30 sec rest | Easy Pace
50 Dolphin / 50 Quarters (uw/sf by 12.5''s)
Main 1 | 10x 100 Alternating: | x2 100 Dolphin ok back | on 1:40/1:45 cycle | x1 at 70% / x1 at 90%
x2 100 Fs
100 easy
Main 2 | 10x 50 | 35 Fs / 15 Uw | on 1:00 cycle | Fs at 70% / Uw at 95%
100 easy
Main 3 | 12x 25 | Underwater | x4 on 35sec/ x8 on 30sec | medium pace
Cool Down | 200.0 | Choice | 2.5K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Endurance Swim 4', 'endurance', 2600, 'Warm up | 4x 100 Alternating: | 50 Flutter / 50 Bounce (up & down) | 20-30 sec rest | Easy Pace
50 Dolphin / 50 Quarters (uw/sf by 12.5''s)
Main 1 | 6x 150 | 25uw-25Fs / 50 Dolphin / 50 Bounce | find a :20 rest cycle | at 80%
100 easy
Main 2 | 8x 75 | Quarters | on 1:20 cycle | 50 at 70% / 25 at 95%
100 easy
Main 3 | 12x 25 | Underwater | on 30 sec cycle | medium pace
Cool Down | 200.0 | Choice | 2.6K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Endurance Swim 5', 'endurance', 2800, 'Warm up | 4x 100 Alternating: | 50 Flutter / 50 Bounce (up & down) | 20-30 sec rest | Easy Pace
50 Dolphin / 50 Quarters (uw/sf by 12.5''s)
Main 1 | 10x 100 | 87.5 Fs / 12.5 Uw | find :10 rest cycle | at 80%
100 easy
Main 2 | 12x 50 Alternating: | x1 Bounce / x1 Dolphin on back | 1:00 cycle | Bounce at 95% / Kick at 70%
100 easy
Main 3 | 16x 25 | Underwater | on 35 sec cycle | medium pace
Cool Down | 200.0 | Choice | 2.8K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Endurance Swim 6', 'endurance', 2900, 'Warm up | 4x 100 Alternating: | 50 Flutter / 50 Bounce (up & down) | 20-30 sec rest | Easy Pace
50 Dolphin / 50 Quarters (uw/sf by 12.5''s)
Main 1 | 12x 100 | 37.5 Fs / 12.5 Uw | on 1:45/1:50 | x1 at 70% / x1 80% / x1 90%
100 easy
Main 2 | 12x 50 | 15 uw / 35 Fs | on 1:00 | Uw at 95% / Fs at 80%
100 easy
Main 3 | 12x 25 | Underwater | on 35 sec cycle | at 90%
Cool Down | 200.0 | Choice | 2.9K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Endurance Swim 7', 'endurance', 2800, 'Warm up | 4x 100 Alternating: | 50 Flutter / 50 Bounce (up & down) | 20-30 sec rest | Easy Pace
50 Dolphin / 50 Quarters (uw/sf by 12.5''s)
Main 1 | 10x 100 Alternating: | x1 Dolphin (alt front/back) | on 1:45 | Dolphin at 70%
x1 Bounce | Bounce at 90%
100 easy
Main 2 | 8x 75 | 25 uw / 25 Fs / 25 Quarters | find a :15 rest cycle | at 80%
100 easy
Main 3 | 16x 25 | Underwater | x8 on 35 / x8 on 30 | medium pace
Cool Down | 200.0 | Choice | 2.8K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Endurance Swim 8', 'endurance', 2800, 'Warm up | 4x 100 Alternating: | 50 Flutter / 50 Bounce (up & down) | 20-30 sec rest | Easy Pace
50 Dolphin / 50 Quarters (uw/sf by 12.5''s)
Main 1 | 5x 200 | as 37.5 Fs / 12.5 Uw | find :25 rest cycle | Fs at 70% / Uw at 90%
100 easy
Main 2 | 12x 50 | 12.5 uw Dolphin / 25 Fs / 12.5 uw Dolphin | on 1:10 | Uw at 95% / Fs at 80%
100 easy
Main 3 | 16x 25 | Underwater | x6 on 35 / x10 on 30 | Medium pace
Cool Down | 200.0 | Choice | 2.8K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Endurance Swim 9', 'endurance', 3000, 'Warm up | 4x 100 Alternating: | 50 Flutter / 50 Bounce (up & down) | 20-30 sec rest | Easy Pace
50 Dolphin / 50 Quarters (uw/sf by 12.5''s)
Main 1 | 100 / 200 / 300 | as 50 Bounce / 50 Quarters | 10 / 20 / 30 sec rest | at 90/80/70%
300 / 200 / 100 | 40 / 30 / 20 sec rest | at 70/80/90%
100 easy
Main 2 | 8x 75 | 12.5 uw / 35 Fs / 25 Quarters | find :20 rest cycle | 50 at 80% / 25 at 90%
100 easy
Main 3 | 16x 25 | Underwater | on 30 sec cycle | Medium pace
Cool Down | 200.0 | Choice | 3K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Anaerobic Swim 1', 'anaerobic', 2100, 'Target (from 25uw/25fs test)
Warm up | 4x 100 Alternating: | Kick / Bounce (up & down)/ Fs / Quarters (uw/fs by 12.5) by 25 | 20-30 sec rest | Easy Pace
Uw / Fs / Quarters / Kick by 25
4x 25 | Underwater slow on 30/40/50/60sec | rest at will | don''t push limits alone
Main 1 | 4x Rounds back to back:
100.0 | 50 Fs / 50 Bounce | on 1:30/1:40 | At @75%
50.0 | Quarters | on 1:30 | Max | PB +3
100 easy
Main 2 | 10x 50 Alternating: | x1 Fs | on 1:10 | At 70%
x1 15 Uw / 35 Dolphin | At 95%
Main 3 | 8x 25 | 12.5 Uw / 12.5 Fs | on 1:00 | Max | PB /2
Cool Down | 200.0 | Alt backstroke / easy flutter | 2.1K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Anaerobic Swim 2', 'anaerobic', 2250, 'Target (from 25uw/25fs test)
Warm up | 4x 100 Alternating: | Kick / Bounce (up & down)/ Fs / Quarters (uw/fs by 12.5) by 25 | 20-30 sec rest | Easy Pace
Uw / Fs / Quarters / Kick by 25
4x 25 | Underwater slow on 30/40/50/60sec | rest at will | don''t push limits alone
Main 1 | 9x 100 | as x1 Dolphin (front or back) / x1 Fs / x1 Quarters | on 2:00 cycle | Dolphin & Fs at 80%
Quarters at 95% | PB +6 x2 or better
100 easy
Main 2 | 8x 50 | as :10 uw static / 12.5uw-12.5Fs max / :5uw static / 25 Fs easy | on 1:20
Main 3 | 6x 25 | Underwater | on 1:10 | Max | PB /2 or better
Cool Down | 200.0 | Alt backstroke / easy flutter | 2.25K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Anaerobic Swim 3', 'anaerobic', 2200, 'Target (from 25uw/25fs test)
Warm up | 4x 100 Alternating: | Kick / Bounce (up & down)/ Fs / Quarters (uw/fs by 12.5) by 25 | 20-30 sec rest | Easy Pace
Uw / Fs / Quarters / Kick by 25
4x 25 | Underwater slow on 30/40/50/60sec | rest at will | don''t push limits alone
Main 1 | 16x50 Alternating: | x3 Quarters | on 1:10 cycle | Quarters at 80%
x1 25uw/25Fs | 25uw/25Fs max | PB +2
100 easy
Main 2 | 8x 50 | 35 uw / 15 Fs easy | on 1:20 | alt: x1 at 70% / x1 at 80%
Main 3 | 8x 25 as | 12.5 Fs / :10 uw static / 12.5 uw | rest at will | Max
Cool Down | 200.0 | Alt backstroke / easy flutter | 2.2K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Anaerobic Swim 4', 'anaerobic', 2100, 'Target (from 25uw/25fs test)
Warm up | 4x 100 Alternating: | Kick / Bounce (up & down)/ Fs / Quarters (uw/fs by 12.5) by 25 | 20-30 sec rest | Easy Pace
Uw / Fs / Quarters / Kick by 25
4x 25 | Underwater slow on 30/40/50/60sec | rest at will | don''t push limits alone
Main 1 | 8x 75 as | 25 uw / 25 Fs / :10 uw static / 12.5 uw max - 12.5 Fs | find :30 rest cycle | at 80%
100 easy
Main 2 | 10x 50 Alternating: | x1 Fs | on 1:30 | at 80% | PB + 6
x1 12.5 uw / 25 Fs / 12.5 uw | Max | PB + 1
Main 3 | 8x 25 as | :10 uw static / 12.5 uw + :5 uw static / 3 Breaths / 12.5 uw + :5 uw static | on :50 cycle | at 80%
Cool Down | 200.0 | Alt backstroke / easy flutter | 2.1K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Anaerobic Swim 5', 'anaerobic', 2400, 'Target (from 25uw/25fs test)
Warm up | 4x 100 Alternating: | Kick / Bounce (up & down)/ Fs / Quarters (uw/fs by 12.5) by 25 | 20-30 sec rest | Easy Pace
Uw / Fs / Quarters / Kick by 25
4x 25 | Underwater slow on 30/40/50/60sec | rest at will | don''t push limits alone
Main 1 | 8x 100 as | 50 Dolphin max / 25 Fs easy / 25 uw at 90% | find :30 rest cycle
100 easy
Main 2 | 24x 25 Alternating: | x1 uw at 70% / x1 at 80% / x1 at 90% / x1 Fs easy | on :50
Main 3 | 3 Rounds: 6x 12.5 | 6m Fs out / :5 uw static / 6m uw back / :5 uw static | relay in pairs or | Max
1:1 work/rest ratio | 1:00 rest between rounds
Cool Down | 200.0 | Alt backstroke / easy flutter | 2.4K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Anaerobic Swim 6', 'anaerobic', 2000, 'Target (from 25uw/25fs test)
Warm up | 4x 100 Alternating: | Kick / Bounce (up & down)/ Fs / Quarters (uw/fs by 12.5) by 25 | 20-30 sec rest | Easy Pace
Uw / Fs / Quarters / Kick by 25
4x 25 | Underwater slow on 30/40/50/60sec | rest at will | don''t push limits alone
Main 1 | 8x 50 | 37.5 uw max / 12.5 Fs easy | on 1:30
100 easy
Main 2 | 20x 25 Alternating: | x1 Fs / x1 uw | on :40 | at 95% | PB /2
x1 Dolphin / x1 uw-Fs by 12.5
Main 3 | 4 Rounds: 6x 12.5 | 6m uw out / :5 uw static / 6m uw back / :5 uw static | relay in 3''s or | Max
1:2 work/rest ratio
Cool Down | 200.0 | Alt backstroke / easy flutter | 2.0K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Anaerobic Swim 7', 'anaerobic', 2100, 'Target (from 25uw/25fs test)
Warm up | 4x 100 Alternating: | Kick / Bounce (up & down)/ Fs / Quarters (uw/fs by 12.5) by 25 | 20-30 sec rest | Easy Pace
Uw / Fs / Quarters / Kick by 25
4x 25 | Underwater slow on 30/40/50/60sec | rest at will | don''t push limits alone
Main 1 | 4x Rounds back to back:
100.0 | 50 Fs / 50 Bounce | on 1:30/1:40 | At @75%
50.0 | 25 uw / 25 Fs | on 1:30 | Max | PB +2
100 easy
Main 2 | 10x 50 Alternating: | x1 Fs | on 1:10 | At 70%
x1 15 uw / 20 Fs / 15 uw | At 95%
Main 3 | 8x 25 | 12.5 Uw / 12.5 Fs | on 1:00 | Max | PB /2
Cool Down | 200.0 | Alt backstroke / easy flutter | 2.1K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Anaerobic Swim 8', 'anaerobic', 2350, 'Target (from 25uw/25fs test)
Warm up | 4x 100 Alternating: | Kick / Bounce (up & down)/ Fs / Quarters (uw/fs by 12.5) by 25 | 20-30 sec rest | Easy Pace
Uw / Fs / Quarters / Kick by 25
4x 25 | Underwater slow on 30/40/50/60sec | rest at will | don''t push limits alone
Main 1 | 10x 100 Alternating: | x1 50 Dolphin / 50 Fs | on 1:10 cycle | at 70%
x1 50 Bounce / 50 Quarters | at 95% | PB +6 x2 or better
100 easy
Main 2 | 8x 50 as | 12.5 uw at 70% / :5 uw static / 25 Fs / 12.5 uw / :5 uw static | 1:10 cycle | Fs to 12.5 uw at 95%
Main 3 | 6x 25 as | 25 uw + :10 uw static | rest at will | Max
Cool Down | 200.0 | Alt backstroke / easy flutter | 2.35K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Anaerobic Swim 9', 'anaerobic', 2300, 'Target (from 25uw/25fs test)
Warm up | 4x 100 Alternating: | Kick / Bounce (up & down)/ Fs / Quarters (uw/fs by 12.5) by 25 | 20-30 sec rest | Easy Pace
Uw / Fs / Quarters / Kick by 25
4x 25 | Underwater slow on 30/40/50/60sec | rest at will | don''t push limits alone
Main 1 | 9x 100 Quarters as | x1 at 70% / x1 at 85% / x1 at 95% | on 2:00 cycle
100 easy
Main 2 | 8x 50 as | 12.5 uw at 70% / :5 uw static / 12.5 uw max / :5 uw static / 25 Fs easy | 1:10 cycle
Main 3 | 8x 25 as | x1 uw max / x1 uw easy | on :50 cycle
Cool Down | 200.0 | Alt backstroke / easy flutter | 2.3K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Anaerobic Swim 10', 'anaerobic', 2000, 'Target (from 25uw/25fs test)
Warm up | 4x 100 Alternating: | Kick / Bounce (up & down)/ Fs / Quarters (uw/fs by 12.5) by 25 | 20-30 sec rest | Easy Pace
Uw / Fs / Quarters / Kick by 25
4x 25 | Underwater slow on 30/40/50/60sec | rest at will | don''t push limits alone
Main 1 | 8x 75 as | 25 Dolphin / 25 Fs | on :45 | at 80%
12.5 uw / 1 breath / 12.5 uw | on :45 | Max | PB /2
100 easy
Main 2 | 16x 25 as | x1 uw / x1 Quarters / x1 uw / x1 Dolhphin | on :45 cycle | at 90%
Main 3 | 8x 25 | :10 static + 25 uw | rest at will | Max
Cool Down | 200.0 | Alt backstroke / easy flutter | 2.0K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Anaerobic Swim 11', 'anaerobic', 2000, 'Target (from 25uw/25fs test)
Warm up | 4x 100 Alternating: | Kick / Bounce (up & down)/ Fs / Quarters (uw/fs by 12.5) by 25 | 20-30 sec rest | Easy Pace
Uw / Fs / Quarters / Kick by 25
4x 25 | Underwater slow on 30/40/50/60sec | rest at will | don''t push limits alone
Main 1 | 10x 50 Alternating: | 37.5 uw max / 12.5 Fs easy | on 1:30 | Max | PB +1
37.5 Fs max / 12.5 uw easy | Max | PB +2
100 easy
Main 2 | 2x 200 as | 100 Fs / 100 uw-Fs by 25 | rest at will | Max efforts
Main 3 | 4 Rounds: 6x 12.5 | 6m uw out / :5 uw static / 6m uw back / :5 uw static | relay in 3''s or | Max
1:2 work/rest ratio
Cool Down | 200.0 | Alt backstroke / easy flutter | 2.0K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Alactic Swim 1', 'alactic', 2200, 'No fins | 3x 100 | Fs / Kick by 25 | 20-30 sec rest | Easy Pace
Main 1 | 10 x 25 Alternating: | x1 Dolphin | on :50 cycle | Build*
x1 Kick | *(start at 60% and build to 100%, hold last 8m at max effort)
50 Fs easy
Fins | 3x 100 | Quarters (uw/fs by 12.5) | 20-30 sec rest | Easy Pace
Main 2 | x2 Rounds: | Rest 1-2min between rounds
16x 12.5 as: | 6m out / turn 180Â° / 6m in. Dead start (no wall push) All dolphin uw | 3 ppl relay or 1:3 work/rest ratio | Max efforts
rest extra :30 every 4
8x 25 as: | 12.5 Fs / :10 uw static / 12.5 uw Dolphin | on 1:00 cycle | Max efforts
50 easy
Cool Down | 400.0 | Alt backstroke / easy flutter | 2.2K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Alactic Swim 2', 'alactic', 2000, 'Warm up | 4x 100 | 50 Kick - 50 Quarters (uw/fs by 12.5) | 20-30 sec rest | Easy Pace
Main 2 | x2 Rounds: | Rest 1-2min between rounds
8x 50 as: | :5 uw static / 12.5 dead start uw dolphin max / 37.5 easy fs | on 1:10 cycle
8x 25 as: | 12.5 Fs out / uw turn 180Â° / 12.5 uw Dolphin in | on 1:00 cycle | Max efforts
Cool Down | 400.0 | Alt backstroke / easy flutter | 2.0K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Alactic Swim 3', 'alactic', 2000, 'No fins | 3x 100 | Fs / Kick by 25 | 20-30 sec rest | Easy Pace
Main 1 | 10 x 25 Alternating: | x1 Dolphin uw | on :45 cycle | 15m Explosions*
x1 Freestyle | *(15 max - 10 easy fs)
50 Fs easy
Fins | 3x 100 | Quarters (uw/fs by 12.5) | 20-30 sec rest | Easy Pace
Main 2 | x2 Rounds: | Rest 1-2min between rounds
8x 18 as: | 6m out / turn 180Â° / 6m in / turn 180Â° / 6m out | 3 ppl relay or 1:3 work/rest ratio | Max efforts
rest extra :30 every 4 | All dolphin uw
6x 50 as: | 35 uw dolphin build* / 15 easy fs | 1:00 rest | Max efforts
*(start at 60% and build to 100%, hold last 12m at max effort)
50 easy
Cool Down | 400.0 | Alt backstroke / easy flutter | 2.0K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Alactic Swim 4', 'alactic', 2000, 'Warm up | 4x 100 | 50 Kick - 50 Quarters (uw/fs by 12.5) | 20-30 sec rest | Easy Pace
Main 2 | x2 Rounds: | Rest 1-2min between rounds
8x 25 as: | :5 uw static / 12.5 uw dolphin max / :10 uw static / 12.5 easy fs | on 1:00 cycle
8x 50 alt: | 50 by 12.5 Fs / 12.5 uw dolphin | on 1:10 cycle | 25 Max / 25 easy
50 Freestyle
Cool Down | 400.0 | Alt backstroke / easy flutter | 2.0K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Alactic Swim 5', 'alactic', 2000, 'No fins | 3x 100 | Fs / Kick by 25 | 20-30 sec rest | Easy Pace
Main 1 | 10 x 25 Alternating: | x1 Dolphin | on :50 cycle | Build*
x1 Freestyle | *(start at 60% and build to 100%, hold last 8m at max effort)
50 Fs easy
Fins | 3x 100 | Quarters (uw/fs by 12.5) | 20-30 sec rest | Easy Pace
Main 2 | x2 Rounds: | Rest 1-2min between rounds
8x 18 as: | 6m out fs / uw turn 180Â° / 6m in uw / turn 180Â° / 6m out uw | 3 ppl relay or 1:3 work/rest ratio | Max efforts
rest extra :30 every 4
6x 50 as: | 12.5 max / 12.5 slow / 12.5 max / 12.5 fs easy | rest at will | 37.5 uw dolphin / 12.5 fs
50 easy
Cool Down | 400.0 | Alt backstroke / easy flutter | 2.0K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;
  INSERT INTO swim_session_templates (user_id, name, swim_type, distance_meters, notes)
    VALUES (_uid, 'Alactic Swim 6', 'alactic', 2000, 'Warm up | 4x 100 | 50 Kick - 50 Quarters (uw/fs by 12.5) | 20-30 sec rest | Easy Pace
Main 2 | x2 Rounds: | Rest 1-2min between rounds
8x 50 as: | :5 uw static / 12.5 dead start uw dolphin max / 37.5 easy fs | on 1:10 cycle
8x 25 as: | 12.5 Fs out / uw turn 180Â° / 12.5 uw Dolphin in | on 1:00 cycle | Max efforts
Cool Down | 400.0 | Alt backstroke / easy flutter | 2.0K Total')
    ON CONFLICT (user_id, name) DO UPDATE SET swim_type = EXCLUDED.swim_type, distance_meters = EXCLUDED.distance_meters, notes = EXCLUDED.notes;

  -- ── 6. TESTING BLOCKS ───────────────────────────────────
  INSERT INTO testing_blocks (user_id, macrocycle_id, week_number, scheduled_date, status, purpose)
    VALUES (_uid, _mac_id, 0, NULL, 'completed', 'Pre-macrocycle baseline (historical)')
    ON CONFLICT (user_id, macrocycle_id, week_number) DO UPDATE SET purpose = EXCLUDED.purpose
    RETURNING id INTO _blk_w0;
  IF _blk_w0 IS NULL THEN SELECT id INTO _blk_w0 FROM testing_blocks WHERE user_id = _uid AND macrocycle_id = _mac_id AND week_number = 0; END IF;
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

  -- ── 7. TESTING SESSIONS ─────────────────────────────────
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w0, NULL, 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w2, '2026-07-29', 'strength', 'Strength Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w2, '2026-08-01', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w7, '2026-09-05', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w12, '2026-10-07', 'strength', 'Strength Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w12, '2026-10-10', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w15, '2026-10-28', 'strength', 'Strength Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w15, '2026-10-31', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w16, '2026-11-07', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;
  INSERT INTO testing_sessions (user_id, testing_block_id, date, session_type, session_label, status)
    VALUES (_uid, _blk_w18, '2026-11-21', 'in_water', 'In-Water Tests', 'planned')
    ON CONFLICT (testing_block_id, session_label) DO NOTHING;

END $$;

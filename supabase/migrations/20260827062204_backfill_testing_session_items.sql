-- ============================================================
-- BACKFILL testing_session_items from the hardcoded config
--
-- features/tests/sessions-config.ts held one athlete's week 2 as a
-- TypeScript literal, and the tests pages resolved its template NAMES
-- against test_templates with `.in('name', ...)`. Moving that list into
-- the database is what lets the pages read a plan the athlete built
-- instead of a literal only a developer can change.
--
-- Matching on name is also why one test went missing: the config said
-- 'Pull Up 1RM' and the template is called 'Supinated Pull Up 1RM', so
-- the pull up silently vanished from Strength Session 2 and could not be
-- logged there. A name that matches nothing produces no row and no
-- error. That is the whole argument for foreign keys, so the pull up is
-- resolved here by pattern within the right session rather than by an
-- exact string.
--
-- Only week 2's four sessions are backfilled, because they are the only
-- ones the config described. The other nine testing sessions have no
-- recorded prescription anywhere — not in the config, not in results —
-- and are left empty, exactly as they render today. Inventing a list for
-- them would be worse than the gap.
-- ============================================================

with wanted (session_label, template_name, order_index) as (
  values
    ('Strength Session 1', 'Back Squat 3RM',   0),
    ('Strength Session 1', 'Bench Press 3RM',  1),
    ('Strength Session 2', 'Deadlift 3RM',     0),
    ('In-Water Session 1', '400m Swim',        0),
    ('In-Water Session 1', 'Beep Test',        1),
    ('In-Water Session 2', '8x25 UW',          0),
    ('In-Water Session 2', '25UW / 25FS',      1)
)
insert into testing_session_items (user_id, testing_session_id, test_template_id, order_index)
select s.user_id, s.id, t.id, w.order_index
from testing_sessions s
join testing_blocks b on b.id = s.testing_block_id and b.week_number = 2
join wanted w         on w.session_label = s.session_label
join test_templates t on t.name = w.template_name and t.user_id = s.user_id
on conflict (testing_session_id, test_template_id) do nothing;

-- The pull up, matched by pattern because the config's name was wrong.
-- Scoped to the one session that asked for it, and to the athlete's own
-- strength templates; if no such template exists, nothing is inserted.
insert into testing_session_items (user_id, testing_session_id, test_template_id, order_index)
select s.user_id, s.id, t.id, 1
from testing_sessions s
join testing_blocks b on b.id = s.testing_block_id and b.week_number = 2
join test_templates t on t.user_id = s.user_id
                     and t.category = 'strength'
                     and t.name ilike '%pull up%'
where s.session_label = 'Strength Session 2'
on conflict (testing_session_id, test_template_id) do nothing;

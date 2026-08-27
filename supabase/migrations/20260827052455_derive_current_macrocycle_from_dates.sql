-- ============================================================
-- CURRENT — The current macrocycle is the one you are in
-- ============================================================
-- `is_active` was a flag set by hand: creating a plan raised it on the
-- new cycle and lowered it on the old one. That let the flag contradict
-- the calendar. Building next season in advance — a plan starting in
-- 2027 — took over the dashboard immediately and hid the season the
-- athlete was actually training, mid-cycle.
--
-- A macrocycle is current because today falls inside it, not because
-- someone flipped a switch. Derived from start_date/end_date there is
-- no second source of truth to drift:
--
--   current   start_date <= today <= end_date
--   upcoming  start_date > today
--   past      end_date < today
--
-- Dropping the column rather than leaving it unread: a column nothing
-- reads is a trap for whoever reads this schema next.
-- ============================================================

drop index if exists macrocycles_one_active_per_user;
drop index if exists idx_macrocycles_user_active;

alter table macrocycles
  drop column if exists is_active;

-- Every read now filters on (user_id, start_date) to place today.
create index if not exists idx_macrocycles_user_start_date
  on macrocycles(user_id, start_date);

comment on table macrocycles is
  'Preparation cycles. The current one is whichever contains today; there is no active flag.';

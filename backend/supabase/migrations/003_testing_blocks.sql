-- ============================================================
-- TESTING BLOCKS
-- Formal evaluation checkpoints within a macrocycle.
-- Each block belongs to a specific week and contains results
-- from test_templates. Status moves from 'pending' → 'completed'
-- when every template has a recorded result.
-- ============================================================

create table testing_blocks (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references profiles(id)    on delete cascade,
  macrocycle_id  uuid        not null references macrocycles(id) on delete cascade,
  week_number    integer     not null,
  scheduled_date date,
  status         text        not null default 'pending',
  purpose        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint testing_blocks_unique_per_week unique (user_id, macrocycle_id, week_number)
);

create index idx_testing_blocks_user_id      on testing_blocks(user_id);
create index idx_testing_blocks_macrocycle_id on testing_blocks(macrocycle_id);

create trigger trg_testing_blocks_updated_at
  before update on testing_blocks
  for each row execute function set_updated_at();

alter table testing_blocks enable row level security;

create policy "testing_blocks: owner all"
  on testing_blocks for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- LINK test_results → testing_blocks
-- ============================================================

alter table test_results
  add column if not exists testing_block_id uuid references testing_blocks(id) on delete set null;

create index if not exists idx_test_results_testing_block_id
  on test_results(testing_block_id);

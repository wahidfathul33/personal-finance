-- ============================================================
-- Personal Finance App - Supabase Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  person_id text not null check (person_id in ('mas', 'fita')),
  type text not null check (type in ('income', 'expense', 'transfer')),
  category_id text,
  amount numeric not null,
  note text,
  group_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_date on transactions(date desc);
create index if not exists idx_transactions_person on transactions(person_id);
create index if not exists idx_transactions_group on transactions(group_id);
create index if not exists idx_transactions_type on transactions(type);

-- ============================================================
-- RECURRING TEMPLATES
-- ============================================================
create table if not exists recurring_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  category_id text,
  person_id text check (person_id in ('mas', 'fita')),
  amount numeric not null,
  day_of_month int not null check (day_of_month between 1 and 31),
  split_type text not null default 'full' check (split_type in ('equal', 'custom', 'full_mas', 'full_fita', 'none')),
  split_ratio_mas numeric not null default 50,
  split_ratio_fita numeric not null default 50,
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- BALANCES (starting balance per person per month)
-- ============================================================
create table if not exists balances (
  id uuid primary key default gen_random_uuid(),
  person_id text not null check (person_id in ('mas', 'fita')),
  month int not null check (month between 1 and 12),
  year int not null,
  amount numeric not null default 0,
  unique (person_id, month, year)
);

-- ============================================================
-- SAVINGS
-- ============================================================
create table if not exists savings (
  id uuid primary key default gen_random_uuid(),
  person_id text not null check (person_id in ('mas', 'fita')),
  amount numeric not null,
  date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_savings_person on savings(person_id);
create index if not exists idx_savings_date on savings(date desc);

-- ============================================================
-- ASSETS
-- ============================================================
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'gold' check (type in ('gold', 'other')),
  amount numeric not null,
  unit text not null default 'gram',
  created_at timestamptz not null default now()
);

-- ============================================================
-- GOLD PRICES
-- ============================================================
create table if not exists gold_prices (
  id uuid primary key default gen_random_uuid(),
  price_per_gram numeric not null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists idx_gold_prices_date on gold_prices(date desc);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed starting balance for March 2026 (adjust amounts as needed)
insert into balances (person_id, month, year, amount) values
  ('mas', 3, 2026, 0),
  ('fita', 3, 2026, 0)
on conflict (person_id, month, year) do nothing;

-- Seed initial gold price (update to current price)
insert into gold_prices (price_per_gram, date) values
  (1650000, current_date)
on conflict do nothing;

-- ============================================================
-- ROW LEVEL SECURITY (optional - disable for open access)
-- ============================================================
-- Since there is no auth, we allow all operations
alter table transactions enable row level security;
alter table recurring_templates enable row level security;
alter table balances enable row level security;
alter table savings enable row level security;
alter table assets enable row level security;
alter table gold_prices enable row level security;

-- Allow all operations from anon key (no auth required)
create policy "Allow all transactions" on transactions for all using (true) with check (true);
create policy "Allow all recurring_templates" on recurring_templates for all using (true) with check (true);
create policy "Allow all balances" on balances for all using (true) with check (true);
create policy "Allow all savings" on savings for all using (true) with check (true);
create policy "Allow all assets" on assets for all using (true) with check (true);
create policy "Allow all gold_prices" on gold_prices for all using (true) with check (true);

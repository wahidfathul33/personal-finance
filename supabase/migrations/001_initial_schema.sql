-- ============================================================
-- Personal Finance App - Supabase Migration v2
-- Run this in your Supabase SQL Editor (fresh / reset)
-- ============================================================
-- DROP EVERYTHING first so this is idempotent on a fresh DB
drop table if exists savings             cascade;
drop table if exists transactions        cascade;
drop table if exists recurring_templates cascade;
drop table if exists balances            cascade;
drop table if exists persons             cascade;
drop table if exists assets              cascade;
drop table if exists gold_prices         cascade;

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- PERSONS
-- ============================================================
create table if not exists persons (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  color      text not null default 'indigo',
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table if not exists transactions (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  person_id   uuid not null references persons(id) on delete cascade,
  type        text not null check (type in ('income', 'expense', 'transfer', 'split_bill')),
  category_id text,
  amount      numeric not null,
  note        text,
  group_id    uuid,
  created_at  timestamptz not null default now()
);

create index if not exists idx_transactions_date on transactions(date desc);
create index if not exists idx_transactions_person on transactions(person_id);
create index if not exists idx_transactions_group on transactions(group_id);
create index if not exists idx_transactions_type on transactions(type);

-- ============================================================
-- RECURRING TEMPLATES
-- ============================================================
create table if not exists recurring_templates (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null check (type in ('income', 'expense', 'transfer')),
  category_id   text,
  person_id     uuid references persons(id) on delete set null,
  amount        numeric not null,
  day_of_month  int not null check (day_of_month between 1 and 31),
  note          text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- BALANCES (starting balance per person per month)
-- ============================================================
create table if not exists balances (
  id        uuid primary key default gen_random_uuid(),
  person_id uuid not null references persons(id) on delete cascade,
  month     int not null check (month between 1 and 12),
  year      int not null,
  amount    numeric not null default 0,
  unique (person_id, month, year)
);

-- ============================================================
-- SAVINGS
-- ============================================================
create table if not exists savings (
  id         uuid primary key default gen_random_uuid(),
  person_id  uuid not null references persons(id) on delete cascade,
  amount     numeric not null,
  date       date not null default current_date,
  note       text,
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

-- Seed persons
insert into persons (name, color, sort_order) values
  ('Mas',  'indigo', 0),
  ('Fita', 'pink',   1);

-- Seed starting balance for March 2026
insert into balances (person_id, month, year, amount)
select id, 3, 2026, 0 from persons
on conflict (person_id, month, year) do nothing;

-- Seed initial gold price
insert into gold_prices (price_per_gram, date) values
  (1650000, current_date)
on conflict do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table persons              enable row level security;
alter table transactions         enable row level security;
alter table recurring_templates  enable row level security;
alter table balances             enable row level security;
alter table savings              enable row level security;
alter table assets               enable row level security;
alter table gold_prices          enable row level security;

-- Allow all operations from anon key (no auth required)
create policy "Allow all persons"             on persons             for all using (true) with check (true);
create policy "Allow all transactions"        on transactions        for all using (true) with check (true);
create policy "Allow all recurring_templates" on recurring_templates for all using (true) with check (true);
create policy "Allow all balances"            on balances            for all using (true) with check (true);
create policy "Allow all savings"             on savings             for all using (true) with check (true);
create policy "Allow all assets"              on assets              for all using (true) with check (true);
create policy "Allow all gold_prices"         on gold_prices         for all using (true) with check (true);

create table piutang (
  id uuid primary key default gen_random_uuid(),
  debtor_name text not null,
  amount numeric not null,
  date date not null,
  note text,
  person_id uuid references persons(id) on delete set null,
  status text not null default 'outstanding' check (status in ('outstanding', 'paid')),
  created_at timestamptz default now()
);

create table piutang_payments (
  id uuid primary key default gen_random_uuid(),
  piutang_id uuid not null references piutang(id) on delete cascade,
  amount numeric not null,
  date date not null,
  note text,
  created_at timestamptz default now()
);

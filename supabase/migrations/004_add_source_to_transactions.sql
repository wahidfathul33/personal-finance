alter table transactions
  add column if not exists source text not null default 'balance'
  check (source in ('balance', 'savings'));

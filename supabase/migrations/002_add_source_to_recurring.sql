-- Add source column to recurring_templates
-- source: 'balance' = dari/ke saldo, 'savings' = dari/ke tabungan
alter table recurring_templates
  add column if not exists source text not null default 'balance'
    check (source in ('balance', 'savings'));

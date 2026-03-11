-- Add sub_type to assets (only relevant for gold type)
alter table assets
  add column if not exists sub_type text check (sub_type in ('logam_mulia', 'perhiasan'));

-- Add jewellery price per gram to gold_prices
alter table gold_prices
  add column if not exists jewelry_price_per_gram numeric;

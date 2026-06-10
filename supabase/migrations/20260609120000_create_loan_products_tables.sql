create type public.loan_product_category as enum (
  'personal',
  'business',
  'asset_financing',
  'education'
);

create table public.loan_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category public.loan_product_category not null,
  description text not null,
  min_amount numeric(12, 2) not null check (min_amount >= 0),
  max_amount numeric(12, 2) not null check (max_amount >= min_amount),
  active boolean not null default true,
  country text not null default 'US',
  eligibility_summary text,
  created_at timestamptz not null default now()
);

create table public.loan_product_requirements (
  id uuid primary key default gen_random_uuid(),
  loan_product_id uuid not null references public.loan_products (id) on delete cascade,
  requirement_name text not null,
  description text,
  required boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.loan_product_terms (
  id uuid primary key default gen_random_uuid(),
  loan_product_id uuid not null references public.loan_products (id) on delete cascade,
  repayment_frequency text not null,
  repayment_period integer not null check (repayment_period > 0),
  interest_rate numeric(5, 2) not null check (interest_rate >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index loan_products_category_idx on public.loan_products (category);
create index loan_products_active_idx on public.loan_products (active);
create index loan_products_country_idx on public.loan_products (country);
create index loan_product_requirements_product_idx
  on public.loan_product_requirements (loan_product_id);
create index loan_product_terms_product_idx
  on public.loan_product_terms (loan_product_id);

alter table public.loan_products enable row level security;
alter table public.loan_product_requirements enable row level security;
alter table public.loan_product_terms enable row level security;

create policy "loan_products_select_active"
  on public.loan_products
  for select
  to authenticated
  using (active = true);

create policy "loan_product_requirements_select"
  on public.loan_product_requirements
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.loan_products
      where loan_products.id = loan_product_requirements.loan_product_id
        and loan_products.active = true
    )
  );

create policy "loan_product_terms_select"
  on public.loan_product_terms
  for select
  to authenticated
  using (
    active = true
    and exists (
      select 1
      from public.loan_products
      where loan_products.id = loan_product_terms.loan_product_id
        and loan_products.active = true
    )
  );

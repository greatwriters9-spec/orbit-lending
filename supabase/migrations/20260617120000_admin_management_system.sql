-- Administrative Management System: account controls, product lifecycle, admin RLS

create type public.account_status as enum (
  'active',
  'under_review',
  'restricted',
  'on_hold',
  'suspended',
  'closed'
);

create type public.loan_product_status as enum (
  'draft',
  'active',
  'hidden',
  'archived'
);

-- ---------------------------------------------------------------------------
-- Profiles: account status controls
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists account_status public.account_status not null default 'active',
  add column if not exists account_status_reason text,
  add column if not exists account_status_changed_at timestamptz,
  add column if not exists account_status_changed_by uuid references auth.users (id) on delete set null;

create index if not exists profiles_account_status_idx
  on public.profiles (account_status);

-- ---------------------------------------------------------------------------
-- Loan products: extended admin fields
-- ---------------------------------------------------------------------------

alter table public.loan_products
  add column if not exists default_apr numeric(5, 2),
  add column if not exists min_apr numeric(5, 2),
  add column if not exists max_apr numeric(5, 2),
  add column if not exists min_term integer check (min_term is null or min_term > 0),
  add column if not exists max_term integer,
  add column if not exists weekly_repayment_supported boolean not null default false,
  add column if not exists monthly_repayment_supported boolean not null default true,
  add column if not exists product_status public.loan_product_status not null default 'draft',
  add column if not exists updated_at timestamptz not null default now();

-- Sync legacy active flag into product_status
update public.loan_products
set product_status = case when active = true then 'active'::public.loan_product_status else 'draft'::public.loan_product_status end
where product_status = 'draft';

-- ---------------------------------------------------------------------------
-- Platform settings (Chief Lending Officer)
-- ---------------------------------------------------------------------------

create table public.platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.platform_settings enable row level security;

insert into public.platform_settings (key, value)
values
  ('general', '{"institutionName":"Orbit Lending","supportEmail":"support@orbitlending.com","maintenanceMode":false}'::jsonb),
  ('lending', '{"maxConcurrentApplicationsPerClient":3,"autoAssignLoanOfficer":true}'::jsonb),
  ('notifications', '{"emailEnabled":true,"criticalAlertsEnabled":true}'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Admin helper functions
-- ---------------------------------------------------------------------------

create or replace function public.is_admin_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Loan product RLS: replace client catalog policy
-- ---------------------------------------------------------------------------

drop policy if exists "loan_products_select_active" on public.loan_products;

create policy "loan_products_select_catalog"
  on public.loan_products
  for select
  to authenticated
  using (
    product_status = 'active'
    or public.is_admin_staff()
  );

create policy "loan_products_admin_insert"
  on public.loan_products
  for insert
  to authenticated
  with check (public.is_admin_staff());

create policy "loan_products_admin_update"
  on public.loan_products
  for update
  to authenticated
  using (public.is_admin_staff())
  with check (public.is_admin_staff());

create policy "loan_products_admin_delete"
  on public.loan_products
  for delete
  to authenticated
  using (public.is_admin_staff());

-- Requirements & terms: admin manage
create policy "loan_product_requirements_admin_all"
  on public.loan_product_requirements
  for all
  to authenticated
  using (public.is_admin_staff())
  with check (public.is_admin_staff());

create policy "loan_product_terms_admin_all"
  on public.loan_product_terms
  for all
  to authenticated
  using (public.is_admin_staff())
  with check (public.is_admin_staff());

-- ---------------------------------------------------------------------------
-- Profile admin updates (super admin only for role / account status)
-- ---------------------------------------------------------------------------

create policy "profiles_super_admin_update"
  on public.profiles
  for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- Platform settings RLS
-- ---------------------------------------------------------------------------

create policy "platform_settings_super_admin_select"
  on public.platform_settings
  for select
  to authenticated
  using (public.is_super_admin());

create policy "platform_settings_super_admin_update"
  on public.platform_settings
  for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Audit logs: super admin can always read (finance staff already can)
create policy "audit_logs_super_admin_select"
  on public.audit_logs
  for select
  to authenticated
  using (public.is_super_admin());

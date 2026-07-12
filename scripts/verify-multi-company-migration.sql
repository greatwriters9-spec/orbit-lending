-- Multi-company migration verification
-- Run in Supabase SQL Editor after applying 20260710120100_multi_company_platform_fix.sql

-- 1. Companies table exists with both seeds
select slug, company_name, domain, company_status
from public.companies
order by slug;

-- Expected: orbit + oakstone rows

-- 2. company_id columns exist and are populated
select
  (select count(*) from public.profiles where company_id is null) as profiles_missing_company,
  (select count(*) from public.loan_applications where company_id is null) as applications_missing_company,
  (select count(*) from public.loan_products where company_id is null) as products_missing_company;

-- Expected: all zeros after migration

-- 3. RLS helpers exist
select proname
from pg_proc
where proname in (
  'auth_user_company_id',
  'can_access_company',
  'resolve_company_id_by_host',
  'handle_new_user'
)
order by proname;

-- Expected: 4 functions

-- 4. Host resolution (adjust host for your preview domain)
select public.resolve_company_id_by_host('oakstonemortgage.local') as oakstone_id;
select public.resolve_company_id_by_host('localhost') as orbit_id;

-- Expected: OakStone UUID a1000000-0000-4000-8000-000000000002
-- Expected: Orbit UUID a1000000-0000-4000-8000-000000000001

-- 5. OakStone branding assets
select slug, logo, hero_background, primary_color
from public.companies
where slug = 'oakstone';

-- Expected: logo /companies/oakstone-logo.png, green primary_color

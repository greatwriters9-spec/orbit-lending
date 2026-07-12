-- Idempotent repair: safe to run even if the first migration failed or rolled back.
-- Paste this ENTIRE file in Supabase SQL Editor and run once.

do $$ begin
  create type public.company_status as enum ('active', 'inactive');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  slug text not null unique,
  domain text not null unique,
  alternate_domains text[] not null default '{}',
  logo text,
  favicon text,
  primary_color text not null default '#0f2d78',
  secondary_color text not null default '#1e4db7',
  accent_color text not null default '#6b7280',
  background_color text not null default '#ffffff',
  headquarters_address text,
  business_address text,
  support_email text,
  general_email text,
  phone_number text,
  secondary_phone text,
  business_hours text,
  banking_partner text,
  website text,
  privacy_policy text,
  terms_conditions text,
  about_us text,
  mission text,
  vision text,
  why_choose_us text,
  footer_text text,
  copyright_text text,
  facebook text,
  instagram text,
  linkedin text,
  twitter text,
  tiktok text,
  youtube text,
  threads text,
  telegram text,
  whatsapp text,
  hero_title text,
  hero_subtitle text,
  hero_button_text text,
  hero_background text,
  tagline text,
  branding_settings jsonb not null default '{}'::jsonb,
  company_status public.company_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.companies (
  id, company_name, slug, domain, alternate_domains,
  primary_color, secondary_color, accent_color, background_color,
  headquarters_address, business_address, support_email, general_email,
  phone_number, business_hours, banking_partner, website, tagline,
  hero_title, hero_subtitle, hero_button_text, footer_text, copyright_text,
  about_us, mission, vision, why_choose_us, branding_settings
) values (
  'a1000000-0000-4000-8000-000000000001',
  'Orbit Mortgage', 'orbit', 'orbitmortgage.com',
  array['www.orbitmortgage.com', 'localhost', '127.0.0.1'],
  '#0f2d78', '#1e4db7', '#6b7280', '#ffffff',
  '500 Mortgage Way, Suite 200, Omaha, NE 68102',
  '500 Mortgage Way, Suite 200, Omaha, NE 68102',
  'support@orbittmortgage.com', 'info@orbittmortgage.com',
  '(313) 555-0189', 'Mon – Fri: 8:00 AM – 6:00 PM EST',
  'Pathward National Bank', 'https://orbitmortgage.com',
  'Home financing made simple',
  'Home Financing Made Simple',
  'Get pre-qualified in minutes with transparent terms and secure banking infrastructure.',
  'Get Pre-Qualified',
  'Premium digital mortgage financing with transparent terms and real-time application tracking.',
  '© Orbit Mortgage. All rights reserved.',
  'Orbit Mortgage is a modern mortgage platform built for clarity, speed, and trust.',
  'Make home financing accessible, transparent, and human.',
  'Become the most trusted digital mortgage experience for every household we serve.',
  'Simple process, competitive rates, and dedicated support from pre-qualification through closing.',
  '{"departmentDefaults":{"loan_officer":{"staffName":"Orbit Mortgage Loan Team","staffTitle":"Senior Loan Officer","contactEmail":"loanofficer@orbittmortgage.com"},"underwriting":{"staffName":"Orbit Mortgage Underwriting","staffTitle":"Underwriting Specialist","contactEmail":"underwriting@orbittmortgage.com"},"funding":{"staffName":"Orbit Mortgage Funding Team","staffTitle":"Funding Operations Manager","contactEmail":"funding@orbittmortgage.com"},"closings":{"staffName":"Orbit Mortgage Closing Team","staffTitle":"Closing Coordinator","contactEmail":"closing@orbittmortgage.com"},"support":{"staffName":"Orbit Mortgage Support","staffTitle":"Client Support Team","contactEmail":"support@orbittmortgage.com"},"executive":{"staffName":"Orbit Mortgage Leadership","staffTitle":"Chief Lending Officer","contactEmail":"lending@orbittmortgage.com"}}}'::jsonb
), (
  'a1000000-0000-4000-8000-000000000002',
  'OakStone Mortgage', 'oakstone', 'oakstonemortgage.com',
  array['www.oakstonemortgage.com', 'oakstonemortgage.local'],
  '#0F6A4A', '#D4A53A', '#1A7A57', '#F8FAFC',
  '1200 OakStone Plaza, Suite 400, Charlotte, NC 28202',
  '1200 OakStone Plaza, Suite 400, Charlotte, NC 28202',
  'support@oakstonemortgage.com', 'info@oakstonemortgage.com',
  '(866) 555-0123', 'Mon – Fri: 8:00 AM – 6:00 PM EST',
  'Pathward National Bank', 'https://oakstonemortgage.com',
  'Rooted in strength. Built for your future.',
  'Financing the Home That Builds Your Future',
  'Personalized service, competitive rates, and a mortgage experience rooted in strength.',
  'Get Pre-Qualified',
  'OakStone Mortgage — rooted in strength, built for your future.',
  '© OakStone Mortgage. All rights reserved.',
  'OakStone Mortgage combines traditional strength with modern digital convenience.',
  'Help families build lasting wealth through homeownership.',
  'Be the mortgage company families trust for generations.',
  'Secure lending, personalized guidance, and on-time closings backed by experienced professionals.',
  '{"departmentDefaults":{"loan_officer":{"staffName":"OakStone Loan Team","staffTitle":"Senior Loan Officer","contactEmail":"loanofficer@oakstonemortgage.com"},"underwriting":{"staffName":"OakStone Underwriting","staffTitle":"Underwriting Specialist","contactEmail":"underwriting@oakstonemortgage.com"},"funding":{"staffName":"OakStone Funding Team","staffTitle":"Funding Operations Manager","contactEmail":"funding@oakstonemortgage.com"},"closings":{"staffName":"OakStone Closing Team","staffTitle":"Closing Coordinator","contactEmail":"closing@oakstonemortgage.com"},"support":{"staffName":"OakStone Support","staffTitle":"Client Support Team","contactEmail":"support@oakstonemortgage.com"},"executive":{"staffName":"OakStone Leadership","staffTitle":"Chief Lending Officer","contactEmail":"lending@oakstonemortgage.com"}}}'::jsonb
)
on conflict (id) do update set
  alternate_domains = excluded.alternate_domains,
  updated_at = now();

update public.companies
set
  logo = '/companies/oakstone-logo.png',
  favicon = '/companies/oakstone-favicon.png',
  hero_background = '/assets/oakstone/hero-home.webp',
  primary_color = '#0F6A4A',
  secondary_color = '#D4A53A',
  accent_color = '#1A7A57',
  background_color = '#F8FAFC'
where slug = 'oakstone';

-- Add company_id columns if missing
alter table public.profiles add column if not exists company_id uuid references public.companies (id) on delete restrict;
alter table public.loan_applications add column if not exists company_id uuid references public.companies (id) on delete restrict;
alter table public.loan_products add column if not exists company_id uuid references public.companies (id) on delete restrict;
alter table public.notifications add column if not exists company_id uuid references public.companies (id) on delete restrict;
alter table public.admin_notifications add column if not exists company_id uuid references public.companies (id) on delete restrict;
alter table public.support_tickets add column if not exists company_id uuid references public.companies (id) on delete restrict;
alter table public.guest_support_concerns add column if not exists company_id uuid references public.companies (id) on delete restrict;
alter table public.audit_logs add column if not exists company_id uuid references public.companies (id) on delete restrict;
alter table public.email_communication_logs add column if not exists company_id uuid references public.companies (id) on delete restrict;
alter table public.platform_transactions add column if not exists company_id uuid references public.companies (id) on delete restrict;
alter table public.loans add column if not exists company_id uuid references public.companies (id) on delete restrict;
alter table public.wallets add column if not exists company_id uuid references public.companies (id) on delete restrict;

-- Backfill
update public.profiles
set company_id = 'a1000000-0000-4000-8000-000000000001'
where company_id is null;

update public.loan_applications la
set company_id = p.company_id
from public.profiles p
where la.user_id = p.id and la.company_id is null;

update public.loan_applications
set company_id = 'a1000000-0000-4000-8000-000000000001'
where company_id is null;

update public.loan_products
set company_id = 'a1000000-0000-4000-8000-000000000001'
where company_id is null;

update public.notifications n
set company_id = p.company_id
from public.profiles p
where n.user_id = p.id and n.company_id is null;

update public.support_tickets st
set company_id = p.company_id
from public.profiles p
where st.borrower_id = p.id and st.company_id is null;

update public.wallets w
set company_id = p.company_id
from public.profiles p
where w.user_id = p.id and w.company_id is null;

update public.loans l
set company_id = la.company_id
from public.loan_applications la
where l.application_id = la.id and l.company_id is null;

update public.platform_transactions
set company_id = 'a1000000-0000-4000-8000-000000000001'
where company_id is null;

update public.audit_logs
set company_id = 'a1000000-0000-4000-8000-000000000001'
where company_id is null;

update public.email_communication_logs
set company_id = 'a1000000-0000-4000-8000-000000000001'
where company_id is null;

update public.guest_support_concerns
set company_id = 'a1000000-0000-4000-8000-000000000001'
where company_id is null;

update public.admin_notifications
set company_id = 'a1000000-0000-4000-8000-000000000001'
where company_id is null;

alter table public.profiles alter column company_id set not null;
alter table public.loan_applications alter column company_id set not null;
alter table public.loan_products alter column company_id set not null;

create index if not exists profiles_company_id_idx on public.profiles (company_id);
create index if not exists loan_applications_company_id_idx on public.loan_applications (company_id);
create index if not exists loan_products_company_id_idx on public.loan_products (company_id);
create index if not exists companies_domain_idx on public.companies (domain);
create index if not exists companies_slug_idx on public.companies (slug);

alter table public.companies enable row level security;

create or replace function public.auth_user_company_id()
returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create or replace function public.can_access_company(target_company_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_super_admin() or public.auth_user_company_id() = target_company_id;
$$;

create or replace function public.resolve_company_id_by_host(host_name text)
returns uuid language sql stable security definer set search_path = public as $$
  select c.id from public.companies c
  where c.company_status = 'active'
    and (lower(c.domain) = lower(host_name)
      or lower(host_name) = any (select lower(unnest(c.alternate_domains))))
  limit 1;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare resolved_company_id uuid;
begin
  resolved_company_id := coalesce(
    nullif(new.raw_user_meta_data ->> 'company_id', '')::uuid,
    'a1000000-0000-4000-8000-000000000001'::uuid
  );
  insert into public.profiles (id, email, first_name, last_name, company_id)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    resolved_company_id
  );
  return new;
end;
$$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='companies' and policyname='companies_public_read_active') then
    create policy "companies_public_read_active" on public.companies for select to authenticated, anon using (company_status = 'active');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='companies' and policyname='companies_super_admin_all') then
    create policy "companies_super_admin_all" on public.companies for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());
  end if;
end $$;

drop policy if exists "finance_applications_select" on public.loan_applications;
create policy "finance_applications_select" on public.loan_applications for select to authenticated
  using (public.is_finance_staff() and public.can_access_company(company_id));

drop policy if exists "finance_applications_update" on public.loan_applications;
create policy "finance_applications_update" on public.loan_applications for update to authenticated
  using (public.is_finance_staff() and public.can_access_company(company_id))
  with check (public.is_finance_staff() and public.can_access_company(company_id));

drop policy if exists "finance_profiles_select" on public.profiles;
create policy "finance_profiles_select" on public.profiles for select to authenticated
  using (public.is_finance_staff() and public.can_access_company(company_id));

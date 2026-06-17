-- Fix platform_settings RLS so admin staff can save mortgage configuration.
-- The original schema only granted super admins SELECT + UPDATE (no INSERT).
-- Upsert on a missing `mortgage` row therefore failed with an RLS error.

insert into public.platform_settings (key, value)
values (
  'mortgage',
  '{
    "productName": "Home Mortgage",
    "description": "Competitive fixed-rate mortgage financing for primary residences, refinancing, and investment properties.",
    "minLoanAmount": 50000,
    "maxLoanAmount": 1500000,
    "maxLtv": 80,
    "status": "active",
    "terms": [
      { "id": "fixed-30", "label": "30-Year Fixed", "termMonths": 360, "interestRate": 6.99, "isPrimary": true },
      { "id": "fixed-15", "label": "15-Year Fixed", "termMonths": 180, "interestRate": 6.75 }
    ]
  }'::jsonb
)
on conflict (key) do nothing;

-- Super admin: full manage access to all platform settings
drop policy if exists "platform_settings_super_admin_insert" on public.platform_settings;

create policy "platform_settings_super_admin_insert"
  on public.platform_settings
  for insert
  to authenticated
  with check (public.is_super_admin());

-- Admin staff: manage the mortgage setting only
drop policy if exists "platform_settings_admin_select_mortgage" on public.platform_settings;
drop policy if exists "platform_settings_admin_update_mortgage" on public.platform_settings;
drop policy if exists "platform_settings_admin_insert_mortgage" on public.platform_settings;
drop policy if exists "platform_settings_admin_all_mortgage" on public.platform_settings;

create policy "platform_settings_admin_all_mortgage"
  on public.platform_settings
  for all
  to authenticated
  using (key = 'mortgage' and public.is_admin_staff())
  with check (key = 'mortgage' and public.is_admin_staff());

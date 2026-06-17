-- ---------------------------------------------------------------------------
-- Mortgage management settings
-- Orbit has consolidated to a single mortgage product. Mortgage parameters
-- (LTV, interest rates by term, amount range) are stored as a platform setting
-- and managed by admin staff from the Mortgage Management page.
-- ---------------------------------------------------------------------------

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

-- Admin staff (credit managers + chief lending officer) can read and manage the
-- mortgage setting specifically, while all other platform settings remain
-- restricted to the super admin.
create policy "platform_settings_admin_select_mortgage"
  on public.platform_settings
  for select
  to authenticated
  using (key = 'mortgage' and public.is_admin_staff());

create policy "platform_settings_admin_update_mortgage"
  on public.platform_settings
  for update
  to authenticated
  using (key = 'mortgage' and public.is_admin_staff())
  with check (key = 'mortgage' and public.is_admin_staff());

create policy "platform_settings_admin_insert_mortgage"
  on public.platform_settings
  for insert
  to authenticated
  with check (key = 'mortgage' and public.is_admin_staff());

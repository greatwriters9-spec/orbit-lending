alter table public.profiles
  add column if not exists pathward_withdrawable_approved_at timestamptz,
  add column if not exists pathward_withdrawable_approved_by uuid references auth.users (id) on delete set null;

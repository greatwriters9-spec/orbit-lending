-- Constrain profile roles to supported values
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('client', 'finance_officer', 'admin', 'super_admin'));

create index if not exists profiles_role_idx on public.profiles (role);

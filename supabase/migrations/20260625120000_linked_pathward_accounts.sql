alter table public.profiles
  add column if not exists pathward_account_holder_name text,
  add column if not exists pathward_routing_number text,
  add column if not exists pathward_account_number text,
  add column if not exists pathward_linked_at timestamptz,
  add column if not exists pathward_linked_by uuid references auth.users (id) on delete set null;

create index if not exists profiles_pathward_linked_at_idx
  on public.profiles (pathward_linked_at);

-- Guest support concerns (unregistered visitors)

create table public.guest_support_concerns (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  full_name text not null,
  email text not null,
  phone text not null,
  concern text not null,
  source text not null default 'onboarding',
  status text not null default 'open'
    check (status in ('open', 'in_review', 'resolved', 'closed')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guest_support_concerns_status_idx
  on public.guest_support_concerns (status);

create index guest_support_concerns_created_idx
  on public.guest_support_concerns (created_at desc);

create trigger guest_support_concerns_set_updated_at
  before update on public.guest_support_concerns
  for each row execute function public.set_updated_at();

alter table public.guest_support_concerns enable row level security;

create policy "guest_concerns_super_admin_select"
  on public.guest_support_concerns for select to authenticated
  using (public.is_super_admin());

create policy "guest_concerns_super_admin_update"
  on public.guest_support_concerns for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Client Communication & Notification System

create type public.notification_category as enum (
  'application_update',
  'finance_message',
  'wallet_activity',
  'security',
  'repayment'
);

create type public.notification_priority as enum (
  'critical',
  'high',
  'normal',
  'informational'
);

alter table public.notifications
  add column if not exists category public.notification_category not null default 'application_update',
  add column if not exists priority public.notification_priority not null default 'normal',
  add column if not exists action_url text,
  add column if not exists modal_dismissed boolean not null default false;

create index if not exists notifications_category_idx
  on public.notifications (user_id, category);

create index if not exists notifications_priority_idx
  on public.notifications (user_id, priority, modal_dismissed)
  where read = false;

-- Allow authenticated users to receive system notifications on their own account
create policy "notifications_insert_own"
  on public.notifications
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Track document uploads as timeline events
create table if not exists public.application_activity_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications (id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  actor_id uuid references auth.users (id) on delete set null,
  actor_name text,
  created_at timestamptz not null default now()
);

create index if not exists application_activity_events_app_idx
  on public.application_activity_events (application_id, created_at desc);

alter table public.application_activity_events enable row level security;

create policy "application_activity_select_own"
  on public.application_activity_events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.loan_applications
      where loan_applications.id = application_activity_events.application_id
        and loan_applications.user_id = auth.uid()
    )
  );

create policy "application_activity_select_finance"
  on public.application_activity_events
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "application_activity_insert_authenticated"
  on public.application_activity_events
  for insert
  to authenticated
  with check (true);

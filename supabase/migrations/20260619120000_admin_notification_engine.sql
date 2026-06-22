-- Centralized admin notification engine

create type public.admin_notification_severity as enum (
  'critical',
  'high',
  'normal',
  'informational'
);

create type public.admin_notification_channel as enum (
  'in_app',
  'email',
  'telegram'
);

create table public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  title text not null,
  message text not null,
  severity public.admin_notification_severity not null default 'normal',
  entity_type text,
  entity_id text,
  channel public.admin_notification_channel not null default 'in_app',
  dashboard_url text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index admin_notifications_created_at_idx
  on public.admin_notifications (created_at desc);

create index admin_notifications_unread_in_app_idx
  on public.admin_notifications (read, created_at desc)
  where channel = 'in_app';

create index admin_notifications_event_type_idx
  on public.admin_notifications (event_type);

alter table public.admin_notifications enable row level security;

create policy "admin_notifications_staff_select"
  on public.admin_notifications
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "admin_notifications_staff_update"
  on public.admin_notifications
  for update
  to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

-- Service role inserts from server notification engine
create policy "admin_notifications_service_insert"
  on public.admin_notifications
  for insert
  to authenticated
  with check (public.is_finance_staff());

-- Realtime: staff dashboards receive new alerts instantly
alter publication supabase_realtime add table public.admin_notifications;

-- Expand platform notification settings
update public.platform_settings
set value = coalesce(value, '{}'::jsonb) || '{
  "emailEnabled": true,
  "criticalAlertsEnabled": true,
  "inAppEnabled": true,
  "primaryEmail": "",
  "secondaryEmail": "",
  "telegramEnabled": false,
  "telegramChatId": "",
  "telegramBotToken": "",
  "notificationMode": "all"
}'::jsonb
where key = 'notifications';

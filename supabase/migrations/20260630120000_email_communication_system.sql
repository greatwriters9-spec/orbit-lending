create type public.email_department as enum (
  'system',
  'loan_officer',
  'lending',
  'funding',
  'closings',
  'support'
);

create type public.email_delivery_status as enum (
  'pending',
  'sent',
  'failed',
  'skipped'
);

create table if not exists public.email_communication_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  recipient_email text not null,
  sender_email text not null,
  sender_display_name text not null,
  department public.email_department not null,
  template_key text not null,
  subject text not null,
  status public.email_delivery_status not null default 'pending',
  resend_id text,
  error_message text,
  sent_by uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_communication_logs_user_id_idx
  on public.email_communication_logs (user_id, created_at desc);

create index if not exists email_communication_logs_recipient_idx
  on public.email_communication_logs (recipient_email, created_at desc);

create index if not exists email_communication_logs_created_at_idx
  on public.email_communication_logs (created_at desc);

alter table public.email_communication_logs enable row level security;

create policy "Users can read own email communication logs"
  on public.email_communication_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can read all email communication logs"
  on public.email_communication_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin', 'finance_officer')
    )
  );

create policy "Service role manages email communication logs"
  on public.email_communication_logs
  for all
  to service_role
  using (true)
  with check (true);

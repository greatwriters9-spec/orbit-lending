create or replace function public.is_finance_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('finance_officer', 'admin', 'super_admin')
  );
$$;

create table public.application_internal_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  note text not null,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index application_internal_notes_application_idx
  on public.application_internal_notes (application_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_user_idx on public.audit_logs (user_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

alter table public.application_internal_notes enable row level security;
alter table public.audit_logs enable row level security;

create policy "finance_applications_select"
  on public.loan_applications
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "finance_applications_update"
  on public.loan_applications
  for update
  to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "finance_application_documents_select"
  on public.loan_application_documents
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "finance_offers_select"
  on public.loan_offers
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "finance_offers_insert"
  on public.loan_offers
  for insert
  to authenticated
  with check (public.is_finance_staff());

create policy "finance_offers_update"
  on public.loan_offers
  for update
  to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "finance_messages_select"
  on public.application_messages
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "finance_messages_insert"
  on public.application_messages
  for insert
  to authenticated
  with check (
    public.is_finance_staff()
    and sender_role in ('finance', 'officer', 'system')
    and sender_id = auth.uid()
  );

create policy "finance_status_history_select"
  on public.application_status_history
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "finance_status_history_insert"
  on public.application_status_history
  for insert
  to authenticated
  with check (public.is_finance_staff());

create policy "finance_document_requests_select"
  on public.application_document_requests
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "finance_document_requests_insert"
  on public.application_document_requests
  for insert
  to authenticated
  with check (public.is_finance_staff());

create policy "finance_document_requests_update"
  on public.application_document_requests
  for update
  to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "finance_profiles_select"
  on public.profiles
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "internal_notes_finance_select"
  on public.application_internal_notes
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "internal_notes_finance_insert"
  on public.application_internal_notes
  for insert
  to authenticated
  with check (public.is_finance_staff() and author_id = auth.uid());

create policy "audit_logs_finance_select"
  on public.audit_logs
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "audit_logs_finance_insert"
  on public.audit_logs
  for insert
  to authenticated
  with check (public.is_finance_staff() and user_id = auth.uid());

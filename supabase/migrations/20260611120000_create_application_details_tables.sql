create table public.loan_offers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications (id) on delete cascade,
  requested_amount numeric(12, 2) not null,
  recommended_amount numeric(12, 2) not null,
  final_amount numeric(12, 2) not null,
  offered_interest_rate numeric(5, 2) not null,
  repayment_frequency text not null default 'Monthly',
  repayment_period integer not null default 12,
  notes text,
  accepted_by_client boolean,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.application_messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications (id) on delete cascade,
  sender_id uuid references auth.users (id) on delete set null,
  sender_role text not null check (sender_role in ('client', 'officer', 'finance', 'system')),
  sender_name text not null,
  message text not null,
  attachment_url text,
  created_at timestamptz not null default now()
);

create table public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications (id) on delete cascade,
  status public.loan_application_status not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.application_document_requests (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications (id) on delete cascade,
  document_name text not null,
  description text,
  required boolean not null default true,
  fulfilled boolean not null default false,
  file_name text,
  requested_at timestamptz not null default now(),
  due_date date,
  uploaded_at timestamptz
);

create index loan_offers_application_idx on public.loan_offers (application_id);
create index application_messages_application_idx on public.application_messages (application_id);
create index application_status_history_application_idx
  on public.application_status_history (application_id);
create index application_document_requests_application_idx
  on public.application_document_requests (application_id);

alter table public.loan_offers enable row level security;
alter table public.application_messages enable row level security;
alter table public.application_status_history enable row level security;
alter table public.application_document_requests enable row level security;

create policy "loan_offers_select_own"
  on public.loan_offers
  for select
  to authenticated
  using (
    exists (
      select 1 from public.loan_applications
      where loan_applications.id = loan_offers.application_id
        and loan_applications.user_id = auth.uid()
    )
  );

create policy "loan_offers_update_own"
  on public.loan_offers
  for update
  to authenticated
  using (
    exists (
      select 1 from public.loan_applications
      where loan_applications.id = loan_offers.application_id
        and loan_applications.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.loan_applications
      where loan_applications.id = loan_offers.application_id
        and loan_applications.user_id = auth.uid()
    )
  );

create policy "application_messages_select_own"
  on public.application_messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.loan_applications
      where loan_applications.id = application_messages.application_id
        and loan_applications.user_id = auth.uid()
    )
  );

create policy "application_messages_insert_own"
  on public.application_messages
  for insert
  to authenticated
  with check (
    sender_role = 'client'
    and sender_id = auth.uid()
    and exists (
      select 1 from public.loan_applications
      where loan_applications.id = application_messages.application_id
        and loan_applications.user_id = auth.uid()
    )
  );

create policy "application_status_history_select_own"
  on public.application_status_history
  for select
  to authenticated
  using (
    exists (
      select 1 from public.loan_applications
      where loan_applications.id = application_status_history.application_id
        and loan_applications.user_id = auth.uid()
    )
  );

create policy "application_document_requests_select_own"
  on public.application_document_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.loan_applications
      where loan_applications.id = application_document_requests.application_id
        and loan_applications.user_id = auth.uid()
    )
  );

create policy "application_document_requests_update_own"
  on public.application_document_requests
  for update
  to authenticated
  using (
    exists (
      select 1 from public.loan_applications
      where loan_applications.id = application_document_requests.application_id
        and loan_applications.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.loan_applications
      where loan_applications.id = application_document_requests.application_id
        and loan_applications.user_id = auth.uid()
    )
  );

create policy "loan_application_documents_insert_submitted"
  on public.loan_application_documents
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.loan_applications
      where loan_applications.id = loan_application_documents.application_id
        and loan_applications.user_id = auth.uid()
        and loan_applications.status <> 'draft'
    )
  );

create policy "loan_applications_update_own_submitted"
  on public.loan_applications
  for update
  to authenticated
  using (auth.uid() = user_id and status <> 'draft')
  with check (auth.uid() = user_id);

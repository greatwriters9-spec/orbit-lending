create type public.loan_application_status as enum (
  'draft',
  'submitted',
  'under_review',
  'pre_approved',
  'information_required',
  'pending_finance_approval',
  'approved',
  'funded',
  'active',
  'completed',
  'rejected',
  'defaulted'
);

create table public.loan_applications (
  id uuid primary key default gen_random_uuid(),
  application_number text unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  loan_product_slug text not null,
  loan_product_id uuid references public.loan_products (id),
  requested_amount numeric(12, 2),
  selected_term_id text,
  purpose text,
  status public.loan_application_status not null default 'draft',
  personal_info jsonb not null default '{}'::jsonb,
  financial_info jsonb not null default '{}'::jsonb,
  requirement_documents jsonb not null default '{}'::jsonb,
  current_step integer not null default 1 check (current_step between 1 and 7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table public.loan_application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications (id) on delete cascade,
  requirement_id text not null,
  document_name text not null,
  file_name text not null,
  file_url text,
  uploaded_at timestamptz not null default now()
);

create index loan_applications_user_id_idx on public.loan_applications (user_id);
create index loan_applications_status_idx on public.loan_applications (status);
create index loan_applications_product_slug_idx on public.loan_applications (loan_product_slug);
create index loan_application_documents_application_idx
  on public.loan_application_documents (application_id);

create trigger loan_applications_set_updated_at
  before update on public.loan_applications
  for each row
  execute function public.set_updated_at();

alter table public.loan_applications enable row level security;
alter table public.loan_application_documents enable row level security;

create policy "loan_applications_select_own"
  on public.loan_applications
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "loan_applications_insert_own"
  on public.loan_applications
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "loan_applications_update_own_draft"
  on public.loan_applications
  for update
  to authenticated
  using (auth.uid() = user_id and status = 'draft')
  with check (auth.uid() = user_id);

create policy "loan_application_documents_select_own"
  on public.loan_application_documents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.loan_applications
      where loan_applications.id = loan_application_documents.application_id
        and loan_applications.user_id = auth.uid()
    )
  );

create policy "loan_application_documents_insert_own"
  on public.loan_application_documents
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.loan_applications
      where loan_applications.id = loan_application_documents.application_id
        and loan_applications.user_id = auth.uid()
        and loan_applications.status = 'draft'
    )
  );

create policy "loan_application_documents_delete_own_draft"
  on public.loan_application_documents
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.loan_applications
      where loan_applications.id = loan_application_documents.application_id
        and loan_applications.user_id = auth.uid()
        and loan_applications.status = 'draft'
    )
  );

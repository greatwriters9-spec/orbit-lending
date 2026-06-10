-- Repayment management system

create type public.loan_repayment_status as enum (
  'upcoming',
  'due_today',
  'pending_verification',
  'paid',
  'rejected',
  'late',
  'overdue',
  'waived'
);

create type public.repayment_payment_method as enum (
  'bank_transfer',
  'ach_transfer',
  'wire_transfer',
  'wallet_balance'
);

create type public.payment_submission_status as enum (
  'pending',
  'approved',
  'rejected'
);

create type public.loan_health_rating as enum (
  'excellent',
  'good',
  'warning',
  'critical'
);

alter table public.loans
  add column if not exists loan_number text,
  add column if not exists repayment_progress_percent numeric(5, 2) not null default 0,
  add column if not exists loan_health_rating public.loan_health_rating not null default 'good',
  add column if not exists loan_health_score integer not null default 100 check (loan_health_score >= 0 and loan_health_score <= 100),
  add column if not exists paid_installments integer not null default 0,
  add column if not exists total_paid_amount numeric(14, 2) not null default 0;

create table public.loan_repayments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans (id) on delete cascade,
  borrower_id uuid not null references auth.users (id) on delete cascade,
  installment_number integer not null check (installment_number > 0),
  due_date date not null,
  principal_amount numeric(14, 2) not null check (principal_amount >= 0),
  interest_amount numeric(14, 2) not null check (interest_amount >= 0),
  installment_amount numeric(14, 2) not null check (installment_amount > 0),
  remaining_balance_before numeric(14, 2) not null check (remaining_balance_before >= 0),
  remaining_balance_after numeric(14, 2) not null check (remaining_balance_after >= 0),
  status public.loan_repayment_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (loan_id, installment_number)
);

create table public.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  repayment_id uuid not null references public.loan_repayments (id) on delete cascade,
  borrower_id uuid not null references auth.users (id) on delete cascade,
  payment_method public.repayment_payment_method not null,
  amount numeric(14, 2) not null check (amount > 0),
  reference_number text not null,
  proof_document_url text,
  notes text,
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  status public.payment_submission_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.repayment_activity_logs (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans (id) on delete cascade,
  repayment_id uuid references public.loan_repayments (id) on delete set null,
  actor_id uuid references auth.users (id) on delete set null,
  actor_role text,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.repayment_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  repayment_id uuid not null references public.loan_repayments (id) on delete cascade,
  reminder_type text not null,
  sent_at timestamptz not null default now(),
  unique (repayment_id, reminder_type)
);

create index loan_repayments_loan_id_idx on public.loan_repayments (loan_id);
create index loan_repayments_borrower_id_idx on public.loan_repayments (borrower_id);
create index loan_repayments_due_date_idx on public.loan_repayments (due_date);
create index loan_repayments_status_idx on public.loan_repayments (status);
create index payment_submissions_repayment_id_idx on public.payment_submissions (repayment_id);
create index payment_submissions_borrower_id_idx on public.payment_submissions (borrower_id);
create index payment_submissions_status_idx on public.payment_submissions (status);
create index repayment_activity_logs_loan_id_idx on public.repayment_activity_logs (loan_id);
create index repayment_reminder_logs_repayment_id_idx on public.repayment_reminder_logs (repayment_id);

create trigger loan_repayments_set_updated_at
  before update on public.loan_repayments
  for each row
  execute function public.set_updated_at();

create trigger payment_submissions_set_updated_at
  before update on public.payment_submissions
  for each row
  execute function public.set_updated_at();

alter table public.loan_repayments enable row level security;
alter table public.payment_submissions enable row level security;
alter table public.repayment_activity_logs enable row level security;
alter table public.repayment_reminder_logs enable row level security;

create policy "loan_repayments_select_own"
  on public.loan_repayments for select to authenticated
  using (auth.uid() = borrower_id);

create policy "loan_repayments_finance_select"
  on public.loan_repayments for select to authenticated
  using (public.is_finance_staff());

create policy "loan_repayments_finance_update"
  on public.loan_repayments for update to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "loan_repayments_finance_insert"
  on public.loan_repayments for insert to authenticated
  with check (public.is_finance_staff());

create policy "payment_submissions_select_own"
  on public.payment_submissions for select to authenticated
  using (auth.uid() = borrower_id);

create policy "payment_submissions_insert_own"
  on public.payment_submissions for insert to authenticated
  with check (auth.uid() = borrower_id);

create policy "payment_submissions_finance_select"
  on public.payment_submissions for select to authenticated
  using (public.is_finance_staff());

create policy "payment_submissions_finance_update"
  on public.payment_submissions for update to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "repayment_activity_logs_select_own"
  on public.repayment_activity_logs for select to authenticated
  using (
    exists (
      select 1 from public.loans
      where loans.id = repayment_activity_logs.loan_id
        and loans.user_id = auth.uid()
    )
  );

create policy "repayment_activity_logs_finance_all"
  on public.repayment_activity_logs for all to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "repayment_reminder_logs_finance_all"
  on public.repayment_reminder_logs for all to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "loans_finance_update"
  on public.loans for update to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

-- Storage bucket for payment proof documents
insert into storage.buckets (id, name, public)
values ('repayment-proofs', 'repayment-proofs', false)
on conflict (id) do nothing;

create policy "repayment_proofs_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'repayment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "repayment_proofs_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'repayment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "repayment_proofs_finance_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'repayment-proofs'
    and public.is_finance_staff()
  );

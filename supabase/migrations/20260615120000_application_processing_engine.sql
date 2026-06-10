-- Application Processing Engine: extended statuses, scoring, audit metadata

alter type public.loan_application_status add value if not exists 'pre_qualified';
alter type public.loan_application_status add value if not exists 'offer_sent';
alter type public.loan_application_status add value if not exists 'offer_accepted';
alter type public.loan_application_status add value if not exists 'offer_declined';

alter table public.application_status_history
  add column if not exists changed_by uuid references auth.users (id) on delete set null;

create table if not exists public.application_scores (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications (id) on delete cascade,
  risk_score numeric(5, 2) not null check (risk_score between 0 and 100),
  income_score numeric(5, 2) not null check (income_score between 0 and 100),
  employment_score numeric(5, 2) not null check (employment_score between 0 and 100),
  final_score numeric(5, 2) not null check (final_score between 0 and 100),
  scored_at timestamptz not null default now(),
  scored_by uuid references auth.users (id) on delete set null,
  unique (application_id)
);

create index if not exists application_scores_application_idx
  on public.application_scores (application_id);

alter table public.application_scores enable row level security;

create policy "application_scores_select_own"
  on public.application_scores
  for select
  to authenticated
  using (
    exists (
      select 1 from public.loan_applications
      where loan_applications.id = application_scores.application_id
        and loan_applications.user_id = auth.uid()
    )
  );

create policy "application_scores_select_finance"
  on public.application_scores
  for select
  to authenticated
  using (public.is_finance_staff());

create policy "application_scores_insert_finance"
  on public.application_scores
  for insert
  to authenticated
  with check (public.is_finance_staff());

create policy "application_scores_update_finance"
  on public.application_scores
  for update
  to authenticated
  using (public.is_finance_staff());

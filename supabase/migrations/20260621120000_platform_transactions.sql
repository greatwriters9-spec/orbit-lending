-- Unified platform transaction ledger

create type public.platform_transaction_type as enum (
  'loan_disbursement',
  'repayment_payment',
  'wallet_credit',
  'wallet_debit',
  'withdrawal_request',
  'withdrawal_approved',
  'withdrawal_rejected',
  'refund',
  'penalty_applied',
  'penalty_reversed',
  'credit_applied',
  'adjustment',
  'manual_correction',
  'fee_charged',
  'fee_waived',
  'loan_closed',
  'loan_write_off',
  'administrative_action'
);

create type public.platform_transaction_status as enum (
  'pending',
  'processing',
  'approved',
  'completed',
  'rejected',
  'failed',
  'reversed',
  'cancelled'
);

create type public.platform_transaction_category as enum (
  'disbursement',
  'repayment',
  'wallet',
  'adjustment',
  'fee',
  'administrative',
  'penalty',
  'refund'
);

create table public.platform_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_number text not null unique,
  borrower_id uuid not null references auth.users (id) on delete cascade,
  loan_id uuid references public.loans (id) on delete set null,
  repayment_id uuid references public.loan_repayments (id) on delete set null,
  wallet_transaction_id uuid references public.wallet_transactions (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  transaction_type public.platform_transaction_type not null,
  category public.platform_transaction_category not null,
  amount numeric(14, 2) not null check (amount >= 0),
  direction text not null check (direction in ('credit', 'debit')),
  previous_balance numeric(14, 2),
  new_balance numeric(14, 2),
  status public.platform_transaction_status not null default 'completed',
  reference_number text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transaction_timeline_events (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.platform_transactions (id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  actor_id uuid references auth.users (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index platform_transactions_borrower_id_idx
  on public.platform_transactions (borrower_id);

create index platform_transactions_loan_id_idx
  on public.platform_transactions (loan_id);

create index platform_transactions_status_idx
  on public.platform_transactions (status);

create index platform_transactions_type_idx
  on public.platform_transactions (transaction_type);

create index platform_transactions_created_at_idx
  on public.platform_transactions (created_at desc);

create index platform_transactions_reference_idx
  on public.platform_transactions (reference_number);

create index transaction_timeline_transaction_id_idx
  on public.transaction_timeline_events (transaction_id);

create trigger platform_transactions_set_updated_at
  before update on public.platform_transactions
  for each row
  execute function public.set_updated_at();

alter table public.platform_transactions enable row level security;
alter table public.transaction_timeline_events enable row level security;

create policy "platform_transactions_select_own"
  on public.platform_transactions for select to authenticated
  using (auth.uid() = borrower_id and deleted_at is null);

create policy "platform_transactions_finance_select"
  on public.platform_transactions for select to authenticated
  using (public.is_finance_staff() and deleted_at is null);

create policy "platform_transactions_finance_insert"
  on public.platform_transactions for insert to authenticated
  with check (public.is_finance_staff() or auth.uid() = borrower_id);

create policy "platform_transactions_finance_update"
  on public.platform_transactions for update to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "transaction_timeline_select_own"
  on public.transaction_timeline_events for select to authenticated
  using (
    exists (
      select 1 from public.platform_transactions
      where platform_transactions.id = transaction_timeline_events.transaction_id
        and platform_transactions.borrower_id = auth.uid()
        and platform_transactions.deleted_at is null
    )
  );

create policy "transaction_timeline_finance_select"
  on public.transaction_timeline_events for select to authenticated
  using (public.is_finance_staff());

create policy "transaction_timeline_finance_insert"
  on public.transaction_timeline_events for insert to authenticated
  with check (public.is_finance_staff() or auth.uid() is not null);

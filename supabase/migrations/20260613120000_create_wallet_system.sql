-- Application funding fields
alter table public.loan_applications
  add column if not exists approved_amount numeric(12, 2),
  add column if not exists funded_at timestamptz;

-- Wallet transaction types
create type public.wallet_transaction_type as enum (
  'loan_funding',
  'withdrawal_request',
  'withdrawal_approved',
  'withdrawal_rejected',
  'repayment_received',
  'manual_adjustment',
  'fee_adjustment',
  'system_credit',
  'system_debit'
);

create type public.wallet_transaction_status as enum (
  'pending',
  'completed',
  'failed',
  'cancelled'
);

create type public.withdrawal_method as enum (
  'bank_transfer',
  'debit_card',
  'credit_card',
  'crypto',
  'other'
);

create type public.withdrawal_request_status as enum (
  'pending',
  'approved',
  'rejected',
  'completed'
);

create type public.loan_record_status as enum (
  'active',
  'completed',
  'defaulted'
);

-- Wallets
create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  available_balance numeric(14, 2) not null default 0 check (available_balance >= 0),
  pending_balance numeric(14, 2) not null default 0 check (pending_balance >= 0),
  reserved_balance numeric(14, 2) not null default 0 check (reserved_balance >= 0),
  total_funded numeric(14, 2) not null default 0 check (total_funded >= 0),
  total_withdrawn numeric(14, 2) not null default 0 check (total_withdrawn >= 0),
  total_repaid numeric(14, 2) not null default 0 check (total_repaid >= 0),
  current_loan_exposure numeric(14, 2) not null default 0 check (current_loan_exposure >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Wallet transaction ledger
create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets (id) on delete cascade,
  transaction_type public.wallet_transaction_type not null,
  amount numeric(14, 2) not null check (amount > 0),
  status public.wallet_transaction_status not null default 'pending',
  description text not null,
  reference_number text not null unique,
  application_id uuid references public.loan_applications (id) on delete set null,
  withdrawal_request_id uuid,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Withdrawal requests
create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  withdrawal_method public.withdrawal_method not null,
  destination_details jsonb not null default '{}'::jsonb,
  notes text,
  status public.withdrawal_request_status not null default 'pending',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wallet_transactions
  add constraint wallet_transactions_withdrawal_request_fkey
  foreign key (withdrawal_request_id)
  references public.withdrawal_requests (id)
  on delete set null;

-- Active loans
create table public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null unique references public.loan_applications (id) on delete cascade,
  loan_offer_id uuid references public.loan_offers (id) on delete set null,
  principal_amount numeric(14, 2) not null check (principal_amount > 0),
  interest_rate numeric(6, 3) not null default 0,
  repayment_frequency text not null,
  repayment_period integer not null,
  total_repayment_amount numeric(14, 2) not null,
  remaining_balance numeric(14, 2) not null,
  start_date date not null default current_date,
  maturity_date date,
  status public.loan_record_status not null default 'active',
  funded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notifications
create type public.notification_type as enum (
  'loan_funded',
  'withdrawal_requested',
  'withdrawal_approved',
  'withdrawal_rejected',
  'funding_failed',
  'manual_adjustment',
  'wallet_credit',
  'wallet_debit',
  'application_update',
  'general'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  message text not null,
  type public.notification_type not null default 'general',
  read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index wallets_user_id_idx on public.wallets (user_id);
create index wallet_transactions_wallet_id_idx on public.wallet_transactions (wallet_id);
create index wallet_transactions_application_id_idx on public.wallet_transactions (application_id);
create index wallet_transactions_created_at_idx on public.wallet_transactions (created_at desc);
create index withdrawal_requests_wallet_id_idx on public.withdrawal_requests (wallet_id);
create index withdrawal_requests_user_id_idx on public.withdrawal_requests (user_id);
create index withdrawal_requests_status_idx on public.withdrawal_requests (status);
create index loans_user_id_idx on public.loans (user_id);
create index loans_status_idx on public.loans (status);
create index notifications_user_id_idx on public.notifications (user_id);
create index notifications_read_idx on public.notifications (user_id, read);

-- Updated_at triggers
create trigger wallets_set_updated_at
  before update on public.wallets
  for each row
  execute function public.set_updated_at();

create trigger withdrawal_requests_set_updated_at
  before update on public.withdrawal_requests
  for each row
  execute function public.set_updated_at();

create trigger loans_set_updated_at
  before update on public.loans
  for each row
  execute function public.set_updated_at();

-- Active loan check helper
create or replace function public.user_has_active_loan(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.loan_applications
    where user_id = p_user_id
      and status in ('funded', 'active')
  )
  or exists (
    select 1
    from public.loans
    where user_id = p_user_id
      and status = 'active'
  );
$$;

-- RLS
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.loans enable row level security;
alter table public.notifications enable row level security;

-- Wallet policies: clients see own
create policy "wallets_select_own"
  on public.wallets for select to authenticated
  using (auth.uid() = user_id);

create policy "wallets_finance_select"
  on public.wallets for select to authenticated
  using (public.is_finance_staff());

create policy "wallet_transactions_select_own"
  on public.wallet_transactions for select to authenticated
  using (
    exists (
      select 1 from public.wallets
      where wallets.id = wallet_transactions.wallet_id
        and wallets.user_id = auth.uid()
    )
  );

create policy "wallet_transactions_finance_select"
  on public.wallet_transactions for select to authenticated
  using (public.is_finance_staff());

create policy "wallet_transactions_finance_insert"
  on public.wallet_transactions for insert to authenticated
  with check (public.is_finance_staff());

create policy "withdrawal_requests_select_own"
  on public.withdrawal_requests for select to authenticated
  using (auth.uid() = user_id);

create policy "withdrawal_requests_insert_own"
  on public.withdrawal_requests for insert to authenticated
  with check (auth.uid() = user_id);

create policy "withdrawal_requests_finance_select"
  on public.withdrawal_requests for select to authenticated
  using (public.is_finance_staff());

create policy "withdrawal_requests_finance_update"
  on public.withdrawal_requests for update to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "loans_select_own"
  on public.loans for select to authenticated
  using (auth.uid() = user_id);

create policy "loans_finance_select"
  on public.loans for select to authenticated
  using (public.is_finance_staff());

create policy "loans_finance_insert"
  on public.loans for insert to authenticated
  with check (public.is_finance_staff());

create policy "notifications_select_own"
  on public.notifications for select to authenticated
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Finance can insert notifications (system notifications)
create policy "notifications_finance_insert"
  on public.notifications for insert to authenticated
  with check (public.is_finance_staff());

-- Service inserts for wallet creation (via finance staff or authenticated insert own wallet)
create policy "wallets_insert_own"
  on public.wallets for insert to authenticated
  with check (auth.uid() = user_id);

create policy "wallets_finance_update"
  on public.wallets for update to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "wallets_update_own_withdrawal"
  on public.wallets for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "wallet_transactions_insert_own"
  on public.wallet_transactions for insert to authenticated
  with check (
    exists (
      select 1 from public.wallets
      where wallets.id = wallet_transactions.wallet_id
        and wallets.user_id = auth.uid()
    )
  );

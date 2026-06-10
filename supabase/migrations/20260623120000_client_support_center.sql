-- Client Support & Help Center

alter type public.notification_category add value if not exists 'support';

create type public.support_ticket_category as enum (
  'application_support',
  'loan_status_inquiry',
  'repayment_assistance',
  'payment_verification',
  'withdrawal_issue',
  'document_verification',
  'account_access',
  'security_concern',
  'technical_issue',
  'general_inquiry',
  'other'
);

create type public.support_ticket_priority as enum (
  'low',
  'normal',
  'high',
  'urgent',
  'critical'
);

create type public.support_ticket_status as enum (
  'open',
  'assigned',
  'in_progress',
  'waiting_for_client',
  'escalated',
  'resolved',
  'closed'
);

create type public.support_contact_preference as enum (
  'email',
  'in_app',
  'both'
);

create type public.support_escalation_level as enum (
  'loan_officer',
  'credit_manager',
  'chief_lending_officer'
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  borrower_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid references public.loan_applications (id) on delete set null,
  subject text not null,
  category public.support_ticket_category not null default 'general_inquiry',
  priority public.support_ticket_priority not null default 'normal',
  status public.support_ticket_status not null default 'open',
  description text not null,
  contact_preference public.support_contact_preference not null default 'both',
  assigned_to uuid references auth.users (id) on delete set null,
  assigned_staff_name text,
  escalation_level public.support_escalation_level not null default 'loan_officer',
  escalated_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  last_client_response_at timestamptz,
  last_staff_response_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  sender_id uuid references auth.users (id) on delete set null,
  sender_role text not null check (sender_role in ('client', 'staff', 'system')),
  sender_name text not null,
  message text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.support_ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  message_id uuid references public.support_ticket_messages (id) on delete set null,
  file_name text not null,
  storage_path text not null,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.support_ticket_timeline (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  actor_id uuid references auth.users (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.support_ticket_satisfaction (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references public.support_tickets (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now()
);

create table public.support_knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  title text not null,
  summary text not null,
  content text not null,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index support_tickets_borrower_idx on public.support_tickets (borrower_id);
create index support_tickets_status_idx on public.support_tickets (status);
create index support_tickets_assigned_idx on public.support_tickets (assigned_to);
create index support_tickets_priority_idx on public.support_tickets (priority);
create index support_ticket_messages_ticket_idx on public.support_ticket_messages (ticket_id);
create index support_knowledge_category_idx on public.support_knowledge_articles (category);

create trigger support_tickets_set_updated_at
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
alter table public.support_ticket_attachments enable row level security;
alter table public.support_ticket_timeline enable row level security;
alter table public.support_ticket_satisfaction enable row level security;
alter table public.support_knowledge_articles enable row level security;

create policy "support_tickets_select_own"
  on public.support_tickets for select to authenticated
  using (borrower_id = auth.uid());

create policy "support_tickets_insert_own"
  on public.support_tickets for insert to authenticated
  with check (borrower_id = auth.uid());

create policy "support_tickets_update_own"
  on public.support_tickets for update to authenticated
  using (borrower_id = auth.uid())
  with check (borrower_id = auth.uid());

create policy "support_tickets_finance_select"
  on public.support_tickets for select to authenticated
  using (public.is_finance_staff());

create policy "support_tickets_finance_update"
  on public.support_tickets for update to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "support_messages_select_own"
  on public.support_ticket_messages for select to authenticated
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.borrower_id = auth.uid()
    )
    and is_internal = false
  );

create policy "support_messages_insert_own"
  on public.support_ticket_messages for insert to authenticated
  with check (
    sender_role = 'client'
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.borrower_id = auth.uid()
    )
  );

create policy "support_messages_finance_select"
  on public.support_ticket_messages for select to authenticated
  using (public.is_finance_staff());

create policy "support_messages_finance_insert"
  on public.support_ticket_messages for insert to authenticated
  with check (
    public.is_finance_staff()
    and sender_role in ('staff', 'system')
  );

create policy "support_attachments_select_own"
  on public.support_ticket_attachments for select to authenticated
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.borrower_id = auth.uid()
    )
  );

create policy "support_attachments_insert_own"
  on public.support_ticket_attachments for insert to authenticated
  with check (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.borrower_id = auth.uid()
    )
  );

create policy "support_attachments_finance_all"
  on public.support_ticket_attachments for all to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "support_timeline_select_own"
  on public.support_ticket_timeline for select to authenticated
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.borrower_id = auth.uid()
    )
  );

create policy "support_timeline_finance_all"
  on public.support_ticket_timeline for all to authenticated
  using (public.is_finance_staff())
  with check (public.is_finance_staff());

create policy "support_satisfaction_select_own"
  on public.support_ticket_satisfaction for select to authenticated
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.borrower_id = auth.uid()
    )
  );

create policy "support_satisfaction_insert_own"
  on public.support_ticket_satisfaction for insert to authenticated
  with check (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.borrower_id = auth.uid()
    )
  );

create policy "support_knowledge_select_all"
  on public.support_knowledge_articles for select to authenticated
  using (published = true);

insert into storage.buckets (id, name, public)
values ('support-attachments', 'support-attachments', false)
on conflict (id) do nothing;

drop policy if exists "support_attachments_storage_insert" on storage.objects;
create policy "support_attachments_storage_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'support-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "support_attachments_storage_select_own" on storage.objects;
create policy "support_attachments_storage_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'support-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "support_attachments_storage_finance_select" on storage.objects;
create policy "support_attachments_storage_finance_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'support-attachments'
    and public.is_finance_staff()
  );

-- Seed knowledge base articles
insert into public.support_knowledge_articles (slug, category, title, summary, content, tags, sort_order) values
('getting-started-welcome', 'getting_started', 'Welcome to Orbit Lending', 'Learn how your Orbit Lending client portal works.', 'Your Orbit Lending portal lets you apply for financing, track loan status, manage repayments, view transactions, upload documents, and contact support. Banking infrastructure is powered by Pathward National Bank.', array['welcome','portal'], 1),
('apply-for-financing', 'applying_for_financing', 'How to Apply for Financing', 'Step-by-step guide to submitting a loan application.', 'Browse loan products, complete the application wizard, upload required documents, and submit for review. You can save drafts and return later.', array['application','apply'], 1),
('track-loan-status', 'loan_status_tracking', 'Track Your Loan Status', 'Understand each stage of your application.', 'Applications move through submitted, under review, pre-approved, approved, funded, and completed stages. Check Dashboard and Applications for real-time updates.', array['status','application'], 1),
('make-a-repayment', 'repayments', 'Making a Repayment', 'How to pay installments and submit payment proof.', 'Go to Repayments, select an installment, choose a payment method, and submit. Upload proof if paying outside the platform. Payments are verified by your loan officer.', array['repayment','payment'], 1),
('wallet-overview', 'wallet_management', 'Wallet Management', 'Understand your Orbit wallet balances.', 'Your wallet holds funded loan proceeds and available balance. Withdrawals require loan officer approval. All wallet activity appears in Transactions.', array['wallet','balance'], 1),
('view-transactions', 'transactions', 'Viewing Transactions', 'Your complete financial activity ledger.', 'The Transactions page shows disbursements, repayments, wallet credits, withdrawals, and adjustments with filters and export options.', array['transactions','ledger'], 1),
('upload-documents', 'document_uploads', 'Uploading Documents', 'How to submit required files.', 'Upload documents during application or when requested by your loan officer. Supported formats include PDF, JPG, PNG, and Word. All uploads appear in Documents.', array['documents','upload'], 1),
('account-security', 'account_security', 'Account Security', 'Protect your Orbit Lending account.', 'Use a strong password, monitor login notifications, and contact support immediately if you notice suspicious activity.', array['security','password'], 1),
('contact-support', 'faq', 'Contacting Support', 'How to reach the Orbit support team.', 'Open a support ticket from the Support page. Include your subject, category, and description. Attach documents when helpful. You will receive updates in-app and by email.', array['support','ticket','help'], 1),
('payment-verification-faq', 'faq', 'Payment Verification FAQ', 'Why is my payment pending verification?', 'Manual and bank transfer payments require loan officer verification. Upload clear proof of payment to speed up approval.', array['payment','verification','faq'], 2)
on conflict (slug) do nothing;

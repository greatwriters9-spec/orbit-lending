-- Track when clients last read application message threads

create table if not exists public.application_message_read_states (
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null references public.loan_applications (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (user_id, application_id)
);

create index if not exists application_message_read_states_user_idx
  on public.application_message_read_states (user_id);

alter table public.application_message_read_states enable row level security;

drop policy if exists "message_read_states_select_own" on public.application_message_read_states;
create policy "message_read_states_select_own"
  on public.application_message_read_states for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "message_read_states_upsert_own" on public.application_message_read_states;
create policy "message_read_states_insert_own"
  on public.application_message_read_states for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "message_read_states_update_own" on public.application_message_read_states;
create policy "message_read_states_update_own"
  on public.application_message_read_states for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

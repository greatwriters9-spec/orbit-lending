-- Per-client funding account bank label (e.g. Chase, Pathward National Bank).
alter table public.profiles
  add column if not exists funding_bank_name text;

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_super_admin() then
    return new;
  end if;

  new.role := old.role;
  new.account_status := old.account_status;
  new.account_status_reason := old.account_status_reason;
  new.account_status_changed_at := old.account_status_changed_at;
  new.account_status_changed_by := old.account_status_changed_by;
  new.pathward_account_holder_name := old.pathward_account_holder_name;
  new.pathward_routing_number := old.pathward_routing_number;
  new.pathward_account_number := old.pathward_account_number;
  new.pathward_account_balance := old.pathward_account_balance;
  new.pathward_linked_at := old.pathward_linked_at;
  new.pathward_linked_by := old.pathward_linked_by;
  new.pathward_withdrawable_approved_at := old.pathward_withdrawable_approved_at;
  new.pathward_withdrawable_approved_by := old.pathward_withdrawable_approved_by;
  new.funding_bank_name := old.funding_bank_name;

  return new;
end;
$$;

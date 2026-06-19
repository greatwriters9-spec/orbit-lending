-- Prevent clients from escalating their own role or modifying admin-only profile fields.
-- RLS policies are OR'd, so profiles_update_own must be complemented by this trigger.

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role (no JWT) and super admins may change privileged fields.
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

  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields on public.profiles;

create trigger protect_profile_privileged_fields
  before update on public.profiles
  for each row
  execute function public.protect_profile_privileged_fields();

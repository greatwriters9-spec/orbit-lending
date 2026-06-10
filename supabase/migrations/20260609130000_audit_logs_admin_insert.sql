-- Allow admin staff to write audit logs for product/category management

create policy "audit_logs_admin_insert"
  on public.audit_logs
  for insert
  to authenticated
  with check (public.is_admin_staff() and user_id = auth.uid());

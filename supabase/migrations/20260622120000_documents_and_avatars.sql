-- Profile avatars
alter table public.profiles
  add column if not exists avatar_url text;

-- Document request file URLs
alter table public.application_document_requests
  add column if not exists file_url text;

-- Application documents storage (private)
insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do nothing;

drop policy if exists "application_documents_insert_own" on storage.objects;
create policy "application_documents_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'application-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "application_documents_select_own" on storage.objects;
create policy "application_documents_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'application-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "application_documents_finance_select" on storage.objects;
create policy "application_documents_finance_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'application-documents'
    and public.is_finance_staff()
  );

-- Avatar storage (public read)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_select_public" on storage.objects;
create policy "avatars_select_public"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars');

drop policy if exists "avatars_select_anon" on storage.objects;
create policy "avatars_select_anon"
  on storage.objects for select to anon
  using (bucket_id = 'avatars');

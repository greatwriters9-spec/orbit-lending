-- Public images embedded in admin-composed emails (must be publicly readable by mail clients).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'email-assets',
  'email-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "email_assets_public_read" on storage.objects;
create policy "email_assets_public_read"
  on storage.objects for select
  using (bucket_id = 'email-assets');

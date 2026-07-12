alter table public.application_document_requests
  add column if not exists review_status text not null default 'requested'
  check (review_status in ('requested', 'pending_review', 'approved', 'rejected'));

update public.application_document_requests
set review_status = case
  when fulfilled = true then 'approved'
  when file_url is not null then 'pending_review'
  else 'requested'
end
where review_status = 'requested';

create index if not exists application_document_requests_review_status_idx
  on public.application_document_requests (application_id, review_status);

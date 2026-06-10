-- Allow public (anonymous) read access to active category metadata
-- so the marketing landing page and authenticated product directory
-- display the same category illustrations.

create policy "loan_product_category_meta_public_read"
  on public.loan_product_category_meta
  for select
  to anon
  using (active = true);

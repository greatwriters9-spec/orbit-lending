-- Product directory category metadata (icons, illustrations, ordering)

create table public.loan_product_category_meta (
  category public.loan_product_category primary key,
  label text not null,
  description text not null,
  icon_name text not null default 'Landmark',
  illustration_url text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.loan_product_category_meta enable row level security;

create policy "loan_product_category_meta_select"
  on public.loan_product_category_meta
  for select
  to authenticated
  using (active = true or public.is_admin_staff());

create policy "loan_product_category_meta_admin_all"
  on public.loan_product_category_meta
  for all
  to authenticated
  using (public.is_admin_staff())
  with check (public.is_admin_staff());

insert into public.loan_product_category_meta (
  category,
  label,
  description,
  icon_name,
  sort_order,
  active
)
values
  (
    'personal',
    'Personal Financing',
    'Flexible consumer lending for personal expenses, emergencies, and major life purchases.',
    'Wallet',
    1,
    true
  ),
  (
    'business',
    'Business Financing',
    'Working capital, startup funding, and growth financing for businesses of every size.',
    'Briefcase',
    2,
    true
  ),
  (
    'asset_financing',
    'Asset Financing',
    'Vehicle, equipment, and asset-backed loans with competitive terms.',
    'Truck',
    3,
    true
  ),
  (
    'property',
    'Property Financing',
    'Home mortgages, refinancing, and real estate lending solutions.',
    'Home',
    4,
    true
  ),
  (
    'education',
    'Education Financing',
    'Tuition, training programs, and educational expense financing.',
    'GraduationCap',
    5,
    true
  )
on conflict (category) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'category-illustrations',
  'category-illustrations',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

create policy "category_illustrations_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'category-illustrations');

create policy "category_illustrations_admin_upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'category-illustrations'
    and public.is_admin_staff()
  );

create policy "category_illustrations_admin_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'category-illustrations'
    and public.is_admin_staff()
  )
  with check (
    bucket_id = 'category-illustrations'
    and public.is_admin_staff()
  );

create policy "category_illustrations_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'category-illustrations'
    and public.is_admin_staff()
  );

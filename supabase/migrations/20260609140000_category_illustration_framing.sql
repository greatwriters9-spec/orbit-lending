-- Category illustration pan/zoom framing controls

alter table public.loan_product_category_meta
  add column if not exists illustration_focal_x numeric(5, 2) not null default 50
    check (illustration_focal_x >= 0 and illustration_focal_x <= 100),
  add column if not exists illustration_focal_y numeric(5, 2) not null default 50
    check (illustration_focal_y >= 0 and illustration_focal_y <= 100),
  add column if not exists illustration_scale numeric(5, 2) not null default 100
    check (illustration_scale >= 50 and illustration_scale <= 200);

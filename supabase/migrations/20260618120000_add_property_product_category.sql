-- Add property financing category to loan product enum

alter type public.loan_product_category add value if not exists 'property';

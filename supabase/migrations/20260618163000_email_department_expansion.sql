-- Extend email department enum for underwriting and executive senders.
alter type public.email_department add value if not exists 'underwriting';
alter type public.email_department add value if not exists 'executive';

-- Add no-reply sender address for per-company email branding.
alter table public.companies add column if not exists no_reply_email text;

update public.companies
set no_reply_email = 'noreply@orbittmortgage.com'
where slug = 'orbit' and (no_reply_email is null or no_reply_email = '');

update public.companies
set no_reply_email = 'noreply@oakstonemortgage.com'
where slug = 'oakstone' and (no_reply_email is null or no_reply_email = '');

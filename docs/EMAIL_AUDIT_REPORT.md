# Orbitt Mortgage — Email System Audit Report

**Date:** June 17, 2026  
**Scope:** All transactional and authentication email delivery  
**Verified domain:** `orbittmortgage.com`  
**Primary sender:** `Orbitt Mortgage <support@orbittmortgage.com>`

---

## Executive Summary

The application now routes **all email delivery through Resend** using **React Email branded templates**. Supabase Auth no longer sends default confirmation or password-reset emails from application code paths. A **Send Email Hook** endpoint provides a safety net if Supabase Auth ever triggers its mailer.

| Metric | Before audit | After fix |
|--------|--------------|-----------|
| Auth emails from Supabase defaults | Yes (`signUp`, `resetPasswordForEmail`) | No (Resend + `generateLink`) |
| Unified sender address | No (7 department addresses) | Yes (`support@orbittmortgage.com`) |
| Reply-To header | Missing | `support@orbittmortgage.com` on all sends |
| Fallback plain HTML emails | Yes (notifications without template) | No (`account_notification` template) |
| Magic link template | Missing | Added (`magic_link`) |

---

## 1. Email Inventory

### Authentication (Resend + custom templates)

| Email | Template key | Trigger | Delivery path |
|-------|--------------|---------|---------------|
| Signup confirmation | `verify_email` | Register / onboarding account creation | `lib/auth/resend-auth-delivery.ts` → `sendEmail` |
| Email verified welcome | `welcome` | `/auth/callback` after confirmation | `lib/email/hooks.ts` |
| Password reset | `password_reset` | Forgot password action | `lib/auth/resend-auth-delivery.ts` |
| Magic link sign-in | `magic_link` | Supabase hook only (not used in UI today) | `lib/auth/supabase-auth-email.ts` |
| Security alert (login) | `security_alert` | Successful login | `lib/notifications/service.ts` |

### Mortgage & application (Resend + custom templates)

| Email | Template key | Trigger |
|-------|--------------|---------|
| Application submitted | `application_submitted` | Status change |
| Under review | `application_under_review` | Status change |
| Documents required | `additional_documents_required` | Status change |
| Approved / rejected / on hold | `application_*` | Status change |
| Pre-qualification notice | `pre_qualified_notice` | Onboarding finalize |
| Eligible amount updated | `eligible_amount_updated` | Finance actions |
| Finance message | `account_notification` | New finance message (via notifyUser) |

### Wallet & funding (Resend + custom templates)

| Email | Template key | Trigger |
|-------|--------------|---------|
| Funding account created | `funding_account_created` | Wallet hooks |
| Deposits / escrow / closing | `deposit_*`, `escrow_*`, `funds_released_*`, `mortgage_closed_successfully` | Wallet / admin actions |
| Wallet activity (generic) | `account_notification` | `notifyWalletEvent` |

### Support & admin (Resend + custom templates)

| Email | Template key | Trigger |
|-------|--------------|---------|
| Support ticket updates | `account_notification` | `notifySupportEvent` |
| Repayment events | `account_notification` | `notifyRepaymentEvent` |
| Account status changes | `account_notification` | Admin user actions |
| Admin communication center | Custom / institutional templates | `lib/email/admin-actions.ts` |

---

## 2. Supabase Default Templates — Status

| Path | Previous behavior | Current behavior |
|------|-------------------|------------------|
| `supabase.auth.signUp()` | Supabase sent confirmation | **Removed** — replaced with `admin.generateLink` + Resend |
| `supabase.auth.resetPasswordForEmail()` | Supabase sent reset | **Removed** — replaced with `admin.generateLink` + Resend |
| Magic link / invite / email change | Not used in app | **Hook handler** at `/api/auth/hooks/send-email` if Supabase triggers |

**No application code path invokes Supabase's built-in mailer.**

---

## 3. What Was Fixed

1. **Unified sender** — `lib/email/config.ts` → all emails from `support@orbittmortgage.com` / `Orbitt Mortgage`
2. **Reply-To** — `lib/email/resend-client.ts` adds `reply_to: support@orbittmortgage.com` on every Resend API call
3. **Central Resend client** — single delivery module with dev-domain fallback (non-production only)
4. **Notification fallback** — replaced plain HTML builder with `account_notification` branded template
5. **New templates** — `account_notification`, `magic_link`
6. **Branding** — email header/footer use `Orbitt Mortgage` via `BRAND_DISPLAY_NAME`
7. **Contact emails in templates** — all departments display `support@orbittmortgage.com`
8. **Supabase Auth hook** — `POST /api/auth/hooks/send-email` intercepts any auth email Supabase would send
9. **Legacy `sendTransactionalEmail`** — now delegates to branded `account_notification` template

---

## 4. Code References

### Primary send pipeline

```57:120:lib/email/service.ts
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  // Renders React Email template → deliverResendEmailWithDevFallback
}
```

### Auth signup (no Supabase mailer)

```37:98:lib/auth/resend-auth-delivery.ts
export async function registerUserWithResendVerification(...)
```

### Auth hook safety net

```1:28:app/api/auth/hooks/send-email/route.ts
export async function POST(request: Request) { ... }
```

### Unified sender configuration

```85:104:lib/email/config.ts
export function getBrandedSender() { ... }
export function resolveDepartmentSender() { ... }
```

---

## 5. Environment Variables (Production Checklist)

| Variable | Required | Example |
|----------|----------|---------|
| `RESEND_API_KEY` | Yes | `re_...` |
| `EMAIL_FROM` | Yes | `support@orbittmortgage.com` |
| `EMAIL_NAME` | Yes | `Orbitt Mortgage` |
| `EMAIL_REPLY_TO` | Yes | `support@orbittmortgage.com` |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://www.orbittmortgage.com` |
| `NEXT_PUBLIC_WEBSITE_DOMAIN` | Yes | `www.orbittmortgage.com` |
| `SUPABASE_AUTH_HOOK_SECRET` | Recommended | Random secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | For `generateLink` |

### Supabase Dashboard

1. **Authentication → URL Configuration**
   - Site URL: `https://www.orbittmortgage.com`
   - Redirect URLs: `/auth/callback`, `/auth/callback?next=/reset-password`

2. **Authentication → Hooks → Send Email** (recommended)
   - URL: `https://www.orbittmortgage.com/api/auth/hooks/send-email`
   - Secret: same as `SUPABASE_AUTH_HOOK_SECRET`

3. **Authentication → SMTP** (optional belt-and-suspenders)
   - Host: `smtp.resend.com` | Port: `465` | User: `resend` | Pass: `RESEND_API_KEY`
   - Sender: `Orbitt Mortgage <support@orbittmortgage.com>`
   - Only needed if not using Send Email Hook exclusively

4. **Disable Supabase default templates** when Send Email Hook is enabled (hook replaces them)

---

## 6. Test Plan

| Flow | How to test | Expected result |
|------|-------------|-----------------|
| New registration | Register at `/register` | Branded `verify_email` from `support@orbittmortgage.com` |
| Email verification | Click link in email | Redirect to app; `welcome` email received |
| Password reset | `/forgot-password` | Branded `password_reset` with working token link |
| Magic link | N/A in UI | Hook sends `magic_link` if enabled in Supabase |
| Application status | Finance approves application | Branded status template |
| Support ticket | Staff replies to ticket | Branded `account_notification` |
| Admin send | Admin communications center | Branded institutional template |
| Gmail headers | Show original | `spf=pass`, `dkim=pass`, `from: support@orbittmortgage.com` |

---

## 7. Remaining Manual Steps (Not Code)

These require Vercel / Supabase / Resend dashboard configuration:

- [ ] Set Vercel env vars per section 5
- [ ] Enable Supabase Send Email Hook pointing to production URL
- [ ] Confirm Resend domain `orbittmortgage.com` is verified (SPF, DKIM, DMARC)
- [ ] Register Google Postmaster Tools for domain reputation
- [ ] Send test emails to Gmail, Outlook, and Apple Mail and verify rendering

---

## 8. Success Criteria Mapping

| Criterion | Status |
|-----------|--------|
| Every email from `support@orbittmortgage.com` | ✅ Code-enforced via `getBrandedSender()` |
| Every email uses Orbitt Mortgage template | ✅ All paths use `sendEmail` / React Email |
| No Supabase-branded emails from app | ✅ Auth mailer bypassed + hook safety net |
| Resend delivery | ✅ All sends via Resend API with `reply_to` |
| No business logic / DB changes | ✅ Email infrastructure only |

---

## 9. Files Changed in This Audit

- `lib/email/config.ts` — unified sender, reply-to, brand constants
- `lib/email/resend-client.ts` — central Resend delivery
- `lib/email/service.ts` — uses resend-client
- `lib/email/types.ts` — new template keys
- `lib/email/registry.ts` — template registry + contact emails
- `lib/email/templates/catalog.ts` — `account_notification`, `magic_link`
- `lib/email/react/components/shared.tsx` — Orbitt Mortgage branding
- `lib/notifications/service.ts` — branded fallback notifications
- `lib/notifications/email.ts` — legacy wrapper → branded template
- `lib/auth/supabase-auth-email.ts` — hook handler logic
- `app/api/auth/hooks/send-email/route.ts` — Supabase hook endpoint
- `.env.example` — email configuration documentation

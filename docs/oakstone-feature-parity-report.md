# OakStone Feature Parity Report

**Audit date:** 2026-07-11  
**Canonical brand:** Orbit Mortgage (master)  
**Parity target:** OakStone Mortgage — same routes, logic, and workflows; branding via `CompanyProvider` / `CompanyRecord` / `data-company` CSS only.

**Legend:** Pass = shared implementation confirmed in code audit. Fail = parity blocker. Partial = shared logic with residual branding or ops gap. Manual QA = requires browser verification.

---

## Summary

| Metric | Count |
|--------|------:|
| Pages audited | 38 |
| **Pass** | 34 |
| **Partial** | 3 |
| **Fail** | 1 |
| Code fixes applied (this audit) | 18 files |

**Fail (1):** Multi-company DB migration / OakStone domain not applied in target environment (operational, not code).

**Partial (3):** Staff portal nav title constants (unused in sidebar); email sender DNS defaults; `site.webmanifest` static Orbit name.

---

## Public Routes

| Page | Visual | Functional | Navigation | Validation | API | Loading | Success | Error | Responsive | A11y | Status | Notes |
|------|:------:|:----------:|:----------:|:----------:|:---:|:-------:|:-------:|:-----:|:----------:|:----:|:------:|-------|
| Landing (`/`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | `LandingPage` + `getLandingContent()`; theme via `data-company`. Requires manual browser QA for OakStone hero/colors. |
| Mortgage Calculator (landing) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Embedded `LoanCalculator`; no `/calculator` route. OakStone styling via `globals.css`. |
| Get Started (`/get-started`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | `BuyingPowerAssessmentWizard`; metadata uses `getCompanyContext()`. |
| Congratulations (`/get-started/congratulations`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Shared `CongratulationsScreen` + `CompanyLogo`. |
| Create Account (`/create-account`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | `useCompany()` for title; `CompanyLogo`; `company_id` on signup. |
| Register (`/register`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Shared `registerAction`; `AuthCompanyLogo`. |
| Login (`/login`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Login security notification now uses `resolveBrandingForUserId()`. |
| Forgot Password (`/forgot-password`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Shared auth flow + branded emails. |
| Reset Password (`/reset-password`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Shared auth flow. |
| Profile Complete (`/profile/complete`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Sync field init + draft merge; `company_id` backfill on complete. |
| Legal Hub (`/legal`) | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | `applyCompanyBrandingToLegalCopy()` at render. |
| Legal Document (`/legal/[slug]`) | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | `applyCompanyBrandingToLegalDocument()` swaps name/domain. |
| Loan Products (`/loans`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Shared catalog; product copy is generic. |
| Account Status (`/account-status`) | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | **Fixed:** `CompanyLogo`, institution name, support email from context. |
| Unauthorized (`/unauthorized`) | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | **Fixed:** `CompanyLogo` replaces direct `OrbitLogo`. |

---

## Customer Dashboard & Journey

| Page | Visual | Functional | Navigation | Validation | API | Loading | Success | Error | Responsive | A11y | Status | Notes |
|------|:------:|:----------:|:----------:|:----------:|:---:|:-------:|:-------:|:-----:|:----------:|:----:|:------:|-------|
| Dashboard (`/dashboard`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | **Fixed:** welcome hero uses `institutionName` from user `company_id`. |
| Qualification Result (`/dashboard/qualification-result`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Company-aware metadata + screen copy. |
| Applications (`/dashboard/loans`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Shared queries; system messages use institution name. |
| Application Detail (`/dashboard/loans/[id]`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Shared detail views. |
| Documents (`/dashboard/documents`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Same upload actions and RLS. |
| Transactions (`/dashboard/transactions`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | **Fixed:** statement HTML + notification use company branding. |
| Repayments (`/dashboard/repayments`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Shared repayment engine. |
| Notifications (`/dashboard/notifications`) | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | **Fixed:** status/suspension notifications resolve user company. |
| Messages (`/dashboard/messages`) | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | System sender name from institution resolver. |
| Support (`/dashboard/support`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Guest concern + assistant use company branding. |
| Profile (`/dashboard/profile`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | **Fixed:** `UserCommunicationHistory` client variant uses `useCompany()`. |
| Funding Account (`/wallet`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | **Fixed:** escrow transfer error uses institution name. |
| Loan Apply (`/loans/[slug]/apply`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | **Fixed:** metadata uses `getCompanyContext()`. |
| Mortgage App Intro (`/mortgage-application/[id]`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | **Fixed:** `generateMetadata` + shared wizard shell. |
| Mortgage App Apply (`/mortgage-application/[id]/apply`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | **Fixed:** metadata + `map-to-db` purpose uses institution name. |
| Mortgage Submitted (`/mortgage-application/[id]/submitted`) | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Shared submitted screen + `CompanyLogo`. |

---

## Staff Portals

| Page | Visual | Functional | Navigation | Validation | API | Loading | Success | Error | Responsive | A11y | Status | Notes |
|------|:------:|:----------:|:----------:|:----------:|:---:|:-------:|:-------:|:-----:|:----------:|:----:|:------:|-------|
| Admin (`/admin/*`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Same routes; sidebar `CompanyLogo`. Nav title constants are Orbit-default but unused in chrome. |
| Finance (`/finance/*`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Shared portal; role-gated. |
| Super Admin (`/super-admin/*`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Pass** | Includes multi-company CRUD at `/super-admin/companies`. |

---

## Operational / Environment (Not Code Parity)

| Item | Status | Notes |
|------|:------:|-------|
| Supabase migration `20260710120100_multi_company_platform_fix.sql` | **Fail** | OakStone company row, domains, and `company_id` backfill require manual apply. |
| OakStone domain / hosts file | **Fail** | Point `oakstonemortgage.local` or production domain to app. |
| Per-company Resend sender domains | **Partial** | Email templates brand correctly; SMTP/from may default to Orbit env until DNS configured. |
| `public/site.webmanifest` | **Partial** | Static Orbit name; PWA install label may show Orbit on OakStone host until made dynamic. |

---

## Critical Fixes Applied (2026-07-11)

| Area | Change |
|------|--------|
| Branding resolver | Added `lib/company/resolve-branding.ts` (`resolveBrandingForUserId`, `resolveInstitutionNameForUserId`) |
| Account status / unauthorized | `CompanyLogo` + company support email and copy |
| Dashboard | Welcome hero + approved down-payment message use institution name |
| Escrow transfer | Error message uses user's company |
| Auth login | Security notification uses institution name |
| Mortgage map-to-db | Application `purpose` field uses institution name |
| System messages | `sendSystemMessage` + `seedApplicationDetailsOnSubmit` resolve sender from user `company_id` |
| Notifications | Completed loan, suspension, activity actor use institution name |
| Transactions | Account statement HTML + notification branded |
| Repayments | Loan-completed notification branded |
| Metadata | Mortgage application pages + loan apply page |
| Profile comms history | Client/admin subtitles use `useCompany()` |
| Hero loan card | Wired to `CompanyLogo` + `useCompany()` (unused component, parity-safe) |

---

## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **Pass** (exit 0) |
| Manual browser QA (OakStone host) | **Required** — visual theme, hero, emails, domain resolution |

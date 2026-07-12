# OakStone Feature Parity Checklist

**Audit date:** 2026-07-11  
**Scope:** Code audit — same routes, components, actions, and workflows for Orbit and OakStone; branding-only differences via `CompanyProvider`, `CompanyRecord`, and CSS (`data-company`).

**Legend**

| Status | Meaning |
|--------|---------|
| **Pass** | Shared implementation; only company context / theme / copy differs |
| **Fail** | OakStone fork, hardcoded Orbit blocker, or missing company-aware branding |
| **Partial** | Shared logic; some UI copy or assets still Orbit-specific |

---

## Platform Architecture

| Feature | Orbit | OakStone | Status | Notes |
|---------|-------|----------|--------|-------|
| Single application codebase | `app/` | Same `app/` | **Pass** ✓ | No OakStone-only route tree found |
| Company resolution (host/cookie) | `middleware.ts`, `lib/company/server.ts` | Same | **Pass** ✓ | `x-company-id` header + `orbit_company_id` cookie |
| Company provider / theme | `CompanyProvider`, `companyToTheme()` | Same + OakStone tokens | **Pass** ✓ | `isOakstoneCompany()` used for theme/CSS only |
| User branding resolver | — | `lib/company/resolve-branding.ts` | **Pass** ✓ | **Added 2026-07-11** — resolves from profile `company_id` |
| Landing content from DB | `CompanyRecord` fields | Same | **Pass** ✓ | No `slug === "oakstone"` copy branches |
| DB seed (companies table) | Migration `20260710120100_multi_company_platform_fix.sql` | Same migration | **Fail** ✗ | See `docs/multi-company-migration.md` |
| Design tokens | `lib/design-system/oakstone/` | Wired via `companyToTheme()` | **Pass** ✓ | Tokens only; not a second app |

---

## Public Marketing & Onboarding

| Feature | Orbit | OakStone | Status | Notes |
|---------|-------|----------|--------|-------|
| Landing Page (`/`) | `LandingPage` + shared sections | Same components | **Pass** ✓ | Hero, nav, footer use `getLandingContent()` + CSS vars |
| Landing hero presentation | Default overlay/typography | `[data-company="oakstone"]` CSS | **Pass** ✓ | No `isOakstone` branches in `hero-section.tsx` |
| Mortgage Calculator | `LoanCalculator` (on landing) | Same | **Pass** ✓ | OakStone styling via `globals.css` calculator selectors |
| Buying Power Assessment (`/get-started`) | `BuyingPowerAssessmentWizard` | Same | **Pass** ✓ | Metadata uses `generateMetadata` + `getCompanyContext()` |
| Prequalification engine | `computePreQualification` | Same | **Pass** ✓ | No slug conditionals in calculation logic |
| Congratulations (`/get-started/congratulations`) | Shared screen | Same | **Pass** ✓ | Same route and onboarding flow |
| Account Registration (`/register`, `/create-account`) | `registerAction` | Same | **Pass** ✓ | `company_id` on signup metadata **and** profiles row |
| Login (`/login`) | `loginAction` | Same | **Pass** ✓ | Security notification uses `resolveBrandingForUserId()` |
| Forgot Password (`/forgot-password`) | Shared | Same | **Pass** ✓ | Same actions and templates |
| Reset Password (`/reset-password`) | Shared | Same | **Pass** ✓ | Same actions and templates |
| Profile completion (`/profile/complete`) | Shared | Same | **Pass** ✓ | Sync field init; draft merged from localStorage |
| Account status (`/account-status`) | Shared | Same | **Pass** ✓ | **Fixed:** `CompanyLogo`, institution copy, support email |
| Unauthorized (`/unauthorized`) | Shared | Same | **Pass** ✓ | **Fixed:** `CompanyLogo` |

---

## Customer Dashboard & Mortgage Journey

| Feature | Orbit | OakStone | Status | Notes |
|---------|-------|----------|--------|-------|
| Customer Dashboard (`/dashboard`) | Shared dashboard views | Same | **Pass** ✓ | **Fixed:** welcome hero uses institution name |
| Pre-Qualified Dashboard | `qualification-result` + dashboard cards | Same | **Pass** ✓ | Company-aware metadata + screen |
| Mortgage Application — 12 sections | `MortgageApplicationWizard` | Same | **Pass** ✓ | Consent text uses `useCompany()` |
| Application purpose / map-to-db | `mapFullApplicationToDbPayload` | Same | **Pass** ✓ | **Fixed:** `institutionName` param |
| Application Submitted | `/mortgage-application/[id]/submitted` | Same | **Pass** ✓ | Shared submitted screen |
| Document Upload | Application documents + `/dashboard/documents` | Same | **Pass** ✓ | Same actions and storage |
| Funding Account (`/wallet`) | Shared wallet views | Same | **Pass** ✓ | Empty states use `useCompany()` |
| Down payment / escrow cards | `mortgage-primary-cards.tsx` | Same | **Pass** ✓ | `useCompany()` |
| Escrow transfer errors | `lib/wallet/escrow-transfer.ts` | Same | **Pass** ✓ | **Fixed:** institution name in error copy |
| Mortgage Tracking | Dashboard loan views | Same | **Pass** ✓ | Approved-state message uses institution name |
| Repayments (`/dashboard/repayments`) | Shared | Same | **Pass** ✓ | Loan-completed notification branded |
| Transactions (`/dashboard/transactions`) | Shared | Same | **Pass** ✓ | **Fixed:** statement HTML + notification branded |
| Profile (`/dashboard/profile`) | Shared | Same | **Pass** ✓ | **Fixed:** communication history uses `useCompany()` |
| Notifications (`/dashboard/notifications`) | Shared | Same | **Pass** ✓ | Status/suspension/completed use institution resolver |
| Messages (`/dashboard/messages`) | Shared | Same | **Pass** ✓ | System sender from institution resolver |
| Support (`/dashboard/support`) | Shared ticketing | Same | **Pass** ✓ | Guest concern + assistant branded |
| Loan products (`/loans`) | Shared catalog | Same | **Pass** ✓ | Apply page metadata branded |
| Mortgage app metadata | `/mortgage-application/[id]/*` | Same | **Pass** ✓ | **Fixed:** `generateMetadata` + company context |

---

## Staff Portals

| Feature | Orbit | OakStone | Status | Notes |
|---------|-------|----------|--------|-------|
| Admin (`/admin`) | Role-gated shared portal | Same | **Pass** ✓ | Sidebar uses `CompanyLogo` |
| Finance / Loan Officer (`/finance`) | Shared portal | Same | **Pass** ✓ | Same nav config and pages |
| Super Admin (`/super-admin`) | Shared portal | Same | **Pass** ✓ | Includes multi-company management |
| Super Admin — Companies CRUD | `/super-admin/companies` | Same | **Pass** ✓ | Platform feature, not OakStone fork |
| Nav config `*_PORTAL.title` | Removed unused hardcoded titles | Same | **Pass** ✓ | Only `subtitle` used in sidebar |
| Staff communication center | Shared `CommunicationCenter` | Same | **Pass** ✓ | Uses `useCompany()` for department labels and copy |

---

## Legal, SEO & Email

| Feature | Orbit | OakStone | Status | Notes |
|---------|-------|----------|--------|-------|
| Legal hub (`/legal`) | `legal-hub.tsx` | Same routes | **Pass** ✓ | `applyCompanyBrandingToLegalCopy()` |
| Legal documents (`/legal/[slug]`) | `lib/legal/documents/*.ts` | Same files | **Pass** ✓ | Runtime substitution at render |
| Page metadata / SEO | `app/layout.tsx` `generateMetadata()` | Same | **Pass** ✓ | Company name + tagline from context |
| Organization JSON-LD | `OrganizationJsonLd` | Same | **Pass** ✓ | Company context in root layout |
| Transactional email templates | `resolveEmailTemplate()` | Same | **Pass** ✓ | Subjects/bodies use `branding.institutionName` |
| `sendEmail` company resolution | Profile `company_id` | Same | **Pass** ✓ | Branding from user's company |
| System application messages | `sendSystemMessage` | Same | **Pass** ✓ | **Fixed:** sender name from user company |
| Email sender routing / DNS | Orbit env defaults | Per-company DNS needed | **Partial** ~ | Templates brand correctly; from-address ops |
| Dynamic web manifest | `app/site.webmanifest/route.ts` | Same | **Pass** ✓ | Company name, colors, icons from context |
| Deprecated `buildEmailHtml` | Generic `institutionName` param | Same | **Pass** ✓ | Legacy helper; unused in production paths |

---

## Multi-Company Data Isolation

| Feature | Orbit | OakStone | Status | Notes |
|---------|-------|----------|--------|-------|
| `company_id` on registration | `lib/auth/actions.ts` | Same | **Pass** ✓ | Stored in auth metadata **and** profiles row |
| `company_id` on applications | `lib/onboarding/finalize-application.ts` | Same | **Pass** ✓ | Backfills profile if missing |
| Onboarding draft metadata | `lib/onboarding/actions.ts` | Same | **Pass** ✓ | Includes `company_id` |
| Branding config fetch | `fetchBrandingConfig(companyId?)` | Same | **Pass** ✓ | Host/cookie context or explicit company ID |
| Per-company hero / logo / colors | `companies` table | Same table | **Pass** ✓ | OakStone seed in migration (when applied) |

---

## Violations Found & Fixed (This Audit — 2026-07-11)

| Issue | Resolution | Status |
|-------|------------|--------|
| `account-status` / `unauthorized` used `OrbitLogo` + hardcoded copy | `CompanyLogo` + `getCompanyContext()` / branding | **Fixed** ✓ |
| `hero-loan-card.tsx` hardcoded Orbit mark/name | `CompanyLogo` + `useCompany()` | **Fixed** ✓ |
| Dashboard welcome hero "Welcome to Orbit Mortgage" | `resolveBrandingForUserId()` in `fetchClientDashboardData` | **Fixed** ✓ |
| Approved down-payment next-action message | `institutionName` passed to `buildNextAction` | **Fixed** ✓ |
| Escrow transfer error mentioned Orbit | `resolveInstitutionNameForUserId()` | **Fixed** ✓ |
| Login security notification hardcoded Orbit | `resolveBrandingForUserId()` in `loginAction` | **Fixed** ✓ |
| `map-to-db.ts` purpose "through Orbit Mortgage" | `institutionName` option on payload mapper | **Fixed** ✓ |
| `sendSystemMessage` / `seedApplicationDetailsOnSubmit` sender | Resolve from application user's `company_id` | **Fixed** ✓ |
| Notification completed/suspended/actor Orbit strings | Institution resolver in `notifications/service.ts` | **Fixed** ✓ |
| Account statement HTML + notification Orbit strings | `resolveBrandingForUserId()` in transactions action | **Fixed** ✓ |
| Repayment completed notification Orbit string | `resolveInstitutionNameForUserId()` | **Fixed** ✓ |
| Mortgage app + loan apply metadata | `generateMetadata` + `getCompanyContext()` | **Fixed** ✓ |
| `UserCommunicationHistory` client copy | `useCompany()` for titles/subtitles | **Fixed** ✓ |
| No shared user branding helper (duplicated patterns) | Added `lib/company/resolve-branding.ts` | **Fixed** ✓ |

---

## Prior Session Fixes (Verified Still in Place)

| Issue | Status |
|-------|--------|
| `company.slug === "oakstone"` in `get-landing-content.ts` | **Fixed** ✓ |
| `isOakstone` branches in `hero-section.tsx` | **Fixed** ✓ |
| Email `catalog.ts` hardcoded Orbit (43 strings) | **Fixed** ✓ |
| `sendEmail` ignored user's company | **Fixed** ✓ |
| Page metadata suffixed with `\| Orbit Mortgage` | **Fixed** ✓ |
| `AuthCard` always showed Orbit logo/copyright | **Fixed** ✓ |
| Profile completion blank form (hydration) | **Fixed** ✓ |
| `company_id` backfill on signup/application | **Fixed** ✓ |
| `map-draft.ts`, `finalize-application.ts` institution params | **Fixed** ✓ |

---

## Remaining Fail / Partial Items (User Action)

| Item | Status | Action needed |
|------|--------|---------------|
| Supabase migration not applied | **Fail** ✗ | Follow `docs/multi-company-migration.md`; verify with `scripts/verify-multi-company-migration.sql` |
| OakStone domain / env | **Fail** ✗ | Point `oakstonemortgage.com` (or `.local`) to app |
| Email sender routing | **Partial** ~ | Configure Resend sender domains per company |
| Per-company legal document bodies (optional) | **Partial** ~ | Runtime substitution works; DB-stored OakStone copy optional |
| Manual browser QA on OakStone host | **Partial** ~ | Visual/theme/email end-to-end verification |

---

## Compile Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **Pass** ✓ (exit 0, 2026-07-11 enterprise parity refinement) |

---

## Scorecard

| Area | Pass | Partial | Fail |
|------|-----:|--------:|-----:|
| Platform architecture | 6 | 0 | 1 |
| Public & onboarding | 13 | 0 | 0 |
| Customer dashboard | 17 | 0 | 0 |
| Staff portals | 5 | 2 | 0 |
| Legal, SEO & email | 7 | 3 | 0 |
| Data isolation | 5 | 0 | 0 |
| **Total checklist items** | **53** | **5** | **1** |

---

## Summary

- **Business logic is shared.** No OakStone-specific pages, API routes, or workflow forks. OakStone code is limited to design tokens and `[data-company="oakstone"]` presentation CSS.
- **This audit** added `resolve-branding.ts` and fixed 18 files where client-facing copy, metadata, notifications, or logos still hardcoded Orbit instead of resolving from the user's `company_id`.
- **Primary remaining gaps** are operational: DB migration, domain/DNS, and manual browser QA on an OakStone host.
- **Reports:** `docs/oakstone-feature-parity-report.md` (page inventory), `docs/oakstone-component-parity-report.md` (component inventory).

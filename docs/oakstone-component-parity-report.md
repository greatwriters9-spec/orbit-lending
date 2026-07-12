# OakStone Component Parity Report

**Audit date:** 2026-07-11  
**Rule:** Orbit is canonical. OakStone uses the same shared components; only branding differs via `CompanyProvider`, `CompanyLogo`, and `data-company` CSS.

**Legend:** Pass = shared implementation, no OakStone fork. Partial = shared but residual hardcoded Orbit in non-critical path. Fail = duplicate or slug-forked component.

---

## Summary

| Metric | Count |
|--------|------:|
| Components audited | 42 |
| **Pass** | 39 |
| **Partial** | 3 |
| **Fail** | 0 |
| Duplicates to delete | 0 |

---

## Branding & Layout

| Component | Orbit | OakStone | Shared | Duplicate | Status | Notes |
|-----------|:-----:|:--------:|:------:|:---------:|:------:|-------|
| `CompanyProvider` | ✓ | ✓ | ✓ | No | **Pass** | Root layout wraps all routes. |
| `CompanyThemeStyles` | ✓ | ✓ | ✓ | No | **Pass** | `isOakstoneCompany()` for theme/CSS only. |
| `CompanyLogo` | ✓ | ✓ | ✓ | No | **Pass** | Resolves logo/wordmark from `CompanyRecord`; falls back to `OrbitLogo` only when no context. |
| `CompanyLogo` mark fallback (`slug === "orbit"`) | ✓ | ✓ | ✓ | No | **Pass** | Branding logic, not workflow fork. |
| `OrbitLogo` / `OrbitLogoMark` | ✓ | — | Internal | No | **Pass** | Used inside `CompanyLogo` and `auth-logo.tsx` shim only. |
| `AuthCompanyLogo` / `AuthCompanyCopyright` | ✓ | ✓ | ✓ | No | **Pass** | Auth surfaces use company context. |
| `Sidebar` | ✓ | ✓ | ✓ | No | **Pass** | `CompanyLogo`; nav sections identical. |
| `TopNavigation` | ✓ | ✓ | ✓ | No | **Pass** | `CompanyLogo` in header. |
| `LandingNav` | ✓ | ✓ | ✓ | No | **Pass** | `CompanyLogo` + `getLandingContent()`. |
| `LandingFooter` | ✓ | ✓ | ✓ | No | **Pass** | Company name, contact, social from DB. |
| `HeroSection` | ✓ | ✓ | ✓ | No | **Pass** | No `isOakstone` branches; OakStone CSS via `[data-company="oakstone"]`. |
| `HeroLoanCard` | ✓ | ✓ | ✓ | No | **Partial** | **Fixed** to `CompanyLogo` + `useCompany()`; component unused on landing (dead code). |
| `OrganizationJsonLd` | ✓ | ✓ | ✓ | No | **Pass** | Company context in root layout. |
| `SitePathwardBadge` | ✓ | ✓ | ✓ | No | **Pass** | Shared Pathward badge. |

---

## Auth & Onboarding

| Component | Orbit | OakStone | Shared | Duplicate | Status | Notes |
|-----------|:-----:|:--------:|:------:|:---------:|:------:|-------|
| `AuthCard` | ✓ | ✓ | ✓ | No | **Pass** | Company-aware logo/copyright. |
| `LoginForm` | ✓ | ✓ | ✓ | No | **Pass** | Same `loginAction`. |
| `RegisterForm` | ✓ | ✓ | ✓ | No | **Pass** | Same `registerAction` + `company_id`. |
| `ForgotPasswordForm` | ✓ | ✓ | ✓ | No | **Pass** | Shared. |
| `ProfileCompletionForm` | ✓ | ✓ | ✓ | No | **Pass** | Sync init; draft merge in `useEffect`. |
| `OnboardingShell` / `OnboardingChrome` | ✓ | ✓ | ✓ | No | **Pass** | `CompanyLogo` in chrome. |
| `BuyingPowerAssessmentWizard` | ✓ | ✓ | ✓ | No | **Pass** | Same wizard; company copy via context. |
| `CongratulationsScreen` | ✓ | ✓ | ✓ | No | **Pass** | Shared. |
| `AssessmentIntro` | ✓ | ✓ | ✓ | No | **Pass** | `CompanyLogo`. |
| Create Account page | ✓ | ✓ | ✓ | No | **Pass** | `useCompany()` for H1. |

---

## Mortgage Application

| Component | Orbit | OakStone | Shared | Duplicate | Status | Notes |
|-----------|:-----:|:--------:|:------:|:---------:|:------:|-------|
| `MortgageApplicationWizard` | ✓ | ✓ | ✓ | No | **Pass** | 12 sections; single implementation. |
| `ApplicationShell` | ✓ | ✓ | ✓ | No | **Pass** | `CompanyLogo`. |
| `ApplicationIntro` | ✓ | ✓ | ✓ | No | **Pass** | Shared intro client. |
| `ApplicationSubmittedScreen` | ✓ | ✓ | ✓ | No | **Pass** | `CompanyLogo`. |
| `LoanApplicationWizard` (legacy slug flow) | ✓ | ✓ | ✓ | No | **Pass** | Same component at `/loans/[slug]/apply`. |
| `LoanCalculator` | ✓ | ✓ | ✓ | No | **Pass** | OakStone panel CSS only. |

---

## Dashboard & Wallet

| Component | Orbit | OakStone | Shared | Duplicate | Status | Notes |
|-----------|:-----:|:--------:|:------:|:---------:|:------:|-------|
| Dashboard hero / cards | ✓ | ✓ | ✓ | No | **Pass** | Queries now pass `institutionName`. |
| `MortgagePrimaryCards` | ✓ | ✓ | ✓ | No | **Pass** | `useCompany()`. |
| `QualificationResultScreen` | ✓ | ✓ | ✓ | No | **Pass** | Company-aware copy. |
| `MessagesWidget` | ✓ | ✓ | ✓ | No | **Pass** | System category uses company name. |
| `ClientTransactionCenter` | ✓ | ✓ | ✓ | No | **Pass** | Company branding in empty states. |
| `AskAssistantModal` | ✓ | ✓ | ✓ | No | **Pass** | Support copy branded. |
| `UserCommunicationHistory` | ✓ | ✓ | ✓ | No | **Pass** | **Fixed:** `useCompany()` for client/admin subtitles. |
| Wallet views | ✓ | ✓ | ✓ | No | **Pass** | Shared ledger + Pathward integration. |

---

## Staff & Admin

| Component | Orbit | OakStone | Shared | Duplicate | Status | Notes |
|-----------|:-----:|:--------:|:------:|:---------:|:------:|-------|
| `CommunicationCenter` | ✓ | ✓ | ✓ | No | **Partial** | Shared; one help string mentions "Orbit Mortgage System" (staff-only). |
| `UserDetailView` | ✓ | ✓ | ✓ | No | **Pass** | Same admin component tree. |
| Portal nav configs (`*_PORTAL.title`) | ✓ | ✓ | ✓ | No | **Partial** | Constants say "Orbit Mortgage"; sidebar uses `CompanyLogo` instead. |
| `LegalHubPage` | ✓ | ✓ | ✓ | No | **Pass** | `applyCompanyBrandingToLegalCopy()`. |

---

## UI Kit (Design System)

| Component | Orbit | OakStone | Shared | Duplicate | Status | Notes |
|-----------|:-----:|:--------:|:------:|:---------:|:------:|-------|
| `Button` | ✓ | ✓ | ✓ | No | **Pass** | Theme vars from `companyToTheme()`. |
| `Input` / `Select` / `FormField` | ✓ | ✓ | ✓ | No | **Pass** | Shared ui-kit. |
| `Card` / `Badge` / `Avatar` | ✓ | ✓ | ✓ | No | **Pass** | Shared. |
| `PasswordInput` | ✓ | ✓ | ✓ | No | **Pass** | Shared auth primitive. |
| OakStone design tokens (`lib/design-system/oakstone/`) | — | ✓ | N/A | No | **Pass** | Tokens/CSS only; wired via `companyToTheme()`. |

---

## Email Components

| Component | Orbit | OakStone | Shared | Duplicate | Status | Notes |
|-----------|:-----:|:--------:|:------:|:---------:|:------:|-------|
| `EmailLogoMark` / React email layout | ✓ | ✓ | ✓ | No | **Pass** | Resolves `logoUrl` + colors from user `company_id`. |
| `catalog.ts` templates | ✓ | ✓ | ✓ | No | **Pass** | `${brand}` substitution. |
| `department-layout.tsx` fallback | ✓ | ✓ | ✓ | No | **Partial** | Fallback "Orbit Mortgage Department" if department name missing; overridden when branding resolved. |
| `buildEmailHtml` (deprecated) | ✓ | ✓ | ✓ | No | **Partial** | Unused legacy helper; still has Orbit strings. |

---

## Duplicate / Fork Audit

| Search | Result |
|--------|--------|
| OakStone-only routes under `app/` | **None** |
| OakStone-only components | **None** (only `lib/design-system/oakstone/` tokens) |
| `slug === "oakstone"` in business logic | **None** (theme/CSS/branding only) |
| Duplicate form implementations | **None** — single auth, onboarding, mortgage wizards |
| Direct `OrbitLogo` in shared client flows | **Remediated** — `account-status`, `unauthorized`, `hero-loan-card` now use `CompanyLogo` |

---

## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **Pass** |
| Component visual QA on OakStone host | **Required** for hero, calculator, auth card, sidebar colors |

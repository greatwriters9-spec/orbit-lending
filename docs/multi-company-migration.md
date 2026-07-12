# Multi-Company Migration Guide

This guide applies the **multi-company platform** database changes so Orbit and OakStone share one schema with per-company branding and data isolation.

## Which file to run

Use **`supabase/migrations/20260710120100_multi_company_platform_fix.sql`**.

It is **idempotent** — safe to run even if an earlier attempt partially applied or failed. Do **not** run the older `20260710120000_multi_company_platform.sql` if the fix migration is available; the fix file covers repair and backfill.

## Option A — Supabase SQL Editor (recommended)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Click **New query**.
3. Open `supabase/migrations/20260710120100_multi_company_platform_fix.sql` in this repo and **copy the entire file**.
4. Paste into the SQL Editor and click **Run**.
5. Confirm success (no red errors). Warnings about `duplicate_object` or existing policies are OK — the script handles them.
6. Run verification: copy `scripts/verify-multi-company-migration.sql` into a new query and run it. All checks should match the comments in that file.

## Option B — Supabase CLI

Prerequisites: [Supabase CLI](https://supabase.com/docs/guides/cli) installed and project linked.

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

If `db push` fails because migrations were applied manually:

```bash
npx supabase migration repair --status applied 20260710120100
```

## What the migration does

| Step | Description |
|------|-------------|
| Creates `companies` table | Stores branding, contact info, hero copy, department defaults |
| Seeds Orbit + OakStone | Fixed UUIDs for stable references |
| Adds `company_id` | On profiles, loan_applications, loan_products, notifications, wallets, etc. |
| Backfills existing rows | Existing data assigned to Orbit |
| RLS helpers | `auth_user_company_id()`, `can_access_company()`, `resolve_company_id_by_host()` |
| Updates `handle_new_user` | Sets `company_id` from signup metadata (fallback Orbit) |
| Finance staff policies | Scoped to same company as the application/profile |

## Company UUIDs (reference)

| Company | UUID |
|---------|------|
| Orbit Mortgage | `a1000000-0000-4000-8000-000000000001` |
| OakStone Mortgage | `a1000000-0000-4000-8000-000000000002` |

## Local OakStone preview

Add to `C:\Windows\System32\drivers\etc\hosts` (as Administrator):

```
127.0.0.1 oakstonemortgage.local
```

Then visit: **http://oakstonemortgage.local:3000**

Orbit remains: **http://localhost:3000** or **http://127.0.0.1:3000**

**Important (dev only):** `next.config.ts` includes `allowedDevOrigins: ['oakstonemortgage.local']` so client JavaScript and HMR work on the custom host. Restart `npm run dev` after changing hosts or config — otherwise buttons (e.g. Start Assessment) will not respond on OakStone.

Restart the dev server after changing hosts or env.

## After migration — smoke test

On **each** host (Orbit + OakStone):

1. `/get-started` → complete assessment → congratulations
2. `/create-account` → register → login
3. `/profile/complete` → form visible → confirm details
4. `/dashboard` → pre-qualified state
5. Start mortgage application from dashboard

OakStone users should have `profiles.company_id = a1000000-…0002`. Orbit users should have `…0001`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| "Company assignment is missing for this account" | Re-run fix migration; ensure `profiles.company_id` is NOT NULL |
| OakStone shows Orbit branding | Check hosts file; hard refresh; confirm `companies` row for `oakstone` |
| `companies` table does not exist | Migration not applied — run Option A |
| `handle_new_user` still omits company_id | Re-run fix migration (replaces trigger function) |
| RLS errors for finance staff | Ensure `can_access_company` exists; staff profile must have matching `company_id` |

## Verification script

`scripts/verify-multi-company-migration.sql` — run in SQL Editor after migration to confirm tables, seeds, backfill, and host resolution.

## Email (optional, post-migration)

Transactional emails brand from the user's `company_id`. Per-company **from-address** domains still require Resend DNS setup per company — templates work before DNS is configured.

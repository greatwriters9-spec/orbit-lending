# Orbit Lending Platform

Next.js client and staff portal for loan applications, wallet, repayments, documents, and support.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Database & Auth:** Supabase (Postgres + RLS)
- **Email:** Resend
- **Hosting:** Vercel (recommended)

## Local development

```bash
cd loan-platform
npm install
cp .env.example .env.local
# Fill in Supabase and Resend values in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database setup

1. Create a Supabase project.
2. Apply migrations in order from `supabase/migrations/`.
3. Seed loan products:

```bash
npm run seed:loan-products
```

4. Create staff users locally (optional, dev only):

```bash
npm run seed:dev-users
npm run seed:finance-officer
```

Configure Supabase Auth redirect URLs to include `http://localhost:3000/auth/callback`.

## Environment variables

See [`.env.example`](./.env.example). Required for production:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin operations |
| `NEXT_PUBLIC_APP_URL` | Production site URL (email links) |
| `RESEND_API_KEY` | Transactional email |
| `EMAIL_FROM` | Verified sender address |
| `CRON_SECRET` | Protects repayment reminder cron |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Deployment (Vercel)

1. Set **Root Directory** to `.` (repository root — do not use `loan-platform`).
2. Add all environment variables from `.env.example`.
3. Apply Supabase migrations to the production project.
4. Run `npm run seed:loan-products` against production (one-time).
5. Configure Supabase Auth:
   - Site URL: your production domain
   - Redirect URLs: `https://your-domain.com/auth/callback`
6. Verify your Resend sending domain.
7. Deploy — `vercel.json` schedules daily repayment reminders at 08:00 UTC.

### Post-deploy checks

- [ ] Register / login / logout
- [ ] Client dashboard, loan application, documents upload
- [ ] Finance portal application review
- [ ] Email delivery (password reset, notifications)
- [ ] Cron route returns 401 without `Authorization: Bearer $CRON_SECRET`
- [ ] File uploads (avatars, documents, repayment proofs)

## Project structure

```
app/           Next.js routes (client, finance, admin portals)
components/    UI and feature components
lib/           Server logic, queries, actions
supabase/      SQL migrations
types/         Shared TypeScript types
```

## Incomplete areas

Admin, finance, and super-admin routes for **reports**, **messages**, and **profile** still show a placeholder until those modules are built. Client-facing features (dashboard, loans, wallet, repayments, transactions, documents, support) are implemented.

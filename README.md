# ClearCheck

A compliance scanner for Nigerian businesses navigating the Nigeria Data
Protection Act (NDPA) 2023 and GAID 2025. Users answer a short questionnaire,
get a DCPMI risk classification, pay for a document pack, and receive
AI-generated Privacy Policy, RoPA, DPIA, Breach Response Plan, and DPO
Appointment Letter documents — tracked against a compliance calendar with
email reminders.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Prisma + PostgreSQL
(Supabase) · Supabase Auth (Google OAuth) · Claude API (document generation) ·
Paystack (payments + webhook) · Resend (email reminders) · jsPDF (document
export) · Vercel Cron (scheduled reminders)

## Setup

```bash
npm install
cp .env.example .env.local   # fill in real keys, see below
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Pushing to GitHub

This folder already has a git repository initialized with one commit (run
`git log` to confirm) — there's no need to run `git init` again. GitHub's
web "Add file → Upload files" button does **not** accept `.zip` archives;
upload the extracted folder's contents that way only if you must use the
browser, but the reliable path is pushing with git directly:

```bash
# 1. Create a new EMPTY repository on github.com first
#    (do not initialize it with a README, .gitignore, or license)

# 2. From inside this extracted folder:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

That's it — no `git init`, no `git add`, no `git commit` needed, those are
already done. If `git remote add origin` fails with "remote origin already
exists" (e.g. you're retrying), run `git remote set-url origin <url>`
instead.

### Required environment variables

See `.env.example` for the full list with comments. Summary:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase Postgres connection string |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Auth (Google OAuth) |
| `ANTHROPIC_API_KEY` | Document generation via Claude |
| `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Payments — use **test** keys first |
| `RESEND_API_KEY` | Compliance deadline email reminders |
| `CRON_SECRET` | Protects the reminder cron route from public triggering |
| `NEXT_PUBLIC_APP_URL` | Used to build the Paystack callback URL |

### Paystack webhook setup

In your Paystack dashboard: **Settings -> API Keys & Webhooks -> Webhook URL**,
set it to `https://yourdomain.com/api/webhooks/paystack`. This is the backstop
that activates a subscription even if the user closes the tab before the
checkout redirect completes — the redirect path
(`/onboarding/checkout/callback`) is the primary path, the webhook is the
safety net. Both call the same idempotent `activateSubscriptionForBusiness()`
helper, so there's no double-charging or double-seeding of compliance tasks
if both fire for the same payment.

### Vercel Cron setup

`vercel.json` schedules `/api/cron/send-reminders` to run daily at 07:00 UTC.
Vercel automatically sends `CRON_SECRET` as a Bearer token when deployed —
set the same value in your Vercel project's environment variables.

## User flow

1. `/` — landing page (radar/scanner themed), including an in-page pricing
   section (`#pricing`) with one-time pack vs. annual coverage, prices pulled
   live from `src/lib/paystack.ts` so they can't drift out of sync with what
   Paystack actually charges
2. `/onboarding` — questionnaire (industry, employee count, data subject
   volume, sensitive/children's data, international transfer, ICT service flag)
3. `/onboarding/scanning` — animated transition while the risk score is
   "calculated" (purely cosmetic delay, real calculation is instant)
4. `/onboarding/result` — DCPMI tier, exposure gauge, required actions,
   recommended documents
5. `/onboarding/checkout` — collects email, creates the `Business` record,
   starts a Paystack transaction
6. `/onboarding/checkout/callback` — verifies payment, then shows a
   "Continue with Google" prompt. The dashboard ownership check matches the
   signed-in Google account's email against the Prisma `User` record created
   at checkout — so the person needs to pick the matching Google account.
7. `/login` — Google OAuth sign in (also reachable directly, not just post-checkout)
8. `/dashboard` — generate/view/regenerate documents, download as PDF, view
   compliance calendar. Requires auth; auto-resolves to the user's most
   recent business if no `businessId` is in the URL.

## Auth model

Supabase Auth with **Google OAuth** handles sessions; ownership is checked by
matching the signed-in Google account's email against the Prisma `User.email`
field — there's no foreign key between the two systems, just an email match.
This means:

- A user **must** sign in with the Google account whose email matches the
  one they used at checkout for the ownership check to pass.
- If a user pays with one email and signs in with a different Google
  account, the dashboard will show "No business found on this Google
  account" rather than someone else's data — but there's currently no
  account-recovery flow for this edge case (e.g. linking a second email).
  Worth adding before scaling past a handful of users.

### Setting up Google OAuth (required — not just an env var)

Unlike the other integrations, this needs configuration in two external
dashboards before it'll work:

1. **Google Cloud Console** → APIs & Services → Credentials → Create OAuth
   client ID (type: Web application). Add your Supabase callback URL as an
   authorized redirect URI — it looks like
   `https://<your-project>.supabase.co/auth/v1/callback`.
2. **Supabase Dashboard** → Authentication → Providers → Google → paste in
   the Client ID and Client Secret from step 1, and enable the provider.
3. No separate env var is needed in this app — `NEXT_PUBLIC_SUPABASE_URL`
   and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are enough, since the OAuth
   credentials live in Supabase's config, not in this codebase.

## What's been built (complete)

- Risk-scoring engine grounded in verified NDPC/GAID thresholds
- Pricing page with prices imported live from `src/lib/paystack.ts`
- Claude API document generation (5 document types) with regeneration +
  versioning
- Paystack checkout + webhook (signature-verified) + callback redirect,
  both paths idempotent
- Supabase Google OAuth with middleware session refresh and ownership
  checks
- PDF export via a custom lightweight Markdown renderer (no extra heavy
  dependencies)
- Compliance calendar seeded automatically on payment confirmation
- Resend email reminders via Vercel Cron, 14-day lookahead window,
  notify-once guard
- Full visual redesign: radar/scanner aesthetic (Space Grotesk + JetBrains
  Mono + teal-on-void palette), applied consistently across landing,
  questionnaire, scanning transition, result, checkout, dashboard

## Still not verified — no network access in the build sandbox

This was built in a sandboxed environment with **no network access**, so
`npm install`, `npx prisma generate`, the dev server, and a production build
have never actually been run. Before deploying:

1. `npm install` — fix any dependency-resolution issues
2. `npx tsc --noEmit` — fix any type errors (some are likely, see below)
3. `npx prisma generate` && `npx prisma migrate dev` against a real Supabase
   instance
4. `npm run dev` — manually click through the entire flow above
5. Test Paystack with **test mode** keys end-to-end, including the webhook
   (use Paystack's webhook testing tool or `ngrok` to expose localhost)
6. Test the Google OAuth flow with a real Supabase project (requires the
   Google Cloud Console + Supabase provider setup described above)
7. Manually trigger `/api/cron/send-reminders` with the correct Bearer token
   to confirm Resend sends successfully before relying on the schedule

### Known likely issues to check first

- **Vercel deploy error: "Edge Function middleware is referencing unsupported
  modules: @supabase/ssr, next/server"** — this is a confirmed upstream bug,
  not an error in this codebase. `@supabase/supabase-js` versions 2.52.1+
  (and separately, some `@supabase/realtime-js` import paths) access
  `process.version` in a way that Next.js's Edge Runtime static analysis
  flags as unsupported, even though the code is guarded and never actually
  runs on Edge. See
  [supabase-js#1515](https://github.com/supabase/supabase-js/issues/1515)
  and [supabase-js#1552](https://github.com/supabase/supabase-js/issues/1552).
  **Fix already applied here:** `package.json` pins `@supabase/supabase-js`
  to `2.49.4` (pre-bug) both as a direct dependency and via `overrides`, so
  npm can't silently resolve a newer transitive copy through `@supabase/ssr`.
  If you upgrade either package later, re-test a Vercel deploy before
  trusting it — the bug has resurfaced across multiple version ranges as of
  late 2025.
- `jsPDF`'s `splitTextToSize` and page-break math in `documentToPdf.ts` is
  hand-rolled; test with a long real Claude-generated document (the breach
  response plan tends to be the longest) to make sure pagination looks right.

## Pricing (current defaults, in `src/lib/paystack.ts`)

- One-time document pack: NGN 25,000
- Annual subscription: NGN 96,000/yr (approx NGN 8,000/mo)

## Remaining gaps / future work

- No account-recovery flow if checkout email differs from login email (see
  Auth model above)
- No team/multi-user accounts — one Supabase user per business owner
- No legal review of generated documents — get one before charging real
  customers at scale
- DCPMI fee estimates in `riskScore.ts` are approximate; always tell users to
  confirm on the NDPC portal (already done in the UI copy, just worth
  re-confirming the numbers periodically since NDPC guidance evolves)

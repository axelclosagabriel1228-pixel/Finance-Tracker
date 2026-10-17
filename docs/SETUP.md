# Budsync setup and deployment

## 1. Run locally

Use Node 20+ and pnpm 10.12.4. From the project root:

```bash
pnpm install
pnpm dev
```

Budsync is intentionally usable before Supabase configuration. In that mode, the app loads clearly marked demo data, persists new entries to IndexedDB, and labels cloud sign-in/sync as unavailable. Do not enter real financial information while evaluating the demo.

## 2. Supabase configuration

Create a Supabase project and apply `supabase/migrations/202610170001_budsync.sql` using the Supabase SQL editor or the Supabase CLI. The migration creates four wallet definitions, transactions, budgets, savings goals, unique indexes for transfer legs, and owner-only RLS policies.

In Supabase Authentication → Providers, enable **Google** and configure the Google OAuth client ID/secret. Add these redirect URLs under Authentication → URL Configuration:

- `http://localhost:5173/`
- your Vercel production URL with a trailing `/`

Create a local `.env.local` (never commit it):

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

Only the project URL and public anon key belong in browser environment variables. Never use `service_role`, a database password, or a private OAuth secret in frontend code. After configuration, Google sign-in uses `supabase.auth.signInWithOAuth({ provider: 'google' })`; the app's auth listener then supplies the current user id to local mutations and RLS-protected upserts.

## 3. Local-first and sync behavior

The `src/lib/db.ts` module opens an IndexedDB database named `budsync-local` with stores for transactions, budgets, goals, and the sync queue. `src/lib/sync.ts` writes a transaction and its queue mutation before any network call. When the browser is online, the `online` event and visible-tab event call `syncPending`. Each queue item uses the transaction id as its stable key and Supabase `upsert(..., { onConflict: 'id' })`, so replaying the same mutation is safe. A transfer writes two legs with one shared `transferId`; the schema's user/transfer/wallet unique index prevents duplicate legs.

Pending, synced, and failed states are rendered in the activity list. A failed request remains in the queue with the latest error and can be retried from **Sync now**.

## 4. Vercel

Create a Vercel project from this repository with framework preset **Vite**. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Preview and Production environment settings, then deploy. `vercel.json` provides the SPA fallback and conservative PWA cache headers. Run `pnpm test` and `pnpm build` before each deployment.

## 5. Android Chrome installation

Open the deployed HTTPS Budsync URL in Chrome on Android. When Chrome offers **Install app** / **Add to Home screen**, accept it. If the prompt is not visible, open the three-dot menu and choose **Add to Home screen**. The app shell and previously cached pages remain available offline; transactions made offline are stored locally and sync when the connection returns.

## 6. Manual configuration still required

The Supabase project, Google OAuth credentials, redirect URLs, SQL migration, and Vercel environment variables are external account configuration and must be supplied by the deployer. Until those steps are completed, local/demo mode is intentional; the UI does not pretend cloud synchronization is active.

# Budsync

Budsync is a mobile-first, local-first financial management PWA for students and individuals. It separates Personal, Organization, Savings, and E-Wallet balances while preserving a usable ledger offline.

## What is implemented

- React + TypeScript + Vite PWA shell with responsive mobile dashboard.
- Four wallet balances and wallet-specific activity filtering.
- Income, expense, category, note, and date entry flow.
- Two-leg wallet transfers with combined-balance invariant.
- Monthly budget and savings goal cards with editable sheets.
- IndexedDB persistence before any network attempt.
- Durable sync queue with Pending, Synced, and Failed states.
- Supabase Google OAuth and RLS-ready cloud adapter using browser-safe environment variables.
- Idempotent transaction upserts and transfer ids.
- Service worker, manifest, icons, offline shell caching, and Vercel SPA fallback.
- Vitest coverage for offline-first records, duplicate sync key reuse, transfer accounting, month summaries, and account ownership.

## Commands

```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```

## Manual setup

The app intentionally starts with clearly labeled demo data when Supabase is not configured. For real sign-in and cloud sync, create `.env.local` from `.env.example`, apply `supabase/migrations/202610170001_budsync.sql`, enable Google in Supabase Auth, and add the local/deployed redirect URLs. See [`docs/SETUP.md`](docs/SETUP.md) for the full flow and Android Chrome installation instructions.

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are browser-safe. Never expose a service-role key, database password, or Google client secret in this repository.

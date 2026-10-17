# Budsync Delivery Checklist

## Product shell and installability

- [ ] The product is a mobile-first, installable Progressive Web App named Budsync for students and individuals.
- [ ] The app includes a PWA manifest, service worker, app icons, install metadata, and a route manifest at `/manus-routes.json`.
- [ ] The app is Vercel-compatible and includes deployment instructions.

## Authentication and account isolation

- [ ] Google Account sign-in and sign-out use the Supabase OAuth flow when Supabase is configured.
- [ ] The app never bundles a Supabase service-role key, database password, or other server secret.
- [ ] Cloud records are owned by the authenticated user and protected by PostgreSQL RLS.
- [ ] Account-isolation tests demonstrate that one user's records cannot be selected through the ownership helper/policy contract.

## Wallets and transactions

- [ ] Four independent wallets exist: Personal, Organization, Savings, and E-Wallet.
- [ ] The user can add income, expenses, and categorized transactions.
- [ ] Each wallet displays its own balance and transaction history, including inflows and outflows.
- [ ] Transfers move money between wallets without changing combined balance.
- [ ] Transfer writes use unique transaction IDs and an idempotency key so retries cannot duplicate records.

## Offline-first and synchronization

- [ ] Every transaction is saved locally in IndexedDB before any cloud synchronization attempt.
- [ ] Offline changes are queued and automatically retried when connectivity returns or the app becomes visible.
- [ ] Sync states are visible as Pending, Synced, or Failed, with retry messaging for failures.
- [ ] Duplicate sync tests prove that replaying the same mutation is idempotent.
- [ ] If Supabase is not configured, the app remains usable in clearly labeled demo/local mode rather than pretending cloud sync is active.

## Budgets, goals, summaries, and demo data

- [ ] Monthly budgets and savings goals are stored locally and prepared for cloud persistence.
- [ ] Dashboard summaries show combined balance, income, spending, budget progress, and savings progress.
- [ ] Sample data is clearly labeled as demo data and no real financial information is required for initial testing.

## Documentation and validation

- [ ] SQL schema and migration define wallets, transactions, transfers, budgets, goals, unique ids, authenticated ownership, and RLS.
- [ ] Supabase authentication/security setup instructions explain Google provider settings, redirect URLs, RLS application, and safe environment variables.
- [ ] IndexedDB persistence and synchronization implementation is documented.
- [ ] Android Chrome installation instructions are included.
- [ ] Vitest tests cover offline transactions, duplicate sync prevention, wallet transfers, and account isolation.
- [ ] `pnpm test`, `pnpm build`, and the production preview/start path pass before delivery.

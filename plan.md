# Budsync Implementation Plan

## Product scope

Budsync is a mobile-first, installable PWA for students and individuals who need a dependable personal finance ledger that works without internet access. The first release will support four independent wallets, income and expense recording, safe wallet transfers, monthly budgets, savings goals, dashboard summaries, demo data, Google authentication through Supabase, persistent IndexedDB storage, and an idempotent cloud sync queue.

## Implementation approach

- **Frontend:** React 18 + TypeScript + Vite, with a small component system and CSS custom properties rather than a UI framework. Routing is intentionally lightweight because the first release is a single dashboard surface with modal flows.
- **Cloud:** Supabase browser client using only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Authentication uses Supabase Google OAuth. No service-role key or database password is bundled in the frontend.
- **Local-first data:** IndexedDB stores normalized transactions, wallet metadata, budgets, goals, and a durable sync queue. Every mutation is written locally before any network attempt.
- **Synchronization:** A real sync worker groups queued mutations by transaction ID and calls Supabase upserts/deletes with `onConflict: 'id'`. Transfer records are persisted as one logical transfer with two legs and an idempotency key, so retries cannot duplicate the transfer. Connectivity and `visibilitychange` both trigger retries.
- **Security:** SQL migrations define per-user ownership and RLS policies. Each cloud table is keyed by `user_id`; the client only writes rows for the authenticated Supabase user. Transfer records include a unique `(user_id, idempotency_key)` constraint.
- **Demo mode:** If Supabase environment variables are missing, the app stays fully usable with clearly labeled demo data and local-only persistence. It never asks for real financial information during initial testing. Cloud features are visibly marked as requiring manual configuration rather than faked.
- **Testing:** Vitest covers offline-first writes, duplicate sync idempotency, transfer balance invariants, and user/account isolation policy helpers. The source includes a testable repository and sync-worker boundary.

## Project structure

```text
.
├── src/
│   ├── components/       Reusable UI cards, navigation, sheets, badges
│   ├── lib/              Domain types, calculations, IndexedDB, sync, Supabase
│   ├── App.tsx           Main app composition and interaction state
│   ├── main.tsx          React entry point and service-worker registration
│   └── styles.css        Mobile-first visual system and responsive layout
├── public/
│   ├── manifest.webmanifest  Application-owned PWA manifest
│   ├── sw.js                 Cache shell + background sync trigger
│   ├── manus-routes.json     Webdev route declaration
│   └── icons/                App icon SVGs
├── supabase/migrations/  PostgreSQL schema, functions, grants, RLS policies
├── tests/                Vitest coverage of local-first and security invariants
├── docs/                 Supabase, Vercel, Android installation instructions
├── package.json          Pinned toolchain and scripts
└── vercel.json           Vercel SPA fallback and cache headers
```

## Design direction

### Three possible styles

1. **Calm editorial ledger** — 0.07 probability: warm paper surfaces, ink-like navy, and compact financial notation.
2. **Midnight fintech console** — 0.04 probability: dark glass panels, electric cyan, and dense operational readouts.
3. **Campus signal** — 0.08 probability: energetic coral accents, bold labels, and playful modular blocks.

**Chosen style: Calm editorial ledger.** Budsync should feel like a trusted notebook that happens to sync to the cloud, not a trading terminal.

- **Design movement:** Contemporary editorial utility with restrained Swiss grid discipline and tactile ledger details.
- **Core principles:** Calm first; numbers have hierarchy; actions are obvious; offline status is honest.
- **Color philosophy:** Ink navy gives financial data gravity, warm canvas reduces screen fatigue, mint marks healthy money movement, and coral is reserved for attention or overspend states.
- **Layout paradigm:** A left rail on desktop becomes a bottom action dock on mobile; the main content is a vertically flowing ledger with asymmetric hero balance and wallet cards rather than a centered dashboard grid.
- **Signature elements:** An ink-blue “ledger rail” line, rounded wallet chips with tiny monogram marks, and a sync-status pill that reads like a notebook margin annotation.
- **Interaction philosophy:** Add and transfer are reachable from the persistent dock. Sheets use short, legible forms with optimistic local save language. Destructive actions are rare and explicit.
- **Animation:** Use 160–220ms ease-out transitions for sheets, list insertion, and sync status. Avoid looping motion except a small pending dot pulse. Respect `prefers-reduced-motion`.
- **Typography system:** Inter for UI and numeric clarity, with Georgia for editorial display phrases. Use tabular numerals for amounts and avoid all-caps paragraphs.
- **Brand essence:** “A quiet money system that keeps your real life in sync.” Personality: grounded, encouraging, precise.
- **Brand voice:** Headlines are direct (“Your money, in the right places.”). CTAs are specific (“Add an expense”, “Move money”). Status copy is honest (“Saved here. Syncs when you’re back online.”).
- **Wordmark & logo:** A small offset ledger mark: two overlapping rounded rectangles with a mint split line, paired with the `budsync` wordmark in a low-contrast serif/sans combination.
- **Signature brand color:** `#2E8B72` — Budsync green, a calm signal for progress and saved money.

## Delivery and configuration

- Run `pnpm install`, `pnpm test`, `pnpm build`, and `pnpm dev --host 0.0.0.0 --port 3000` from the project root.
- Register TypeScript diagnostics with Webdev before implementation and resolve actionable diagnostics.
- Configure Webdev PWA ownership as `application_owned` so the committed manifest and service worker remain authoritative.
- Configure a Vercel project with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only. Apply `supabase/migrations/202610170001_budsync.sql` in the Supabase SQL editor or CLI, enable Google provider, and add the deployed URL to Supabase redirect URLs.
- Keep the initial deployment safe: without Supabase variables the app is demo/local-only and clearly says why cloud sign-in is unavailable.
- Save the finished project to the initialized Webdev canonical remote, then mirror the same source to the user-selected GitHub repository.

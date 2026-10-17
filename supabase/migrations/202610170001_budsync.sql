create extension if not exists pgcrypto;

create table if not exists public.wallets (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);
insert into public.wallets (id, name) values
  ('personal','Personal Wallet'), ('organization','Organization Wallet'), ('savings','Savings Wallet'), ('ewallet','E-Wallet')
on conflict (id) do nothing;

create table if not exists public.transactions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_id text not null references public.wallets(id),
  kind text not null check (kind in ('income','expense','transfer')),
  amount numeric(14,2) not null check (amount > 0),
  category text not null,
  note text not null default '',
  date date not null,
  transfer_id uuid,
  transfer_peer_wallet_id text references public.wallets(id),
  created_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null check (month ~ '^\\d{4}-\\d{2}$'),
  amount numeric(14,2) not null check (amount >= 0),
  spent numeric(14,2) not null default 0 check (spent >= 0),
  unique (user_id, month)
);

create table if not exists public.savings_goals (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target numeric(14,2) not null check (target > 0),
  saved numeric(14,2) not null default 0 check (saved >= 0),
  deadline date not null
);

create unique index if not exists transactions_user_transfer_idx
  on public.transactions(user_id, transfer_id, wallet_id)
  where transfer_id is not null;

alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;

create policy "transactions owner select" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions owner insert" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions owner update" on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions owner delete" on public.transactions for delete using (auth.uid() = user_id);
create policy "budgets owner all" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals owner all" on public.savings_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

revoke all on public.transactions, public.budgets, public.savings_goals from anon;
grant select, insert, update, delete on public.transactions, public.budgets, public.savings_goals to authenticated;
grant select on public.wallets to anon, authenticated;

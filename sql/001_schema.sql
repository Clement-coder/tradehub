-- TradeHub schema (Privy + Supabase)
-- Run this first in Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.request_privy_user_id()
returns text
language sql
stable
as $$
  select nullif(
    coalesce(
      current_setting('request.headers', true)::json ->> 'x-privy-user-id',
      current_setting('request.jwt.claims', true)::json ->> 'x-privy-user-id'
    ),
    ''
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  privy_user_id text not null unique,
  wallet_address text not null,
  email text,
  username text,
  login_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  privy_user_id text not null,
  amount numeric(20, 8) not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint balances_amount_non_negative check (amount >= 0),
  constraint balances_currency_check check (currency in ('USD'))
);

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  privy_user_id text not null,
  type text not null check (type in ('long', 'short')),
  entry_price numeric(20, 8) not null,
  quantity numeric(20, 8) not null,
  is_open boolean not null default true,
  exit_price numeric(20, 8),
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint positions_entry_price_positive check (entry_price > 0),
  constraint positions_quantity_positive check (quantity > 0)
);

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  privy_user_id text not null,
  position_id uuid references public.positions(id) on delete set null,
  type text not null check (type in ('long', 'short')),
  entry_price numeric(20, 8) not null,
  exit_price numeric(20, 8) not null,
  quantity numeric(20, 8) not null,
  pnl numeric(20, 8) not null,
  pnl_percent numeric(10, 4) not null,
  fee numeric(20, 8) not null default 0,
  opened_at timestamptz,
  closed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint trades_entry_price_positive check (entry_price > 0),
  constraint trades_exit_price_positive check (exit_price > 0),
  constraint trades_quantity_positive check (quantity > 0)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  privy_user_id text not null,
  type text not null check (type in ('deposit', 'withdrawal', 'trade_open', 'trade_close')),
  amount numeric(20, 8) not null,
  balance_before numeric(20, 8) not null,
  balance_after numeric(20, 8) not null,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  reference_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  privy_user_id text not null,
  title text not null,
  message text not null,
  type text not null check (type in ('price', 'trade', 'portfolio', 'security')),
  color text not null default 'primary',
  unread boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_privy_user_id on public.users(privy_user_id);

create index if not exists idx_balances_user_id on public.balances(user_id);
create index if not exists idx_balances_privy_user_id on public.balances(privy_user_id);

create index if not exists idx_positions_user_id on public.positions(user_id);
create index if not exists idx_positions_privy_user_id on public.positions(privy_user_id);
create index if not exists idx_positions_is_open on public.positions(is_open);

create index if not exists idx_trades_user_id on public.trades(user_id);
create index if not exists idx_trades_privy_user_id on public.trades(privy_user_id);
create index if not exists idx_trades_closed_at on public.trades(closed_at desc);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_privy_user_id on public.transactions(privy_user_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_privy_user_id on public.notifications(privy_user_id);
create index if not exists idx_notifications_unread on public.notifications(unread);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger trg_balances_updated_at
before update on public.balances
for each row execute function public.set_updated_at();

create trigger trg_notifications_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

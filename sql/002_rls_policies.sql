-- TradeHub RLS policies (Privy header based)
-- Run this after 001_schema.sql

alter table public.users enable row level security;
alter table public.balances enable row level security;
alter table public.positions enable row level security;
alter table public.trades enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;

-- USERS
drop policy if exists users_select_own on public.users;
create policy users_select_own
on public.users
for select
using (privy_user_id = public.request_privy_user_id());

drop policy if exists users_insert_own on public.users;
create policy users_insert_own
on public.users
for insert
with check (privy_user_id = public.request_privy_user_id());

drop policy if exists users_update_own on public.users;
create policy users_update_own
on public.users
for update
using (privy_user_id = public.request_privy_user_id())
with check (privy_user_id = public.request_privy_user_id());

-- BALANCES
drop policy if exists balances_select_own on public.balances;
create policy balances_select_own
on public.balances
for select
using (privy_user_id = public.request_privy_user_id());

drop policy if exists balances_insert_own on public.balances;
create policy balances_insert_own
on public.balances
for insert
with check (privy_user_id = public.request_privy_user_id());

drop policy if exists balances_update_own on public.balances;
create policy balances_update_own
on public.balances
for update
using (privy_user_id = public.request_privy_user_id())
with check (privy_user_id = public.request_privy_user_id());

-- POSITIONS
drop policy if exists positions_select_own on public.positions;
create policy positions_select_own
on public.positions
for select
using (privy_user_id = public.request_privy_user_id());

drop policy if exists positions_insert_own on public.positions;
create policy positions_insert_own
on public.positions
for insert
with check (privy_user_id = public.request_privy_user_id());

drop policy if exists positions_update_own on public.positions;
create policy positions_update_own
on public.positions
for update
using (privy_user_id = public.request_privy_user_id())
with check (privy_user_id = public.request_privy_user_id());

-- TRADES
drop policy if exists trades_select_own on public.trades;
create policy trades_select_own
on public.trades
for select
using (privy_user_id = public.request_privy_user_id());

drop policy if exists trades_insert_own on public.trades;
create policy trades_insert_own
on public.trades
for insert
with check (privy_user_id = public.request_privy_user_id());

-- TRANSACTIONS
drop policy if exists transactions_select_own on public.transactions;
create policy transactions_select_own
on public.transactions
for select
using (privy_user_id = public.request_privy_user_id());

drop policy if exists transactions_insert_own on public.transactions;
create policy transactions_insert_own
on public.transactions
for insert
with check (privy_user_id = public.request_privy_user_id());

-- NOTIFICATIONS
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
on public.notifications
for select
using (privy_user_id = public.request_privy_user_id());

drop policy if exists notifications_insert_own on public.notifications;
create policy notifications_insert_own
on public.notifications
for insert
with check (privy_user_id = public.request_privy_user_id());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
on public.notifications
for update
using (privy_user_id = public.request_privy_user_id())
with check (privy_user_id = public.request_privy_user_id());

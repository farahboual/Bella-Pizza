-- Run once in Supabase > SQL Editor
create table public.orders(
 id text primary key,
 number bigint generated always as identity,
 created_at timestamptz not null default now(),
 status text not null default 'pending' check (status in ('pending','new','accepted','ready','done','cancelled')),
 paid boolean not null default false,
 type text not null, payment text not null, total int not null,
 items jsonb not null, customer jsonb not null, note text not null default '',
 stripe_session text, stripe_payment text);
create index orders_created_idx on public.orders(created_at desc);
-- RLS on, no policy: the browser (anon key) can never read orders; only our API (service role key) can.
alter table public.orders enable row level security;

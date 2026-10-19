-- Run once in Supabase > SQL Editor

-- 1. Table des commandes
create table if not exists public.orders(
 id text primary key,
 number bigint generated always as identity,
 created_at timestamptz not null default now(),
 status text not null default 'pending' check (status in ('pending','new','accepted','ready','done','cancelled')),
 paid boolean not null default false,
 type text not null check (type in ('emporter','livraison','sur_place')),
 payment text not null, total int not null, discount int not null default 0,
 items jsonb not null, customer jsonb not null, note text not null default '',
 table_number text default '', promo_code text default '',
 stripe_session text, stripe_payment text
);
create index if not exists orders_created_idx on public.orders(created_at desc);
alter table public.orders enable row level security;

-- Alter table if adding columns to existing orders table
alter table public.orders add column if not exists table_number text default '';
alter table public.orders add column if not exists promo_code text default '';
alter table public.orders add column if not exists discount int default 0;

-- 2. Configuration générale (ouverture manuelle, RIB, SMS, etc.)
create table if not exists public.config(
 id text primary key default 'main',
 manual_closed boolean not null default false,
 closed_reason text not null default '',
 rib_iban text not null default '',
 rib_bic text not null default '',
 rib_holder text not null default '',
 sms_enabled boolean not null default false
);
insert into public.config(id) values('main') on conflict do nothing;
alter table public.config enable row level security;

-- 3. Prix modifiés & Ruptures de stock
create table if not exists public.menu_overrides(
 id text primary key,
 price int,
 out_of_stock boolean not null default false
);
alter table public.menu_overrides enable row level security;

-- 4. Codes Promo
create table if not exists public.promos(
 code text primary key,
 discount_type text not null check (discount_type in ('percent','fixed')),
 discount_value int not null,
 active boolean not null default true
);
alter table public.promos enable row level security;

-- Privilèges globaux
grant all on table public.orders to postgres, service_role, anon, authenticated;
grant all on table public.config to postgres, service_role, anon, authenticated;
grant all on table public.menu_overrides to postgres, service_role, anon, authenticated;
grant all on table public.promos to postgres, service_role, anon, authenticated;
grant all on all sequences in schema public to postgres, service_role, anon, authenticated;

-- Politiques de sécurité
create policy "Order Service Access" on public.orders for all using (true) with check (true);
create policy "Config Read Access" on public.config for select using (true);
create policy "Config Service Access" on public.config for all using (true) with check (true);
create policy "Menu Overrides Read Access" on public.menu_overrides for select using (true);
create policy "Menu Overrides Service Access" on public.menu_overrides for all using (true) with check (true);
create policy "Promos Read Access" on public.promos for select using (true);
create policy "Promos Service Access" on public.promos for all using (true) with check (true);

-- 5. Articles personnalisés ajoutés par le gérant
create table if not exists public.custom_items(
 id text primary key,
 name text not null,
 cat text not null default 'Divers',
 price int not null,
 "desc" text default ''
);
alter table public.custom_items enable row level security;
grant all on table public.custom_items to postgres, service_role, anon, authenticated;
create policy "Custom Items Read Access" on public.custom_items for select using (true);
create policy "Custom Items Service Access" on public.custom_items for all using (true) with check (true);

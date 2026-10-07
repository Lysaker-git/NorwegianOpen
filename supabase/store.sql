-- Norwegian Open merch shop.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: tables use IF NOT EXISTS, functions use CREATE OR REPLACE.

create extension if not exists pgcrypto with schema extensions;

-- Settings (single row) ------------------------------------------------------
create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  vipps_number text not null default '',
  shipping_price_nok integer check (shipping_price_nok >= 0), -- null = shipping off
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

-- Products and sizes ---------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price_nok integer not null check (price_nok >= 0),
  image_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  stock integer not null check (stock >= 0),
  sort_order integer not null default 0,
  unique (product_id, label)
);
create index if not exists product_variants_product_id_idx on public.product_variants(product_id);

-- Orders ---------------------------------------------------------------------
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('NO-' || nextval('public.order_number_seq')),
  access_token text not null unique default encode(extensions.gen_random_bytes(16), 'hex'),
  customer_name text not null,
  email text not null,
  phone text not null,
  delivery_method text not null check (delivery_method in ('pickup', 'shipping')),
  address_line text,
  postal_code text,
  city text,
  country text default 'Norway',
  shipping_price_nok integer not null default 0 check (shipping_price_nok >= 0),
  total_nok integer not null check (total_nok >= 0),
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment', 'paid', 'sent', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  constraint shipping_address_required check (
    delivery_method = 'pickup'
    or (address_line is not null and postal_code is not null and city is not null)
  )
);
create index if not exists orders_status_created_idx on public.orders(status, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_label text not null,
  unit_price_nok integer not null,
  quantity integer not null check (quantity > 0)
);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_variant_id_idx on public.order_items(variant_id);

create table if not exists public.order_emails (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  email_type text not null
    check (email_type in ('confirmation', 'payment_reminder', 'paid', 'sent', 'delivered', 'cancelled')),
  recipient text not null default '',
  success boolean not null,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists order_emails_order_id_idx on public.order_emails(order_id, created_at desc);

-- Row level security: on, with no policies. Only the service key (server) can access.
alter table public.store_settings  enable row level security;
alter table public.products        enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.order_emails    enable row level security;

-- place_order ----------------------------------------------------------------
-- Locks the requested variants, checks stock, decrements it, and creates the
-- order with item snapshots, all in one transaction. Concurrent checkouts for
-- the same variants wait for each other on the row locks.
create or replace function public.place_order(p_customer jsonb, p_items jsonb)
returns table (out_order_id uuid, out_order_number text, out_access_token text)
language plpgsql
set search_path = public
as $$
declare
  v_req record;
  v_problems jsonb := '[]'::jsonb;
  v_items_total integer := 0;
  v_shipping integer := 0;
  v_delivery text := p_customer->>'delivery_method';
  v_order public.orders%rowtype;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_items) e
    where coalesce((e->>'quantity')::integer, 0) < 1
  ) then
    raise exception 'INVALID_QUANTITY';
  end if;

  -- Lock in a stable order (by id) to avoid deadlocks between concurrent orders.
  perform 1
    from public.product_variants
   where id in (select (e->>'variant_id')::uuid from jsonb_array_elements(p_items) e)
   order by id
   for update;

  -- Same variant on several lines is summed so stock is checked once per variant.
  for v_req in
    select req.vid, req.qty, pv.stock, p.price_nok, p.is_active
      from (
        select (e->>'variant_id')::uuid as vid, sum((e->>'quantity')::integer)::integer as qty
          from jsonb_array_elements(p_items) e
         group by 1
      ) req
      left join public.product_variants pv on pv.id = req.vid
      left join public.products p on p.id = pv.product_id
  loop
    if v_req.stock is null or not v_req.is_active then
      v_problems := v_problems || jsonb_build_object('variant_id', v_req.vid, 'available', 0);
    elsif v_req.stock < v_req.qty then
      v_problems := v_problems || jsonb_build_object('variant_id', v_req.vid, 'available', v_req.stock);
    else
      v_items_total := v_items_total + v_req.price_nok * v_req.qty;
    end if;
  end loop;

  if jsonb_array_length(v_problems) > 0 then
    raise exception 'OUT_OF_STOCK' using detail = v_problems::text;
  end if;

  if v_delivery = 'shipping' then
    select shipping_price_nok into v_shipping from public.store_settings where id = 1;
    if v_shipping is null then
      raise exception 'SHIPPING_DISABLED';
    end if;
  elsif v_delivery is distinct from 'pickup' then
    raise exception 'INVALID_DELIVERY';
  end if;

  insert into public.orders (
    customer_name, email, phone, delivery_method,
    address_line, postal_code, city, country,
    shipping_price_nok, total_nok
  ) values (
    p_customer->>'customer_name',
    p_customer->>'email',
    p_customer->>'phone',
    v_delivery,
    case when v_delivery = 'shipping' then p_customer->>'address_line' end,
    case when v_delivery = 'shipping' then p_customer->>'postal_code' end,
    case when v_delivery = 'shipping' then p_customer->>'city' end,
    case when v_delivery = 'shipping' then coalesce(nullif(p_customer->>'country', ''), 'Norway') end,
    v_shipping,
    v_items_total + v_shipping
  )
  returning * into v_order;

  insert into public.order_items (order_id, variant_id, product_name, variant_label, unit_price_nok, quantity)
  select v_order.id, pv.id, p.name, pv.label, p.price_nok, req.qty
    from (
      select (e->>'variant_id')::uuid as vid, sum((e->>'quantity')::integer)::integer as qty
        from jsonb_array_elements(p_items) e
       group by 1
    ) req
    join public.product_variants pv on pv.id = req.vid
    join public.products p on p.id = pv.product_id;

  update public.product_variants pv
     set stock = pv.stock - req.qty
    from (
      select (e->>'variant_id')::uuid as vid, sum((e->>'quantity')::integer)::integer as qty
        from jsonb_array_elements(p_items) e
       group by 1
    ) req
   where pv.id = req.vid;

  return query select v_order.id, v_order.order_number, v_order.access_token;
end;
$$;

-- cancel_order: put stock back and mark cancelled ------------------------------
create or replace function public.cancel_order(p_order_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_status text;
begin
  select status into v_status from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if v_status in ('delivered', 'cancelled') then
    raise exception 'INVALID_TRANSITION' using detail = v_status || ' -> cancelled';
  end if;

  update public.product_variants pv
     set stock = pv.stock + oi.qty
    from (
      select variant_id, sum(quantity)::integer as qty
        from public.order_items
       where order_id = p_order_id and variant_id is not null
       group by variant_id
    ) oi
   where pv.id = oi.variant_id;

  update public.orders set status = 'cancelled', cancelled_at = now() where id = p_order_id;
end;
$$;

-- set_order_status: forward transitions only -----------------------------------
create or replace function public.set_order_status(p_order_id uuid, p_status text)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_status text;
begin
  select status into v_status from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if p_status is null or not (
       (v_status = 'awaiting_payment' and p_status = 'paid')
    or (v_status = 'paid' and p_status in ('sent', 'delivered'))
    or (v_status = 'sent' and p_status = 'delivered')
  ) then
    raise exception 'INVALID_TRANSITION' using detail = v_status || ' -> ' || coalesce(p_status, 'null');
  end if;

  update public.orders
     set status = p_status,
         paid_at = case when p_status = 'paid' then now() else paid_at end,
         sent_at = case when p_status = 'sent' then now() else sent_at end,
         delivered_at = case when p_status = 'delivered' then now() else delivered_at end
   where id = p_order_id;
end;
$$;

-- Functions are only callable with the service key.
revoke all on function public.place_order(jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.cancel_order(uuid) from public, anon, authenticated;
revoke all on function public.set_order_status(uuid, text) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb) to service_role;
grant execute on function public.cancel_order(uuid) to service_role;
grant execute on function public.set_order_status(uuid, text) to service_role;

-- Product images bucket (public read; uploads only via the service key).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- =============================================================================
-- MANUAL TEST CHECKLIST: run these one block at a time in the SQL editor
-- after the script above. Each block cleans up after itself.
-- In the Supabase SQL editor only the last statement's result is shown: select everything from `begin;` up to (not including) `rollback;` and run it, read the result, then run `rollback;` on its own.
-- =============================================================================
-- 1) Place an order and see stock drop (expect stock 3, order total 600, status awaiting_payment):
-- begin;
--   insert into products (id, name, price_nok) values ('00000000-0000-0000-0000-000000000001', 'Test tee', 300);
--   insert into product_variants (id, product_id, label, stock) values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000001', 'M', 5);
--   select * from place_order('{"customer_name":"Test","email":"t@t.no","phone":"12345678","delivery_method":"pickup"}',
--                             '[{"variant_id":"00000000-0000-0000-0000-0000000000a1","quantity":2}]');
--   select (select stock from product_variants where id = '00000000-0000-0000-0000-0000000000a1') as stock, o.order_number, o.total_nok, o.status from orders o order by o.created_at desc limit 1;
-- rollback;
--
-- 2) Out of stock is rejected and stock is unchanged (expect ERROR OUT_OF_STOCK, detail available 1):
-- begin;
--   insert into products (id, name, price_nok) values ('00000000-0000-0000-0000-000000000001', 'Test tee', 300);
--   insert into product_variants (id, product_id, label, stock) values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000001', 'M', 1);
--   select * from place_order('{"customer_name":"Test","email":"t@t.no","phone":"12345678","delivery_method":"pickup"}',
--                             '[{"variant_id":"00000000-0000-0000-0000-0000000000a1","quantity":2}]');
-- rollback;
--
-- 3) Cancel returns stock (expect stock back to 5, status cancelled):
-- begin;
--   insert into products (id, name, price_nok) values ('00000000-0000-0000-0000-000000000001', 'Test tee', 300);
--   insert into product_variants (id, product_id, label, stock) values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000001', 'M', 5);
--   select cancel_order(out_order_id) from place_order('{"customer_name":"Test","email":"t@t.no","phone":"12345678","delivery_method":"pickup"}',
--                             '[{"variant_id":"00000000-0000-0000-0000-0000000000a1","quantity":2}]');
--   select (select stock from product_variants where id = '00000000-0000-0000-0000-0000000000a1') as stock, o.status from orders o order by o.created_at desc limit 1;
-- rollback;
--
-- 4) Invalid transition is rejected (expect ERROR INVALID_TRANSITION awaiting_payment -> delivered):
-- begin;
--   insert into products (id, name, price_nok) values ('00000000-0000-0000-0000-000000000001', 'Test tee', 300);
--   insert into product_variants (id, product_id, label, stock) values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000001', 'M', 5);
--   select set_order_status(out_order_id, 'delivered') from place_order('{"customer_name":"Test","email":"t@t.no","phone":"12345678","delivery_method":"pickup"}',
--                             '[{"variant_id":"00000000-0000-0000-0000-0000000000a1","quantity":1}]');
-- rollback;
--
-- 5) Shipping when disabled is rejected (expect ERROR SHIPPING_DISABLED while store_settings.shipping_price_nok is null):
-- begin;
--   insert into products (id, name, price_nok) values ('00000000-0000-0000-0000-000000000001', 'Test tee', 300);
--   insert into product_variants (id, product_id, label, stock) values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000001', 'M', 5);
--   select * from place_order('{"customer_name":"Test","email":"t@t.no","phone":"12345678","delivery_method":"shipping","address_line":"Gate 1","postal_code":"0150","city":"Oslo"}',
--                             '[{"variant_id":"00000000-0000-0000-0000-0000000000a1","quantity":1}]');
-- rollback;

# Merch Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A simple merch shop on norwegianopen.no. Customers add sized products to a cart, check out, and pay manually with Vipps. Admins manage products, sizes, stock, and orders, and every status change emails the customer.

**Architecture:**
- Supabase tables plus three Postgres functions (`place_order`, `cancel_order`, `set_order_status`) hold the stock and status rules, with row locking.
- SvelteKit server loads and actions talk to Supabase through the existing service-key client.
- Pure TypeScript modules in `src/lib/shop/` (cart, validation, status rules, email templates) are unit-tested with Vitest.
- Email goes through the existing Nodemailer/Gmail transporter and is logged to `order_emails`.

**Tech Stack:**
- SvelteKit 2.20 / Svelte 5.27, with legacy component syntax (`export let`, `$:`, `on:click`) to match the codebase
- Tailwind v4
- Supabase JS 2 (database and Storage)
- Nodemailer
- Vitest 3

**Spec:** `docs/superpowers/specs/2026-10-07-merch-shop-design.md`

## Deviations from the spec (intentional)

- **Image limit is 4 MB**, not 5 MB, because Vercel rejects request bodies over 4.5 MB.
- **Product editor starts with one size row labelled "One size"**, instead of "an empty list creates One size". It has the same result, and the stock field is always visible.
- **`/admin/shop` is a server redirect** to `/admin/shop/orders`, with Orders/Products tabs in `src/routes/admin/shop/+layout.svelte`, instead of a separate landing page.
- **Extra helper modules** (`config.ts`, `format.ts`, `adminForms.ts`, `db.server.ts`) keep the shared logic out of the route files.

## Global Constraints

- All amounts are whole NOK integers. Display them with `formatNok` (e.g. `1 250 kr`).
- One price per product, shared by all its sizes.
- A product without sizes has exactly one variant labelled `One size`, which the shop UI does not show.
- Order numbers look like `NO-1001`. Customer links are `/shop/order/<32-hex-char token>`.
- Statuses are `awaiting_payment`, `paid`, `sent`, `delivered`, `cancelled`.
  - Allowed transitions: `awaiting_payment → paid`, `paid → sent | delivered`, `sent → delivered`.
  - Cancelling is allowed from any status except `delivered` and `cancelled`.
- Every email goes to the customer with `bcc: norwegianopenwcs@gmail.com`, and every attempt is logged in `order_emails`. A failed email never blocks or rolls back an order or a status change.
- The browser never talks to the shop tables. RLS is on with no policies, and all access goes through `supabaseAdmin` in `+page.server.ts` or `*.server.ts`.
- Product images: one per product, JPG/PNG/WebP, **max 4 MB** (Vercel's request limit is 4.5 MB), stored in the public bucket `product-images`.
- Svelte components use the legacy syntax used everywhere else in this repo (`export let data`, `$:`, `on:click`). Do not use runes.
- Do not modify unrelated files. `src/lib/tests/hotelRegistration.test.ts` already fails ("No test suite found"), so ignore it.
- `npm run check` already reports errors in older files. Only new errors in shop files matter: `npx svelte-check --threshold error 2>&1 | grep -i shop` must print nothing.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Map

| File | Responsibility |
|---|---|
| `supabase/store.sql` | Tables, sequence, RLS, functions, storage bucket, manual DB test checklist |
| `src/lib/shop/config.ts` | Constants (bucket, notify email, limits, patterns) |
| `src/lib/shop/types.ts` | Shared TS types for DB rows |
| `src/lib/shop/format.ts` | `formatNok`, `itemDisplayName` |
| `src/lib/shop/orderStatus.ts` | Status labels, customer texts, admin actions, confirm and result messages |
| `src/lib/shop/cart.ts` | Pure cart functions and the localStorage-backed Svelte store |
| `src/lib/shop/checkoutValidation.ts` | Parse and validate the checkout form |
| `src/lib/shop/adminForms.ts` | Parse and validate the product and settings forms |
| `src/lib/shop/emailTemplates.ts` | Build subject, HTML and text per email type |
| `src/lib/shop/db.server.ts` | Supabase reads and writes shared by routes |
| `src/lib/shop/emails.server.ts` | `sendOrderEmail`: build, send, log, never throw |
| `src/lib/components/shop/ProductCard.svelte` | Product card with size picker and add-to-cart |
| `src/routes/shop/…` | Shop, checkout, order status pages |
| `src/routes/admin/shop/…` | Admin layout/tabs, products list and editor, orders list and settings, order detail |
| `src/lib/components/htmlComponents/Header.svelte` | Add "Shop" nav link |
| `src/routes/admin/+layout.svelte` | Add "Shop" admin nav link |
| `src/routes/privacy/+page.svelte` | Add "Shop orders" privacy section |

All unit tests live next to their module as `src/lib/shop/<name>.test.ts`. They run in the existing Vitest "server" project:

```bash
npx vitest --run --project server src/lib/shop
```

---

### Task 1: Database schema and functions

**Files:**
- Create: `supabase/store.sql`

**Interfaces:**
- Produces:
  - Tables `store_settings`, `products`, `product_variants`, `orders`, `order_items`, `order_emails`.
  - RPCs:
    - `place_order(p_customer jsonb, p_items jsonb)` returns rows `(out_order_id uuid, out_order_number text, out_access_token text)`.
    - `cancel_order(p_order_id uuid)` and `set_order_status(p_order_id uuid, p_status text)`.
  - Exception messages: `EMPTY_CART`, `INVALID_QUANTITY`, `OUT_OF_STOCK` (with `detail` = a JSON array `[{"variant_id": "...", "available": n}]`), `SHIPPING_DISABLED`, `INVALID_DELIVERY`, `ORDER_NOT_FOUND`, `INVALID_TRANSITION`.
  - Storage bucket `product-images` (public).

- [ ] **Step 1: Write `supabase/store.sql`**

```sql
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
  if not (
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
-- =============================================================================
-- 1) Place an order and see stock drop (expect stock 5 -> 3, total 600):
-- begin;
--   insert into products (id, name, price_nok) values ('00000000-0000-0000-0000-000000000001', 'Test tee', 300);
--   insert into product_variants (id, product_id, label, stock) values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000001', 'M', 5);
--   select * from place_order('{"customer_name":"Test","email":"t@t.no","phone":"12345678","delivery_method":"pickup"}',
--                             '[{"variant_id":"00000000-0000-0000-0000-0000000000a1","quantity":2}]');
--   select stock from product_variants where id = '00000000-0000-0000-0000-0000000000a1';
--   select order_number, total_nok, status from orders order by created_at desc limit 1;
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
--   select stock from product_variants where id = '00000000-0000-0000-0000-0000000000a1';
--   select status from orders order by created_at desc limit 1;
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
```

- [ ] **Step 2: USER STEP (the executor cannot do this).** Ask the user to paste the whole file into the Supabase SQL editor and run it. Then ask them to run checklist blocks 1–5 one at a time and confirm each gives the expected result. Note that the sequence advances even in rolled-back tests, so real order numbers may start above 1001. That is fine.

- [ ] **Step 3: Commit**

```bash
git add supabase/store.sql
git commit -m "feat(shop): add database schema and order functions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Shared shop modules (config, types, format, order status rules)

**Files:**
- Create: `src/lib/shop/config.ts`, `src/lib/shop/types.ts`, `src/lib/shop/format.ts`, `src/lib/shop/orderStatus.ts`
- Test: `src/lib/shop/format.test.ts`, `src/lib/shop/orderStatus.test.ts`

**Interfaces:**
- Produces:
  - `config.ts`: `ONE_SIZE_LABEL`, `SHOP_NOTIFY_EMAIL`, `PRODUCT_IMAGE_BUCKET`, `MAX_LINE_QUANTITY` (20), `MAX_IMAGE_BYTES` (4 MB), `ALLOWED_IMAGE_TYPES`, `ORDER_TOKEN_PATTERN`, `UUID_PATTERN`
  - `types.ts`: `OrderStatus`, `DeliveryMethod`, `EmailType`, `StoreSettings`, `ProductVariant`, `Product`, `ShopProduct`, `OrderItem`, `Order`, `OrderEmailLog`
  - `format.ts`: `formatNok(amount: number): string`, `itemDisplayName(productName: string, variantLabel: string): string`
  - `orderStatus.ts`:
    - `STATUS_LABELS`, `ORDER_STATUSES`, `EMAIL_TYPE_LABELS`, `CUSTOMER_STATUS_TEXT`
    - `AdminAction`
    - `adminActions(status): AdminAction[]`
    - `confirmMessage(action, orderNumber, email): string`
    - `resultMessage(action, mail: { success: boolean; error: string | null }, email): string`

- [ ] **Step 1: Write the failing tests**

`src/lib/shop/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatNok, itemDisplayName } from './format';

describe('formatNok', () => {
	it('formats whole kroner with space thousands separator', () => {
		expect(formatNok(0)).toBe('0 kr');
		expect(formatNok(300)).toBe('300 kr');
		expect(formatNok(1250)).toBe('1 250 kr');
		expect(formatNok(1234567)).toBe('1 234 567 kr');
	});
});

describe('itemDisplayName', () => {
	it('hides the "One size" label', () => {
		expect(itemDisplayName('Tote bag', 'One size')).toBe('Tote bag');
	});
	it('appends a real size', () => {
		expect(itemDisplayName('Event T-shirt', 'M')).toBe('Event T-shirt – M');
	});
});
```

`src/lib/shop/orderStatus.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { adminActions, confirmMessage, resultMessage, CUSTOMER_STATUS_TEXT } from './orderStatus';

const ids = (status: Parameters<typeof adminActions>[0]) =>
	adminActions(status).map((a) => `${a.kind}:${a.to ?? a.emailType}`);

describe('adminActions', () => {
	it('awaiting payment: mark paid, payment reminder, cancel', () => {
		expect(ids('awaiting_payment')).toEqual(['status:paid', 'resend:payment_reminder', 'cancel:cancelled']);
	});
	it('paid: mark sent, mark delivered, resend paid, cancel', () => {
		expect(ids('paid')).toEqual(['status:sent', 'status:delivered', 'resend:paid', 'cancel:cancelled']);
	});
	it('sent: mark delivered, resend sent, cancel', () => {
		expect(ids('sent')).toEqual(['status:delivered', 'resend:sent', 'cancel:cancelled']);
	});
	it('delivered and cancelled: resend only', () => {
		expect(ids('delivered')).toEqual(['resend:delivered']);
		expect(ids('cancelled')).toEqual(['resend:cancelled']);
	});
	it('status actions send the email of the new status', () => {
		for (const a of adminActions('paid').filter((x) => x.kind === 'status')) {
			expect(a.emailType).toBe(a.to);
		}
	});
	it('labels', () => {
		expect(adminActions('awaiting_payment')[0].label).toBe('Mark paid');
		expect(adminActions('awaiting_payment')[1].label).toBe('Send payment reminder');
	});
});

describe('confirmMessage', () => {
	const [markPaid, reminder, cancel] = adminActions('awaiting_payment');
	it('describes each action with order number and email', () => {
		expect(confirmMessage(markPaid, 'NO-1001', 'kari@example.com')).toBe(
			'Mark NO-1001 as Paid and email kari@example.com?'
		);
		expect(confirmMessage(cancel, 'NO-1001', 'kari@example.com')).toBe(
			'Cancel NO-1001, return its items to stock, and email kari@example.com?'
		);
		expect(confirmMessage(reminder, 'NO-1001', 'kari@example.com')).toBe(
			'Send the "Payment reminder" email for NO-1001 to kari@example.com?'
		);
	});
});

describe('resultMessage', () => {
	const [markPaid, reminder, cancel] = adminActions('awaiting_payment');
	const ok = { success: true, error: null };
	const bad = { success: false, error: 'SMTP down' };
	it('status change', () => {
		expect(resultMessage(markPaid, ok, 'k@x.no')).toBe('Status changed to Paid. Email sent to k@x.no.');
		expect(resultMessage(markPaid, bad, 'k@x.no')).toBe(
			'Status changed to Paid, but the email failed: SMTP down. You can resend it.'
		);
	});
	it('cancel', () => {
		expect(resultMessage(cancel, ok, 'k@x.no')).toBe(
			'Order cancelled and items returned to stock. Email sent to k@x.no.'
		);
		expect(resultMessage(cancel, bad, 'k@x.no')).toBe(
			'Order cancelled and items returned to stock, but the email failed: SMTP down. You can resend it.'
		);
	});
	it('resend', () => {
		expect(resultMessage(reminder, ok, 'k@x.no')).toBe('Email sent to k@x.no.');
		expect(resultMessage(reminder, bad, 'k@x.no')).toBe('The email failed: SMTP down.');
	});
});

describe('CUSTOMER_STATUS_TEXT', () => {
	it('cancelled text includes the contact email', () => {
		expect(CUSTOMER_STATUS_TEXT.cancelled).toContain('norwegianopenwcs@gmail.com');
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest --run --project server src/lib/shop`
Expected: FAIL, because `./format` and `./orderStatus` cannot be resolved.

- [ ] **Step 3: Implement**

`src/lib/shop/config.ts`:

```ts
export const ONE_SIZE_LABEL = 'One size';
export const SHOP_NOTIFY_EMAIL = 'norwegianopenwcs@gmail.com';
export const PRODUCT_IMAGE_BUCKET = 'product-images';
export const MAX_LINE_QUANTITY = 20;
// Vercel rejects request bodies over 4.5 MB, so keep uploads below that.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};
export const ORDER_TOKEN_PATTERN = /^[0-9a-f]{32}$/;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
```

`src/lib/shop/types.ts`:

```ts
export type OrderStatus = 'awaiting_payment' | 'paid' | 'sent' | 'delivered' | 'cancelled';
export type DeliveryMethod = 'pickup' | 'shipping';
export type EmailType = 'confirmation' | 'payment_reminder' | 'paid' | 'sent' | 'delivered' | 'cancelled';

export interface StoreSettings {
	vipps_number: string;
	shipping_price_nok: number | null;
}

export interface ProductVariant {
	id: string;
	product_id: string;
	label: string;
	stock: number;
	sort_order: number;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	price_nok: number;
	image_path: string | null;
	is_active: boolean;
	created_at: string;
	product_variants: ProductVariant[];
}

export interface ShopProduct extends Product {
	imageUrl: string | null;
}

export interface OrderItem {
	id: string;
	order_id: string;
	variant_id: string | null;
	product_name: string;
	variant_label: string;
	unit_price_nok: number;
	quantity: number;
}

export interface Order {
	id: string;
	order_number: string;
	access_token: string;
	customer_name: string;
	email: string;
	phone: string;
	delivery_method: DeliveryMethod;
	address_line: string | null;
	postal_code: string | null;
	city: string | null;
	country: string | null;
	shipping_price_nok: number;
	total_nok: number;
	status: OrderStatus;
	created_at: string;
	paid_at: string | null;
	sent_at: string | null;
	delivered_at: string | null;
	cancelled_at: string | null;
	order_items: OrderItem[];
}

export interface OrderEmailLog {
	id: string;
	order_id: string;
	email_type: EmailType;
	recipient: string;
	success: boolean;
	error: string | null;
	created_at: string;
}
```

`src/lib/shop/format.ts`:

```ts
import { ONE_SIZE_LABEL } from './config';

export function formatNok(amount: number): string {
	const sign = amount < 0 ? '-' : '';
	const digits = Math.abs(Math.round(amount))
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	return `${sign}${digits} kr`;
}

export function itemDisplayName(productName: string, variantLabel: string): string {
	return variantLabel === ONE_SIZE_LABEL ? productName : `${productName} – ${variantLabel}`;
}
```

`src/lib/shop/orderStatus.ts`:

```ts
import { SHOP_NOTIFY_EMAIL } from './config';
import type { EmailType, OrderStatus } from './types';

export const ORDER_STATUSES: OrderStatus[] = ['awaiting_payment', 'paid', 'sent', 'delivered', 'cancelled'];

export const STATUS_LABELS: Record<OrderStatus, string> = {
	awaiting_payment: 'Awaiting payment',
	paid: 'Paid',
	sent: 'Sent',
	delivered: 'Delivered',
	cancelled: 'Cancelled'
};

export const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
	confirmation: 'Order confirmation',
	payment_reminder: 'Payment reminder',
	paid: 'Payment received',
	sent: 'Order sent',
	delivered: 'Order delivered',
	cancelled: 'Order cancelled'
};

export const CUSTOMER_STATUS_TEXT: Record<OrderStatus, string> = {
	awaiting_payment: 'Awaiting payment. Your items are reserved for you.',
	paid: 'Payment received, thank you.',
	sent: 'Your order has been sent.',
	delivered: 'Your order has been delivered / handed over.',
	cancelled: `This order has been cancelled. If you believe this is a mistake, contact ${SHOP_NOTIFY_EMAIL}.`
};

export interface AdminAction {
	id: string;
	kind: 'status' | 'cancel' | 'resend';
	label: string;
	emailType: EmailType;
	to?: OrderStatus;
	danger?: boolean;
}

const cancelAction: AdminAction = {
	id: 'cancel',
	kind: 'cancel',
	label: 'Cancel order',
	emailType: 'cancelled',
	danger: true
};

function markAs(to: 'paid' | 'sent' | 'delivered'): AdminAction {
	return { id: `mark_${to}`, kind: 'status', label: `Mark ${STATUS_LABELS[to].toLowerCase()}`, emailType: to, to };
}

function resend(emailType: EmailType, label: string): AdminAction {
	return { id: 'resend', kind: 'resend', label, emailType };
}

export function adminActions(status: OrderStatus): AdminAction[] {
	switch (status) {
		case 'awaiting_payment':
			return [markAs('paid'), resend('payment_reminder', 'Send payment reminder'), cancelAction];
		case 'paid':
			return [markAs('sent'), markAs('delivered'), resend('paid', 'Resend "Payment received" email'), cancelAction];
		case 'sent':
			return [markAs('delivered'), resend('sent', 'Resend "Order sent" email'), cancelAction];
		case 'delivered':
			return [resend('delivered', 'Resend "Order delivered" email')];
		case 'cancelled':
			return [resend('cancelled', 'Resend "Order cancelled" email')];
	}
}

export function confirmMessage(action: AdminAction, orderNumber: string, email: string): string {
	if (action.kind === 'status') {
		return `Mark ${orderNumber} as ${STATUS_LABELS[action.to as OrderStatus]} and email ${email}?`;
	}
	if (action.kind === 'cancel') {
		return `Cancel ${orderNumber}, return its items to stock, and email ${email}?`;
	}
	return `Send the "${EMAIL_TYPE_LABELS[action.emailType]}" email for ${orderNumber} to ${email}?`;
}

export function resultMessage(
	action: AdminAction,
	mail: { success: boolean; error: string | null },
	email: string
): string {
	const failure = `the email failed: ${mail.error ?? 'unknown error'}. You can resend it.`;
	if (action.kind === 'status') {
		const done = `Status changed to ${STATUS_LABELS[action.to as OrderStatus]}`;
		return mail.success ? `${done}. Email sent to ${email}.` : `${done}, but ${failure}`;
	}
	if (action.kind === 'cancel') {
		const done = 'Order cancelled and items returned to stock';
		return mail.success ? `${done}. Email sent to ${email}.` : `${done}, but ${failure}`;
	}
	return mail.success ? `Email sent to ${email}.` : `The email failed: ${mail.error ?? 'unknown error'}.`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest --run --project server src/lib/shop`
Expected: PASS (format and orderStatus suites green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/config.ts src/lib/shop/types.ts src/lib/shop/format.ts src/lib/shop/orderStatus.ts src/lib/shop/format.test.ts src/lib/shop/orderStatus.test.ts
git commit -m "feat(shop): add shared shop types, formatting and order status rules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Cart store

**Files:**
- Create: `src/lib/shop/cart.ts`
- Test: `src/lib/shop/cart.test.ts`

**Interfaces:**
- Consumes: `MAX_LINE_QUANTITY` from `config.ts`
- Produces:
  - `CartItem { variantId, productId, name, label, unitPriceNok, quantity, maxQuantity, imageUrl }`
  - `StockProblem { variant_id: string; available: number }`
  - `CatalogEntry { priceNok: number; stock: number }`
  - `CART_STORAGE_KEY`
  - Pure functions: `addItem(items, item: Omit<CartItem,'quantity'>, qty)`, `updateQuantity(items, variantId, qty)`, `removeItem(items, variantId)`, `cartTotal(items)`, `cartCount(items)`, `applyStockProblems(items, problems)`, `syncWithCatalog(items, catalog: Record<string, CatalogEntry>)`, `parseStoredCart(raw)`
  - `createCartStore(storage?)`
  - The singleton `cart` store, with methods `add(item, qty)`, `setQuantity(variantId, qty)`, `remove(variantId)`, `applyStockProblems(problems)`, `sync(catalog)`, `clear()`.

- [ ] **Step 1: Write the failing test**

`src/lib/shop/cart.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import {
	addItem,
	updateQuantity,
	removeItem,
	cartTotal,
	cartCount,
	applyStockProblems,
	syncWithCatalog,
	parseStoredCart,
	createCartStore,
	CART_STORAGE_KEY,
	type CartItem
} from './cart';

const tee = {
	variantId: '11111111-1111-1111-1111-111111111111',
	productId: 'p1',
	name: 'Event T-shirt',
	label: 'M',
	unitPriceNok: 300,
	maxQuantity: 5,
	imageUrl: null
};
const bag = { ...tee, variantId: '22222222-2222-2222-2222-222222222222', productId: 'p2', name: 'Tote', label: 'One size', unitPriceNok: 150, maxQuantity: 30 };

describe('pure cart functions', () => {
	it('adds a new line', () => {
		expect(addItem([], tee, 2)).toEqual([{ ...tee, quantity: 2 }]);
	});
	it('merges the same variant and caps at stock', () => {
		const items = addItem(addItem([], tee, 4), tee, 3);
		expect(items).toHaveLength(1);
		expect(items[0].quantity).toBe(5);
	});
	it('caps at 20 even when stock is higher', () => {
		expect(addItem([], bag, 25)[0].quantity).toBe(20);
	});
	it('ignores adding when stock is 0', () => {
		expect(addItem([], { ...tee, maxQuantity: 0 }, 1)).toEqual([]);
	});
	it('updates and removes when quantity <= 0', () => {
		const items = addItem([], tee, 2);
		expect(updateQuantity(items, tee.variantId, 4)[0].quantity).toBe(4);
		expect(updateQuantity(items, tee.variantId, 0)).toEqual([]);
		expect(removeItem(items, tee.variantId)).toEqual([]);
	});
	it('totals and counts', () => {
		const items = addItem(addItem([], tee, 2), bag, 1);
		expect(cartTotal(items)).toBe(750);
		expect(cartCount(items)).toBe(3);
	});
	it('applies stock problems: reduce or remove', () => {
		const items = addItem(addItem([], tee, 3), bag, 1);
		const result = applyStockProblems(items, [
			{ variant_id: tee.variantId, available: 1 },
			{ variant_id: bag.variantId, available: 0 }
		]);
		expect(result).toEqual([{ ...tee, quantity: 1, maxQuantity: 1 }]);
	});
	it('syncs prices and stock from the catalog and drops unknown variants', () => {
		const items = addItem(addItem([], tee, 3), bag, 1);
		const result = syncWithCatalog(items, { [tee.variantId]: { priceNok: 350, stock: 2 } });
		expect(result).toEqual([{ ...tee, unitPriceNok: 350, maxQuantity: 2, quantity: 2 }]);
	});
});

describe('parseStoredCart', () => {
	it('returns [] for null, bad JSON and non-arrays', () => {
		expect(parseStoredCart(null)).toEqual([]);
		expect(parseStoredCart('{nope')).toEqual([]);
		expect(parseStoredCart('{"a":1}')).toEqual([]);
	});
	it('keeps only valid items', () => {
		const good: CartItem = { ...tee, quantity: 1 };
		expect(parseStoredCart(JSON.stringify([good, { foo: 'bar' }]))).toEqual([good]);
	});
});

describe('createCartStore', () => {
	function memoryStorage(initial: Record<string, string> = {}) {
		const data = { ...initial };
		return {
			data,
			getItem: (k: string) => data[k] ?? null,
			setItem: (k: string, v: string) => {
				data[k] = v;
			}
		};
	}

	it('loads from and saves to storage', () => {
		const storage = memoryStorage({ [CART_STORAGE_KEY]: JSON.stringify([{ ...tee, quantity: 1 }]) });
		const store = createCartStore(storage);
		expect(get(store)).toHaveLength(1);
		store.add(bag, 2);
		expect(JSON.parse(storage.data[CART_STORAGE_KEY])).toHaveLength(2);
		store.clear();
		expect(JSON.parse(storage.data[CART_STORAGE_KEY])).toEqual([]);
	});

	it('works when storage throws', () => {
		const store = createCartStore({
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			}
		});
		store.add(tee, 1);
		expect(get(store)).toHaveLength(1);
	});

	it('works with no storage (server)', () => {
		const store = createCartStore(undefined);
		store.add(tee, 1);
		expect(get(store)[0].quantity).toBe(1);
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest --run --project server src/lib/shop/cart.test.ts`
Expected: FAIL, because `./cart` cannot be resolved.

- [ ] **Step 3: Implement `src/lib/shop/cart.ts`**

```ts
import { writable } from 'svelte/store';
import { MAX_LINE_QUANTITY } from './config';

export interface CartItem {
	variantId: string;
	productId: string;
	name: string;
	label: string;
	unitPriceNok: number;
	quantity: number;
	maxQuantity: number;
	imageUrl: string | null;
}

export interface StockProblem {
	variant_id: string;
	available: number;
}

export interface CatalogEntry {
	priceNok: number;
	stock: number;
}

export const CART_STORAGE_KEY = 'no-shop-cart';

function clamp(quantity: number, max: number): number {
	const q = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
	return Math.max(0, Math.min(q, max, MAX_LINE_QUANTITY));
}

export function addItem(items: CartItem[], item: Omit<CartItem, 'quantity'>, quantity: number): CartItem[] {
	const existing = items.find((i) => i.variantId === item.variantId);
	if (existing) {
		return items
			.map((i) =>
				i.variantId === item.variantId
					? { ...i, ...item, quantity: clamp(i.quantity + quantity, item.maxQuantity) }
					: i
			)
			.filter((i) => i.quantity > 0);
	}
	const q = clamp(quantity, item.maxQuantity);
	return q > 0 ? [...items, { ...item, quantity: q }] : items;
}

export function updateQuantity(items: CartItem[], variantId: string, quantity: number): CartItem[] {
	return items
		.map((i) => (i.variantId === variantId ? { ...i, quantity: clamp(quantity, i.maxQuantity) } : i))
		.filter((i) => i.quantity > 0);
}

export function removeItem(items: CartItem[], variantId: string): CartItem[] {
	return items.filter((i) => i.variantId !== variantId);
}

export function cartTotal(items: CartItem[]): number {
	return items.reduce((sum, i) => sum + i.unitPriceNok * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
	return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function applyStockProblems(items: CartItem[], problems: StockProblem[]): CartItem[] {
	const available = new Map(problems.map((p) => [p.variant_id, p.available]));
	return items
		.map((i) => {
			const max = available.get(i.variantId);
			return max === undefined ? i : { ...i, maxQuantity: max, quantity: clamp(i.quantity, max) };
		})
		.filter((i) => i.quantity > 0);
}

export function syncWithCatalog(items: CartItem[], catalog: Record<string, CatalogEntry>): CartItem[] {
	return items
		.filter((i) => catalog[i.variantId])
		.map((i) => {
			const entry = catalog[i.variantId];
			return {
				...i,
				unitPriceNok: entry.priceNok,
				maxQuantity: entry.stock,
				quantity: clamp(i.quantity, entry.stock)
			};
		})
		.filter((i) => i.quantity > 0);
}

function isCartItem(value: unknown): value is CartItem {
	if (!value || typeof value !== 'object') return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.variantId === 'string' &&
		typeof v.productId === 'string' &&
		typeof v.name === 'string' &&
		typeof v.label === 'string' &&
		typeof v.unitPriceNok === 'number' &&
		typeof v.quantity === 'number' &&
		typeof v.maxQuantity === 'number' &&
		(v.imageUrl === null || typeof v.imageUrl === 'string')
	);
}

export function parseStoredCart(raw: string | null): CartItem[] {
	if (!raw) return [];
	try {
		const value = JSON.parse(raw);
		return Array.isArray(value) ? value.filter(isCartItem) : [];
	} catch {
		return [];
	}
}

type CartStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function createCartStore(storage?: CartStorage) {
	let initial: CartItem[] = [];
	try {
		initial = parseStoredCart(storage?.getItem(CART_STORAGE_KEY) ?? null);
	} catch {
		initial = [];
	}

	const { subscribe, set, update } = writable<CartItem[]>(initial);

	subscribe((items) => {
		try {
			storage?.setItem(CART_STORAGE_KEY, JSON.stringify(items));
		} catch {
			// Storage blocked or full: the cart still works for this page view.
		}
	});

	return {
		subscribe,
		add: (item: Omit<CartItem, 'quantity'>, quantity: number) => update((i) => addItem(i, item, quantity)),
		setQuantity: (variantId: string, quantity: number) => update((i) => updateQuantity(i, variantId, quantity)),
		remove: (variantId: string) => update((i) => removeItem(i, variantId)),
		applyStockProblems: (problems: StockProblem[]) => update((i) => applyStockProblems(i, problems)),
		sync: (catalog: Record<string, CatalogEntry>) => update((i) => syncWithCatalog(i, catalog)),
		clear: () => set([])
	};
}

function browserStorage(): CartStorage | undefined {
	try {
		return typeof window !== 'undefined' ? window.localStorage : undefined;
	} catch {
		return undefined;
	}
}

export const cart = createCartStore(browserStorage());
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest --run --project server src/lib/shop/cart.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/cart.ts src/lib/shop/cart.test.ts
git commit -m "feat(shop): add localStorage-backed cart store

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Form validation (checkout, product, settings)

**Files:**
- Create: `src/lib/shop/checkoutValidation.ts`, `src/lib/shop/adminForms.ts`
- Test: `src/lib/shop/checkoutValidation.test.ts`, `src/lib/shop/adminForms.test.ts`

**Interfaces:**
- Consumes: `MAX_LINE_QUANTITY`, `UUID_PATTERN`, `ONE_SIZE_LABEL` from `config.ts`; `DeliveryMethod` from `types.ts`
- Produces:
  - `parseCheckoutForm(form: FormData): { input: CheckoutInput; errors: CheckoutErrors }`.
    - `CheckoutInput = { customer_name, email, phone, delivery_method, address_line, postal_code, city, country, items: { variant_id: string; quantity: number }[] }`.
    - The form field `cart` holds JSON `[{ variantId, quantity }]`.
  - `parseProductForm(form: FormData): { values: ProductFormValues; errors: ProductFormErrors }`.
    - `ProductFormValues = { name, description, price_nok, is_active, variants: { id: string | null; label: string; stock: number; sort_order: number }[] }`.
    - Form fields: `name`, `description`, `price_nok`, `is_active` (`on`), and repeated `variant_id` / `variant_label` / `variant_stock`.
  - `parseSettingsForm(form: FormData): { values: { vipps_number: string; shipping_price_nok: number | null }; error: string | null }`

- [ ] **Step 1: Write the failing tests**

`src/lib/shop/checkoutValidation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseCheckoutForm } from './checkoutValidation';

const V = '11111111-1111-1111-1111-111111111111';

function form(fields: Record<string, string>) {
	const f = new FormData();
	for (const [k, v] of Object.entries(fields)) f.set(k, v);
	return f;
}

const valid = {
	customer_name: 'Kari Nordmann',
	email: 'kari@example.com',
	phone: '+47 123 45 678',
	delivery_method: 'pickup',
	cart: JSON.stringify([{ variantId: V, quantity: 2 }])
};

describe('parseCheckoutForm', () => {
	it('accepts a valid pickup order', () => {
		const { input, errors } = parseCheckoutForm(form(valid));
		expect(errors).toEqual({});
		expect(input.items).toEqual([{ variant_id: V, quantity: 2 }]);
		expect(input.delivery_method).toBe('pickup');
		expect(input.country).toBe('Norway');
	});
	it('requires name, valid email and phone', () => {
		const { errors } = parseCheckoutForm(form({ ...valid, customer_name: ' ', email: 'nope', phone: '12' }));
		expect(Object.keys(errors).sort()).toEqual(['customer_name', 'email', 'phone']);
	});
	it('requires address fields for shipping', () => {
		const { errors } = parseCheckoutForm(form({ ...valid, delivery_method: 'shipping' }));
		expect(Object.keys(errors).sort()).toEqual(['address_line', 'city', 'postal_code']);
	});
	it('accepts shipping with address', () => {
		const { errors } = parseCheckoutForm(
			form({ ...valid, delivery_method: 'shipping', address_line: 'Gate 1', postal_code: '0150', city: 'Oslo' })
		);
		expect(errors).toEqual({});
	});
	it('treats unknown delivery as pickup', () => {
		expect(parseCheckoutForm(form({ ...valid, delivery_method: 'teleport' })).input.delivery_method).toBe('pickup');
	});
	it('rejects empty, malformed or out-of-range carts', () => {
		for (const cart of ['', '[]', '{bad', JSON.stringify([{ variantId: 'x', quantity: 1 }]), JSON.stringify([{ variantId: V, quantity: 0 }]), JSON.stringify([{ variantId: V, quantity: 21 }])]) {
			expect(parseCheckoutForm(form({ ...valid, cart })).errors.items).toBeDefined();
		}
	});
});
```

`src/lib/shop/adminForms.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseProductForm, parseSettingsForm } from './adminForms';

function productForm(fields: Record<string, string>, variants: [string, string, string][]) {
	const f = new FormData();
	for (const [k, v] of Object.entries(fields)) f.set(k, v);
	for (const [id, label, stock] of variants) {
		f.append('variant_id', id);
		f.append('variant_label', label);
		f.append('variant_stock', stock);
	}
	return f;
}

describe('parseProductForm', () => {
	it('parses a valid product with sizes', () => {
		const { values, errors } = parseProductForm(
			productForm({ name: ' Tee ', description: 'Nice', price_nok: '300', is_active: 'on' }, [
				['abc', 'S', '4'],
				['', 'M', '0']
			])
		);
		expect(errors).toEqual({});
		expect(values).toEqual({
			name: 'Tee',
			description: 'Nice',
			price_nok: 300,
			is_active: true,
			variants: [
				{ id: 'abc', label: 'S', stock: 4, sort_order: 0 },
				{ id: null, label: 'M', stock: 0, sort_order: 1 }
			]
		});
	});
	it('a single row with empty label becomes "One size"', () => {
		const { values, errors } = parseProductForm(productForm({ name: 'Bag', price_nok: '150' }, [['', '', '10']]));
		expect(errors).toEqual({});
		expect(values.variants[0].label).toBe('One size');
		expect(values.is_active).toBe(false);
	});
	it('validates name, price and sizes', () => {
		expect(Object.keys(parseProductForm(productForm({ name: '', price_nok: '1.5' }, [['', 'S', '1']])).errors).sort()).toEqual(['name', 'price_nok']);
		expect(parseProductForm(productForm({ name: 'X', price_nok: '1' }, [])).errors.variants).toBeDefined();
		expect(parseProductForm(productForm({ name: 'X', price_nok: '1' }, [['', 'S', '1'], ['', '', '1']])).errors.variants).toBeDefined();
		expect(parseProductForm(productForm({ name: 'X', price_nok: '1' }, [['', 'S', '1'], ['', 's', '1']])).errors.variants).toBeDefined();
		expect(parseProductForm(productForm({ name: 'X', price_nok: '1' }, [['', 'S', '-1']])).errors.variants).toBeDefined();
	});
});

describe('parseSettingsForm', () => {
	function f(vipps: string, shipping: string) {
		const fd = new FormData();
		fd.set('vipps_number', vipps);
		fd.set('shipping_price_nok', shipping);
		return fd;
	}
	it('empty shipping turns shipping off', () => {
		expect(parseSettingsForm(f(' 12345 ', ''))).toEqual({ values: { vipps_number: '12345', shipping_price_nok: null }, error: null });
	});
	it('parses a shipping price', () => {
		expect(parseSettingsForm(f('12345', '99')).values.shipping_price_nok).toBe(99);
	});
	it('rejects invalid shipping prices', () => {
		expect(parseSettingsForm(f('12345', '-5')).error).not.toBeNull();
		expect(parseSettingsForm(f('12345', 'abc')).error).not.toBeNull();
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest --run --project server src/lib/shop`
Expected: FAIL, because `./checkoutValidation` and `./adminForms` cannot be resolved.

- [ ] **Step 3: Implement**

`src/lib/shop/checkoutValidation.ts`:

```ts
import { MAX_LINE_QUANTITY, UUID_PATTERN } from './config';
import type { DeliveryMethod } from './types';

export interface CheckoutItem {
	variant_id: string;
	quantity: number;
}

export interface CheckoutInput {
	customer_name: string;
	email: string;
	phone: string;
	delivery_method: DeliveryMethod;
	address_line: string;
	postal_code: string;
	city: string;
	country: string;
	items: CheckoutItem[];
}

export type CheckoutField =
	| 'customer_name'
	| 'email'
	| 'phone'
	| 'delivery_method'
	| 'address_line'
	| 'postal_code'
	| 'city'
	| 'items';

export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

function text(form: FormData, key: string, max = 200): string {
	return String(form.get(key) ?? '').trim().slice(0, max);
}

function parseItems(raw: string): CheckoutItem[] | null {
	try {
		const value = JSON.parse(raw);
		if (!Array.isArray(value) || value.length === 0 || value.length > 50) return null;
		const items = value.map((x) => ({
			variant_id: String(x?.variantId ?? ''),
			quantity: Number(x?.quantity)
		}));
		const valid = items.every(
			(i) =>
				UUID_PATTERN.test(i.variant_id) &&
				Number.isInteger(i.quantity) &&
				i.quantity >= 1 &&
				i.quantity <= MAX_LINE_QUANTITY
		);
		return valid ? items : null;
	} catch {
		return null;
	}
}

export function parseCheckoutForm(form: FormData): { input: CheckoutInput; errors: CheckoutErrors } {
	const delivery_method: DeliveryMethod = text(form, 'delivery_method') === 'shipping' ? 'shipping' : 'pickup';
	const input: CheckoutInput = {
		customer_name: text(form, 'customer_name'),
		email: text(form, 'email'),
		phone: text(form, 'phone', 40),
		delivery_method,
		address_line: text(form, 'address_line'),
		postal_code: text(form, 'postal_code', 20),
		city: text(form, 'city', 100),
		country: text(form, 'country', 100) || 'Norway',
		items: parseItems(String(form.get('cart') ?? '')) ?? []
	};

	const errors: CheckoutErrors = {};
	if (!input.customer_name) errors.customer_name = 'Please enter your name.';
	if (!/^\S+@\S+\.\S+$/.test(input.email)) errors.email = 'Please enter a valid email address.';
	if (input.phone.replace(/\D/g, '').length < 8) errors.phone = 'Please enter a valid phone number.';
	if (delivery_method === 'shipping') {
		if (!input.address_line) errors.address_line = 'Please enter your street address.';
		if (!input.postal_code) errors.postal_code = 'Please enter your postcode.';
		if (!input.city) errors.city = 'Please enter your city.';
	}
	if (input.items.length === 0) errors.items = 'Your cart is empty or invalid. Please go back to the shop.';

	return { input, errors };
}
```

`src/lib/shop/adminForms.ts`:

```ts
import { ONE_SIZE_LABEL } from './config';

export interface ProductFormVariant {
	id: string | null;
	label: string;
	stock: number;
	sort_order: number;
}

export interface ProductFormValues {
	name: string;
	description: string;
	price_nok: number;
	is_active: boolean;
	variants: ProductFormVariant[];
}

export type ProductFormErrors = Partial<Record<'name' | 'price_nok' | 'variants' | 'image', string>>;

export function parseProductForm(form: FormData): { values: ProductFormValues; errors: ProductFormErrors } {
	const ids = form.getAll('variant_id').map((v) => String(v).trim());
	const labels = form.getAll('variant_label').map((v) => String(v).trim());
	const stocks = form.getAll('variant_stock').map((v) => String(v).trim());
	const priceRaw = String(form.get('price_nok') ?? '').trim();

	const variants: ProductFormVariant[] = labels.map((label, i) => ({
		id: ids[i] ? ids[i] : null,
		label: label || (labels.length === 1 ? ONE_SIZE_LABEL : ''),
		stock: stocks[i] === '' ? NaN : Number(stocks[i]),
		sort_order: i
	}));

	const values: ProductFormValues = {
		name: String(form.get('name') ?? '').trim(),
		description: String(form.get('description') ?? '').trim(),
		price_nok: priceRaw === '' ? NaN : Number(priceRaw),
		is_active: form.get('is_active') === 'on',
		variants
	};

	const errors: ProductFormErrors = {};
	if (!values.name) errors.name = 'Please enter a product name.';
	if (!Number.isInteger(values.price_nok) || values.price_nok < 0) {
		errors.price_nok = 'Enter a price in whole kroner (0 or more).';
	}
	const lowerLabels = variants.map((v) => v.label.toLowerCase());
	if (variants.length === 0) {
		errors.variants = 'Add at least one size. Use "One size" for items without sizes.';
	} else if (variants.some((v) => !v.label)) {
		errors.variants = 'Every size needs a name.';
	} else if (new Set(lowerLabels).size !== lowerLabels.length) {
		errors.variants = 'Each size name must be unique.';
	} else if (variants.some((v) => !Number.isInteger(v.stock) || v.stock < 0)) {
		errors.variants = 'Stock must be a whole number, 0 or more.';
	}

	return { values, errors };
}

export function parseSettingsForm(form: FormData): {
	values: { vipps_number: string; shipping_price_nok: number | null };
	error: string | null;
} {
	const vipps_number = String(form.get('vipps_number') ?? '').trim();
	const raw = String(form.get('shipping_price_nok') ?? '').trim();
	const shipping_price_nok = raw === '' ? null : Number(raw);
	const invalid = shipping_price_nok !== null && (!Number.isInteger(shipping_price_nok) || shipping_price_nok < 0);
	return {
		values: { vipps_number, shipping_price_nok: invalid ? null : shipping_price_nok },
		error: invalid ? 'Shipping price must be a whole number of kroner, or empty to turn shipping off.' : null
	};
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest --run --project server src/lib/shop`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/checkoutValidation.ts src/lib/shop/adminForms.ts src/lib/shop/checkoutValidation.test.ts src/lib/shop/adminForms.test.ts
git commit -m "feat(shop): add checkout, product and settings form validation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Email templates

**Files:**
- Create: `src/lib/shop/emailTemplates.ts`
- Test: `src/lib/shop/emailTemplates.test.ts`

**Interfaces:**
- Consumes: `formatNok`, `itemDisplayName` (`format.ts`); `EmailType`, `DeliveryMethod` (`types.ts`)
- Produces:
  - `buildOrderEmail(type: EmailType, order: EmailOrder, ctx: EmailContext): { subject: string; html: string; text: string }`
    - `EmailOrder` is a structural subset of `Order`: `order_number, customer_name, delivery_method, address_line, postal_code, city, country, shipping_price_nok, total_nok, order_items[{product_name, variant_label, unit_price_nok, quantity}]`.
    - `EmailContext = { orderUrl: string; vippsNumber: string; contactEmail: string }`.
  - `escapeHtml(s: string): string`

- [ ] **Step 1: Write the failing test**

`src/lib/shop/emailTemplates.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildOrderEmail, escapeHtml, type EmailOrder } from './emailTemplates';
import type { EmailType } from './types';

const order: EmailOrder = {
	order_number: 'NO-1001',
	customer_name: 'Kari <b>',
	delivery_method: 'shipping',
	address_line: 'Gate 1',
	postal_code: '0150',
	city: 'Oslo',
	country: 'Norway',
	shipping_price_nok: 99,
	total_nok: 699,
	order_items: [
		{ product_name: 'Event T-shirt', variant_label: 'M', unit_price_nok: 300, quantity: 2 }
	]
};
const ctx = { orderUrl: 'https://norwegianopen.no/shop/order/abc', vippsNumber: '123456', contactEmail: 'norwegianopenwcs@gmail.com' };
const ALL: EmailType[] = ['confirmation', 'payment_reminder', 'paid', 'sent', 'delivered', 'cancelled'];

describe('buildOrderEmail', () => {
	it('every email has order number, total, link and items', () => {
		for (const type of ALL) {
			const e = buildOrderEmail(type, order, ctx);
			for (const body of [e.text, e.html]) {
				expect(body).toContain('NO-1001');
				expect(body).toContain('699 kr');
				expect(body).toContain(ctx.orderUrl);
				expect(body).toContain('Event T-shirt – M');
			}
			expect(e.subject).toContain('NO-1001');
		}
	});
	it('only confirmation and payment reminder include the Vipps number', () => {
		for (const type of ALL) {
			const hasVipps = buildOrderEmail(type, order, ctx).text.includes('123456');
			expect(hasVipps).toBe(type === 'confirmation' || type === 'payment_reminder');
		}
	});
	it('subjects', () => {
		expect(buildOrderEmail('confirmation', order, ctx).subject).toBe('Order NO-1001 – Norwegian Open Shop');
		expect(buildOrderEmail('payment_reminder', order, ctx).subject).toBe('Payment reminder – Order NO-1001');
		expect(buildOrderEmail('paid', order, ctx).subject).toBe('Payment received – Order NO-1001');
		expect(buildOrderEmail('sent', order, ctx).subject).toBe('Your order NO-1001 has been sent');
		expect(buildOrderEmail('delivered', order, ctx).subject).toBe('Your order NO-1001 has been delivered');
		expect(buildOrderEmail('cancelled', order, ctx).subject).toBe('Order NO-1001 has been cancelled');
	});
	it('cancelled email includes the contact email', () => {
		expect(buildOrderEmail('cancelled', order, ctx).text).toContain('norwegianopenwcs@gmail.com');
	});
	it('shows the shipping address for shipping orders and pickup text otherwise', () => {
		expect(buildOrderEmail('sent', order, ctx).text).toContain('Gate 1, 0150 Oslo, Norway');
		const pickup = buildOrderEmail('paid', { ...order, delivery_method: 'pickup', shipping_price_nok: 0, total_nok: 600 }, ctx).text;
		expect(pickup).toContain('Pickup / arranged with the organizer');
		expect(pickup).toContain('We will contact you to arrange pickup.');
	});
	it('escapes customer input in HTML', () => {
		const html = buildOrderEmail('confirmation', order, ctx).html;
		expect(html).toContain('Kari &lt;b&gt;');
		expect(html).not.toContain('Kari <b>');
	});
});

describe('escapeHtml', () => {
	it('escapes special characters', () => {
		expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest --run --project server src/lib/shop/emailTemplates.test.ts`
Expected: FAIL, because `./emailTemplates` cannot be resolved.

- [ ] **Step 3: Implement `src/lib/shop/emailTemplates.ts`**

```ts
import { formatNok, itemDisplayName } from './format';
import type { DeliveryMethod, EmailType } from './types';

export interface EmailOrder {
	order_number: string;
	customer_name: string;
	delivery_method: DeliveryMethod;
	address_line: string | null;
	postal_code: string | null;
	city: string | null;
	country: string | null;
	shipping_price_nok: number;
	total_nok: number;
	order_items: { product_name: string; variant_label: string; unit_price_nok: number; quantity: number }[];
}

export interface EmailContext {
	orderUrl: string;
	vippsNumber: string;
	contactEmail: string;
}

export interface BuiltEmail {
	subject: string;
	html: string;
	text: string;
}

export function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

const SUBJECTS: Record<EmailType, (orderNumber: string) => string> = {
	confirmation: (n) => `Order ${n} – Norwegian Open Shop`,
	payment_reminder: (n) => `Payment reminder – Order ${n}`,
	paid: (n) => `Payment received – Order ${n}`,
	sent: (n) => `Your order ${n} has been sent`,
	delivered: (n) => `Your order ${n} has been delivered`,
	cancelled: (n) => `Order ${n} has been cancelled`
};

function introLines(type: EmailType, order: EmailOrder, ctx: EmailContext): string[] {
	const hi = `Hi ${order.customer_name},`;
	switch (type) {
		case 'confirmation':
			return [`Thank you for your order, ${order.customer_name}!`, 'Your items are reserved for you until we receive your payment.'];
		case 'payment_reminder':
			return [hi, `This is a friendly reminder that we have not yet received payment for order ${order.order_number}.`];
		case 'paid':
			return [
				hi,
				'We have received your payment. Thank you!',
				order.delivery_method === 'shipping'
					? 'We will email you when your order has been sent.'
					: 'We will contact you to arrange pickup.'
			];
		case 'sent':
			return [hi, 'Your order has been sent to the address below.'];
		case 'delivered':
			return [hi, 'Your order has been delivered / handed over. Enjoy!'];
		case 'cancelled':
			return [
				hi,
				'Your order has been cancelled.',
				`If you believe this is a mistake, or you have already paid, contact us at ${ctx.contactEmail}.`
			];
	}
}

function deliveryLine(order: EmailOrder): string {
	if (order.delivery_method !== 'shipping') return 'Delivery: Pickup / arranged with the organizer';
	const cityLine = `${order.postal_code ?? ''} ${order.city ?? ''}`.trim();
	return `Delivery: Shipping to ${[order.address_line, cityLine, order.country].filter(Boolean).join(', ')}`;
}

export function buildOrderEmail(type: EmailType, order: EmailOrder, ctx: EmailContext): BuiltEmail {
	const intro = introLines(type, order, ctx);
	const needsPayment = type === 'confirmation' || type === 'payment_reminder';
	const payment = needsPayment
		? [
				`Pay ${formatNok(order.total_nok)} with Vipps to ${ctx.vippsNumber}.`,
				`Write ${order.order_number} in the Vipps message.`
			]
		: [];
	const items = order.order_items.map(
		(i) => `${i.quantity} × ${itemDisplayName(i.product_name, i.variant_label)} – ${formatNok(i.unit_price_nok * i.quantity)}`
	);
	const totals = [
		...(order.shipping_price_nok > 0 ? [`Shipping: ${formatNok(order.shipping_price_nok)}`] : []),
		`Total: ${formatNok(order.total_nok)}`
	];
	const delivery = deliveryLine(order);

	const text = [
		...intro,
		'',
		...(payment.length ? [...payment, ''] : []),
		`Order ${order.order_number}`,
		...items,
		...totals,
		delivery,
		'',
		`See your order and its status: ${ctx.orderUrl}`,
		'',
		'Norwegian Open WCS'
	].join('\n');

	const p = (s: string) => `<p style="margin:0 0 12px">${escapeHtml(s)}</p>`;
	const html = [
		'<div style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:560px">',
		intro.map(p).join(''),
		needsPayment
			? `<div style="border:2px solid #f59e0b;border-radius:8px;padding:12px;margin:16px 0">${payment.map(p).join('')}</div>`
			: '',
		`<h3 style="margin:16px 0 8px">Order ${escapeHtml(order.order_number)}</h3>`,
		`<ul style="padding-left:20px;margin:0 0 12px">${items.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`,
		totals.map(p).join(''),
		p(delivery),
		`<p style="margin:16px 0"><a href="${escapeHtml(ctx.orderUrl)}">See your order and its status</a><br><span style="font-size:12px;color:#666">${escapeHtml(ctx.orderUrl)}</span></p>`,
		'<p style="margin:0;color:#666">Norwegian Open WCS</p>',
		'</div>'
	].join('');

	return { subject: SUBJECTS[type](order.order_number), html, text };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest --run --project server src/lib/shop/emailTemplates.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/emailTemplates.ts src/lib/shop/emailTemplates.test.ts
git commit -m "feat(shop): add order email templates

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Server data access and email sending

**Files:**
- Create: `src/lib/shop/db.server.ts`, `src/lib/shop/emails.server.ts`
- Test: `src/lib/shop/emails.server.test.ts`

**Interfaces:**
- Consumes:
  - `supabaseAdmin` (`src/lib/supabaseAdminClient.ts`)
  - default export `transporter` (`src/lib/emailClient.server.ts`)
  - `GOOGLE_EMAIL` (`$env/static/private`)
  - `buildOrderEmail`, the config constants, and the types
- Produces:
  - `db.server.ts`:
    - `getSettings(): Promise<StoreSettings>`
    - `getOrderById(id): Promise<Order | null>`
    - `getOrderByToken(token): Promise<Order | null>`
    - `listActiveProducts(): Promise<Product[]>`
    - `listAllProducts(): Promise<Product[]>`
    - `getProduct(id): Promise<Product | null>`
    - `getOrderedVariantIds(ids: string[]): Promise<string[]>`
    - `getOrderEmails(orderId): Promise<OrderEmailLog[]>`
    - `logOrderEmail(row: { order_id; email_type; recipient; success; error }): Promise<void>`
    - `productImageUrl(path: string | null): string | null`
  - `emails.server.ts`: `sendOrderEmail(orderId: string, type: EmailType, origin: string): Promise<SendResult>`, where `SendResult = { success: boolean; error: string | null; recipient: string | null }`. It never throws.

- [ ] **Step 1: Write the failing test**

`src/lib/shop/emails.server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
	sendMail: vi.fn(),
	getOrderById: vi.fn(),
	getSettings: vi.fn(),
	logOrderEmail: vi.fn()
}));

vi.mock('$env/static/private', () => ({ GOOGLE_EMAIL: 'shop@test.no' }));
vi.mock('$lib/emailClient.server', () => ({ default: { sendMail: mocks.sendMail } }));
vi.mock('./db.server', () => ({
	getOrderById: mocks.getOrderById,
	getSettings: mocks.getSettings,
	logOrderEmail: mocks.logOrderEmail
}));

import { sendOrderEmail } from './emails.server';

const order = {
	id: 'o1',
	order_number: 'NO-1001',
	access_token: 'a'.repeat(32),
	customer_name: 'Kari',
	email: 'kari@example.com',
	delivery_method: 'pickup',
	address_line: null,
	postal_code: null,
	city: null,
	country: null,
	shipping_price_nok: 0,
	total_nok: 300,
	order_items: [{ product_name: 'Tee', variant_label: 'M', unit_price_nok: 300, quantity: 1 }]
};

beforeEach(() => {
	// The server test project does not set clearMocks, so reset call history here.
	vi.clearAllMocks();
	mocks.getOrderById.mockResolvedValue(order);
	mocks.getSettings.mockResolvedValue({ vipps_number: '123456', shipping_price_nok: null });
	mocks.logOrderEmail.mockResolvedValue(undefined);
	mocks.sendMail.mockResolvedValue({});
});

describe('sendOrderEmail', () => {
	it('sends to the customer with bcc to the event and logs success', async () => {
		const result = await sendOrderEmail('o1', 'confirmation', 'https://norwegianopen.no');
		expect(result).toEqual({ success: true, error: null, recipient: 'kari@example.com' });
		const mail = mocks.sendMail.mock.calls[0][0];
		expect(mail.to).toBe('kari@example.com');
		expect(mail.bcc).toBe('norwegianopenwcs@gmail.com');
		expect(mail.from).toContain('shop@test.no');
		expect(mail.text).toContain(`https://norwegianopen.no/shop/order/${'a'.repeat(32)}`);
		expect(mocks.logOrderEmail).toHaveBeenCalledWith({
			order_id: 'o1',
			email_type: 'confirmation',
			recipient: 'kari@example.com',
			success: true,
			error: null
		});
	});

	it('logs and returns the error when sending fails, without throwing', async () => {
		mocks.sendMail.mockRejectedValue(new Error('SMTP down'));
		const result = await sendOrderEmail('o1', 'paid', 'https://x.no');
		expect(result).toEqual({ success: false, error: 'SMTP down', recipient: 'kari@example.com' });
		expect(mocks.logOrderEmail).toHaveBeenCalledWith(
			expect.objectContaining({ success: false, error: 'SMTP down', email_type: 'paid' })
		);
	});

	it('returns an error without sending when the order does not exist', async () => {
		mocks.getOrderById.mockResolvedValue(null);
		const result = await sendOrderEmail('missing', 'paid', 'https://x.no');
		expect(result.success).toBe(false);
		expect(mocks.sendMail).not.toHaveBeenCalled();
	});

	it('still succeeds if writing the log fails', async () => {
		mocks.logOrderEmail.mockRejectedValue(new Error('db down'));
		const result = await sendOrderEmail('o1', 'sent', 'https://x.no');
		expect(result.success).toBe(true);
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest --run --project server src/lib/shop/emails.server.test.ts`
Expected: FAIL, because `./emails.server` cannot be resolved.

- [ ] **Step 3: Implement**

`src/lib/shop/db.server.ts`:

```ts
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { ORDER_TOKEN_PATTERN, PRODUCT_IMAGE_BUCKET, UUID_PATTERN } from './config';
import type { EmailType, Order, OrderEmailLog, Product, StoreSettings } from './types';

function sortVariants(product: Product): Product {
	return {
		...product,
		product_variants: [...(product.product_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order)
	};
}

export async function getSettings(): Promise<StoreSettings> {
	const { data, error } = await supabaseAdmin
		.from('store_settings')
		.select('vipps_number, shipping_price_nok')
		.eq('id', 1)
		.single();
	if (error) throw error;
	return data as StoreSettings;
}

export async function getOrderById(id: string): Promise<Order | null> {
	if (!UUID_PATTERN.test(id)) return null;
	const { data, error } = await supabaseAdmin.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
	if (error) throw error;
	return data as Order | null;
}

export async function getOrderByToken(token: string): Promise<Order | null> {
	if (!ORDER_TOKEN_PATTERN.test(token)) return null;
	const { data, error } = await supabaseAdmin
		.from('orders')
		.select('*, order_items(*)')
		.eq('access_token', token)
		.maybeSingle();
	if (error) throw error;
	return data as Order | null;
}

export async function listActiveProducts(): Promise<Product[]> {
	const { data, error } = await supabaseAdmin
		.from('products')
		.select('*, product_variants(*)')
		.eq('is_active', true)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data as Product[]).map(sortVariants);
}

export async function listAllProducts(): Promise<Product[]> {
	const { data, error } = await supabaseAdmin
		.from('products')
		.select('*, product_variants(*)')
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data as Product[]).map(sortVariants);
}

export async function getProduct(id: string): Promise<Product | null> {
	if (!UUID_PATTERN.test(id)) return null;
	const { data, error } = await supabaseAdmin
		.from('products')
		.select('*, product_variants(*)')
		.eq('id', id)
		.maybeSingle();
	if (error) throw error;
	return data ? sortVariants(data as Product) : null;
}

export async function getOrderedVariantIds(variantIds: string[]): Promise<string[]> {
	if (variantIds.length === 0) return [];
	const { data, error } = await supabaseAdmin.from('order_items').select('variant_id').in('variant_id', variantIds);
	if (error) throw error;
	return [...new Set((data ?? []).map((r: { variant_id: string }) => r.variant_id))];
}

export async function getOrderEmails(orderId: string): Promise<OrderEmailLog[]> {
	const { data, error } = await supabaseAdmin
		.from('order_emails')
		.select('*')
		.eq('order_id', orderId)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data as OrderEmailLog[];
}

export async function logOrderEmail(row: {
	order_id: string;
	email_type: EmailType;
	recipient: string;
	success: boolean;
	error: string | null;
}): Promise<void> {
	const { error } = await supabaseAdmin.from('order_emails').insert(row);
	if (error) throw error;
}

export function productImageUrl(path: string | null): string | null {
	if (!path) return null;
	return supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
```

`src/lib/shop/emails.server.ts`:

```ts
import transporter from '$lib/emailClient.server';
import { GOOGLE_EMAIL } from '$env/static/private';
import { SHOP_NOTIFY_EMAIL } from './config';
import { getOrderById, getSettings, logOrderEmail } from './db.server';
import { buildOrderEmail } from './emailTemplates';
import type { EmailType } from './types';

export interface SendResult {
	success: boolean;
	error: string | null;
	recipient: string | null;
}

async function safeLog(orderId: string, type: EmailType, recipient: string, success: boolean, error: string | null) {
	try {
		await logOrderEmail({ order_id: orderId, email_type: type, recipient, success, error });
	} catch (err) {
		console.error('[SHOP] Failed to log order email:', err);
	}
}

/** Builds, sends and logs an order email. Never throws. */
export async function sendOrderEmail(orderId: string, type: EmailType, origin: string): Promise<SendResult> {
	let recipient: string | null = null;
	try {
		const [order, settings] = await Promise.all([getOrderById(orderId), getSettings()]);
		if (!order) return { success: false, error: 'Order not found', recipient: null };
		recipient = order.email;

		const email = buildOrderEmail(type, order, {
			orderUrl: `${origin}/shop/order/${order.access_token}`,
			vippsNumber: settings.vipps_number,
			contactEmail: SHOP_NOTIFY_EMAIL
		});

		await transporter.sendMail({
			from: `"Norwegian Open Shop" <${GOOGLE_EMAIL}>`,
			to: order.email,
			bcc: SHOP_NOTIFY_EMAIL,
			replyTo: SHOP_NOTIFY_EMAIL,
			subject: email.subject,
			html: email.html,
			text: email.text
		});

		await safeLog(orderId, type, recipient, true, null);
		return { success: true, error: null, recipient };
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error(`[SHOP] Failed to send ${type} email for order ${orderId}:`, message);
		if (recipient !== null) await safeLog(orderId, type, recipient, false, message);
		return { success: false, error: message, recipient };
	}
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest --run --project server src/lib/shop`
Expected: PASS (all shop suites)

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/db.server.ts src/lib/shop/emails.server.ts src/lib/shop/emails.server.test.ts
git commit -m "feat(shop): add shop data access and logged order emails

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Public shop page

**Files:**
- Create: `src/lib/components/shop/ProductCard.svelte`, `src/routes/shop/+page.server.ts`, `src/routes/shop/+page.svelte`
- Modify: `src/lib/components/htmlComponents/Header.svelte` (desktop "Contact Us" `<li>` around line 137, mobile around line 205)

**Interfaces:**
- Consumes: `listActiveProducts`, `getSettings`, `productImageUrl` (db.server); `cart`, `cartCount` (cart); `formatNok`; `ONE_SIZE_LABEL`, `MAX_LINE_QUANTITY`; `ShopProduct`
- Produces: page data `{ products: ShopProduct[]; shippingEnabled: boolean }`

- [ ] **Step 1: Write `src/routes/shop/+page.server.ts`**

```ts
import type { PageServerLoad } from './$types';
import { getSettings, listActiveProducts, productImageUrl } from '$lib/shop/db.server';
import type { ShopProduct } from '$lib/shop/types';

export const load: PageServerLoad = async () => {
	const [products, settings] = await Promise.all([listActiveProducts(), getSettings()]);
	return {
		products: products.map((p): ShopProduct => ({ ...p, imageUrl: productImageUrl(p.image_path) })),
		shippingEnabled: settings.shipping_price_nok !== null
	};
};
```

- [ ] **Step 2: Write `src/lib/components/shop/ProductCard.svelte`**

```svelte
<script lang="ts">
	import { cart } from '$lib/shop/cart';
	import { MAX_LINE_QUANTITY, ONE_SIZE_LABEL } from '$lib/shop/config';
	import { formatNok } from '$lib/shop/format';
	import type { ShopProduct } from '$lib/shop/types';

	export let product: ShopProduct;

	let selectedId: string | null = product.product_variants.find((v) => v.stock > 0)?.id ?? null;
	let quantity = 1;
	let added = false;

	$: variants = product.product_variants;
	$: hasSizes = !(variants.length === 1 && variants[0].label === ONE_SIZE_LABEL);
	$: soldOut = variants.every((v) => v.stock <= 0);
	$: selected = variants.find((v) => v.id === selectedId) ?? null;
	$: inCart = $cart.find((i) => i.variantId === selectedId)?.quantity ?? 0;
	$: maxAddable = selected ? Math.max(0, Math.min(selected.stock, MAX_LINE_QUANTITY) - inCart) : 0;
	$: if (maxAddable > 0 && quantity > maxAddable) quantity = maxAddable;

	function add() {
		const q = Math.floor(Number(quantity));
		if (!selected || !(q >= 1) || maxAddable < 1) return;
		cart.add(
			{
				variantId: selected.id,
				productId: product.id,
				name: product.name,
				label: selected.label,
				unitPriceNok: product.price_nok,
				maxQuantity: selected.stock,
				imageUrl: product.imageUrl
			},
			Math.min(q, maxAddable)
		);
		quantity = 1;
		added = true;
		setTimeout(() => (added = false), 2000);
	}
</script>

<div class="flex flex-col overflow-hidden rounded-lg border border-amber-400/30 bg-[#232B3A] text-white shadow-xl">
	{#if product.imageUrl}
		<img src={product.imageUrl} alt={product.name} class="aspect-square w-full object-cover" loading="lazy" />
	{:else}
		<div class="flex aspect-square w-full items-center justify-center bg-gray-700 text-white/50">No image</div>
	{/if}
	<div class="flex flex-1 flex-col gap-3 p-5">
		<div class="flex items-start justify-between gap-2">
			<h2 class="text-xl font-semibold">{product.name}</h2>
			<span class="whitespace-nowrap font-semibold text-amber-400">{formatNok(product.price_nok)}</span>
		</div>
		{#if product.description}
			<p class="whitespace-pre-line text-sm text-white/80">{product.description}</p>
		{/if}

		{#if soldOut}
			<p class="mt-auto font-semibold text-red-400">Sold out</p>
		{:else}
			{#if hasSizes}
				<div class="flex flex-wrap gap-2" role="group" aria-label="Size">
					{#each variants as v (v.id)}
						<button
							type="button"
							disabled={v.stock <= 0}
							aria-pressed={selectedId === v.id}
							on:click={() => (selectedId = v.id)}
							class="min-w-12 rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 {selectedId === v.id
								? 'border-amber-400 bg-amber-400 text-gray-900'
								: 'border-gray-400'}"
						>
							{v.label}
						</button>
					{/each}
				</div>
			{/if}
			<div class="mt-auto flex items-center gap-3">
				<label class="text-sm">
					Qty
					<input
						type="number"
						min="1"
						max={Math.max(1, maxAddable)}
						bind:value={quantity}
						class="ml-1 w-16 rounded px-2 py-1 text-gray-900"
					/>
				</label>
				<button
					type="button"
					on:click={add}
					disabled={maxAddable < 1}
					class="flex-1 rounded bg-amber-500 px-4 py-2 font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-50"
				>
					{added ? 'Added ✓' : maxAddable < 1 ? 'All in cart' : 'Add to cart'}
				</button>
			</div>
		{/if}
	</div>
</div>
```

- [ ] **Step 3: Write `src/routes/shop/+page.svelte`**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import ProductCard from '$lib/components/shop/ProductCard.svelte';
	import { cart, cartCount } from '$lib/shop/cart';

	export let data: PageData;

	// The cart lives in localStorage, so only show its count after hydration.
	let mounted = false;
	onMount(() => (mounted = true));
	$: count = cartCount($cart);
</script>

<svelte:head>
	<title>Shop | Norwegian Open WCS</title>
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-12">
	<div class="mb-6 flex items-center justify-between gap-4">
		<h1 class="text-4xl font-bold text-white md:text-5xl">SHOP</h1>
		<a href="/shop/checkout" class="rounded bg-amber-500 px-4 py-2 font-semibold text-gray-900 hover:bg-amber-400">
			Cart{#if mounted && count > 0}&nbsp;({count}){/if}
		</a>
	</div>
	<p class="mb-8 text-white/80">
		Norwegian Open merch. Place your order and pay with Vipps{data.shippingEnabled
			? '. Pick it up or have it shipped to you.'
			: '. We will contact you to arrange pickup.'}
	</p>

	{#if data.products.length === 0}
		<p class="text-white">There are no products in the shop right now. Check back soon!</p>
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.products as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	{/if}
</div>

<style>
	h1 {
		font-family: 'NorseBold';
	}
</style>
```

- [ ] **Step 4: Add the "Shop" link to `Header.svelte`**

Desktop: insert a new `<li>` directly **before** the `<li>` containing `<a href="/contact" class="hover:text-amber-200 transition-colors duration-300 font-bold">Contact Us</a>`:

```svelte
            <li>
                <a href="/shop" class="hover:text-amber-200 transition-colors duration-300 font-bold">Shop</a>
            </li>
```

Mobile: insert directly **before** the `<li class="mt-4">` containing `<a href="/contact" on:click={handleNavClick} class="text-3xl font-bold ...">Contact Us</a>`:

```svelte
            <li class="mt-4">
                <a href="/shop" on:click={handleNavClick} class="text-3xl font-bold hover:text-amber-200 transition-colors duration-300">Shop</a>
            </li>
```

- [ ] **Step 5: Type check**

Run: `npx svelte-kit sync && npx svelte-check --threshold error 2>&1 | grep -i shop`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/shop/ProductCard.svelte src/routes/shop/+page.server.ts src/routes/shop/+page.svelte src/lib/components/htmlComponents/Header.svelte
git commit -m "feat(shop): add public shop page and header link

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Checkout page and placeOrder action

**Files:**
- Create: `src/routes/shop/checkout/+page.server.ts`, `src/routes/shop/checkout/+page.svelte`

**Interfaces:**
- Consumes:
  - `parseCheckoutForm`
  - `supabaseAdmin.rpc('place_order', { p_customer, p_items })`, which returns `[{ out_order_id, out_order_number, out_access_token }]`
  - `sendOrderEmail`
  - `getSettings`, `listActiveProducts`
  - `cart` (`sync`, `setQuantity`, `remove`, `applyStockProblems`), `cartTotal`, `StockProblem`, `CatalogEntry`
  - `formatNok`, `itemDisplayName`
- Produces:
  - Load data `{ shippingPriceNok: number | null; catalog: Record<string, CatalogEntry> }`.
  - Action `placeOrder`:
    - on success, redirects 303 to `/shop/order/<token>?new=1`;
    - otherwise returns `fail(400, { errors, values })`, `fail(409, { stockProblems, values })` or `fail(500, { message, values })`.

- [ ] **Step 1: Write `src/routes/shop/checkout/+page.server.ts`**

```ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { getSettings, listActiveProducts } from '$lib/shop/db.server';
import { sendOrderEmail } from '$lib/shop/emails.server';
import { parseCheckoutForm, type CheckoutInput } from '$lib/shop/checkoutValidation';
import type { CatalogEntry, StockProblem } from '$lib/shop/cart';

export const load: PageServerLoad = async () => {
	const [settings, products] = await Promise.all([getSettings(), listActiveProducts()]);
	const catalog: Record<string, CatalogEntry> = {};
	for (const p of products) {
		for (const v of p.product_variants) catalog[v.id] = { priceNok: p.price_nok, stock: v.stock };
	}
	return { shippingPriceNok: settings.shipping_price_nok, catalog };
};

// Everything except the cart, to refill the form after an error.
function formValues(input: CheckoutInput) {
	const { items: _items, ...values } = input;
	return values;
}

export const actions: Actions = {
	placeOrder: async ({ request, url }) => {
		const { input, errors } = parseCheckoutForm(await request.formData());
		const values = formValues(input);
		if (Object.keys(errors).length > 0) return fail(400, { errors, values });

		const { data, error } = await supabaseAdmin.rpc('place_order', {
			p_customer: {
				customer_name: input.customer_name,
				email: input.email,
				phone: input.phone,
				delivery_method: input.delivery_method,
				address_line: input.address_line,
				postal_code: input.postal_code,
				city: input.city,
				country: input.country
			},
			p_items: input.items
		});

		if (error) {
			if (error.message === 'OUT_OF_STOCK') {
				let stockProblems: StockProblem[] = [];
				try {
					stockProblems = JSON.parse(error.details ?? '[]');
				} catch {
					stockProblems = [];
				}
				return fail(409, { stockProblems, values });
			}
			if (error.message === 'SHIPPING_DISABLED') {
				return fail(400, { errors: { delivery_method: 'Shipping is not available right now. Please choose pickup.' }, values });
			}
			console.error('[SHOP] place_order failed:', error);
			return fail(500, { message: 'Something went wrong placing your order. Please try again.', values });
		}

		const row = (Array.isArray(data) ? data[0] : data) as { out_order_id: string; out_access_token: string };
		// The order stands even if the email fails; the order page shows the payment details.
		await sendOrderEmail(row.out_order_id, 'confirmation', url.origin);
		redirect(303, `/shop/order/${row.out_access_token}?new=1`);
	}
};
```

- [ ] **Step 2: Write `src/routes/shop/checkout/+page.svelte`**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { cart, cartTotal, type StockProblem } from '$lib/shop/cart';
	import { formatNok, itemDisplayName } from '$lib/shop/format';

	export let data: PageData;
	export let form: ActionData;

	let mounted = false;
	let submitting = false;
	let delivery: 'pickup' | 'shipping' = form?.values?.delivery_method === 'shipping' ? 'shipping' : 'pickup';
	let stockMessages: string[] = [];

	onMount(() => {
		// Refresh prices and stock limits in the stored cart from the server.
		cart.sync(data.catalog);
		mounted = true;
	});

	function handleStockProblems(problems: StockProblem[]) {
		stockMessages = problems.map((p) => {
			const item = $cart.find((i) => i.variantId === p.variant_id);
			const name = item ? itemDisplayName(item.name, item.label) : 'An item';
			return p.available > 0
				? `Only ${p.available} left of ${name}. We've updated your cart.`
				: `${name} is sold out and was removed from your cart.`;
		});
		cart.applyStockProblems(problems);
	}

	$: if (form?.stockProblems) handleStockProblems(form.stockProblems);
	$: shippingAvailable = data.shippingPriceNok !== null;
	$: if (!shippingAvailable) delivery = 'pickup';
	$: itemsTotal = cartTotal($cart);
	$: shipping = delivery === 'shipping' && data.shippingPriceNok !== null ? data.shippingPriceNok : 0;
	$: cartJson = JSON.stringify($cart.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
	$: errors = form?.errors ?? {};
	$: values = form?.values;
</script>

<svelte:head>
	<title>Checkout | Norwegian Open Shop</title>
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-12 text-white">
	<a href="/shop" class="text-amber-300 underline">← Back to shop</a>
	<h1 class="mb-8 mt-4 text-4xl font-bold">CHECKOUT</h1>

	{#if !mounted}
		<p>Loading your cart…</p>
	{:else if $cart.length === 0}
		{#each stockMessages as msg}
			<p class="mb-2 rounded border border-red-400 bg-red-400/10 p-3 text-red-200">{msg}</p>
		{/each}
		<p>Your cart is empty. <a href="/shop" class="text-amber-300 underline">Go to the shop</a>.</p>
	{:else}
		{#each stockMessages as msg}
			<p class="mb-2 rounded border border-red-400 bg-red-400/10 p-3 text-red-200">{msg}</p>
		{/each}
		{#if form?.message}
			<p class="mb-4 rounded border border-red-400 bg-red-400/10 p-3 text-red-200">{form.message}</p>
		{/if}

		<section class="mb-8 rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
			<h2 class="mb-4 text-xl font-semibold text-amber-400">Your cart</h2>
			<ul class="divide-y divide-gray-600">
				{#each $cart as item (item.variantId)}
					<li class="flex items-center gap-4 py-3">
						{#if item.imageUrl}
							<img src={item.imageUrl} alt="" class="h-14 w-14 rounded object-cover" />
						{/if}
						<div class="flex-1">
							<p class="font-medium">{itemDisplayName(item.name, item.label)}</p>
							<p class="text-sm text-white/70">{formatNok(item.unitPriceNok)} each</p>
						</div>
						<input
							type="number"
							min="1"
							max={Math.min(item.maxQuantity, 20)}
							value={item.quantity}
							on:change={(e) => cart.setQuantity(item.variantId, Number(e.currentTarget.value))}
							class="w-16 rounded px-2 py-1 text-gray-900"
							aria-label="Quantity"
						/>
						<span class="w-24 text-right">{formatNok(item.unitPriceNok * item.quantity)}</span>
						<button type="button" on:click={() => cart.remove(item.variantId)} class="text-sm text-red-300 underline">
							Remove
						</button>
					</li>
				{/each}
			</ul>
		</section>

		<form
			method="POST"
			action="?/placeOrder"
			class="space-y-6"
			use:enhance={() => {
				submitting = true;
				stockMessages = [];
				return async ({ update }) => {
					await update({ reset: false });
					submitting = false;
				};
			}}
		>
			<input type="hidden" name="cart" value={cartJson} />

			<section class="space-y-4 rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
				<h2 class="text-xl font-semibold text-amber-400">Your details</h2>
				<label class="block">
					<span class="text-sm">Full name *</span>
					<input name="customer_name" required value={values?.customer_name ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
					{#if errors.customer_name}<span class="text-sm text-red-300">{errors.customer_name}</span>{/if}
				</label>
				<label class="block">
					<span class="text-sm">Email *</span>
					<input name="email" type="email" required value={values?.email ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
					{#if errors.email}<span class="text-sm text-red-300">{errors.email}</span>{/if}
				</label>
				<label class="block">
					<span class="text-sm">Phone *</span>
					<input name="phone" type="tel" required value={values?.phone ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
					{#if errors.phone}<span class="text-sm text-red-300">{errors.phone}</span>{/if}
				</label>
			</section>

			<section class="space-y-4 rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
				<h2 class="text-xl font-semibold text-amber-400">Delivery</h2>
				<label class="flex items-center gap-2">
					<input type="radio" name="delivery_method" value="pickup" bind:group={delivery} />
					Pickup / arrange with the organizer
				</label>
				{#if shippingAvailable}
					<label class="flex items-center gap-2">
						<input type="radio" name="delivery_method" value="shipping" bind:group={delivery} />
						Ship to me (+ {formatNok(data.shippingPriceNok ?? 0)})
					</label>
				{/if}
				{#if errors.delivery_method}<p class="text-sm text-red-300">{errors.delivery_method}</p>{/if}

				{#if delivery === 'shipping'}
					<label class="block">
						<span class="text-sm">Street address *</span>
						<input name="address_line" required value={values?.address_line ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
						{#if errors.address_line}<span class="text-sm text-red-300">{errors.address_line}</span>{/if}
					</label>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<label class="block">
							<span class="text-sm">Postcode *</span>
							<input name="postal_code" required value={values?.postal_code ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
							{#if errors.postal_code}<span class="text-sm text-red-300">{errors.postal_code}</span>{/if}
						</label>
						<label class="block sm:col-span-2">
							<span class="text-sm">City *</span>
							<input name="city" required value={values?.city ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
							{#if errors.city}<span class="text-sm text-red-300">{errors.city}</span>{/if}
						</label>
					</div>
					<label class="block">
						<span class="text-sm">Country</span>
						<input name="country" value={values?.country ?? 'Norway'} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
					</label>
				{/if}
			</section>

			<section class="rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
				<div class="flex justify-between"><span>Items</span><span>{formatNok(itemsTotal)}</span></div>
				{#if shipping > 0}
					<div class="flex justify-between"><span>Shipping</span><span>{formatNok(shipping)}</span></div>
				{/if}
				<div class="mt-2 flex justify-between border-t border-gray-600 pt-2 text-lg font-semibold">
					<span>Total</span><span>{formatNok(itemsTotal + shipping)}</span>
				</div>
				{#if errors.items}<p class="mt-2 text-sm text-red-300">{errors.items}</p>{/if}
				<p class="mt-4 text-sm text-white/80">
					You pay with Vipps after placing the order. Your items are reserved when you place the order. Unpaid orders may be cancelled.
					See our <a href="/privacy" class="text-amber-300 underline" target="_blank">Privacy Policy</a>.
				</p>
				<button
					type="submit"
					disabled={submitting}
					class="mt-4 w-full rounded bg-amber-500 px-4 py-3 text-lg font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-50"
				>
					{submitting ? 'Placing order…' : 'Place order'}
				</button>
			</section>
		</form>
	{/if}
</div>

<style>
	h1 {
		font-family: 'NorseBold';
	}
</style>
```

- [ ] **Step 3: Type check**

Run: `npx svelte-kit sync && npx svelte-check --threshold error 2>&1 | grep -i shop`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/routes/shop/checkout
git commit -m "feat(shop): add checkout page with stock-safe order placement

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Customer order status page

**Files:**
- Create: `src/routes/shop/order/[token]/+page.server.ts`, `src/routes/shop/order/[token]/+page.svelte`

**Interfaces:**
- Consumes: `getOrderByToken`, `getSettings`; `CUSTOMER_STATUS_TEXT`, `STATUS_LABELS`; `formatNok`, `itemDisplayName`; `cart.clear()`
- Produces: page data `{ order: Order; vippsNumber: string; isNew: boolean }`

- [ ] **Step 1: Write `src/routes/shop/order/[token]/+page.server.ts`**

```ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getOrderByToken, getSettings } from '$lib/shop/db.server';

export const load: PageServerLoad = async ({ params, url }) => {
	const order = await getOrderByToken(params.token);
	if (!order) error(404, 'Order not found');
	const settings = await getSettings();
	return { order, vippsNumber: settings.vipps_number, isNew: url.searchParams.has('new') };
};
```

- [ ] **Step 2: Write `src/routes/shop/order/[token]/+page.svelte`**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { cart } from '$lib/shop/cart';
	import { CUSTOMER_STATUS_TEXT, STATUS_LABELS } from '$lib/shop/orderStatus';
	import { formatNok, itemDisplayName } from '$lib/shop/format';
	import type { OrderStatus } from '$lib/shop/types';

	export let data: PageData;

	onMount(() => {
		if (data.isNew) cart.clear();
	});

	const bannerClass: Record<OrderStatus, string> = {
		awaiting_payment: 'border-amber-400 bg-amber-400/10',
		paid: 'border-green-400 bg-green-400/10',
		sent: 'border-sky-400 bg-sky-400/10',
		delivered: 'border-green-400 bg-green-400/10',
		cancelled: 'border-red-400 bg-red-400/10'
	};

	$: order = data.order;
	$: itemsTotal = order.total_nok - order.shipping_price_nok;
</script>

<svelte:head>
	<title>Order {order.order_number} | Norwegian Open Shop</title>
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-12 text-white">
	{#if data.isNew}
		<p class="mb-6 rounded border border-green-400 bg-green-400/10 p-4">Order placed! We've emailed you the details.</p>
	{/if}

	<h1 class="mb-2 text-3xl font-bold">Order {order.order_number}</h1>
	<p class="mb-6 text-white/70">Placed {new Date(order.created_at).toLocaleDateString('nb-NO')}</p>

	<div class="mb-6 rounded-lg border-2 p-5 {bannerClass[order.status]}">
		<p class="text-sm uppercase tracking-wide text-white/70">Status</p>
		<p class="text-2xl font-semibold">{STATUS_LABELS[order.status]}</p>
		<p class="mt-1">{CUSTOMER_STATUS_TEXT[order.status]}</p>
	</div>

	{#if order.status === 'awaiting_payment'}
		<div class="mb-6 rounded-lg border-2 border-amber-400 bg-[#232B3A] p-5">
			<h2 class="mb-2 text-xl font-semibold text-amber-400">How to pay</h2>
			<p>Pay <strong>{formatNok(order.total_nok)}</strong> with Vipps to <strong>{data.vippsNumber}</strong>.</p>
			<p>Write <strong>{order.order_number}</strong> in the Vipps message.</p>
		</div>
	{/if}

	<section class="mb-6 rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
		<h2 class="mb-3 text-xl font-semibold text-amber-400">Items</h2>
		<ul class="divide-y divide-gray-600">
			{#each order.order_items as item (item.id)}
				<li class="flex justify-between py-2">
					<span>{item.quantity} × {itemDisplayName(item.product_name, item.variant_label)}</span>
					<span>{formatNok(item.unit_price_nok * item.quantity)}</span>
				</li>
			{/each}
		</ul>
		<div class="mt-3 space-y-1 border-t border-gray-600 pt-3">
			<div class="flex justify-between"><span>Items</span><span>{formatNok(itemsTotal)}</span></div>
			{#if order.shipping_price_nok > 0}
				<div class="flex justify-between"><span>Shipping</span><span>{formatNok(order.shipping_price_nok)}</span></div>
			{/if}
			<div class="flex justify-between text-lg font-semibold"><span>Total</span><span>{formatNok(order.total_nok)}</span></div>
		</div>
	</section>

	<section class="rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
		<h2 class="mb-3 text-xl font-semibold text-amber-400">Delivery</h2>
		{#if order.delivery_method === 'shipping'}
			<p>Shipping to:</p>
			<p>{order.customer_name}<br />{order.address_line}<br />{order.postal_code} {order.city}<br />{order.country}</p>
		{:else}
			<p>Pickup / arranged with the organizer. We will contact you.</p>
		{/if}
	</section>

	<p class="mt-8 text-sm text-white/70">
		Questions? Email <a href="mailto:norwegianopenwcs@gmail.com" class="text-amber-300 underline">norwegianopenwcs@gmail.com</a>
		and include your order number.
	</p>
</div>
```

- [ ] **Step 3: Type check**

Run: `npx svelte-kit sync && npx svelte-check --threshold error 2>&1 | grep -i shop`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add "src/routes/shop/order"
git commit -m "feat(shop): add permanent customer order status page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Admin shop layout, products list, and product editor

**Files:**
- Create:
  - `src/routes/admin/shop/+page.server.ts`
  - `src/routes/admin/shop/+layout.svelte`
  - `src/routes/admin/shop/products/+page.server.ts`, `src/routes/admin/shop/products/+page.svelte`
  - `src/routes/admin/shop/products/[id]/+page.server.ts`, `src/routes/admin/shop/products/[id]/+page.svelte`

**Interfaces:**
- Consumes:
  - `listAllProducts`, `getProduct`, `getOrderedVariantIds`, `productImageUrl`
  - `parseProductForm`
  - `ALLOWED_IMAGE_TYPES`, `MAX_IMAGE_BYTES`, `PRODUCT_IMAGE_BUCKET`, `ONE_SIZE_LABEL`
  - `supabaseAdmin`, `formatNok`
- Produces:
  - Routes `/admin/shop` (redirects to `/admin/shop/orders`), `/admin/shop/products` and `/admin/shop/products/[id]` (`id = new` creates). The products list is reached through the shop sub-nav tabs.
  - Actions `save` and `delete` on the editor.

- [ ] **Step 1: Write the redirect and the tabs layout**

`src/routes/admin/shop/+page.server.ts`:

```ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	redirect(303, '/admin/shop/orders');
};
```

`src/routes/admin/shop/+layout.svelte`:

```svelte
<script lang="ts">
	import { page } from '$app/stores';
	const tabs = [
		{ href: '/admin/shop/orders', label: 'Orders' },
		{ href: '/admin/shop/products', label: 'Products' }
	];
</script>

<div class="mb-6 flex gap-2 border-b border-gray-700">
	{#each tabs as tab}
		<a
			href={tab.href}
			class="-mb-px border-b-2 px-4 py-2 font-semibold {$page.url.pathname.startsWith(tab.href)
				? 'border-amber-400 text-amber-400'
				: 'border-transparent text-gray-300 hover:text-white'}"
		>
			{tab.label}
		</a>
	{/each}
</div>

<slot />
```

- [ ] **Step 2: Write the products list**

`src/routes/admin/shop/products/+page.server.ts`:

```ts
import type { PageServerLoad } from './$types';
import { listAllProducts, productImageUrl } from '$lib/shop/db.server';

export const load: PageServerLoad = async ({ url }) => {
	const products = await listAllProducts();
	return {
		products: products.map((p) => ({ ...p, imageUrl: productImageUrl(p.image_path) })),
		notice: url.searchParams.has('saved') ? 'Product saved.' : url.searchParams.has('deleted') ? 'Product deleted.' : null
	};
};
```

`src/routes/admin/shop/products/+page.svelte`:

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { formatNok } from '$lib/shop/format';
	export let data: PageData;
</script>

<div class="mb-4 flex items-center justify-between">
	<h1 class="text-2xl font-bold text-amber-400">Products</h1>
	<a href="/admin/shop/products/new" class="rounded bg-amber-500 px-4 py-2 font-semibold text-gray-900 hover:bg-amber-400">+ Add product</a>
</div>

{#if data.notice}
	<p class="mb-4 rounded border border-green-500 bg-green-500/10 p-3 text-green-200">{data.notice}</p>
{/if}

{#if data.products.length === 0}
	<p>No products yet. Add your first one.</p>
{:else}
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead class="bg-gray-800 text-gray-300">
				<tr>
					<th class="p-2">Image</th>
					<th class="p-2">Name</th>
					<th class="p-2">Price</th>
					<th class="p-2">Stock</th>
					<th class="p-2">In shop</th>
					<th class="p-2"></th>
				</tr>
			</thead>
			<tbody>
				{#each data.products as p (p.id)}
					<tr class="border-b border-gray-700">
						<td class="p-2">
							{#if p.imageUrl}<img src={p.imageUrl} alt="" class="h-12 w-12 rounded object-cover" />{:else}<span class="text-gray-500">—</span>{/if}
						</td>
						<td class="p-2 font-medium">{p.name}</td>
						<td class="p-2">{formatNok(p.price_nok)}</td>
						<td class="p-2">
							{#each p.product_variants as v, i (v.id)}
								<span class={v.stock === 0 ? 'text-red-400' : ''}>{v.label} {v.stock}</span>{i < p.product_variants.length - 1 ? ' · ' : ''}
							{/each}
						</td>
						<td class="p-2">{p.is_active ? 'Yes' : 'Hidden'}</td>
						<td class="p-2"><a href="/admin/shop/products/{p.id}" class="text-amber-300 underline">Edit</a></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
```

- [ ] **Step 3: Write the product editor server**

`src/routes/admin/shop/products/[id]/+page.server.ts`:

```ts
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { getOrderedVariantIds, getProduct, productImageUrl } from '$lib/shop/db.server';
import { parseProductForm } from '$lib/shop/adminForms';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, PRODUCT_IMAGE_BUCKET } from '$lib/shop/config';

export const load: PageServerLoad = async ({ params, url }) => {
	if (params.id === 'new') {
		return { product: null, imageUrl: null, orderedVariantIds: [] as string[], imageFailed: false };
	}
	const product = await getProduct(params.id);
	if (!product) error(404, 'Product not found');
	const orderedVariantIds = await getOrderedVariantIds(product.product_variants.map((v) => v.id));
	return {
		product,
		imageUrl: productImageUrl(product.image_path),
		orderedVariantIds,
		imageFailed: url.searchParams.has('image_failed')
	};
};

function imageError(file: File): string | null {
	if (!ALLOWED_IMAGE_TYPES[file.type]) return 'Image must be JPG, PNG or WebP.';
	if (file.size > MAX_IMAGE_BYTES) return 'Image must be 4 MB or smaller.';
	return null;
}

export const actions: Actions = {
	save: async ({ params, request }) => {
		const form = await request.formData();
		const { values, errors } = parseProductForm(form);
		const image = form.get('image');
		const file = image instanceof File && image.size > 0 ? image : null;
		const imgErr = file ? imageError(file) : null;
		if (imgErr) errors.image = imgErr;
		if (Object.keys(errors).length > 0) return fail(400, { errors, values });

		const isNew = params.id === 'new';
		const existing = isNew ? null : await getProduct(params.id);
		if (!isNew && !existing) error(404, 'Product not found');

		// Refuse to remove sizes that have orders, before changing anything.
		const keptIds = new Set(values.variants.map((v) => v.id).filter((id): id is string => !!id));
		const removed = (existing?.product_variants ?? []).filter((v) => !keptIds.has(v.id));
		const orderedRemoved = new Set(await getOrderedVariantIds(removed.map((v) => v.id)));
		const blocked = removed.filter((v) => orderedRemoved.has(v.id));
		if (blocked.length > 0) {
			return fail(400, {
				errors: {
					variants: `These sizes have orders and can't be removed: ${blocked.map((v) => v.label).join(', ')}. Set their stock to 0 instead.`
				},
				values
			});
		}

		const productFields = {
			name: values.name,
			description: values.description,
			price_nok: values.price_nok,
			is_active: values.is_active
		};

		let productId = params.id;
		if (isNew) {
			const { data, error: insertError } = await supabaseAdmin.from('products').insert(productFields).select('id').single();
			if (insertError || !data) {
				console.error('[SHOP ADMIN] Insert product failed:', insertError);
				return fail(500, { message: 'Could not save the product.', values });
			}
			productId = data.id;
		} else {
			const { error: updateError } = await supabaseAdmin.from('products').update(productFields).eq('id', productId);
			if (updateError) {
				console.error('[SHOP ADMIN] Update product failed:', updateError);
				return fail(500, { message: 'Could not save the product.', values });
			}
		}

		if (removed.length > 0) {
			const { error: deleteError } = await supabaseAdmin
				.from('product_variants')
				.delete()
				.in('id', removed.map((v) => v.id));
			if (deleteError) return fail(500, { message: `Could not remove sizes: ${deleteError.message}`, values });
		}

		for (const v of values.variants) {
			const row = { label: v.label, stock: v.stock, sort_order: v.sort_order };
			const { error: variantError } = v.id
				? await supabaseAdmin.from('product_variants').update(row).eq('id', v.id).eq('product_id', productId)
				: await supabaseAdmin.from('product_variants').insert({ ...row, product_id: productId });
			if (variantError) {
				return fail(500, { message: `Could not save size "${v.label}": ${variantError.message}`, values });
			}
		}

		const removeImage = form.get('remove_image') === 'on';
		if (file || removeImage) {
			const oldPath = existing?.image_path ?? null;
			let newPath: string | null = null;
			if (file) {
				newPath = `products/${productId}-${Date.now()}.${ALLOWED_IMAGE_TYPES[file.type]}`;
				const { error: uploadError } = await supabaseAdmin.storage
					.from(PRODUCT_IMAGE_BUCKET)
					.upload(newPath, file, { contentType: file.type });
				if (uploadError) {
					console.error('[SHOP ADMIN] Image upload failed:', uploadError);
					redirect(303, `/admin/shop/products/${productId}?image_failed=1`);
				}
			}
			await supabaseAdmin.from('products').update({ image_path: newPath }).eq('id', productId);
			if (oldPath) await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).remove([oldPath]);
		}

		redirect(303, '/admin/shop/products?saved=1');
	},

	delete: async ({ params }) => {
		const product = await getProduct(params.id);
		if (!product) error(404, 'Product not found');
		const ordered = await getOrderedVariantIds(product.product_variants.map((v) => v.id));
		if (ordered.length > 0) {
			return fail(400, { message: 'This product has orders and cannot be deleted. Untick "Visible in shop" to hide it instead.' });
		}
		const { error: deleteError } = await supabaseAdmin.from('products').delete().eq('id', product.id);
		if (deleteError) return fail(500, { message: 'Could not delete the product.' });
		if (product.image_path) await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).remove([product.image_path]);
		redirect(303, '/admin/shop/products?deleted=1');
	}
};
```

- [ ] **Step 4: Write the product editor page**

`src/routes/admin/shop/products/[id]/+page.svelte`:

```svelte
<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { ONE_SIZE_LABEL } from '$lib/shop/config';

	export let data: PageData;
	export let form: ActionData;

	type Row = { id: string; label: string; stock: number | string };

	let rows: Row[] = data.product?.product_variants.map((v) => ({ id: v.id, label: v.label, stock: v.stock })) ?? [
		{ id: '', label: ONE_SIZE_LABEL, stock: 0 }
	];
	// After a failed save, show what the admin typed.
	$: if (form?.values) rows = form.values.variants.map((v) => ({ id: v.id ?? '', label: v.label, stock: Number.isNaN(v.stock) ? '' : v.stock }));

	$: values = form?.values;
	$: errors = form?.errors ?? {};
	$: ordered = new Set(data.orderedVariantIds);

	function addRow() {
		rows = [...rows, { id: '', label: '', stock: 0 }];
	}
	function removeRow(index: number) {
		rows = rows.filter((_, i) => i !== index);
	}
</script>

<a href="/admin/shop/products" class="text-amber-300 underline">← All products</a>
<h1 class="mb-6 mt-2 text-2xl font-bold text-amber-400">{data.product ? `Edit ${data.product.name}` : 'Add product'}</h1>

{#if form?.message}
	<p class="mb-4 rounded border border-red-500 bg-red-500/10 p-3 text-red-200">{form.message}</p>
{/if}
{#if data.imageFailed}
	<p class="mb-4 rounded border border-amber-500 bg-amber-500/10 p-3 text-amber-200">The product was saved, but the image upload failed. Please try uploading it again.</p>
{/if}

<form method="POST" action="?/save" enctype="multipart/form-data" class="max-w-2xl space-y-5">
	<label class="block">
		<span class="text-sm">Name *</span>
		<input name="name" required value={values?.name ?? data.product?.name ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
		{#if errors.name}<span class="text-sm text-red-300">{errors.name}</span>{/if}
	</label>

	<label class="block">
		<span class="text-sm">Description</span>
		<textarea name="description" rows="3" class="mt-1 block w-full rounded px-3 py-2 text-gray-900">{values?.description ?? data.product?.description ?? ''}</textarea>
	</label>

	<label class="block">
		<span class="text-sm">Price (NOK, whole kroner) *</span>
		<input name="price_nok" type="number" min="0" step="1" required value={values ? (Number.isNaN(values.price_nok) ? '' : values.price_nok) : (data.product?.price_nok ?? '')} class="mt-1 block w-40 rounded px-3 py-2 text-gray-900" />
		{#if errors.price_nok}<span class="block text-sm text-red-300">{errors.price_nok}</span>{/if}
	</label>

	<fieldset class="rounded border border-gray-600 p-4">
		<legend class="px-2 text-sm">Sizes and stock *</legend>
		<p class="mb-3 text-xs text-gray-400">For items without sizes, keep a single row called "{ONE_SIZE_LABEL}".</p>
		{#each rows as row, i (i)}
			<div class="mb-2 flex items-center gap-2">
				<input type="hidden" name="variant_id" value={row.id} />
				<input name="variant_label" placeholder="Size, e.g. M" bind:value={row.label} class="w-40 rounded px-3 py-2 text-gray-900" />
				<input name="variant_stock" type="number" min="0" step="1" bind:value={row.stock} class="w-28 rounded px-3 py-2 text-gray-900" aria-label="Stock" />
				{#if row.id && ordered.has(row.id)}
					<span class="text-xs text-gray-400" title="This size has orders. Set stock to 0 instead of removing it.">has orders</span>
				{:else}
					<button type="button" on:click={() => removeRow(i)} class="text-sm text-red-300 underline">Remove</button>
				{/if}
			</div>
		{/each}
		<button type="button" on:click={addRow} class="mt-2 text-sm text-amber-300 underline">+ Add size</button>
		{#if errors.variants}<p class="mt-2 text-sm text-red-300">{errors.variants}</p>{/if}
	</fieldset>

	<div>
		<span class="text-sm">Image (JPG, PNG or WebP, max 4 MB)</span>
		{#if data.imageUrl}
			<div class="my-2 flex items-center gap-4">
				<img src={data.imageUrl} alt="" class="h-24 w-24 rounded object-cover" />
				<label class="flex items-center gap-2 text-sm"><input type="checkbox" name="remove_image" /> Remove image</label>
			</div>
		{/if}
		<input type="file" name="image" accept="image/jpeg,image/png,image/webp" class="mt-1 block text-sm" />
		{#if errors.image}<span class="text-sm text-red-300">{errors.image}</span>{/if}
	</div>

	<label class="flex items-center gap-2">
		<input type="checkbox" name="is_active" checked={values ? values.is_active : (data.product?.is_active ?? true)} />
		Visible in shop
	</label>

	<button type="submit" class="rounded bg-amber-500 px-6 py-2 font-semibold text-gray-900 hover:bg-amber-400">Save product</button>
</form>

{#if data.product}
	<form
		method="POST"
		action="?/delete"
		class="mt-10"
		on:submit={(e) => {
			if (!confirm(`Delete ${data.product?.name}? This cannot be undone.`)) e.preventDefault();
		}}
	>
		<button type="submit" class="rounded bg-red-700 px-4 py-2 text-sm hover:bg-red-600">Delete product</button>
	</form>
{/if}
```

- [ ] **Step 5: Type check**

Run: `npx svelte-kit sync && npx svelte-check --threshold error 2>&1 | grep -i shop`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/routes/admin/shop/+page.server.ts src/routes/admin/shop/+layout.svelte src/routes/admin/shop/products
git commit -m "feat(shop): add admin product management with sizes and image upload

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Admin orders list, store settings, admin nav link

**Files:**
- Create: `src/routes/admin/shop/orders/+page.server.ts`, `src/routes/admin/shop/orders/+page.svelte`
- Modify: `src/routes/admin/+layout.svelte` (desktop nav, before the Dashboard `<a>`; mobile nav, before the Dashboard `<a>`)

**Interfaces:**
- Consumes: `getSettings`, `parseSettingsForm`, `supabaseAdmin`, `STATUS_LABELS`, `ORDER_STATUSES`, `formatNok`, `itemDisplayName`
- Produces:
  - Load data `{ orders: AdminOrderRow[]; status: OrderStatus | 'all'; settings: StoreSettings }`.
  - Action `saveSettings`: returns `{ settingsSaved: true }`, or fails with `fail(400, { settingsError })` or `fail(500, { settingsError })`.

- [ ] **Step 1: Write `src/routes/admin/shop/orders/+page.server.ts`**

```ts
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { getSettings } from '$lib/shop/db.server';
import { parseSettingsForm } from '$lib/shop/adminForms';
import { ORDER_STATUSES } from '$lib/shop/orderStatus';
import type { DeliveryMethod, OrderStatus } from '$lib/shop/types';

type Filter = OrderStatus | 'all';

interface OrderRow {
	id: string;
	order_number: string;
	created_at: string;
	customer_name: string;
	email: string;
	delivery_method: DeliveryMethod;
	total_nok: number;
	status: OrderStatus;
	order_items: { product_name: string; variant_label: string; quantity: number }[];
	order_emails: { success: boolean; created_at: string }[];
}

export const load: PageServerLoad = async ({ url }) => {
	const requested = url.searchParams.get('status');
	const status: Filter =
		requested === 'all' || ORDER_STATUSES.includes(requested as OrderStatus) ? (requested as Filter) : 'awaiting_payment';

	let query = supabaseAdmin
		.from('orders')
		.select(
			'id, order_number, created_at, customer_name, email, delivery_method, total_nok, status, order_items(product_name, variant_label, quantity), order_emails(success, created_at)'
		)
		.order('created_at', { ascending: false });
	if (status !== 'all') query = query.eq('status', status);

	const { data, error: loadError } = await query;
	if (loadError) {
		console.error('[SHOP ADMIN] Load orders failed:', loadError);
		error(500, 'Could not load orders');
	}

	const orders = ((data ?? []) as OrderRow[]).map(({ order_emails, ...o }) => {
		const latest = [...order_emails].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
		return { ...o, lastEmailFailed: latest ? !latest.success : false };
	});

	return { orders, status, settings: await getSettings() };
};

export const actions: Actions = {
	saveSettings: async ({ request }) => {
		const { values, error: settingsError } = parseSettingsForm(await request.formData());
		if (settingsError) return fail(400, { settingsError });
		const { error: saveError } = await supabaseAdmin
			.from('store_settings')
			.update({ ...values, updated_at: new Date().toISOString() })
			.eq('id', 1);
		if (saveError) {
			console.error('[SHOP ADMIN] Save settings failed:', saveError);
			return fail(500, { settingsError: 'Could not save settings.' });
		}
		return { settingsSaved: true };
	}
};
```

- [ ] **Step 2: Write `src/routes/admin/shop/orders/+page.svelte`**

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { ORDER_STATUSES, STATUS_LABELS } from '$lib/shop/orderStatus';
	import { formatNok, itemDisplayName } from '$lib/shop/format';

	export let data: PageData;
	export let form: ActionData;

	const filters = [...ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })), { value: 'all', label: 'All' }];
</script>

<section class="mb-8 rounded border border-gray-700 bg-gray-800 p-4">
	<h2 class="mb-3 text-lg font-semibold text-amber-400">Shop settings</h2>
	<form method="POST" action="?/saveSettings" use:enhance={() => async ({ update }) => update({ reset: false })} class="flex flex-wrap items-end gap-4">
		<label class="block">
			<span class="text-sm">Vipps number</span>
			<input name="vipps_number" value={data.settings.vipps_number} class="mt-1 block w-48 rounded px-3 py-2 text-gray-900" />
		</label>
		<label class="block">
			<span class="text-sm">Shipping price (NOK, empty = no shipping)</span>
			<input name="shipping_price_nok" type="number" min="0" step="1" value={data.settings.shipping_price_nok ?? ''} class="mt-1 block w-48 rounded px-3 py-2 text-gray-900" />
		</label>
		<button type="submit" class="rounded bg-amber-500 px-4 py-2 font-semibold text-gray-900 hover:bg-amber-400">Save settings</button>
	</form>
	{#if form?.settingsSaved}<p class="mt-2 text-sm text-green-300">Settings saved.</p>{/if}
	{#if form?.settingsError}<p class="mt-2 text-sm text-red-300">{form.settingsError}</p>{/if}
	{#if !data.settings.vipps_number}
		<p class="mt-2 text-sm text-amber-300">⚠️ No Vipps number set. Customers will not see where to pay.</p>
	{/if}
</section>

<h1 class="mb-4 text-2xl font-bold text-amber-400">Orders</h1>

<div class="mb-4 flex flex-wrap gap-2">
	{#each filters as f}
		<a
			href="?status={f.value}"
			class="rounded px-3 py-1 text-sm {data.status === f.value ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}"
		>
			{f.label}
		</a>
	{/each}
</div>

{#if data.orders.length === 0}
	<p>No orders here.</p>
{:else}
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead class="bg-gray-800 text-gray-300">
				<tr>
					<th class="p-2">Order</th>
					<th class="p-2">Date</th>
					<th class="p-2">Customer</th>
					<th class="p-2">Items</th>
					<th class="p-2">Delivery</th>
					<th class="p-2">Total</th>
					<th class="p-2">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each data.orders as o (o.id)}
					<tr class="border-b border-gray-700 hover:bg-gray-800">
						<td class="p-2">
							<a href="/admin/shop/orders/{o.id}" class="font-semibold text-amber-300 underline">{o.order_number}</a>
							{#if o.lastEmailFailed}<span title="The last email to this customer failed">⚠️</span>{/if}
						</td>
						<td class="p-2">{new Date(o.created_at).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })}</td>
						<td class="p-2">{o.customer_name}<br /><span class="text-gray-400">{o.email}</span></td>
						<td class="p-2">
							{#each o.order_items as item}
								<div>{item.quantity} × {itemDisplayName(item.product_name, item.variant_label)}</div>
							{/each}
						</td>
						<td class="p-2">{o.delivery_method === 'shipping' ? 'Shipping' : 'Pickup'}</td>
						<td class="p-2">{formatNok(o.total_nok)}</td>
						<td class="p-2">{STATUS_LABELS[o.status]}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
```

- [ ] **Step 3: Add the "Shop" link to `src/routes/admin/+layout.svelte`**

Desktop: insert directly **before** `<a href="/admin/dashboard" class="px-4 py-2 rounded bg-indigo-500 ...">`, inside the `{:else}` branch:

```svelte
                        <a href="/admin/shop/orders" class="px-4 py-2 rounded bg-amber-500 text-gray-900 font-semibold shadow hover:bg-amber-400 transition-colors duration-150 mr-2">
                            Shop
                        </a>
```

Mobile: insert directly **before** `<a href="/admin/dashboard" class="px-4 py-3 border-b border-gray-700 hover:bg-indigo-500 ...">`:

```svelte
                        <a href="/admin/shop/orders" class="px-4 py-3 border-b border-gray-700 hover:bg-amber-500 hover:text-gray-900 transition-colors">Shop</a>
```

- [ ] **Step 4: Type check**

Run: `npx svelte-kit sync && npx svelte-check --threshold error 2>&1 | grep -i shop`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/routes/admin/shop/orders/+page.server.ts src/routes/admin/shop/orders/+page.svelte src/routes/admin/+layout.svelte
git commit -m "feat(shop): add admin orders list, shop settings and admin nav link

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Admin order detail with status actions and email log

**Files:**
- Create: `src/routes/admin/shop/orders/[id]/+page.server.ts`, `src/routes/admin/shop/orders/[id]/+page.svelte`

**Interfaces:**
- Consumes:
  - `getOrderById`, `getOrderEmails`
  - `adminActions`, `confirmMessage`, `resultMessage`, `STATUS_LABELS`, `EMAIL_TYPE_LABELS`
  - `sendOrderEmail`
  - `supabaseAdmin.rpc('set_order_status' | 'cancel_order')`
  - `formatNok`, `itemDisplayName`
- Produces:
  - Load data `{ order, emails, actions: AdminAction[], customerUrl }`.
  - Action `act` (form field `action_id`, plus `email_type` for disambiguation): returns `{ result: { ok: boolean; message: string } }`, or fails with `fail(400 | 500, { result })`.

- [ ] **Step 1: Write `src/routes/admin/shop/orders/[id]/+page.server.ts`**

```ts
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { getOrderById, getOrderEmails } from '$lib/shop/db.server';
import { sendOrderEmail } from '$lib/shop/emails.server';
import { adminActions, resultMessage } from '$lib/shop/orderStatus';

export const load: PageServerLoad = async ({ params, url }) => {
	const order = await getOrderById(params.id);
	if (!order) error(404, 'Order not found');
	const emails = await getOrderEmails(order.id);
	return {
		order,
		emails,
		actions: adminActions(order.status),
		customerUrl: `${url.origin}/shop/order/${order.access_token}`
	};
};

export const actions: Actions = {
	act: async ({ params, request, url }) => {
		const form = await request.formData();
		const actionId = String(form.get('action_id') ?? '');
		const emailType = String(form.get('email_type') ?? '');

		const order = await getOrderById(params.id);
		if (!order) error(404, 'Order not found');

		// Re-check against the current status, in case someone else changed it.
		const action = adminActions(order.status).find((a) => a.id === actionId && a.emailType === emailType);
		if (!action) {
			return fail(400, { result: { ok: false, message: 'That action is no longer available for this order. The page has been refreshed.' } });
		}

		if (action.kind === 'status') {
			const { error: rpcError } = await supabaseAdmin.rpc('set_order_status', { p_order_id: order.id, p_status: action.to });
			if (rpcError) {
				console.error('[SHOP ADMIN] set_order_status failed:', rpcError);
				return fail(500, { result: { ok: false, message: `Could not change status: ${rpcError.message}` } });
			}
		} else if (action.kind === 'cancel') {
			const { error: rpcError } = await supabaseAdmin.rpc('cancel_order', { p_order_id: order.id });
			if (rpcError) {
				console.error('[SHOP ADMIN] cancel_order failed:', rpcError);
				return fail(500, { result: { ok: false, message: `Could not cancel the order: ${rpcError.message}` } });
			}
		}

		// The status change is already committed; a failed email is reported, not rolled back.
		const mail = await sendOrderEmail(order.id, action.emailType, url.origin);
		return { result: { ok: mail.success, message: resultMessage(action, mail, order.email) } };
	}
};
```

- [ ] **Step 2: Write `src/routes/admin/shop/orders/[id]/+page.svelte`**

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { EMAIL_TYPE_LABELS, STATUS_LABELS, confirmMessage } from '$lib/shop/orderStatus';
	import { formatNok, itemDisplayName } from '$lib/shop/format';

	export let data: PageData;
	export let form: ActionData;

	let busy = false;

	$: order = data.order;
	$: itemsTotal = order.total_nok - order.shipping_price_nok;

	const fmt = (iso: string | null) =>
		iso ? new Date(iso).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' }) : '—';
</script>

<a href="/admin/shop/orders" class="text-amber-300 underline">← All orders</a>

<div class="mb-6 mt-2 flex flex-wrap items-center gap-4">
	<h1 class="text-2xl font-bold text-amber-400">Order {order.order_number}</h1>
	<span class="rounded bg-gray-700 px-3 py-1 text-sm font-semibold">{STATUS_LABELS[order.status]}</span>
</div>

{#if form?.result}
	<p class="mb-6 rounded border p-3 {form.result.ok ? 'border-green-500 bg-green-500/10 text-green-200' : 'border-amber-500 bg-amber-500/10 text-amber-200'}">
		{form.result.ok ? '✅' : '⚠️'} {form.result.message}
	</p>
{/if}

<section class="mb-6 rounded border border-gray-700 bg-gray-800 p-4">
	<h2 class="mb-3 text-lg font-semibold text-amber-400">Actions</h2>
	<div class="flex flex-wrap gap-3">
		{#each data.actions as action (action.id + action.emailType)}
			<form
				method="POST"
				action="?/act"
				use:enhance={({ cancel }) => {
					if (!confirm(confirmMessage(action, order.order_number, order.email))) {
						cancel();
						return;
					}
					busy = true;
					return async ({ update }) => {
						await update();
						busy = false;
					};
				}}
			>
				<input type="hidden" name="action_id" value={action.id} />
				<input type="hidden" name="email_type" value={action.emailType} />
				<button
					type="submit"
					disabled={busy}
					class="rounded px-4 py-2 font-semibold disabled:opacity-50 {action.danger
						? 'bg-red-700 hover:bg-red-600'
						: action.kind === 'resend'
							? 'bg-gray-600 hover:bg-gray-500'
							: 'bg-amber-500 text-gray-900 hover:bg-amber-400'}"
				>
					{action.label}
				</button>
			</form>
		{/each}
	</div>
	<p class="mt-3 text-xs text-gray-400">Every action asks for confirmation and emails the customer (copy to norwegianopenwcs@gmail.com).</p>
</section>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
	<section class="rounded border border-gray-700 bg-gray-800 p-4">
		<h2 class="mb-3 text-lg font-semibold text-amber-400">Customer</h2>
		<p>{order.customer_name}</p>
		<p><a href="mailto:{order.email}" class="text-amber-300 underline">{order.email}</a></p>
		<p><a href="tel:{order.phone}" class="text-amber-300 underline">{order.phone}</a></p>
		<h3 class="mb-1 mt-4 font-semibold">Delivery</h3>
		{#if order.delivery_method === 'shipping'}
			<p>Shipping to:<br />{order.address_line}<br />{order.postal_code} {order.city}<br />{order.country}</p>
		{:else}
			<p>Pickup / arrange with customer</p>
		{/if}
		<h3 class="mb-1 mt-4 font-semibold">Customer order page</h3>
		<a href={data.customerUrl} target="_blank" rel="noopener noreferrer" class="break-all text-sm text-amber-300 underline">{data.customerUrl}</a>
	</section>

	<section class="rounded border border-gray-700 bg-gray-800 p-4">
		<h2 class="mb-3 text-lg font-semibold text-amber-400">Items</h2>
		<ul>
			{#each order.order_items as item (item.id)}
				<li class="flex justify-between py-1">
					<span>{item.quantity} × {itemDisplayName(item.product_name, item.variant_label)}</span>
					<span>{formatNok(item.unit_price_nok * item.quantity)}</span>
				</li>
			{/each}
		</ul>
		<div class="mt-2 border-t border-gray-600 pt-2">
			<div class="flex justify-between"><span>Items</span><span>{formatNok(itemsTotal)}</span></div>
			{#if order.shipping_price_nok > 0}
				<div class="flex justify-between"><span>Shipping</span><span>{formatNok(order.shipping_price_nok)}</span></div>
			{/if}
			<div class="flex justify-between font-semibold"><span>Total</span><span>{formatNok(order.total_nok)}</span></div>
		</div>
		<h3 class="mb-1 mt-4 font-semibold">Timeline</h3>
		<dl class="grid grid-cols-2 gap-x-4 text-sm">
			<dt class="text-gray-400">Placed</dt><dd>{fmt(order.created_at)}</dd>
			<dt class="text-gray-400">Paid</dt><dd>{fmt(order.paid_at)}</dd>
			<dt class="text-gray-400">Sent</dt><dd>{fmt(order.sent_at)}</dd>
			<dt class="text-gray-400">Delivered</dt><dd>{fmt(order.delivered_at)}</dd>
			<dt class="text-gray-400">Cancelled</dt><dd>{fmt(order.cancelled_at)}</dd>
		</dl>
	</section>
</div>

<section class="mt-6 rounded border border-gray-700 bg-gray-800 p-4">
	<h2 class="mb-3 text-lg font-semibold text-amber-400">Email log</h2>
	{#if data.emails.length === 0}
		<p class="text-sm text-gray-400">No emails sent yet.</p>
	{:else}
		<table class="w-full text-left text-sm">
			<thead class="text-gray-400">
				<tr><th class="py-1">Time</th><th class="py-1">Email</th><th class="py-1">To</th><th class="py-1">Result</th></tr>
			</thead>
			<tbody>
				{#each data.emails as e (e.id)}
					<tr class="border-t border-gray-700">
						<td class="py-1">{fmt(e.created_at)}</td>
						<td class="py-1">{EMAIL_TYPE_LABELS[e.email_type]}</td>
						<td class="py-1">{e.recipient}</td>
						<td class="py-1">{#if e.success}<span class="text-green-300">Sent</span>{:else}<span class="text-red-300">Failed: {e.error}</span>{/if}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</section>
```

- [ ] **Step 3: Type check**

Run: `npx svelte-kit sync && npx svelte-check --threshold error 2>&1 | grep -i shop`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add "src/routes/admin/shop/orders/[id]"
git commit -m "feat(shop): add admin order detail with status actions, emails and log

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Privacy Policy update

**Files:**
- Modify: `src/routes/privacy/+page.svelte`

**Interfaces:**
- Consumes: none. This is static content.

- [ ] **Step 1: Read the current file**, then make these edits:

1. Change `const lastUpdated = "30/09/2026"` to today's date in the same `DD/MM/YYYY` format (the date the change is made).
2. Replace the notice box paragraph `<p class="text-sm">This Privacy Policy is new. …</p>` with:

```svelte
        <p class="text-sm">Updated: we now run a merch shop on this website. See "Shop orders" below for how we handle order details.</p>
```

and change the notice heading text from `New {lastUpdated}` to `Updated {lastUpdated}`.

3. Replace the whole `<section>` whose heading is `This website` with:

```svelte
        <section class="mb-8">
          <h2 class="section-heading">This website</h2>
          <p class="mb-2">This website does not handle event registration. It receives personal data in two places: the <a href="/shop" class="link-style">shop</a> (see "Shop orders" below) and the <a href="/contact" class="link-style">contact form</a> (your name, email address, and message). Contact form messages are delivered to our email inbox (Google Gmail) and only used to answer you.</p>
        </section>

        <section class="mb-8">
          <h2 class="section-heading">Shop orders</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>What we collect:</strong> your name, email address, phone number, delivery choice, postal address (only if you choose shipping), the items you order, and your order and payment status.</li>
            <li><strong>Why:</strong> to process, deliver and follow up your order, and to email you updates about it (contract, GDPR Art. 6(1)(b)). Payment is made with Vipps directly between you and us; we do not receive or store any card or bank details.</li>
            <li><strong>Where it is stored:</strong> in our database at Supabase. Order emails are sent through Google Gmail, with a copy to our event inbox. These providers only process the data on our behalf; where data is processed outside the EEA, it is protected by the EU Standard Contractual Clauses.</li>
            <li><strong>How long:</strong> order records are kept for 5 years, as required by the Norwegian Bookkeeping Act (bokføringsloven). After that they are deleted.</li>
            <li><strong>Your order page:</strong> each order has a private link that only you receive by email. Anyone with that link can see the order, so please don't share it.</li>
          </ul>
        </section>
```

4. In the "Your rights" section, change the sentence `For registration data, you can also manage your account on DancePoint.` to `For registration data, you can also manage your account on DancePoint. For shop orders, email us with your order number.`

- [ ] **Step 2: Compile check**

Run: `node -e "const {compile}=require('svelte/compiler');compile(require('fs').readFileSync('src/routes/privacy/+page.svelte','utf8'),{filename:'privacy'});console.log('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add src/routes/privacy/+page.svelte
git commit -m "docs(privacy): describe shop order data handling

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Full test run and end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Run all shop unit tests**

Run: `npx vitest --run --project server src/lib/shop`
Expected: all suites PASS (format, orderStatus, cart, checkoutValidation, adminForms, emailTemplates, emails.server).

- [ ] **Step 2: Type check the shop code**

Run: `npx svelte-kit sync && npx svelte-check --threshold error 2>&1 | grep -i shop`
Expected: no output.

- [ ] **Step 3: USER STEP: manual end-to-end in dev** (needs the Supabase SQL from Task 1 applied and `.env` with the Supabase and Gmail credentials). Run `npm run dev`, then:
  1. Log in at `/admin/login` → **Shop**. Set a Vipps number and a shipping price (e.g. 99).
  2. **Products → + Add product:** "Test T-shirt", 300 kr, sizes S=2 and M=1, upload a JPG, visible. Save. Check that it appears in the list with its thumbnail.
  3. Open `/shop`. Pick M, add 1. Check that the M button shows "All in cart" afterwards. Add S × 2.
  4. **Checkout:** choose Ship to me and check that the address fields appear and the total is 300 × 3 + 99 = 999 kr. Place the order.
  5. Check that the order page shows `NO-…`, "Awaiting payment" and the Vipps box, and that the cart is empty.
  6. Check that the confirmation email arrives at the customer address **and** at norwegianopenwcs@gmail.com, with the order number, Vipps number and a working link.
  7. In admin **Products**, check that the stock now shows S 0 · M 0, and that `/shop` shows "Sold out".
  8. In admin **Orders → the order**, step it through each action in turn:
     - **Send payment reminder**
     - **Mark paid**
     - **Mark sent**
     - **Mark delivered**
     - **Resend "Order delivered" email**

     Each time, check that the confirm dialog names the order and email, that the ✅ banner appears, that an email arrives, and that the email log gains a "Sent" row.
  9. Place a second order (add stock back first by editing the product to S=1). Then **Cancel order**. Check that the stock returns to S=1, that the customer page shows "Cancelled" with the contact email, and that the cancellation email arrives.
  10. **Concurrency sanity:** set M=1. Add M to the cart in two different browsers and place both orders. Check that one succeeds and the other sees "… is sold out and was removed from your cart."
  11. **Email failure:** temporarily set a wrong `GOOGLE_PASSWORD` in `.env` and restart dev. Mark an order paid. Check that the ⚠️ banner shows the error, the status is still Paid, the log shows "Failed", and the orders list shows ⚠️. Restore the password and use **Resend**.

- [ ] **Step 4: Report**

Tell the user which checks passed and which failed, with the exact output for any failure. Do not claim completion until steps 1–3 pass.

# Merch Shop – Design

Date: 2026-10-07
Status: Approved in brainstorming, awaiting spec review

## Goal

Sell the remaining Norwegian Open merch (mostly T-shirts) from norwegianopen.no. Customers add items to a cart and check out; they pay manually with Vipps to a published number. Admins manage products, sizes, stock, and orders, and every order status change emails the customer.

No card payments, no Vipps API, no shipping API.

## Decisions

| Topic | Decision |
|---|---|
| Variants | Products have sizes (variants), each with its own stock. A product without sizes gets one hidden variant, "One size". |
| Price | One price per product, shared by all sizes. Whole NOK (integers). |
| Delivery | Buyer chooses **Pickup / arrange with organizer** or **Ship to me (+ flat price)**. The flat shipping price is set by the admin. If it is empty, shipping is not offered. |
| Stock | Reserved when the order is placed. Cancelling returns it. |
| Concurrency | One Postgres function locks the variant rows, checks stock, decrements, and creates the order in one transaction. Concurrent checkouts wait for each other. |
| Images | One image per product, in Supabase Storage. |
| Statuses | `awaiting_payment` → `paid` → `sent` → `delivered`; `cancelled` from any status before `delivered`. Pickup orders may go `paid` → `delivered`. |
| Emails | Sent on order placement and on every status change, to the customer with a copy to norwegianopenwcs@gmail.com. Admin can resend the email for the current status. Every attempt is logged. |
| Order page | Permanent link `/shop/order/<token>` showing live status. |

## Existing context

- Supabase is used throughout. Server code uses the service-key client `supabaseAdmin` (`src/lib/supabaseAdminClient.ts`).
- `src/hooks.server.ts` protects every `/admin/*` route: Supabase auth plus the `admin_users_lookup` table. New admin pages under `/admin/shop` are protected automatically.
- Email goes through the Nodemailer + Gmail transporter in `src/lib/emailClient.server.ts` (env `GOOGLE_EMAIL`, `GOOGLE_PASSWORD`).
- The repo has no migrations. Tables were created in the Supabase dashboard.

## 1. Data model

All SQL lives in `supabase/store.sql`. It is run once in the Supabase SQL editor and is idempotent where practical (`create ... if not exists`, `create or replace function`).

### Tables

**`store_settings`** – single row (`id = 1`, enforced by a check)
- `vipps_number text not null default ''`
- `shipping_price_nok integer null check (shipping_price_nok >= 0)`. Null means shipping is off.
- `updated_at timestamptz default now()`

**`products`**
- `id uuid pk default gen_random_uuid()`
- `name text not null`
- `description text not null default ''`
- `price_nok integer not null check (price_nok >= 0)`
- `image_path text null`: object path in the `product-images` bucket
- `is_active boolean not null default true`
- `created_at timestamptz default now()`

**`product_variants`**
- `id uuid pk`
- `product_id uuid not null references products(id) on delete cascade`
- `label text not null`: e.g. `S`, `M`, `One size`
- `stock integer not null check (stock >= 0)`
- `sort_order integer not null default 0`
- unique (`product_id`, `label`)

**`orders`**
- `id uuid pk`
- `order_number text unique not null`: `NO-` plus a sequence starting at 1001 (`order_number_seq`)
- `access_token text unique not null`: 32 random hex characters (`encode(extensions.gen_random_bytes(16), 'hex')`; `pgcrypto` is enabled by default in Supabase's `extensions` schema), used in the customer link
- `customer_name text not null`, `email text not null`, `phone text not null`
- `delivery_method text not null check (in ('pickup','shipping'))`
- `address_line`, `postal_code`, `city text null`, `country text null default 'Norway'`. Required when `delivery_method = 'shipping'` (check constraint).
- `shipping_price_nok integer not null default 0`
- `total_nok integer not null`: items plus shipping
- `status text not null default 'awaiting_payment' check (in ('awaiting_payment','paid','sent','delivered','cancelled'))`
- `created_at`, `paid_at`, `sent_at`, `delivered_at`, `cancelled_at timestamptz`

**`order_items`**
- `id uuid pk`, `order_id uuid references orders(id) on delete cascade`
- `variant_id uuid references product_variants(id) on delete set null`
- `product_name text`, `variant_label text`, `unit_price_nok integer`: snapshots at order time
- `quantity integer not null check (quantity > 0)`

**`order_emails`** – email log
- `id uuid pk`, `order_id uuid references orders(id) on delete cascade`
- `email_type text`: `confirmation`, `payment_reminder`, `paid`, `sent`, `delivered`, `cancelled`
- `recipient text`, `success boolean`, `error text null`, `created_at timestamptz default now()`

### Functions

**`place_order(p_customer jsonb, p_items jsonb) returns table(order_id uuid, order_number text, access_token text)`**
1. `p_items` is an array of `{variant_id, quantity}`.
2. Lock the variants with `select ... from product_variants join products ... where id = any(...) for update`, ordered by id to avoid deadlocks.
3. For each item, check that the variant exists, its product is active, and `stock >= quantity`. Otherwise raise an exception with `errcode = 'P0001'` and a JSON message listing the problem items (`[{variant_id, available}]`).
4. Decrement stock.
5. Read `shipping_price_nok` from `store_settings`. If the delivery is shipping and the price is null, raise an exception.
6. Insert the order, with the total computed from the **database** prices plus shipping, and the order items with snapshots.
7. Return the id, number, and token.

**`cancel_order(p_order_id uuid) returns void`**
- Lock the order. If the status is `delivered` or `cancelled`, raise an exception.
- Add each item's quantity back to its variant (skip items whose variant was deleted).
- Set `status = 'cancelled'` and `cancelled_at = now()`.

**`set_order_status(p_order_id uuid, p_status text) returns void`**
- Enforces the allowed transitions:
  - `awaiting_payment → paid`
  - `paid → sent | delivered`
  - `sent → delivered`
- Sets the matching timestamp. Cancelling must use `cancel_order`.

### Security

- RLS enabled on all six tables, with no policies. Only the service-key client (server-side) can read or write. The browser never talks to these tables directly.
- Storage bucket `product-images`: public read, and uploads only through the server with the service key.

## 2. Customer side

### Routes

- **`/shop`** (`+page.server.ts` load): active products with variants and settings. Grid of cards: image, name, price, size buttons. Sizes with `stock = 0` are disabled, and a product with no stock left shows "Sold out". The quantity selector is capped at the stock. "Add to cart" opens a cart drawer or panel.
- **`/shop/checkout`**: cart summary (editable quantities, remove), then:
  - customer form: name, email, phone;
  - delivery radio (the shipping option only when the price is set; address fields when shipping is chosen);
  - total;
  - the notice "Your items are reserved when you place the order. Unpaid orders may be cancelled.";
  - a link to `/privacy`.
  The form action `placeOrder` posts the cart as JSON.
- **`/shop/order/[token]`** (load by `access_token`, 404 if not found): order number, status banner, items, delivery, total. The Vipps instructions are shown only while the order is `awaiting_payment`: "Pay **X kr** with Vipps to **[number]** and write **NO-1001** in the message." Status texts:
  - `paid`: "Payment received, thank you."
  - `sent`: "Your order has been sent."
  - `delivered`: "Your order has been delivered / handed over."
  - `cancelled`: "This order has been cancelled. If you believe this is a mistake, contact norwegianopenwcs@gmail.com."
- A "Shop" link is added to `Header.svelte` (desktop and mobile).

### Cart

- A Svelte store in `src/lib/shop/cart.ts`, persisted to `localStorage` under `no-shop-cart`. Reads and writes are wrapped in try/catch.
- Items: `{variantId, productId, name, label, unitPriceNok, quantity, imageUrl}`. Prices in the cart are for display only.

### placeOrder action

1. Validate the fields (required, email format, quantities 1–20, at least one item, address when shipping) and return `fail(400)` with field errors.
2. Call `supabaseAdmin.rpc('place_order', …)`.
3. **Stock error:** return `fail(409, { stockProblems })`. The page shows "Only N left of {name} – {label}" (or "sold out") and updates the cart quantities.
4. **Success:** send the confirmation email (logged, see §4), then redirect `303` to `/shop/order/<token>?new=1`. On that page, `new=1` clears the cart and shows "Order placed! We've emailed you the details."
5. If the email fails, the order still stands, and the page shows the payment details anyway.

## 3. Admin side

Everything is under `/admin/shop`, protected by the existing hook. A "Shop" button is added to `src/routes/admin/+layout.svelte` (desktop and mobile nav, hidden for the restricted check-in user).

### `/admin/shop/products`

- Table: thumbnail, name, price, sizes with stock (e.g. `S 4 · M 0 · L 7`), visible yes/no, Edit.
- **Add / Edit** (`/admin/shop/products/new`, `/admin/shop/products/[id]`): one form with:
  - name, description, price (NOK);
  - image upload (jpg/png/webp, max 5 MB), with replace and remove;
  - "Visible in shop" checkbox;
  - size rows: label and stock, "+ Add size", remove row. With no rows, the product is saved with a single "One size" variant.
- Saving:
  - upsert the product;
  - upload the image to `product-images/products/<productId>-<timestamp>.<ext>` and delete the old object;
  - sync the variants: update existing rows, insert new ones, and delete removed ones only if they have never been ordered (otherwise block with a message).
- **Delete product:** only allowed if none of its variants appear in `order_items`. Otherwise the admin is told to hide it instead.

### `/admin/shop/orders`

- **Settings card:** Vipps number and shipping price (empty = shipping off). Save action.
- **Filter tabs:** Awaiting payment (default), Paid, Sent, Delivered, Cancelled, All.
- **Table:** order number, date, customer, items summary, delivery, total, status, a ⚠️ marker if the latest email attempt failed, and a link to the detail page.
- **`/admin/shop/orders/[id]`:** full contact details and address, items, totals, timestamps, the customer order link, the **email log** (type, recipient, time, sent/failed and error), and action buttons valid for the current status:
  - awaiting_payment: **Mark paid**, **Send payment reminder**, **Cancel**
  - paid: **Mark sent**, **Mark delivered**, **Resend "paid" email**, **Cancel**
  - sent: **Mark delivered**, **Resend "sent" email**, **Cancel**
  - delivered: **Resend "delivered" email**
  - cancelled: **Resend "cancelled" email**
- **Every action** first shows a confirmation dialog, e.g. "Mark NO-1001 as Paid and email kari@example.com?". The result is shown as a banner:
  - ✅ "Status changed to Paid. Email sent to kari@example.com."
  - ⚠️ "Status changed to Paid, but the email failed: <error>. You can resend it."
- The status change is committed before the email is sent. A failed email never rolls back the status.

## 4. Email

- **`src/lib/shop/emails.server.ts`:** `sendOrderEmail(orderId, type)` loads the order and its items, builds the subject and HTML from templates, and sends via the existing `transporter`:
  - from: `GOOGLE_EMAIL`
  - to: the customer
  - bcc: `norwegianopenwcs@gmail.com` (constant `SHOP_NOTIFY_EMAIL`)
  - It inserts a row into `order_emails` with the result and returns `{ success, error }`. It never throws.
- **Templates** (`src/lib/shop/emailTemplates.ts`, pure functions, unit-tested): every email has the order number, items, total, delivery method, and the order page link (`<origin>/shop/order/<token>`).

| Type | Subject | Body highlights |
|---|---|---|
| `confirmation` | Order NO-1001 – Norwegian Open Shop | Thanks; Vipps number, amount, "write NO-1001 in the message"; items reserved |
| `payment_reminder` | Payment reminder – Order NO-1001 | Same Vipps details |
| `paid` | Payment received – Order NO-1001 | Thanks; next step depends on the delivery method |
| `sent` | Your order NO-1001 has been sent | — |
| `delivered` | Your order NO-1001 has been delivered | — |
| `cancelled` | Order NO-1001 has been cancelled | Contact email for questions |

- The site origin for links comes from the request URL (`url.origin`) in the action.

## 5. Privacy Policy

Update `src/routes/privacy/+page.svelte`:
- Replace "This website does not handle registration … the only personal data … contact form" with a section saying that the website handles **shop orders** and the contact form.
- Add a **Shop orders** section:
  - data collected: name, email, phone, address if shipping, items, payment status;
  - purpose: to deliver the order (contract);
  - stored in Supabase; emails sent through Google Gmail;
  - kept for 5 years for accounting (Norwegian Bookkeeping Act).
- Update the "Last Updated" date and the notice box.

## Files

New:
- `supabase/store.sql`
- `src/lib/shop/cart.ts`, `src/lib/shop/types.ts`, `src/lib/shop/orderStatus.ts` (status labels, allowed actions per status)
- `src/lib/shop/emailTemplates.ts`, `src/lib/shop/emails.server.ts`
- `src/routes/shop/+page.svelte`, `+page.server.ts`
- `src/routes/shop/checkout/+page.svelte`, `+page.server.ts`
- `src/routes/shop/order/[token]/+page.svelte`, `+page.server.ts`
- `src/routes/admin/shop/+page.svelte` (redirects or links to products and orders)
- `src/routes/admin/shop/products/+page.svelte`, `+page.server.ts`
- `src/routes/admin/shop/products/[id]/+page.svelte`, `+page.server.ts` (`id = new` for create)
- `src/routes/admin/shop/orders/+page.svelte`, `+page.server.ts`
- `src/routes/admin/shop/orders/[id]/+page.svelte`, `+page.server.ts`

Changed:
- `src/lib/components/htmlComponents/Header.svelte` (Shop link)
- `src/routes/admin/+layout.svelte` (Shop button)
- `src/routes/privacy/+page.svelte`

## Error handling

- Database or RPC errors in actions are logged server-side and return `fail(500)` with a generic message. Stock errors return `fail(409)` with details.
- Image upload errors keep the product saved and show "Image upload failed".
- Email failures are logged in `order_emails` and shown to the admin, and never block an order or a status change.
- An unknown order token returns 404.

## Testing

- **Unit (Vitest, existing setup):**
  - `cart.ts`: add/merge/update/remove/total, capped quantities, corrupt localStorage;
  - `orderStatus.ts`: allowed actions per status;
  - `emailTemplates.ts`: each type includes the order number, total, and link, and only the confirmation and reminder include the Vipps number;
  - checkout validation helper.
- **Database:** a manual test checklist at the bottom of `supabase/store.sql` (commented SQL) for:
  - placing an order;
  - an out-of-stock rejection that leaves stock unchanged;
  - cancel restoring stock;
  - an invalid transition being rejected.
- **Manual end-to-end in dev:**
  - add a product with sizes and an image;
  - order it;
  - receive the email;
  - step it through every status and check each email and the log;
  - cancel and confirm the stock returns.

## Out of scope

Card payments, the Vipps API, shipping APIs and live shipping prices, multiple images, per-size prices, discount codes, automatic cancellation of unpaid orders, customer accounts, and refunds (handled manually outside the system).

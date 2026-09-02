# Bora's Boutique

Storefront for Bora's Boutique, a women's boho-chic boutique in Naples, FL. Built from the Bora's Boutique Design System with the same stack as the other sites in this family (dmd-website, andys-website): Next.js App Router deployed to Cloudflare Workers via OpenNext.

## Stack

- Next.js 16 + React 19, JavaScript (no TypeScript)
- Tailwind CSS v4; design system tokens live in `src/styles/tailwind.css` as an `@theme` block
- Design system components ported to `src/components/ds/` (imported from the `@/components/ds` barrel)
- Product catalog is a code module at `src/data/catalog.js` (32 seed products from the design system kit)
- Cloudflare Workers via `@opennextjs/cloudflare` + `wrangler.jsonc`

## Backend

API routes run on the Worker:

- `POST /api/checkout` creates a Stripe Checkout Session. Prices are looked up server-side from the catalog; the client only sends `{handle, size, color, qty}` lines.
- `POST /api/stripe-webhook` verifies the Stripe signature and logs completed orders. This is the hook point for future fulfillment work (email, inventory, D1).
- `POST /api/newsletter` validates the address (with a honeypot field) and notifies the shop inbox via Resend, same pattern as the dmd-website contact form.

## Admin dashboard

`/admin` is a back-office (overview, inventory editing, orders, product list) protected by a shared password: set it with `npx wrangler secret put ADMIN_PASSWORD` (or `ADMIN_PASSWORD` in `.dev.vars` / `.env.local` locally). Sessions are HMAC-signed HttpOnly cookies, 7 days. Orders and newsletter subscribers are recorded in D1 by the webhook and newsletter routes (`migrations/0002_orders_and_subscribers.sql`).

## Inventory

Live stock lives in Cloudflare D1 (`inventory` table, seeded from the catalog by `migrations/0001_inventory.sql`). The product page shows real availability ("Only N left" / sold out), `/api/checkout` rejects orders that exceed current stock, and the Stripe webhook decrements stock exactly once per completed session (`processed_orders` is the idempotency guard, committed atomically with the decrements).

Setup:

1. Local: `npm run db:migrate:local`, then `npm run dev` or `npm run preview` (both get the local D1 via miniflare/wrangler).
2. Production: `npx wrangler d1 create boras-boutique-db`, paste the returned id into `database_id` in `wrangler.jsonc`, then `npm run db:migrate`.

Without a DB binding everything degrades gracefully to the static catalog numbers (same pattern as missing Stripe/Resend keys). Known limit: stock is checked at checkout-session creation and decremented on payment, so two shoppers racing for the last piece can briefly both reach Stripe; the second order ships short and needs a manual refund. Real reservations are a v2 problem.

## Payments

Stripe Checkout (hosted payment page). The cart lives client-side (localStorage), checkout redirects to Stripe, and `/checkout/success` clears the bag. Orders are visible in the Stripe dashboard; no order database in v1.

Checkout sessions request `automatic_tax`, so **Stripe Tax must be enabled in the Stripe dashboard** (and the shop registered with the Florida DOR) before going live, or session creation will fail. Also toggle on "Successful payments" under Customer Emails so buyers get receipts.

Setup:

1. Create a Stripe account for the shop and grab the secret key.
2. `cp .dev.vars.example .dev.vars` and fill in `STRIPE_SECRET_KEY`. Copy the same values to `.env.local` for `npm run dev`.
3. For webhooks locally: `stripe listen --forward-to localhost:3000/api/stripe-webhook` and put the printed `whsec_...` in `STRIPE_WEBHOOK_SECRET`.
4. In production, add a webhook endpoint in the Stripe dashboard pointing at `https://<domain>/api/stripe-webhook` for the `checkout.session.completed` event, and set secrets with `npx wrangler secret put STRIPE_SECRET_KEY` (and the same for `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, etc.).

## Develop

```bash
npm install
npm run dev        # next dev on localhost:3000
npm run preview    # full Workers runtime preview via OpenNext
```

## Deploy

```bash
npm run deploy     # opennextjs-cloudflare build && deploy
```

Set `SITE_URL` to the production URL so Stripe redirect URLs are correct.

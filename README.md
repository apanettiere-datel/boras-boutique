# Bora's Boutique

Storefront for Bora's Boutique, a women's boho-chic boutique in Naples, FL. Built from the Bora's Boutique Design System with the same stack as the other sites in this family (dmd-website, andys-website): Next.js App Router deployed to Cloudflare Workers via OpenNext.

## Stack

- Next.js 16 + React 19, JavaScript (no TypeScript)
- Tailwind CSS v4; design system tokens live in `src/styles/tailwind.css` as an `@theme` block
- Design system components ported to `src/components/ds/` (imported from the `@/components/ds` barrel)
- Cloudflare Workers via `@opennextjs/cloudflare` + `wrangler.jsonc`, with Cloudflare D1 for stock, orders and newsletter signups
- Stripe Checkout (hosted payment page) with Stripe Tax

## Where Bora's content goes

Everything shop-specific lives in three places, so none of it needs component changes:

| What | Where | Details |
| --- | --- | --- |
| Products, prices, sizes, colors, starting stock | `catalog/products.csv` | One row per size and color. Edit in any spreadsheet app, then `npm run catalog`. Column guide: [`catalog/README.md`](catalog/README.md). |
| Photos | `photos/` | Drop files named after their slot, then `npm run catalog`. Naming guide: [`photos/README.md`](photos/README.md). |
| Address, phone, email, hours, Instagram, legal name | `src/data/business.js` | Values in `[brackets]` are placeholders. They show as-is on the site, and `/admin` lists which are still missing. |

`npm run catalog` checks every spreadsheet row (with line numbers for anything wrong), writes `src/data/products.json` and `seed/stock.sql`, turns photos into web-sized, metadata-free JPEGs in `public/images/`, and fills any slot that has no photo yet with a labeled placeholder. It never overwrites a real photo. `npm run catalog:check` runs the same checks without writing anything.

Until real photos arrive, every image is a generated placeholder. The site used to hotlink Unsplash stock photos of garments the shop doesn't sell; those are gone, and the security policy no longer allows remote images.

## Develop

```bash
npm install
npm run db:migrate:local   # create the local D1 tables
npm run db:seed:local      # starting stock for every size/color in the catalog
npm run dev                # next dev on localhost:3000 (local D1 via miniflare)
npm run preview            # full Workers runtime build + preview (use this to verify D1 and webhook paths)
npm test                   # unit tests (catalog importer, variant rules, order metadata, feed, CSV export)
npm run lint
```

Copy `.dev.vars.example` to `.dev.vars` (for `preview`) and `.env.local` (for `dev`) and fill in what you need. Never commit either file.

## Inventory

Stock is tracked per size and color in the D1 `variant_stock` table (`migrations/0004_variant_stock.sql`). Each color of a piece is a separate physical garment, so a Blush M and a Sage M are counted separately.

- Starting counts come from the `stock` column in the spreadsheet, loaded with `npm run db:seed` (production) or `npm run db:seed:local`. The seed uses `INSERT OR IGNORE`, so re-running it after a new drop only adds the new variants and never overwrites live counts.
- Live counts are edited in `/admin/inventory`. Saving creates the row if it doesn't exist, so a new product can also be stocked there without the seed.
- A size/color with no row at all reads as sold out (it fails closed). The admin launch checklist counts any that are unset.
- The product page and Quick View cross out sizes that the chosen color has run out of, cap the quantity at what's left, and show "Only N left" at 3 or fewer. Product cards show "Sold out" and "Almost gone" badges from live stock.
- Checkout rejects anything that isn't a real size/color of a catalog product (including a sized piece with no size chosen) and anything over the live count. The Stripe webhook takes stock exactly once per paid order.

### Two shoppers, one last piece

Stock is checked when checkout starts and taken when payment completes, so two shoppers can both pay for the last piece. There is deliberately no reservation: Stripe's shortest checkout lifetime is 30 minutes, so reserving would hold one-of-a-kind stock for every abandoned checkout. Instead:

1. Checkout sessions expire after 31 minutes instead of Stripe's default 24 hours, which keeps the window short.
2. The webhook detects an oversell in the same atomic write that takes the stock, records it in `order_shortfalls`, and emails the shop (`ALERT_TO_EMAIL`) with the order, the piece and what to do.
3. The order is flagged in `/admin/orders` until it's marked resolved. The fix is to find the piece or refund that line in Stripe; the Terms of Sale already tell customers this can happen.

If those alerts start arriving more than rarely (Tuesday 11AM drops with one or two of a size are the case to watch), that's the signal to build reservations.

## Payments

`POST /api/checkout` creates a Stripe Checkout Session. The client only sends `{handle, size, color, qty}` lines; prices, product names and images come from the server-side catalog. Prices are whole dollars, which the importer enforces.

`POST /api/stripe-webhook` verifies Stripe's signature, then records paid orders: the order row, the stock decrement and any oversell land in one D1 batch, guarded against Stripe's retries by `processed_orders`. If that write fails, the shop gets an email so the order isn't lost.

Stripe setup (none of this exists yet):

1. Create the shop's Stripe account. Turn on **Stripe Tax** and add the Florida registration, since checkout requests `automatic_tax` and fails without it. Turn on "Successful payments" under Customer emails so buyers get receipts.
2. Create the promotion code `BORA10` (10% off a first order), which the announcement bar and newsletter signup promise. The code lives in `business.welcomeCode`.
3. Add a webhook endpoint at `https://<domain>/api/stripe-webhook` for **`checkout.session.completed`**, **`checkout.session.async_payment_succeeded`** and **`checkout.session.async_payment_failed`**. The last two only matter if a delayed payment method (bank debit) is ever turned on; orders paid that way are recorded when the money actually arrives.
4. Locally: `stripe listen --forward-to localhost:3000/api/stripe-webhook` and put the printed `whsec_...` in `STRIPE_WEBHOOK_SECRET`.

## Newsletter

Signups (home page and footer) go to the D1 `newsletter_subscribers` table, lowercased and de-duplicated. The site does not send newsletters and has no unsubscribe handling, so **the list is export-only**: never mail it from a regular inbox. US law (CAN-SPAM) requires a working unsubscribe link in every marketing email, and the privacy policy promises one.

`/admin/subscribers` shows the list, removes an address when someone asks, and downloads a CSV (with signup dates as the consent record) to import into an email service such as Mailchimp, Klaviyo or Kit. The service then handles sending and unsubscribes. Once one is chosen, point the signup form at it and treat it as the list of record.

The signup shows the `BORA10` code on screen, since no welcome email is sent.

## Product feed

`/feeds/products.xml` is a Google Merchant Center feed (RSS 2.0, one item per size and color, with live availability, sale pricing and variant links like `/product/<handle>?color=Sage&size=M`). Meta Commerce Manager reads the same file. Add it as a scheduled feed in both once the accounts exist.

Google rejects placeholder product images, so the feed leaves out any piece still showing one. Right now that's all of them, so the feed is empty. Add `?preview=1` to see every item.

## Admin

`/admin` (shared password: `npx wrangler secret put ADMIN_PASSWORD`, or `ADMIN_PASSWORD` in `.dev.vars` locally; HMAC-signed 7-day cookie, per-IP sign-in throttle):

- **Overview**: orders, revenue, subscribers, open oversells, sold-out or last-one variants, and a launch checklist (missing shop details, pieces still on placeholder photos, unset stock, which settings are configured, and the steps outside the site)
- **Inventory**: every size/color, grouped by product, editable in place
- **Orders**: the 100 most recent paid orders with sizes and colors, and oversold orders flagged until resolved. Shipping addresses are in the Stripe dashboard.
- **Products**: the catalog as shipped, with photo status per piece
- **Subscribers**: the newsletter list, export and removal

## Why the catalog is a spreadsheet and not a database

The catalog ships with the code: `catalog/products.csv` → `src/data/products.json`. Moving it into D1 would let Bora edit products herself, but it would cost an admin product editor, image uploads through R2 (another Cloudflare resource), reworking the cart, saved-pieces and search code that read the catalog in the browser, and every catalog page reading the database per request. None of that is on the launch path.

The spreadsheet keeps real products from being entered twice: when the move to D1 happens, the same file becomes the seed, and nobody retypes anything. The trigger to build it is Bora needing to manage products herself, or weekly drops costing more than about an hour of developer time.

## Deploy

```bash
npx wrangler d1 create boras-boutique-db   # paste the id into database_id in wrangler.jsonc
npm run db:migrate                          # tables
npm run db:seed                             # starting stock
npx wrangler secret put STRIPE_SECRET_KEY   # and STRIPE_WEBHOOK_SECRET, ADMIN_PASSWORD, RESEND_API_KEY
npm run deploy
```

Set `SITE_URL` to the production `https://` URL (canonical links, sitemap, feed links, Stripe redirects).

The launch blocker is **Florida sales tax registration** (Department of Revenue) before the first sale. After that: the Stripe steps above, Bora's real products, photos and shop details, and one test purchase with card 4242 4242 4242 4242 end to end. `/admin` keeps a running checklist.

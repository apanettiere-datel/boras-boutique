import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { getProduct } from '@/data/catalog'
import { getVariantStockMap } from '@/lib/inventory'
import { encodeOrderItems } from '@/lib/order-metadata'
import { aggregateLines, lineProblem, variantKey, variantLabel } from '@/lib/variants'

const MAX_LINES = 50
const MAX_QTY = 20
// Free shipping at $75, else flat $6; must stay in sync with FREE_AT in the cart UI.
const FREE_SHIPPING_CENTS = 7500
const FLAT_SHIPPING_CENTS = 600
// Stock is checked here and taken when payment completes, so a session that
// sits open is a window for two shoppers to buy the last piece. Stripe's
// default is 24 hours; its minimum is 30 minutes (plus a minute of slack for
// clock skew). Oversells that still slip through are caught by the webhook.
const SESSION_TTL_SECONDS = 31 * 60

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() })
}

function reject(message, status = 400) {
  return NextResponse.json({ ok: false, message }, { status })
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null)
    const items = body?.items
    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) {
      return reject('Your bag looks empty or invalid.')
    }

    // Validate every line against the catalog; the client only sends
    // {handle, size, color, qty}, never prices.
    const lines = []
    for (const item of items) {
      const product = getProduct(item?.handle)
      const qty = Number(item?.qty)
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        return reject('Something in your bag is no longer available.')
      }
      // Catalog prices are integer dollars; refuse anything else rather than
      // doing float math on money.
      if (!Number.isInteger(product.price)) {
        console.error('Non-integer catalog price', { handle: product.handle })
        return reject('Checkout is unavailable right now. Please try again.', 500)
      }
      const size = text(item.size)
      const color = text(item.color)
      const problem = lineProblem(product, { size, color })
      if (problem === 'needs-size') return reject(`Choose a size for ${product.title}.`)
      if (problem === 'needs-color') return reject(`Choose a color for ${product.title}.`)
      if (problem) return reject('Something in your bag is no longer available.')
      lines.push({ product, handle: product.handle, size, color, qty })
    }

    // Live stock check per size/color. Skipped when no DB is bound.
    const wanted = aggregateLines(lines)
    const stockMap = await getVariantStockMap([...new Set(wanted.map((l) => l.handle))])
    if (stockMap) {
      for (const l of wanted) {
        const stock = stockMap.get(l.handle)?.[variantKey(l.size, l.color)] ?? 0
        if (l.qty > stock) {
          const product = getProduct(l.handle)
          const variant = variantLabel(l.size, l.color)
          const name = variant ? `${product.title} (${variant})` : product.title
          return reject(
            stock === 0 ? `${name} just sold out.` : `Only ${stock} of ${name} left.`,
            409,
          )
        }
      }
    }

    const stripe = getStripe()
    if (!stripe) return reject('Checkout is not configured yet. Add STRIPE_SECRET_KEY.', 503)

    // Never derive redirect URLs from the Origin header (attacker-controlled);
    // SITE_URL wins, else the URL this Worker was actually reached on.
    const origin = process.env.SITE_URL || new URL(request.url).origin

    const lineItems = lines.map(({ product, size, color, qty }) => {
      const variant = variantLabel(size, color)
      const image = (color && product.colors.find((c) => c.name === color)?.image) || product.image
      return {
        quantity: qty,
        price_data: {
          currency: 'usd',
          tax_behavior: 'exclusive',
          // Prices come from the server-side catalog, never from the client;
          // integer dollars * 100 stays exact.
          unit_amount: product.price * 100,
          product_data: {
            name: product.title,
            ...(variant ? { description: variant } : {}),
            // Stripe needs absolute URLs; catalog images are site paths
            ...(image ? { images: [new URL(image, origin).href] } : {}),
            metadata: { handle: product.handle, sku: product.sku || '', size, color },
          },
        },
      }
    })

    const subtotalCents = lineItems.reduce(
      (sum, li) => sum + li.price_data.unit_amount * li.quantity,
      0,
    )
    const shippingCents =
      subtotalCents >= FREE_SHIPPING_CENTS ? 0 : FLAT_SHIPPING_CENTS

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      metadata: encodeOrderItems(wanted),
      expires_at: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
      // Requires Stripe Tax enabled in the dashboard (see README)
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      shipping_address_collection: { allowed_countries: ['US'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: shippingCents === 0 ? 'Free shipping' : 'Standard shipping',
            fixed_amount: { amount: shippingCents, currency: 'usd' },
            tax_behavior: 'exclusive',
          },
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    })

    return NextResponse.json({ ok: true, url: session.url })
  } catch (error) {
    console.error('Checkout session error', error)
    return reject('Checkout is unavailable right now. Please try again.', 500)
  }
}

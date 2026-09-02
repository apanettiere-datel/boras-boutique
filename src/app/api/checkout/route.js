import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { getProduct } from '@/data/catalog'
import { getStockMap } from '@/lib/inventory'
import { encodeOrderItems } from '@/lib/order-metadata'

const MAX_LINES = 50
const MAX_QTY = 20
// Free shipping at $75, else flat $6; must stay in sync with FREE_AT in the cart UI.
const FREE_SHIPPING_CENTS = 7500
const FLAT_SHIPPING_CENTS = 600

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() })
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null)
    const items = body?.items
    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) {
      return NextResponse.json(
        { ok: false, message: 'Your bag looks empty or invalid.' },
        { status: 400 },
      )
    }

    const lineItems = []
    for (const item of items) {
      const product = getProduct(item?.handle)
      const qty = Number(item?.qty)
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        return NextResponse.json(
          { ok: false, message: 'Something in your bag is no longer available.' },
          { status: 400 },
        )
      }
      // Catalog prices are integer dollars; refuse anything else rather than
      // doing float math on money.
      if (!Number.isInteger(product.price)) {
        console.error('Non-integer catalog price', { handle: product.handle })
        return NextResponse.json(
          { ok: false, message: 'Checkout is unavailable right now. Please try again.' },
          { status: 500 },
        )
      }
      // Only sell variants the product actually has
      const size = typeof item.size === 'string' && item.size.trim() ? item.size : null
      const color = typeof item.color === 'string' && item.color.trim() ? item.color : null
      const sizeOk = !size || (product.sizes || []).some((s) => s.label === size && !s.soldOut)
      const colorOk = !color || (product.colors || []).some((c) => c.name === color)
      if (!sizeOk || !colorOk) {
        return NextResponse.json(
          { ok: false, message: 'Something in your bag is no longer available.' },
          { status: 400 },
        )
      }
      const variant = [size, color].filter(Boolean).join(' / ')
      lineItems.push({
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
            ...(product.image ? { images: [product.image] } : {}),
            metadata: { handle: product.handle, sku: product.sku || '' },
          },
        },
      })
    }

    // Live stock check: total requested qty per handle (across size/color
    // lines) must fit current inventory. Skipped when no DB is bound.
    const wanted = new Map()
    for (const item of items) {
      wanted.set(item.handle, (wanted.get(item.handle) || 0) + Number(item.qty))
    }
    const stockMap = await getStockMap([...wanted.keys()])
    if (stockMap) {
      for (const [handle, qty] of wanted) {
        const stock = stockMap.get(handle) ?? 0
        if (qty > stock) {
          const product = getProduct(handle)
          return NextResponse.json(
            {
              ok: false,
              message:
                stock === 0
                  ? `${product.title} just sold out.`
                  : `Only ${stock} of ${product.title} left.`,
            },
            { status: 409 },
          )
        }
      }
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json(
        { ok: false, message: 'Checkout is not configured yet. Add STRIPE_SECRET_KEY.' },
        { status: 503 },
      )
    }

    // Never derive redirect URLs from the Origin header (attacker-controlled);
    // SITE_URL wins, else the URL this Worker was actually reached on.
    const origin = process.env.SITE_URL || new URL(request.url).origin

    const subtotalCents = lineItems.reduce(
      (sum, li) => sum + li.price_data.unit_amount * li.quantity,
      0,
    )
    const shippingCents =
      subtotalCents >= FREE_SHIPPING_CENTS ? 0 : FLAT_SHIPPING_CENTS

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      metadata: encodeOrderItems(
        items.map((i) => ({ handle: i.handle, qty: Number(i.qty) })),
      ),
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
    return NextResponse.json(
      { ok: false, message: 'Checkout is unavailable right now. Please try again.' },
      { status: 500 },
    )
  }
}

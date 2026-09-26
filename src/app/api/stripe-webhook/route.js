import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { getProduct } from '@/data/catalog'
import { sendOpsAlert } from '@/lib/alerts'
import { finalizeOrder } from '@/lib/inventory'
import { formatCents } from '@/lib/money'
import { decodeOrderItems } from '@/lib/order-metadata'
import { variantLabel } from '@/lib/variants'

// Subscribe the Stripe webhook endpoint to these three events (see README).
// checkout.session.completed fires for every finished checkout, but a delayed
// payment method (bank debit and the like, if enabled in the Stripe
// dashboard) is still unpaid at that point; those orders are recorded when
// async_payment_succeeded arrives instead.

function orderRef(session) {
  return session.id.slice(-8).toUpperCase()
}

function describe(line) {
  const title = getProduct(line.handle)?.title || line.handle
  const variant = variantLabel(line.size, line.color)
  return variant ? `${title} (${variant})` : title
}

async function recordOrder(session) {
  const items = decodeOrderItems(session.metadata)
  if (items.length === 0) return 'no-items'
  const email = session.customer_details?.email
  let result
  try {
    result = await finalizeOrder(session.id, items, {
      email,
      amountTotal: session.amount_total,
    })
  } catch (error) {
    // Never 500 back to Stripe for a database hiccup; the order is paid.
    console.error('Order write failed', error)
    await sendOpsAlert(
      'Order paid in Stripe but NOT recorded in the shop database',
      `Order ${orderRef(session)} (${session.id}) was paid (${formatCents(session.amount_total) ?? 'unknown total'}, ${email || 'no email'}) but saving it and taking its stock failed: ${error?.message}.\n\nItems: ${items.map((l) => `${describe(l)} x${l.qty}`).join(', ')}\n\nFind the order in the Stripe dashboard to fulfill it, and adjust those stock counts by hand in /admin/inventory.`,
    )
    return 'error'
  }

  if (result.shortfalls.length > 0) {
    const lines = result.shortfalls.map(
      (s) => `- ${describe(s)}: ordered ${s.wanted}, ${s.available === 0 ? 'none were' : `only ${s.available}`} left`,
    )
    await sendOpsAlert(
      `Oversold: order ${orderRef(session)} needs a refund or a restock`,
      `Order ${orderRef(session)} (${email || 'no email'}, ${formatCents(session.amount_total) ?? 'unknown total'}) paid for more than was in stock. Two shoppers most likely checked out the last piece at the same time.\n\n${lines.join('\n')}\n\nEither find the piece, or refund those lines in the Stripe dashboard (Payments > this payment > Refund) and email the customer; the Terms of Sale already say this can happen. Then mark it resolved in /admin/orders.\n\nStripe session: ${session.id}`,
    )
  }
  return result.shortfalls.length > 0 ? `${result.status}-oversold` : result.status
}

export async function POST(request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secretKey || !webhookSecret) {
    return NextResponse.json(
      { ok: false, message: 'Webhook is not configured.' },
      { status: 503 },
    )
  }

  const stripe = new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  })

  const signature = request.headers.get('stripe-signature')
  const payload = await request.text()

  let event
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    )
  } catch (error) {
    console.error('Webhook signature verification failed', error?.message)
    return NextResponse.json(
      { ok: false, message: 'Invalid signature.' },
      { status: 400 },
    )
  }

  const session = event.data.object
  let outcome = 'ignored'
  if (event.type === 'checkout.session.completed') {
    // 'paid', or 'no_payment_required' for a 100%-off promo code
    outcome = session.payment_status === 'unpaid' ? 'awaiting-payment' : await recordOrder(session)
  } else if (event.type === 'checkout.session.async_payment_succeeded') {
    outcome = await recordOrder(session)
  } else if (event.type === 'checkout.session.async_payment_failed') {
    // Nothing was recorded or taken from stock for this session
    outcome = 'payment-failed'
  }

  if (outcome !== 'ignored') {
    console.info('Checkout event', {
      type: event.type,
      sessionId: session.id,
      amountTotal: session.amount_total,
      outcome,
    })
  }

  return NextResponse.json({ received: true })
}

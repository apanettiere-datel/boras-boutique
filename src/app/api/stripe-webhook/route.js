import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { finalizeOrder } from '@/lib/inventory'
import { decodeOrderItems } from '@/lib/order-metadata'

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const items = decodeOrderItems(session.metadata)
    let inventoryResult = 'no-items'
    if (items.length > 0) {
      try {
        inventoryResult = await finalizeOrder(session.id, items, {
          email: session.customer_details?.email,
          amountTotal: session.amount_total,
        })
      } catch (error) {
        // Never 500 back to Stripe for an inventory hiccup; the order is paid.
        console.error('Inventory decrement failed', error)
        inventoryResult = 'error'
      }
    }
    console.info('Order completed', {
      sessionId: session.id,
      amountTotal: session.amount_total,
      email: session.customer_details?.email,
      inventory: inventoryResult,
    })
  }

  return NextResponse.json({ received: true })
}

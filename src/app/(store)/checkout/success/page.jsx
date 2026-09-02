import Stripe from 'stripe'

import { Button, BotanicalDivider, Eyebrow } from '@/components/ds'
import { formatCents } from '@/lib/money'
import { ClearBag } from './ClearBag'

export const metadata = { title: 'Order confirmed' }

async function getSession(sessionId) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || !sessionId) return null
  try {
    const stripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() })
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })
    return session.payment_status === 'paid' ? session : null
  } catch {
    return null
  }
}

export default async function CheckoutSuccessPage({ searchParams }) {
  const { session_id: sessionId } = await searchParams
  const session = await getSession(sessionId)

  return (
    <main className="mx-auto flex max-w-[680px] flex-col items-center px-5 py-24 text-center lg:px-10">
      {sessionId ? <ClearBag /> : null}
      <Eyebrow>Order confirmed</Eyebrow>
      <h1 className="mt-4 font-display text-[clamp(2rem,1.5rem+2.4vw,3rem)] leading-[1.08] text-ink-900">
        Thank you, truly
      </h1>
      <p className="mt-4 max-w-[52ch] text-base leading-[1.65] text-ink-700">
        Your order is in
        {session?.customer_details?.email
          ? ` and a confirmation is on its way to ${session.customer_details.email}`
          : ' and a confirmation is on its way to your inbox'}
        . We pack every piece by hand here in Naples and ship within 1 to 2
        business days.
      </p>

      {session ? (
        <div className="mt-10 w-full max-w-[440px] rounded-lg border border-line-soft bg-cream-50 p-6 text-left">
          <p className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500">
            Order {session.id.slice(-8).toUpperCase()}
          </p>
          <ul className="mt-4 flex flex-col gap-2 border-b border-line-soft pb-4">
            {(session.line_items?.data || []).map((li) => (
              <li
                key={li.id}
                className="flex items-baseline justify-between gap-4 font-body text-[14px] text-ink-700"
              >
                <span className="min-w-0 truncate">
                  {li.description}
                  {li.quantity > 1 ? ` x ${li.quantity}` : ''}
                </span>
                <span className="shrink-0 text-ink-900">
                  {formatCents(li.amount_total)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-baseline justify-between font-body text-[14px]">
            <span className="font-bold uppercase tracking-eyebrow text-[11px] text-ink-500">
              Total
            </span>
            <span className="font-semibold text-ink-900">
              {formatCents(session.amount_total)}
            </span>
          </p>
        </div>
      ) : null}

      <BotanicalDivider className="my-10" />
      <Button as="a" href="/shop">
        Keep shopping
      </Button>
    </main>
  )
}

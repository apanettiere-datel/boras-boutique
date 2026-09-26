import { Badge, EmptyState } from '@/components/ds'
import { getOrders } from '@/lib/store-data'
import { formatCents } from '@/lib/money'
import { SetupCard, TH, TD } from '@/components/admin/ui'
import { ResolveButton } from './ResolveButton'

export const metadata = { title: 'Orders - Admin' }

function formatDate(ts) {
  if (!ts) return '-'
  // D1 datetime('now') is UTC without a zone marker
  const d = new Date(/Z|[+-]\d\d:?\d\d$/.test(ts) ? ts : `${ts.replace(' ', 'T')}Z`)
  if (isNaN(d)) return String(ts)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  })
}

function lineText(l) {
  return `${l.title}${l.variant ? ` (${l.variant})` : ''} x${l.qty}`
}

export default async function OrdersPage() {
  const orders = await getOrders(100)

  return (
    <>
      <header className="flex items-center gap-4 border-b border-line-soft bg-blush-50/90 px-6 py-4 backdrop-blur-sm">
        <h1 className="font-display text-[26px] font-medium text-ink-900">Orders</h1>
      </header>

      <div className="flex flex-col gap-4 p-6">
        <p className="max-w-[70ch] font-body text-[13px] text-ink-500">
          The 100 most recent paid orders. Shipping addresses and receipts are in the Stripe
          dashboard: search Payments by the customer&apos;s email. Hover an order number for its
          full Stripe session ID.
        </p>
        {orders === null ? (
          <SetupCard />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="bag"
            title="No orders yet"
            body="When customers complete checkout, their orders will appear here."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line-soft bg-white">
            <table className="w-full min-w-[820px] border-collapse">
              <thead className="border-b border-line-soft bg-cream-50">
                <tr>
                  <TH>Date</TH>
                  <TH>Order</TH>
                  <TH>Customer</TH>
                  <TH>Items</TH>
                  <TH>Total</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {orders.map((order) => (
                  <tr
                    key={order.session_id}
                    className={order.needsAttention ? 'bg-terracotta-100/60' : 'hover:bg-blush-50'}
                  >
                    <TD className="whitespace-nowrap align-top">{formatDate(order.created_at)}</TD>
                    <TD className="whitespace-nowrap align-top">
                      <span className="font-semibold text-ink-900" title={order.session_id}>
                        {order.session_id.slice(-8).toUpperCase()}
                      </span>
                    </TD>
                    <TD className="align-top">{order.email || '-'}</TD>
                    <TD className="max-w-[340px] align-top">
                      <ul className="flex flex-col gap-0.5">
                        {order.lines.map((l) => (
                          <li key={`${l.handle}|${l.size}|${l.color}`}>{lineText(l)}</li>
                        ))}
                      </ul>
                      {order.shortfalls.length > 0 ? (
                        <div className="mt-2 flex flex-col gap-2 rounded-md border border-terracotta-300 bg-cream-50 p-3">
                          <div className="flex items-center gap-2">
                            <Badge tone={order.needsAttention ? 'sale' : 'soldout'}>
                              {order.needsAttention ? 'Oversold' : 'Oversold, resolved'}
                            </Badge>
                          </div>
                          <ul className="font-body text-[12.5px] text-ink-700">
                            {order.shortfalls.map((s) => (
                              <li key={`${s.handle}|${s.size}|${s.color}`}>
                                {s.title}
                                {s.variant ? ` (${s.variant})` : ''}: ordered {s.wanted},{' '}
                                {s.available === 0 ? 'none' : `only ${s.available}`} left
                              </li>
                            ))}
                          </ul>
                          {order.needsAttention ? (
                            <>
                              <p className="font-body text-[12px] text-ink-500">
                                Find the piece, or refund those lines in Stripe and email the customer.
                              </p>
                              <ResolveButton sessionId={order.session_id} />
                            </>
                          ) : null}
                        </div>
                      ) : null}
                    </TD>
                    <TD className="whitespace-nowrap align-top font-semibold text-ink-900">
                      {order.amount_total != null ? formatCents(order.amount_total) : '-'}
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

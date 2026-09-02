import { Card, EmptyState } from '@/components/ds'
import { getOrders } from '@/lib/store-data'
import { formatCents } from '@/lib/money'
import { SetupCard, TH, TD } from '@/components/admin/ui'

export const metadata = { title: 'Orders - Admin' }

function formatDate(ts) {
  if (!ts) return '-'
  // ts may be an ISO string or a Unix timestamp in seconds
  const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts)
  if (isNaN(d)) return String(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function lineSummary(lines) {
  if (!lines || lines.length === 0) return '-'
  return lines
    .map((l) => `${l.title} x${l.qty}`)
    .join(', ')
}

export default async function OrdersPage() {
  const orders = await getOrders(100)

  return (
    <>
      <header className="flex items-center gap-4 border-b border-line-soft bg-blush-50/90 px-6 py-4 backdrop-blur-sm">
        <h1 className="font-display text-[26px] font-medium text-ink-900">Orders</h1>
      </header>

      <div className="p-6">
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
            <table className="w-full min-w-[760px] border-collapse">
              <thead className="border-b border-line-soft bg-cream-50">
                <tr>
                  <TH>Date</TH>
                  <TH>Customer</TH>
                  <TH>Items</TH>
                  <TH>Total</TH>
                  <TH>Session</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {orders.map((order) => (
                  <tr key={order.session_id} className="hover:bg-blush-50">
                    <TD className="whitespace-nowrap">{formatDate(order.created_at)}</TD>
                    <TD>{order.email || '-'}</TD>
                    <TD className="max-w-[280px]">
                      <span className="block truncate" title={lineSummary(order.lines)}>
                        {lineSummary(order.lines)}
                      </span>
                    </TD>
                    <TD className="whitespace-nowrap font-semibold text-ink-900">
                      {order.amount_total != null
                        ? formatCents(order.amount_total)
                        : '-'}
                    </TD>
                    <TD className="text-[12px] text-ink-400 whitespace-nowrap">
                      {order.session_id ? order.session_id.slice(0, 16) + '...' : '-'}
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

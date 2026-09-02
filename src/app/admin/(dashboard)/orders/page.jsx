import { Card, EmptyState } from '@/components/ds'
import { getOrders } from '@/lib/store-data'

export const metadata = { title: 'Orders - Admin' }

function SetupCard() {
  return (
    <Card tone="cream" padding="lg" className="max-w-lg mx-auto mt-8">
      <p className="font-body font-bold text-ink-900 mb-2">Database not connected</p>
      <p className="font-body text-[14px] text-ink-500 mb-4">
        The D1 database is not connected yet. Run these commands to set it up:
      </p>
      <pre className="bg-ink-900 text-cream-50 rounded-md p-4 font-mono text-[12px] overflow-x-auto leading-relaxed whitespace-pre">
        {`npx wrangler d1 create boras-boutique-db\nnpm run db:migrate`}
      </pre>
    </Card>
  )
}

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

const TH = ({ children, className = '' }) => (
  <th
    className={[
      'px-4 py-3 text-left font-body text-[10.5px] font-bold uppercase tracking-eyebrow text-ink-500',
      className,
    ].join(' ')}
  >
    {children}
  </th>
)

const TD = ({ children, className = '' }) => (
  <td className={['px-4 py-3 font-body text-[13.5px] text-ink-700', className].join(' ')}>
    {children}
  </td>
)

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
                        ? `$${(order.amount_total / 100).toFixed(2)}`
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

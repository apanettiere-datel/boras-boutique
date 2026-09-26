import Link from 'next/link'
import { formatCents } from '@/lib/money'
import { Card, Badge } from '@/components/ds'
import { getAdminStats, getInventoryRows, lowStockVariants } from '@/lib/store-data'
import { SetupCard, TH, TD } from '@/components/admin/ui'
import { LaunchChecklist } from '@/components/admin/LaunchChecklist'

export const metadata = { title: 'Overview - Admin' }

function Stat({ label, value, note, href }) {
  const body = (
    <Card tone="paper" padding="md" className="flex h-full flex-col gap-1.5">
      <p className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500">{label}</p>
      <p className="font-display text-[32px] font-medium leading-none text-ink-900">{value}</p>
      {note ? <p className="font-body text-[12px] font-semibold text-terracotta-700">{note}</p> : null}
    </Card>
  )
  return href ? <Link href={href}>{body}</Link> : body
}

export default async function OverviewPage() {
  const [stats, inventoryRows] = await Promise.all([getAdminStats(), getInventoryRows()])

  const low = inventoryRows ? lowStockVariants(inventoryRows) : []
  const unset = low.filter((v) => v.stock === null).length
  const lowSet = low.filter((v) => v.stock !== null)

  return (
    <>
      <header className="flex items-center gap-4 border-b border-line-soft bg-blush-50/90 px-6 py-4 backdrop-blur-sm">
        <h1 className="font-display text-[26px] font-medium text-ink-900">Overview</h1>
      </header>

      <div className="flex flex-col gap-6 p-6">
        {!stats ? (
          <SetupCard />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Orders" value={stats.orderCount} href="/admin/orders" />
              <Stat label="Revenue" value={formatCents(stats.revenueCents)} />
              <Stat label="Subscribers" value={stats.subscriberCount} href="/admin/subscribers" />
              <Stat
                label="Oversold orders"
                value={stats.oversoldCount}
                note={stats.oversoldCount > 0 ? 'Refund or restock, then mark resolved' : null}
                href="/admin/orders"
              />
            </div>

            {lowSet.length === 0 ? (
              <Card tone="cream" padding="md">
                <p className="font-body text-[14px] text-ink-500">
                  Every size and color has more than one left.
                </p>
              </Card>
            ) : (
              <div>
                <p className="mb-3 font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-900">
                  Sold out or last one ({lowSet.length})
                </p>
                <div className="overflow-x-auto rounded-lg border border-line-soft bg-white">
                  <table className="w-full min-w-[480px] border-collapse">
                    <thead className="border-b border-line-soft bg-cream-50">
                      <tr>
                        <TH>Product</TH>
                        <TH>Variant</TH>
                        <TH>Stock</TH>
                        <TH></TH>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-soft">
                      {lowSet.slice(0, 25).map((row) => (
                        <tr key={`${row.handle}|${row.size}|${row.color}`} className="hover:bg-blush-50">
                          <TD>
                            <div className="flex items-center gap-3">
                              {row.image && (
                                <img src={row.image} alt="" className="h-10 w-8 rounded-sm object-cover" />
                              )}
                              <span className="font-semibold text-ink-900">{row.title}</span>
                            </div>
                          </TD>
                          <TD>{row.label}</TD>
                          <TD>
                            <Badge tone={row.stock === 0 ? 'soldout' : 'low'}>
                              {row.stock === 0 ? 'Sold out' : `${row.stock} left`}
                            </Badge>
                          </TD>
                          <TD>
                            <Link
                              href="/admin/inventory"
                              className="font-body text-[13px] font-semibold text-rose-600 hover:underline"
                            >
                              Update stock
                            </Link>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {lowSet.length > 25 ? (
                  <p className="mt-2 font-body text-[12.5px] text-ink-500">
                    And {lowSet.length - 25} more on the{' '}
                    <Link href="/admin/inventory" className="text-rose-600 underline">
                      inventory page
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            )}
          </>
        )}

        <LaunchChecklist unsetVariants={inventoryRows ? unset : null} />
      </div>
    </>
  )
}

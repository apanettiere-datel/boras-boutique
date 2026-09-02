import Link from 'next/link'
import { formatCents } from '@/lib/money'
import { Card, Badge } from '@/components/ds'
import { getAdminStats, getInventoryRows } from '@/lib/store-data'
import { SetupCard, TH, TD } from '@/components/admin/ui'

export const metadata = { title: 'Overview - Admin' }

export default async function OverviewPage() {
  const [stats, inventoryRows] = await Promise.all([
    getAdminStats(),
    getInventoryRows(),
  ])

  const lowStock = inventoryRows ? inventoryRows.filter((r) => r.stock <= 3) : []

  return (
    <>
      <header className="flex items-center gap-4 border-b border-line-soft bg-blush-50/90 px-6 py-4 backdrop-blur-sm">
        <h1 className="font-display text-[26px] font-medium text-ink-900">Overview</h1>
      </header>

      <div className="p-6 flex flex-col gap-6">
        {!stats ? (
          <SetupCard />
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card tone="paper" padding="md" className="flex flex-col gap-1.5">
                <p className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500">
                  Orders
                </p>
                <p className="font-display text-[32px] font-medium leading-none text-ink-900">
                  {stats.orderCount}
                </p>
              </Card>
              <Card tone="paper" padding="md" className="flex flex-col gap-1.5">
                <p className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500">
                  Revenue
                </p>
                <p className="font-display text-[32px] font-medium leading-none text-ink-900">
                  {formatCents(stats.revenueCents)}
                </p>
              </Card>
              <Card tone="paper" padding="md" className="flex flex-col gap-1.5">
                <p className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500">
                  Subscribers
                </p>
                <p className="font-display text-[32px] font-medium leading-none text-ink-900">
                  {stats.subscriberCount}
                </p>
              </Card>
              <Card tone="paper" padding="md" className="flex flex-col gap-1.5">
                <p className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500">
                  Low stock SKUs
                </p>
                <p className="font-display text-[32px] font-medium leading-none text-ink-900">
                  {stats.lowStockCount}
                </p>
                {stats.lowStockCount > 0 && (
                  <p className="font-body text-[12px] font-semibold text-terracotta-700">
                    Needs attention
                  </p>
                )}
              </Card>
            </div>

            {/* Low stock table */}
            {inventoryRows && lowStock.length === 0 && (
              <Card tone="cream" padding="md">
                <p className="font-body text-[14px] text-ink-500">
                  All products are sufficiently stocked.
                </p>
              </Card>
            )}

            {inventoryRows && lowStock.length > 0 && (
              <div>
                <p className="mb-3 font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-900">
                  Low stock items
                </p>
                <div className="overflow-x-auto rounded-lg border border-line-soft bg-white">
                  <table className="w-full min-w-[480px] border-collapse">
                    <thead className="border-b border-line-soft bg-cream-50">
                      <tr>
                        <TH>Product</TH>
                        <TH>SKU</TH>
                        <TH>Stock</TH>
                        <TH></TH>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-soft">
                      {lowStock.map((row) => (
                        <tr key={row.handle} className="hover:bg-blush-50">
                          <TD>
                            <div className="flex items-center gap-3">
                              {row.image && (
                                <img
                                  src={row.image}
                                  alt=""
                                  className="h-10 w-8 rounded-sm object-cover"
                                />
                              )}
                              <span className="font-semibold text-ink-900">{row.title}</span>
                            </div>
                          </TD>
                          <TD className="text-[12px] text-ink-400">{row.sku}</TD>
                          <TD>
                            <Badge tone={row.stock === 0 ? 'soldout' : 'low'}>
                              {row.stock === 0 ? 'Out of stock' : `${row.stock} left`}
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
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

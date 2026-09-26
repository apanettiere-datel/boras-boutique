import { getInventoryRows } from '@/lib/store-data'
import { InventoryTable } from './InventoryTable'
import { SetupCard } from '@/components/admin/ui'

export const metadata = { title: 'Inventory - Admin' }

export default async function InventoryPage() {
  const rows = await getInventoryRows()

  return (
    <>
      <header className="flex items-center gap-4 border-b border-line-soft bg-blush-50/90 px-6 py-4 backdrop-blur-sm">
        <h1 className="font-display text-[26px] font-medium text-ink-900">Inventory</h1>
      </header>

      <div className="p-6">
        {rows === null ? (
          <SetupCard />
        ) : (
          <InventoryTable initialRows={rows} />
        )}
      </div>
    </>
  )
}

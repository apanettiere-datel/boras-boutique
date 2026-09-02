import { Card } from '@/components/ds'
import { getInventoryRows } from '@/lib/store-data'
import { InventoryTable } from './InventoryTable'

export const metadata = { title: 'Inventory - Admin' }

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

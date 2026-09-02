import { Card } from '@/components/ds'

// Shared admin building blocks, used by every dashboard page.

export function SetupCard() {
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

export const TH = ({ children, className = '' }) => (
  <th
    className={[
      'px-4 py-3 text-left font-body text-[10.5px] font-bold uppercase tracking-eyebrow text-ink-500',
      className,
    ].join(' ')}
  >
    {children}
  </th>
)

export const TD = ({ children, className = '' }) => (
  <td className={['px-4 py-3 font-body text-[13.5px] text-ink-700', className].join(' ')}>
    {children}
  </td>
)

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ds'

// Clears an oversold order from "needs attention" once it's been refunded or
// the piece found. The shortfall itself stays on record.
export function ResolveButton({ sessionId }) {
  const router = useRouter()
  const [state, setState] = useState('idle')

  async function resolve() {
    setState('saving')
    try {
      const res = await fetch('/api/admin/orders/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.message)
      router.refresh()
    } catch {
      setState('error')
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="secondary" size="sm" loading={state === 'saving'} onClick={resolve}>
        Mark resolved
      </Button>
      {state === 'error' ? (
        <span className="font-body text-[11px] text-terracotta-700">Didn&apos;t save. Try again.</span>
      ) : null}
    </div>
  )
}

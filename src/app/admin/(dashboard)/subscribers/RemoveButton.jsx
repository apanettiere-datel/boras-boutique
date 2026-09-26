'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RemoveButton({ email }) {
  const router = useRouter()
  const [state, setState] = useState('idle')

  async function remove() {
    if (!window.confirm(`Remove ${email} from the list?`)) return
    setState('saving')
    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.message)
      router.refresh()
    } catch {
      setState('error')
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={state === 'saving'}
      className="cursor-pointer font-body text-[13px] font-semibold text-rose-600 hover:underline disabled:opacity-50"
    >
      {state === 'saving' ? 'Removing…' : state === 'error' ? 'Try again' : 'Remove'}
    </button>
  )
}

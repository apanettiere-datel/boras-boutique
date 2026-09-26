'use client'
import React, { useState } from 'react'
import { Input, Button, Badge } from '@/components/ds'
import { TH, TD } from '@/components/admin/ui'

const LOW = 1

function key(handle, v) {
  return `${handle}|${v.size}|${v.color}`
}

function stockBadge(stock) {
  if (stock === null) return <Badge tone="soldout">Not set</Badge>
  if (stock === 0) return <Badge tone="soldout">0</Badge>
  return <Badge tone={stock <= LOW ? 'low' : 'restock'}>{stock}</Badge>
}

// One editable row per size/color, grouped under its product.
// per-row save state: 'idle' | 'saving' | 'saved' | 'error'
export function InventoryTable({ initialRows }) {
  const [stock, setStockState] = useState(() => {
    const out = {}
    for (const p of initialRows) for (const v of p.variants) out[key(p.handle, v)] = v.stock
    return out
  })
  const [inputs, setInputs] = useState({})
  const [status, setStatus] = useState({})
  const [filter, setFilter] = useState('')
  const [lowOnly, setLowOnly] = useState(false)

  async function save(handle, v) {
    const k = key(handle, v)
    const raw = inputs[k] ?? String(stock[k] ?? '')
    const value = Number(raw)
    if (raw.trim() === '' || !Number.isInteger(value) || value < 0) {
      setStatus((s) => ({ ...s, [k]: { state: 'error', message: 'Enter a whole number, 0 or more.' } }))
      return
    }
    setStatus((s) => ({ ...s, [k]: { state: 'saving' } }))
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, size: v.size, color: v.color, stock: value }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.message || 'Save failed.')
      setStockState((s) => ({ ...s, [k]: value }))
      setInputs((i) => {
        const next = { ...i }
        delete next[k]
        return next
      })
      setStatus((s) => ({ ...s, [k]: { state: 'saved' } }))
    } catch (error) {
      setStatus((s) => ({
        ...s,
        [k]: { state: 'error', message: error.message === 'Failed to fetch' ? 'Network error.' : error.message },
      }))
    }
  }

  const q = filter.trim().toLowerCase()
  const groups = initialRows
    .filter((p) => !q || p.title.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q))
    .map((p) => ({
      ...p,
      variants: lowOnly
        ? p.variants.filter((v) => {
            const n = stock[key(p.handle, v)]
            return n === null || n <= LOW
          })
        : p.variants,
    }))
    .filter((p) => p.variants.length > 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Filter by title or SKU"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter inventory"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 font-body text-[13px] text-ink-700">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="h-4 w-4 accent-rose-500"
          />
          Only sold out, low ({LOW} or fewer) or not set
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line-soft bg-white">
        <table className="w-full min-w-[640px] border-collapse">
          <thead className="border-b border-line-soft bg-cream-50">
            <tr>
              <TH>Variant</TH>
              <TH>Stock</TH>
              <TH className="w-[220px]">Update</TH>
            </tr>
          </thead>
          {groups.map((p) => (
            <tbody key={p.handle} className="border-b border-line-medium last:border-0">
              <tr className="bg-blush-50/60">
                <td colSpan={3} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image && (
                      <img src={p.image} alt="" className="h-11 w-9 shrink-0 rounded-sm object-cover" />
                    )}
                    <div>
                      <p className="font-body text-[14px] font-semibold leading-snug text-ink-900">{p.title}</p>
                      <p className="font-body text-[11.5px] text-ink-500">
                        {[p.sku, p.collection, `$${p.price}`].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
              {p.variants.map((v) => {
                const k = key(p.handle, v)
                const st = status[k] || {}
                return (
                  <tr key={k} className="hover:bg-blush-50">
                    <TD className="pl-16">{v.label}</TD>
                    <TD>{stockBadge(stock[k])}</TD>
                    <TD>
                      <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault()
                          save(p.handle, v)
                        }}
                      >
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={inputs[k] ?? (stock[k] === null ? '' : String(stock[k]))}
                          onChange={(e) => {
                            const value = e.target.value
                            setInputs((i) => ({ ...i, [k]: value }))
                            setStatus((s) => ({ ...s, [k]: {} }))
                          }}
                          className="w-16 rounded-md border border-line-medium bg-cream-50 px-2 py-1.5 font-body text-[14px] text-ink-900 outline-none focus:border-rose-500 focus:ring-[3px] focus:ring-rose-500/25"
                          aria-label={`Stock for ${p.title} ${v.label}`}
                        />
                        <Button
                          type="submit"
                          variant={st.state === 'saved' ? 'sage' : 'secondary'}
                          size="sm"
                          loading={st.state === 'saving'}
                        >
                          {st.state === 'saved' ? 'Saved' : 'Save'}
                        </Button>
                      </form>
                      {st.state === 'error' && (
                        <p className="mt-1 font-body text-[11px] text-terracotta-700">{st.message}</p>
                      )}
                    </TD>
                  </tr>
                )
              })}
            </tbody>
          ))}
          {groups.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center font-body text-[14px] text-ink-500">
                  {q ? `No results for "${filter}".` : 'Nothing is low on stock.'}
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  )
}

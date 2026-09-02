'use client'
import React, { useState, useCallback } from 'react'
import { Input, Button, Badge } from '@/components/ds'

// per-row save state: 'idle' | 'saving' | 'saved' | 'error'
function useRowState(initialRows) {
  const [rows, setRows] = useState(() =>
    initialRows.map((r) => ({ ...r, inputStock: String(r.stock), status: 'idle', errorMsg: '' }))
  )

  const setInput = useCallback((handle, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.handle === handle ? { ...r, inputStock: value, status: 'idle', errorMsg: '' } : r
      )
    )
  }, [])

  const save = useCallback(async (handle) => {
    setRows((prev) =>
      prev.map((r) => (r.handle === handle ? { ...r, status: 'saving' } : r))
    )
    const row = rows.find((r) => r.handle === handle)
    const stock = parseInt(row.inputStock, 10)
    if (isNaN(stock) || stock < 0) {
      setRows((prev) =>
        prev.map((r) =>
          r.handle === handle ? { ...r, status: 'error', errorMsg: 'Invalid stock value.' } : r
        )
      )
      return
    }
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, stock }),
      })
      const data = await res.json()
      if (data.ok) {
        setRows((prev) =>
          prev.map((r) =>
            r.handle === handle ? { ...r, stock, status: 'saved', errorMsg: '' } : r
          )
        )
      } else {
        setRows((prev) =>
          prev.map((r) =>
            r.handle === handle
              ? { ...r, status: 'error', errorMsg: data.message || 'Save failed.' }
              : r
          )
        )
      }
    } catch {
      setRows((prev) =>
        prev.map((r) =>
          r.handle === handle ? { ...r, status: 'error', errorMsg: 'Network error.' } : r
        )
      )
    }
  }, [rows])

  return { rows, setInput, save }
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

export function InventoryTable({ initialRows }) {
  const { rows, setInput, save } = useRowState(initialRows)
  const [filter, setFilter] = useState('')

  const filtered = filter.trim()
    ? rows.filter(
        (r) =>
          r.title.toLowerCase().includes(filter.toLowerCase()) ||
          r.sku.toLowerCase().includes(filter.toLowerCase())
      )
    : rows

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <Input
          placeholder="Filter by title or SKU"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter inventory"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-line-soft bg-white">
        <table className="w-full min-w-[720px] border-collapse">
          <thead className="border-b border-line-soft bg-cream-50">
            <tr>
              <TH>Product</TH>
              <TH>SKU</TH>
              <TH>Collection</TH>
              <TH>Price</TH>
              <TH>Stock</TH>
              <TH className="w-[180px]">Update</TH>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {filtered.map((row) => (
              <tr key={row.handle} className="hover:bg-blush-50">
                <TD>
                  <div className="flex items-center gap-3">
                    {row.image && (
                      <img
                        src={row.image}
                        alt=""
                        className="h-11 w-9 rounded-sm object-cover shrink-0"
                      />
                    )}
                    <span className="font-semibold text-ink-900 leading-snug">{row.title}</span>
                  </div>
                </TD>
                <TD className="text-[12px] text-ink-400">{row.sku}</TD>
                <TD>{row.collection}</TD>
                <TD>${row.price}</TD>
                <TD>
                  <Badge tone={row.stock === 0 ? 'soldout' : row.stock <= 3 ? 'low' : 'restock'}>
                    {row.stock}
                  </Badge>
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={row.inputStock}
                      onChange={(e) => setInput(row.handle, e.target.value)}
                      className="w-16 rounded-md border border-line-medium bg-cream-50 px-2 py-1.5 font-body text-[14px] text-ink-900 outline-none focus:border-rose-500 focus:ring-[3px] focus:ring-rose-500/25"
                      aria-label={`Stock for ${row.title}`}
                    />
                    <Button
                      variant={row.status === 'saved' ? 'sage' : 'secondary'}
                      size="sm"
                      loading={row.status === 'saving'}
                      onClick={() => save(row.handle)}
                    >
                      {row.status === 'saved' ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                  {row.status === 'error' && (
                    <p className="mt-1 font-body text-[11px] text-terracotta-700">{row.errorMsg}</p>
                  )}
                </TD>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-body text-[14px] text-ink-400">
                  No results for "{filter}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { Dialog, Icon, Price, EmptyState } from '@/components/ds'
import { products } from '@/data/catalog'

const MAX_RESULTS = 8

function matches(product, terms) {
  const haystack = [
    product.title,
    product.vendor,
    product.collection,
    ...(product.tags || []),
  ]
    .join(' ')
    .toLowerCase()
  return terms.every((t) => haystack.includes(t))
}

export function SearchDialog({ open, onClose }) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return []
    return products.filter((p) => matches(p, terms)).slice(0, MAX_RESULTS)
  }, [query])

  function close() {
    setQuery('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={close} title="Search the shop" size="md">
      <div className="p-6">
        <div className="flex items-center gap-3 border-b border-line-medium pb-4">
          <Icon name="search" size={18} className="text-ink-500" />
          {/* Focused when the dialog opens (useFocusTrap), not on page load */}
          <input
            data-autofocus
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pieces, brands, collections"
            className="w-full bg-transparent font-body text-[16px] text-ink-900 placeholder:text-ink-300 outline-none"
          />
        </div>

        {query && results.length === 0 ? (
          <div className="py-6">
            <EmptyState
              icon="search"
              title="Nothing yet"
              body="No pieces match that. Try a shorter word, like linen or sage."
            />
          </div>
        ) : (
          <ul className="divide-y divide-line-soft">
            {results.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/product/${p.handle}`}
                  onClick={close}
                  className="flex items-center gap-4 py-3 transition-colors duration-150 hover:bg-blush-100"
                >
                  <span className="h-14 w-11 shrink-0 overflow-hidden rounded-md bg-blush-200">
                    <img src={p.image} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[16px] text-ink-900">
                      {p.title}
                    </span>
                    <span className="block font-body text-[12px] text-ink-500">
                      {p.vendor}
                    </span>
                  </span>
                  <Price price={p.price} size="sm" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  )
}

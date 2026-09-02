'use client'

import { useMemo, useState } from 'react'
import {
  Breadcrumb,
  ProductCard,
  Checkbox,
  Pagination,
  Button,
  EmptyState,
  Eyebrow,
  Icon,
  Drawer,
  FilterGroup,
  Dialog,
  QuickView,
} from '@/components/ds'
import { useCart } from '@/lib/cart'

const PAGE_SIZE = 12

const FACETS = [
  {
    title: 'Category',
    // counts are computed from the live product set in CollectionView
    options: [
      { label: 'Dresses' },
      { label: 'Tops' },
      { label: 'Bottoms' },
      { label: 'Matching Sets' },
      { label: 'Outerwear' },
      { label: 'Shoes' },
      { label: 'Jewelry' },
      { label: 'Swim' },
    ],
  },
  {
    title: 'Size',
    options: [
      { label: 'XS' },
      { label: 'S' },
      { label: 'M' },
      { label: 'L' },
      { label: 'XL' },
    ],
  },
  {
    title: 'Color',
    swatches: true,
    options: [
      { label: 'Blush', hex: '#F2D2C8' },
      { label: 'Sage', hex: '#C2CDB8' },
      { label: 'Cream', hex: '#FAF4E9' },
      { label: 'Terracotta', hex: '#C97B54' },
      { label: 'Rose', hex: '#CE8484' },
      { label: 'Sand', hex: '#E2D2BE' },
    ],
  },
  {
    title: 'Price',
    options: ['Under $50', '$50 – $80', '$80 – $120', 'Over $120'],
  },
  {
    title: 'Brand',
    options: [
      { label: "Bora's House Label" },
      { label: 'Saltgrass Co.' },
      { label: 'Dune & Dust' },
      { label: 'Palma Row' },
    ],
  },
]

const PRICE_TESTS = {
  'Under $50': (p) => p.price < 50,
  '$50 – $80': (p) => p.price >= 50 && p.price <= 80,
  '$80 – $120': (p) => p.price > 80 && p.price <= 120,
  'Over $120': (p) => p.price > 120,
}

const GROUP_TESTS = {
  Category: (p, label) => p.collection === label,
  Size: (p, label) => (p.sizes || []).some((s) => s.label === label),
  Color: (p, label) => (p.colors || []).some((c) => c.name === label),
  Price: (p, label) => (PRICE_TESTS[label] ? PRICE_TESTS[label](p) : true),
  Brand: (p, label) => p.vendor === label,
}

const optionLabel = (o) => (typeof o === 'string' ? o : o.label)

// OR within a facet group, AND across groups
function matchesFilters(product, selected) {
  return FACETS.every((facet) => {
    const active = facet.options
      .map(optionLabel)
      .filter((l) => selected.includes(l))
    if (active.length === 0) return true
    const test = GROUP_TESTS[facet.title]
    return active.some((l) => test(product, l))
  })
}

// Seed ids are p1..p32; newest = highest number
const idNum = (id) => Number(String(id).replace(/\D/g, '')) || 0

function FacetMenu({ facet, open, onOpen, selected, onToggle }) {
  const count = facet.options.filter((o) =>
    selected.includes(typeof o === 'string' ? o : o.label),
  ).length
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        className={[
          'flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-body text-[11.5px] font-bold uppercase tracking-eyebrow transition-colors duration-150 cursor-pointer',
          count
            ? 'border-rose-500 bg-blush-200 text-rose-700'
            : open
              ? 'border-ink-900 bg-cream-50 text-ink-900'
              : 'border-line-medium bg-cream-50 text-ink-900 hover:border-line-strong',
        ].join(' ')}
      >
        {facet.title}
        {count ? ` (${count})` : ''}
        <Icon
          name="chevronDown"
          size={13}
          className={
            open
              ? 'rotate-180 transition-transform duration-200'
              : 'transition-transform duration-200'
          }
        />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-[268px] rounded-lg border border-line-medium bg-blush-50 p-4 shadow-lift">
          <div className={facet.swatches ? 'flex flex-wrap gap-2.5' : 'flex flex-col'}>
            {facet.options.map((o) => {
              const label = typeof o === 'string' ? o : o.label
              const on = selected.includes(label)
              if (facet.swatches) {
                return (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    aria-label={label}
                    onClick={() => onToggle(label)}
                    className={[
                      'rounded-full border p-[2px] transition-all duration-150 cursor-pointer',
                      on ? 'border-ink-900' : 'border-transparent hover:border-line-strong',
                    ].join(' ')}
                  >
                    <span
                      className="block h-7 w-7 rounded-full border border-black/10"
                      style={{ background: o.hex }}
                    />
                  </button>
                )
              }
              return (
                <Checkbox
                  key={label}
                  label={label}
                  count={typeof o === 'object' ? o.count : undefined}
                  checked={on}
                  onChange={() => onToggle(label)}
                />
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function CollectionView({ collection, allProducts }) {
  const { addLine } = useCart()
  const [selected, setSelected] = useState([])
  const [openFacet, setOpenFacet] = useState(null)
  const [filterDrawer, setFilterDrawer] = useState(false)
  const [page, setPage] = useState(1)
  const [quickView, setQuickView] = useState(null)
  const [sort, setSort] = useState('featured')

  const toggle = (l) => {
    setSelected((s) => (s.includes(l) ? s.filter((x) => x !== l) : [...s, l]))
    setPage(1)
  }

  const clearFilters = () => {
    setSelected([])
    setPage(1)
  }

  // Facet option counts computed from the actual products on this page
  const facets = useMemo(
    () =>
      FACETS.map((f) => ({
        ...f,
        options: f.options.map((o) => {
          if (typeof o === 'string' || f.swatches) return o
          const test = GROUP_TESTS[f.title]
          return {
            ...o,
            count: allProducts.filter((p) => test(p, o.label)).length,
          }
        }),
      })),
    [allProducts],
  )

  const filtered = allProducts.filter((p) => matchesFilters(p, selected))

  // Client-side sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    if (sort === 'newest') return idNum(b.id) - idNum(a.id)
    return 0 // featured
  })

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages, 1))
  const items = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleAddToCart(product, color) {
    addLine(product.handle, {
      color: color || product.colors[0]?.name,
      size: null,
      qty: 1,
    })
  }

  return (
    <div
      onClick={(e) => {
        if (!e.target.closest('[data-facet-bar]')) setOpenFacet(null)
      }}
    >
      <div className="mx-auto w-full max-w-[1280px] px-5 pt-6 lg:px-10">
        <Breadcrumb
          className="mb-6"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shop All', href: '/shop' },
            ...(collection.handle !== 'all' ? [{ label: collection.title }] : []),
          ]}
        />
      </div>

      {/* Collection hero banner */}
      <div
        className="relative overflow-hidden bg-blush-200"
        style={{ aspectRatio: '16 / 5', maxHeight: 340 }}
      >
        <img
          src={collection.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg,rgba(58,46,43,0.1) 40%,rgba(58,46,43,0.5) 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[1280px] flex-col items-center gap-2 px-5 pb-8 text-center lg:px-10">
          <Eyebrow tone="inverse">{allProducts.length} pieces</Eyebrow>
          <h1
            className="font-display font-medium leading-tight text-cream-50"
            style={{ fontSize: 'var(--display-lg)' }}
          >
            {collection.title}
          </h1>
          {collection.blurb ? (
            <p className="max-w-[50ch] font-body text-[15px] text-blush-200">
              {collection.blurb}
            </p>
          ) : null}
        </div>
      </div>

      {/* Facet / sort bar */}
      <div
        data-facet-bar
        className="sticky top-16 z-30 border-b border-line-soft bg-blush-50/94 backdrop-blur-md"
      >
        <div className="mx-auto flex w-full max-w-[1280px] items-center gap-3 px-5 py-3 lg:px-10">
          <div className="hidden flex-1 items-center gap-2 lg:flex">
            {facets.map((f) => (
              <FacetMenu
                key={f.title}
                facet={f}
                selected={selected}
                onToggle={toggle}
                open={openFacet === f.title}
                onOpen={() =>
                  setOpenFacet(openFacet === f.title ? null : f.title)
                }
              />
            ))}
            {selected.length ? (
              <button
                onClick={clearFilters}
                className="ml-1 cursor-pointer font-body text-[12px] text-rose-600 underline underline-offset-2"
              >
                Clear all
              </button>
            ) : null}
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon="sliders"
            className="lg:hidden"
            onClick={() => setFilterDrawer(true)}
          >
            Filter{selected.length ? ` (${selected.length})` : ''}
          </Button>
          <p className="hidden font-body text-[13px] text-ink-500 sm:block lg:hidden">
            {filtered.length} of {allProducts.length}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500 sm:inline">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="cursor-pointer rounded-full border border-line-medium bg-cream-50 py-2 pl-4 pr-8 font-body text-[13px] text-ink-900 outline-none focus:border-rose-500"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto w-full max-w-[1280px] px-5 py-8 lg:px-10 lg:py-10">
        {selected.length ? (
          <div className="mb-7 flex flex-wrap items-center gap-2">
            <span className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500">
              Filtering by
            </span>
            {selected.map((s) => (
              <button
                key={s}
                onClick={() => toggle(s)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line-medium bg-cream-50 px-3 py-1.5 font-body text-[12px] text-ink-700 hover:border-line-strong"
              >
                {s} <Icon name="close" size={12} />
              </button>
            ))}
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState
            icon="leaf"
            title="No pieces match"
            body="Nothing fits those filters yet. Loosen one and more will appear."
            action="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
            {items.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={setQuickView}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <Pagination
            className="mt-14"
            page={safePage}
            pages={totalPages}
            onChange={(n) => { setPage(n); window.scrollTo(0, 0) }}
          />
        ) : null}
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        open={filterDrawer}
        onClose={() => setFilterDrawer(false)}
        side="left"
        width={320}
        title={`Filter${selected.length ? ` (${selected.length})` : ''}`}
        footer={
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={clearFilters}
            >
              Clear all
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => setFilterDrawer(false)}
            >
              Show {filtered.length}
            </Button>
          </div>
        }
      >
        <div className="px-5">
          {facets.map((f) => (
            <FilterGroup
              key={f.title}
              title={f.title}
              options={f.options}
              swatches={f.swatches}
              selected={selected}
              onToggle={toggle}
              defaultOpen={f.title === 'Category'}
            />
          ))}
        </div>
      </Drawer>

      {/* Quick View dialog */}
      <Dialog
        open={!!quickView}
        onClose={() => setQuickView(null)}
        size="lg"
        title="Quick view"
      >
        {quickView ? (
          <QuickView
            product={quickView}
            onAddToCart={({ product, color, size, qty }) => {
              addLine(product.handle, { color, size, qty })
              setQuickView(null)
            }}
          />
        ) : null}
      </Dialog>
    </div>
  )
}

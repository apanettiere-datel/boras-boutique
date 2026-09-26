// Size/color variant rules shared by the storefront, checkout and admin.
// Pure functions with no imports, so they run anywhere (client, Worker, tests).
//
// A product's variants come from the catalog: [{ size, color, initialStock }],
// with '' for "no size" (one-size pieces) and "no color" (one colorway).
// Server pages attach live counts as product.variantStock, keyed by variantKey.

// "Only N left" and the "Almost gone" badge kick in at or below this
export const LOW_STOCK = 3

export function variantKey(size, color) {
  return `${size || ''}|${color || ''}`
}

export function variantLabel(size, color) {
  return [size, color].filter(Boolean).join(' / ')
}

export function findVariant(product, size, color) {
  return (
    (product?.variants || []).find(
      (v) => v.size === (size || '') && v.color === (color || ''),
    ) || null
  )
}

// Why a bag line can't be bought as-is, or null when it's a real variant.
// Guards against the card "Add" button and old saved bags sending a sized
// piece with no size.
export function lineProblem(product, { size, color } = {}) {
  if (!product) return 'unavailable'
  if ((product.sizes || []).length > 0 && !size) return 'needs-size'
  if ((product.colors || []).length > 0 && !color) return 'needs-color'
  if (!findVariant(product, size, color)) return 'unavailable'
  return null
}

// Live count when the page has one, else null (unknown: let checkout decide)
export function stockOf(product, size, color) {
  const live = product?.variantStock
  if (!live) return null
  return live[variantKey(size, color)] ?? 0
}

export function totalStock(product) {
  if (!product?.variantStock) return null
  return Object.values(product.variantStock).reduce((sum, n) => sum + n, 0)
}

// The size buttons for one color, crossed out where that color has none left
export function sizeOptions(product, color) {
  return (product.sizes || []).map((s) => {
    const n = stockOf(product, s.label, color)
    return { label: s.label, soldOut: n !== null && n <= 0 }
  })
}

// Order lines travel through Stripe metadata and the orders table as
// "handle|size|color:qty,..." (the catalog importer keeps , : | out of sizes
// and colors). Old "handle:qty" entries read as no size and no color.
export function formatLines(lines) {
  return lines
    .map(({ handle, size, color, qty }) => `${handle}|${size || ''}|${color || ''}:${qty}`)
    .join(',')
}

export function parseLines(text) {
  if (!text) return []
  return text
    .split(',')
    .map((entry) => {
      const at = entry.lastIndexOf(':')
      if (at < 1) return null
      const [handle, size = '', color = ''] = entry.slice(0, at).split('|')
      return { handle, size, color, qty: Number(entry.slice(at + 1)) }
    })
    .filter((l) => l && l.handle && Number.isInteger(l.qty) && l.qty > 0)
}

// Merge duplicate variants so each is decremented once with the total qty
export function aggregateLines(lines) {
  const byKey = new Map()
  for (const l of lines) {
    const key = `${l.handle}|${variantKey(l.size, l.color)}`
    const prev = byKey.get(key)
    byKey.set(key, {
      handle: l.handle,
      size: l.size || '',
      color: l.color || '',
      qty: (prev?.qty || 0) + l.qty,
    })
  }
  return [...byKey.values()]
}

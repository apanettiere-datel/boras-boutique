import { getDb } from '@/lib/d1'
import { LOW_STOCK, aggregateLines, formatLines, totalStock, variantKey } from '@/lib/variants'

// Live stock lives in the D1 `variant_stock` table, one row per size/color
// (migrations/0004_variant_stock.sql, seeded from seed/stock.sql). Without a
// DB binding every helper falls back to the catalog's starting counts, the
// same way missing Stripe/Resend keys degrade.

// D1 allows at most 100 bound parameters per statement
const LINES_PER_STATEMENT = 20

// { handle -> { "size|color" -> stock } } for the given handles, or for every
// product when handles is omitted. null when no DB is bound. A variant with no
// row reads as 0 (fail closed: a product added without seeding can't oversell).
export async function getVariantStockMap(handles) {
  const db = await getDb()
  if (!db) return null
  if (handles && handles.length === 0) return new Map()
  const stmt = handles
    ? db
        .prepare(
          `SELECT handle, size, color, stock FROM variant_stock WHERE handle IN (${handles.map(() => '?').join(', ')})`,
        )
        .bind(...handles)
    : db.prepare('SELECT handle, size, color, stock FROM variant_stock')
  const { results } = await stmt.all()
  const map = new Map()
  for (const row of results) {
    if (!map.has(row.handle)) map.set(row.handle, {})
    map.get(row.handle)[variantKey(row.size, row.color)] = row.stock
  }
  return map
}

function catalogStock(product) {
  const out = {}
  for (const v of product.variants) out[variantKey(v.size, v.color)] = v.initialStock
  return out
}

// Attach live counts to products for rendering: variantStock (per variant),
// soldOut, and an "Almost gone" / "Sold out" badge that replaces the static
// ones the catalog used to carry. Editorial badges ("Just in", "30% off") win
// over "Almost gone" but not over "Sold out".
export async function withStock(products) {
  if (products.length === 0) return []
  const handles = [...new Set(products.map((p) => p.handle))]
  // Listing pages ask for many products at once; one full read is cheaper
  // than chunking an IN list around the bound-parameter limit.
  const live = await getVariantStockMap(handles.length <= 90 ? handles : undefined)
  return products.map((p) => {
    const rows = live ? live.get(p.handle) || {} : catalogStock(p)
    const variantStock = {}
    for (const v of p.variants) {
      const key = variantKey(v.size, v.color)
      variantStock[key] = rows[key] ?? 0
    }
    const decorated = { ...p, variantStock }
    const total = totalStock(decorated)
    decorated.soldOut = total <= 0
    if (decorated.soldOut) {
      decorated.badge = 'Sold out'
      decorated.badgeTone = 'soldout'
    } else if (!p.badge && total <= LOW_STOCK) {
      decorated.badge = 'Almost gone'
      decorated.badgeTone = 'low'
    }
    return decorated
  })
}

function chunk(list, size) {
  const out = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

// Record a paid order and decrement stock, exactly once. The processed_orders
// primary key is the idempotency guard: Stripe retries the webhook, and two
// concurrent deliveries can both reach here, but only one INSERT wins.
//
// Everything runs in one atomic batch: the idempotency marker, the order row,
// the shortfall check and the decrements commit together. D1 runs a batch as a
// single transaction and serializes writes, so the shortfall rows see exactly
// the stock the decrement is about to take from. amountTotal is integer cents,
// straight from Stripe.
//
// Returns { status: 'applied' | 'duplicate' | 'no-db', shortfalls: [...] },
// where each shortfall is { handle, size, color, wanted, available }.
export async function finalizeOrder(sessionId, items, { email, amountTotal }) {
  const db = await getDb()
  if (!db) return { status: 'no-db', shortfalls: [] }

  const lines = aggregateLines(items)
  const statements = [
    db.prepare('INSERT INTO processed_orders (session_id) VALUES (?)').bind(sessionId),
    db
      .prepare('INSERT INTO orders (session_id, email, amount_total, items) VALUES (?, ?, ?, ?)')
      .bind(sessionId, email || null, amountTotal ?? null, formatLines(lines)),
  ]

  for (const part of chunk(lines, LINES_PER_STATEMENT)) {
    const values = part.map(() => '(?, ?, ?, ?)').join(', ')
    const params = part.flatMap((l) => [l.handle, l.size, l.color, l.qty])
    // Shortfall first, so it compares against stock before this order's decrement
    statements.push(
      db
        .prepare(
          `INSERT INTO order_shortfalls (session_id, handle, size, color, wanted, available)
           SELECT ?, w.column1, w.column2, w.column3, w.column4, COALESCE(v.stock, 0)
           FROM (VALUES ${values}) AS w
           LEFT JOIN variant_stock v
             ON v.handle = w.column1 AND v.size = w.column2 AND v.color = w.column3
           WHERE COALESCE(v.stock, 0) < w.column4`,
        )
        .bind(sessionId, ...params),
      db
        .prepare(
          `UPDATE variant_stock SET stock = MAX(variant_stock.stock - w.column4, 0)
           FROM (VALUES ${values}) AS w
           WHERE variant_stock.handle = w.column1
             AND variant_stock.size = w.column2
             AND variant_stock.color = w.column3`,
        )
        .bind(...params),
    )
  }

  try {
    await db.batch(statements)
  } catch (error) {
    if (String(error?.message).includes('UNIQUE')) return { status: 'duplicate', shortfalls: [] }
    throw error
  }

  const { results } = await db
    .prepare(
      'SELECT handle, size, color, wanted, available FROM order_shortfalls WHERE session_id = ?',
    )
    .bind(sessionId)
    .all()
  return { status: 'applied', shortfalls: results }
}

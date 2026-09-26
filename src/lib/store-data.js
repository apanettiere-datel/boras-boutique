import { getDb } from '@/lib/d1'
import { products, getProduct } from '@/data/catalog'
import placeholders from '@/data/placeholders.json'
import { findVariant, parseLines, variantKey, variantLabel } from '@/lib/variants'

// Server-side reads/writes for the admin dashboard and newsletter. All return
// null (or false / 'no-db') when no DB is bound so callers can show a setup notice.

// Variants at or below this count show up under "Low stock" in the admin
export const ADMIN_LOW_STOCK = 1

const placeholderSet = new Set(placeholders)

// Photo slots for a product that still show a generated placeholder
export function placeholderCount(product) {
  const slots = new Set([product.image, product.hoverImage, ...product.colors.map((c) => c.image)])
  return [...slots].filter((s) => placeholderSet.has(s)).length
}

// Every catalog product with its variants and live counts. A variant with no
// row in D1 (added to the catalog but not seeded) has stock null: the shop
// treats it as sold out until a count is saved.
export async function getInventoryRows() {
  const db = await getDb()
  if (!db) return null
  const { results } = await db.prepare('SELECT handle, size, color, stock FROM variant_stock').all()
  const live = new Map(results.map((r) => [`${r.handle}|${variantKey(r.size, r.color)}`, r.stock]))
  return products.map((p) => ({
    handle: p.handle,
    title: p.title,
    vendor: p.vendor,
    collection: p.collection,
    price: p.price,
    sku: p.sku,
    image: p.image,
    variants: p.variants.map((v) => ({
      size: v.size,
      color: v.color,
      label: variantLabel(v.size, v.color) || 'One size',
      stock: live.get(`${p.handle}|${variantKey(v.size, v.color)}`) ?? null,
    })),
  }))
}

// Variants that are sold out, running low, or never given a count
export function lowStockVariants(rows) {
  return rows.flatMap((p) =>
    p.variants
      .filter((v) => v.stock === null || v.stock <= ADMIN_LOW_STOCK)
      .map((v) => ({ ...v, handle: p.handle, title: p.title, sku: p.sku, image: p.image })),
  )
}

// Returns 'updated', 'no-db', or 'unknown-variant'. An upsert, so a newly
// added product can get its counts here without a seed or migration.
export async function setStock(handle, size, color, stock) {
  if (!findVariant(getProduct(handle), size, color)) return 'unknown-variant'
  const db = await getDb()
  if (!db) return 'no-db'
  await db
    .prepare(
      `INSERT INTO variant_stock (handle, size, color, stock) VALUES (?, ?, ?, ?)
       ON CONFLICT (handle, size, color) DO UPDATE SET stock = excluded.stock`,
    )
    .bind(handle, size, color, stock)
    .run()
  return 'updated'
}

function describeLine(line) {
  return {
    ...line,
    title: getProduct(line.handle)?.title || line.handle,
    variant: variantLabel(line.size, line.color),
  }
}

export async function getOrders(limit = 50) {
  const db = await getDb()
  if (!db) return null
  const { results } = await db
    .prepare(
      `SELECT o.session_id, o.email, o.amount_total, o.items, o.created_at,
         (SELECT group_concat(s.handle || '|' || s.size || '|' || s.color || ':' || s.wanted || ':' || s.available, ',')
            FROM order_shortfalls s WHERE s.session_id = o.session_id) AS shortfalls,
         (SELECT COUNT(*) FROM order_shortfalls s
            WHERE s.session_id = o.session_id AND s.resolved_at IS NULL) AS open_shortfalls
       FROM orders o ORDER BY o.created_at DESC LIMIT ?`,
    )
    .bind(limit)
    .all()
  return results.map((row) => ({
    session_id: row.session_id,
    email: row.email,
    amount_total: row.amount_total,
    created_at: row.created_at,
    // items is a "handle|size|color:qty,..." summary written by finalizeOrder
    lines: parseLines(row.items).map(describeLine),
    shortfalls: (row.shortfalls || '')
      .split(',')
      .filter(Boolean)
      .map((entry) => {
        const [variant, wanted, available] = entry.split(':')
        const [handle, size, color] = variant.split('|')
        return describeLine({ handle, size, color, wanted: Number(wanted), available: Number(available) })
      }),
    needsAttention: row.open_shortfalls > 0,
  }))
}

// After refunding or restocking an oversold order in Stripe
export async function resolveShortfalls(sessionId) {
  const db = await getDb()
  if (!db) return 'no-db'
  const result = await db
    .prepare(
      "UPDATE order_shortfalls SET resolved_at = datetime('now') WHERE session_id = ? AND resolved_at IS NULL",
    )
    .bind(sessionId)
    .run()
  return result.meta.changes > 0 ? 'resolved' : 'nothing-open'
}

export async function getAdminStats() {
  const db = await getDb()
  if (!db) return null
  const [orders, subscribers, oversold] = await db.batch([
    db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(amount_total), 0) AS revenue_cents FROM orders'),
    db.prepare('SELECT COUNT(*) AS n FROM newsletter_subscribers'),
    db.prepare(
      'SELECT COUNT(DISTINCT session_id) AS n FROM order_shortfalls WHERE resolved_at IS NULL',
    ),
  ])
  return {
    orderCount: orders.results[0].n,
    revenueCents: orders.results[0].revenue_cents,
    subscriberCount: subscribers.results[0].n,
    oversoldCount: oversold.results[0].n,
  }
}

export async function addNewsletterSubscriber(email) {
  const db = await getDb()
  if (!db) return false
  await db
    .prepare('INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)')
    .bind(email)
    .run()
  return true
}

// Newest first; the admin page shows `limit`, the CSV export passes none
export async function getSubscribers(limit) {
  const db = await getDb()
  if (!db) return null
  const sql = 'SELECT email, created_at FROM newsletter_subscribers ORDER BY created_at DESC, email'
  const stmt = limit ? db.prepare(`${sql} LIMIT ?`).bind(limit) : db.prepare(sql)
  const { results } = await stmt.all()
  return results
}

// Returns 'removed', 'not-found', or 'no-db'
export async function removeSubscriber(email) {
  const db = await getDb()
  if (!db) return 'no-db'
  const result = await db
    .prepare('DELETE FROM newsletter_subscribers WHERE email = ?')
    .bind(email)
    .run()
  return result.meta.changes > 0 ? 'removed' : 'not-found'
}

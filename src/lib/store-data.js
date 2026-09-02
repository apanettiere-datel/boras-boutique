import { getDb } from '@/lib/d1'
import { products, getProduct } from '@/data/catalog'

// Server-side reads/writes for the admin dashboard and newsletter. All return
// null (or false) when no DB is bound so callers can show a setup notice.

// Inventory joined with catalog details, one query then a dict lookup
export async function getInventoryRows() {
  const db = await getDb()
  if (!db) return null
  const { results } = await db
    .prepare('SELECT handle, stock FROM inventory ORDER BY handle')
    .all()
  const stockByHandle = new Map(results.map((r) => [r.handle, r.stock]))
  return products.map((p) => ({
    handle: p.handle,
    title: p.title,
    vendor: p.vendor,
    collection: p.collection,
    price: p.price,
    sku: p.sku,
    image: p.image,
    stock: stockByHandle.get(p.handle) ?? 0,
  }))
}

// Returns 'updated', 'no-db', or 'missing-row' (product exists in the catalog
// but has no inventory row, e.g. added without a seed migration).
export async function setStock(handle, stock) {
  const db = await getDb()
  if (!db) return 'no-db'
  const result = await db
    .prepare('UPDATE inventory SET stock = ? WHERE handle = ?')
    .bind(stock, handle)
    .run()
  return result.meta.changes > 0 ? 'updated' : 'missing-row'
}

export async function getOrders(limit = 50) {
  const db = await getDb()
  if (!db) return null
  const { results } = await db
    .prepare(
      'SELECT session_id, email, amount_total, items, created_at FROM orders ORDER BY created_at DESC LIMIT ?',
    )
    .bind(limit)
    .all()
  return results.map((row) => ({
    ...row,
    // items is a "handle:qty,handle:qty" summary written by finalizeOrder
    lines: (row.items || '')
      .split(',')
      .filter(Boolean)
      .map((pair) => {
        const at = pair.lastIndexOf(':')
        const handle = pair.slice(0, at)
        return {
          handle,
          qty: Number(pair.slice(at + 1)),
          title: getProduct(handle)?.title || handle,
        }
      }),
  }))
}

export async function getAdminStats() {
  const db = await getDb()
  if (!db) return null
  const [orders, subscribers, lowStock] = await db.batch([
    db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(amount_total), 0) AS revenue_cents FROM orders'),
    db.prepare('SELECT COUNT(*) AS n FROM newsletter_subscribers'),
    db.prepare('SELECT COUNT(*) AS n FROM inventory WHERE stock <= 3'),
  ])
  return {
    orderCount: orders.results[0].n,
    revenueCents: orders.results[0].revenue_cents,
    subscriberCount: subscribers.results[0].n,
    lowStockCount: lowStock.results[0].n,
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

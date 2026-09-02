import { getDb } from '@/lib/d1'

// Live stock lives in the D1 `inventory` table (seeded by migrations/0001_inventory.sql).
// Every helper degrades gracefully when the DB binding is absent: callers get
// null and fall back to the static catalog numbers, matching how the
// Stripe/Resend keys are handled.

// One batched query, keyed by handle. Returns null when no DB is available.
export async function getStockMap(handles) {
  const db = await getDb()
  if (!db || handles.length === 0) return null
  const placeholders = handles.map(() => '?').join(', ')
  const { results } = await db
    .prepare(`SELECT handle, stock FROM inventory WHERE handle IN (${placeholders})`)
    .bind(...handles)
    .all()
  const map = new Map()
  for (const row of results) map.set(row.handle, row.stock)
  return map
}

export async function getStock(handle) {
  const map = await getStockMap([handle])
  return map ? (map.get(handle) ?? null) : null
}

// Record a completed order and decrement stock, exactly once. The
// processed_orders primary key is the idempotency guard: Stripe retries the
// webhook, and two concurrent deliveries can both reach here, but only one
// INSERT wins. amountTotal is integer cents, straight from Stripe.
// Returns 'applied', 'duplicate', or 'no-db'.
export async function finalizeOrder(sessionId, items, { email, amountTotal }) {
  const db = await getDb()
  if (!db) return 'no-db'

  const itemsSummary = items.map(({ handle, qty }) => `${handle}:${qty}`).join(',')

  // One atomic batch: the idempotency marker, the order row, and the
  // decrements commit together, so a partial failure can never mark the order
  // as processed without recording it and adjusting stock.
  const statements = [
    db.prepare('INSERT INTO processed_orders (session_id) VALUES (?)').bind(sessionId),
    db
      .prepare('INSERT INTO orders (session_id, email, amount_total, items) VALUES (?, ?, ?, ?)')
      .bind(sessionId, email || null, amountTotal ?? null, itemsSummary),
    ...items.map(({ handle, qty }) =>
      db
        .prepare('UPDATE inventory SET stock = MAX(stock - ?, 0) WHERE handle = ?')
        .bind(qty, handle),
    ),
  ]
  try {
    await db.batch(statements)
  } catch (error) {
    if (String(error?.message).includes('UNIQUE')) return 'duplicate'
    throw error
  }
  return 'applied'
}

import { getCloudflareContext } from '@opennextjs/cloudflare'

// Live stock lives in the D1 `inventory` table (seeded by migrations/0001_inventory.sql).
// Every helper degrades gracefully when the DB binding is absent (local `next start`,
// or a deploy before `wrangler d1 create`): callers get null and fall back to the
// static catalog numbers, matching how the Stripe/Resend keys are handled.

async function getDb() {
  try {
    const { env } = await getCloudflareContext({ async: true })
    return env.DB || null
  } catch {
    return null
  }
}

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

// Decrement stock for a completed order exactly once. The processed_orders
// primary key is the idempotency guard: Stripe retries the webhook, and two
// concurrent deliveries can both reach here, but only one INSERT wins.
// Returns 'applied', 'duplicate', or 'no-db'.
export async function applyOrderDecrement(sessionId, items) {
  const db = await getDb()
  if (!db) return 'no-db'

  // One atomic batch: the idempotency marker and the decrements commit
  // together, so a partial failure can never mark the order as processed
  // without adjusting stock.
  const statements = [
    db.prepare('INSERT INTO processed_orders (session_id) VALUES (?)').bind(sessionId),
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

import { getDb } from '@/lib/d1'

// Per-IP throttle for admin sign-in: at most MAX_FAILS failed attempts per
// WINDOW_MS, tracked in D1 (login_attempts). window_start is epoch millis.
// Without a DB the caller falls back to a fixed delay on failure.

const MAX_FAILS = 10
const WINDOW_MS = 15 * 60 * 1000

// true = blocked. Fails open when no DB is bound (caller adds the delay).
export async function isThrottled(ip) {
  const db = await getDb()
  if (!db) return false
  const row = await db
    .prepare('SELECT fails, window_start FROM login_attempts WHERE ip = ?')
    .bind(ip)
    .first()
  if (!row) return false
  if (row.window_start < Date.now() - WINDOW_MS) return false
  return row.fails >= MAX_FAILS
}

export async function recordFailure(ip) {
  const db = await getDb()
  if (!db) return false
  const now = Date.now()
  const cutoff = now - WINDOW_MS
  // One atomic upsert so concurrent failures cannot lose counts: an expired
  // window resets to 1, a live window increments.
  await db
    .prepare(
      `INSERT INTO login_attempts (ip, fails, window_start) VALUES (?1, 1, ?2)
       ON CONFLICT(ip) DO UPDATE SET
         fails = CASE WHEN login_attempts.window_start < ?3 THEN 1 ELSE login_attempts.fails + 1 END,
         window_start = CASE WHEN login_attempts.window_start < ?3 THEN ?2 ELSE login_attempts.window_start END`,
    )
    .bind(ip, now, cutoff)
    .run()
  return true
}

export async function clearFailures(ip) {
  const db = await getDb()
  if (!db) return
  await db.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run()
}

import { getCloudflareContext } from '@opennextjs/cloudflare'

// Returns the D1 binding, or null when absent (plain `next start`, or a deploy
// before `wrangler d1 create`); callers degrade gracefully on null.
export async function getDb() {
  try {
    const { env } = await getCloudflareContext({ async: true })
    return env.DB || null
  } catch {
    return null
  }
}

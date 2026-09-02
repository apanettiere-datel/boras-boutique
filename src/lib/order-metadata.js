// The checkout session carries its own line summary in metadata so the webhook
// can decrement inventory without extra Stripe API calls. Format: "handle:qty"
// pairs joined by commas, split across items_0..items_N keys because Stripe
// caps each metadata value at 500 characters.

const CHUNK_SIZE = 450
const KEY_PREFIX = 'items_'

export function encodeOrderItems(items) {
  // Aggregate per handle: the same product in two sizes is one decrement
  const byHandle = new Map()
  for (const { handle, qty } of items) {
    byHandle.set(handle, (byHandle.get(handle) || 0) + qty)
  }
  const joined = [...byHandle.entries()]
    .map(([handle, qty]) => `${handle}:${qty}`)
    .join(',')

  const metadata = {}
  for (let i = 0; i * CHUNK_SIZE < joined.length; i++) {
    metadata[`${KEY_PREFIX}${i}`] = joined.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
  }
  return metadata
}

export function decodeOrderItems(metadata) {
  if (!metadata) return []
  const chunks = []
  for (let i = 0; metadata[`${KEY_PREFIX}${i}`] !== undefined; i++) {
    chunks.push(metadata[`${KEY_PREFIX}${i}`])
  }
  if (chunks.length === 0) return []
  return chunks
    .join('')
    .split(',')
    .map((pair) => {
      const at = pair.lastIndexOf(':')
      return { handle: pair.slice(0, at), qty: Number(pair.slice(at + 1)) }
    })
    .filter((item) => item.handle && Number.isInteger(item.qty) && item.qty > 0)
}

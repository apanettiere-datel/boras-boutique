// The checkout session carries its own line summary in metadata so the webhook
// can decrement stock without extra Stripe API calls. Format:
// "handle|size|color:qty" entries joined by commas (see lib/variants.js),
// split across items_0..items_N keys because Stripe caps each metadata value
// at 500 characters.
import { aggregateLines, formatLines, parseLines } from './variants.js'

const CHUNK_SIZE = 450
const KEY_PREFIX = 'items_'

export function encodeOrderItems(items) {
  const joined = formatLines(aggregateLines(items))
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
  return aggregateLines(parseLines(chunks.join('')))
}

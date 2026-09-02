// Admin sessions: an HttpOnly cookie carrying "expiry.hmac(expiry)" signed
// with a key derived from the ADMIN_PASSWORD secret. No DB, no user table;
// one shared password for the shop, set with `wrangler secret put ADMIN_PASSWORD`.

const COOKIE_NAME = 'bb_admin'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

const encoder = new TextEncoder()

async function getKey() {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  return crypto.subtle.importKey(
    'raw',
    await crypto.subtle.digest('SHA-256', encoder.encode(password)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex) {
  if (typeof hex !== 'string' || hex.length % 2 !== 0 || /[^0-9a-f]/.test(hex)) {
    return null
  }
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD)
}

export async function checkPassword(candidate) {
  const password = process.env.ADMIN_PASSWORD
  if (!password || typeof candidate !== 'string') return false
  // Constant-time compare via HMAC of both values under the same key
  const key = await getKey()
  const a = await crypto.subtle.sign('HMAC', key, encoder.encode(candidate))
  const b = await crypto.subtle.sign('HMAC', key, encoder.encode(password))
  return toHex(a) === toHex(b)
}

export async function createSessionCookie() {
  const key = await getKey()
  if (!key) return null
  const expiry = String(Date.now() + SESSION_TTL_MS)
  const mac = toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(expiry)))
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE_NAME}=${expiry}.${mac}; HttpOnly; SameSite=Lax; Path=/${secure}; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
}

// cookieStore is Next's cookies() result (await it in the caller)
export async function isAdminSession(cookieStore) {
  const key = await getKey()
  if (!key) return false
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return false
  const at = raw.lastIndexOf('.')
  if (at < 1) return false
  const expiry = raw.slice(0, at)
  const mac = raw.slice(at + 1)
  if (!/^\d+$/.test(expiry) || Number(expiry) < Date.now()) return false
  const macBytes = fromHex(mac)
  if (!macBytes) return false
  // subtle.verify is constant-time; never string-compare an attacker-supplied MAC
  return crypto.subtle.verify('HMAC', key, macBytes, encoder.encode(expiry))
}

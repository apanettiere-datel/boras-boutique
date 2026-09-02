// The one place integer cents become display dollars. Integer math only.
export function formatCents(cents) {
  if (!Number.isInteger(cents)) return null
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const dollars = Math.trunc(abs / 100)
  const rem = String(abs % 100).padStart(2, '0')
  return `${sign}$${dollars}.${rem}`
}

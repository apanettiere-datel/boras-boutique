const RESEND_SEND_URL = 'https://api.resend.com/emails'
const ALERT_TIMEOUT_MS = 10000

// Ops alert to the shop inbox via Resend. Best effort: never throws, so a
// failing alert can't take down the code path it is reporting on.
export async function sendOpsAlert(subject, text) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.NEWSLETTER_FROM_EMAIL
  const to = process.env.ALERT_TO_EMAIL || process.env.NEWSLETTER_TO_EMAIL
  if (!apiKey || !from || !to) {
    console.error('Ops alert (email not configured):', subject, text)
    return false
  }
  try {
    const response = await fetch(RESEND_SEND_URL, {
      method: 'POST',
      signal: AbortSignal.timeout(ALERT_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[Bora's Boutique] ${subject}`,
        text,
      }),
    })
    return response.ok
  } catch (error) {
    console.error('Ops alert send failed', error)
    return false
  }
}

import { NextResponse } from 'next/server'

import { business } from '@/data/business'
import { addNewsletterSubscriber } from '@/lib/store-data'

// The list of record is the D1 newsletter_subscribers table, and it is
// export-only: nothing here emails subscribers, so the list must never be
// mailed directly (no unsubscribe handling). See README "Newsletter".

const RESEND_SEND_URL = 'https://api.resend.com/emails'
const RESEND_TIMEOUT_MS = 10000

// Nothing is emailed to the subscriber, so the welcome code is shown on screen
const ON_THE_LIST = business.welcomeCode
  ? `You're on the list. Use ${business.welcomeCode} for 10% off your first order.`
  : "You're on the list."

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isValidEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// Heads-up to the shop inbox. Returns true (sent), false (failed) or null
// (Resend not configured).
async function notifyShop(email) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.NEWSLETTER_FROM_EMAIL
  const to = process.env.NEWSLETTER_TO_EMAIL
  if (!apiKey || !from || !to) return null
  try {
    const response = await fetch(RESEND_SEND_URL, {
      method: 'POST',
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: 'New newsletter signup',
        text: `New newsletter signup from the website: ${email}`,
        html: `<p>New newsletter signup from the website:</p><p><strong>${escapeHtml(email)}</strong></p>`,
      }),
    })
    if (!response.ok) {
      console.error('Resend API error', { status: response.status, body: await response.text() })
    }
    return response.ok
  } catch (error) {
    console.error('Resend request failed', error?.message)
    return false
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null)
    // Lowercase so Jane@x.com and jane@x.com are one subscriber
    const email = clean(body?.email).toLowerCase()
    const website = clean(body?.website)

    // Honeypot: bots fill the hidden field, humans never see it.
    if (website) {
      return NextResponse.json({ ok: true, message: ON_THE_LIST })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, message: 'Please enter a valid email address.' },
        { status: 400 },
      )
    }

    // INSERT OR IGNORE, so resubmitting is harmless
    let stored = false
    try {
      stored = await addNewsletterSubscriber(email)
    } catch (error) {
      console.error('Subscriber insert failed', error)
    }

    const notified = await notifyShop(email)

    // Saved in D1, or at least in the shop inbox: either way it isn't lost
    if (stored || notified === true) {
      return NextResponse.json({ ok: true, message: ON_THE_LIST })
    }

    console.error('Newsletter signup could not be saved anywhere', {
      savedToDatabase: stored,
      shopInboxNotice: notified,
    })
    return NextResponse.json(
      { ok: false, message: 'Signups aren’t working right now. Please try again later.' },
      { status: 503 },
    )
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Something went sideways. Please try again.' },
      { status: 500 },
    )
  }
}

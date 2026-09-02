import { NextResponse } from 'next/server'

import { addNewsletterSubscriber } from '@/lib/store-data'

const RESEND_SEND_URL = 'https://api.resend.com/emails'
const RESEND_TIMEOUT_MS = 10000

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null)
    const email = clean(body?.email)
    const website = clean(body?.website)

    // Honeypot: bots fill the hidden field, humans never see it.
    if (website) {
      return NextResponse.json({ ok: true, message: 'You are on the list.' })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, message: 'Please enter a valid email address.' },
        { status: 400 },
      )
    }

    // The list lives in D1 (INSERT OR IGNORE, so resubmitting is harmless);
    // the Resend email below is just a heads-up to the shop inbox.
    try {
      await addNewsletterSubscriber(email)
    } catch (error) {
      console.error('Subscriber insert failed', error)
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.NEWSLETTER_FROM_EMAIL
    const to = process.env.NEWSLETTER_TO_EMAIL

    if (!apiKey || !from || !to) {
      console.info('Newsletter signup received, but Resend is not configured.', {
        email,
      })
      return NextResponse.json({ ok: true, message: 'You are on the list.' })
    }

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
      console.error('Resend API error', {
        status: response.status,
        body: await response.text(),
      })
      return NextResponse.json(
        { ok: false, message: 'Something went sideways. Please try again.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, message: 'You are on the list.' })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Something went sideways. Please try again.' },
      { status: 500 },
    )
  }
}

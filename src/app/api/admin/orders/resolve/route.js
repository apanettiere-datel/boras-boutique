import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { isAdminSession } from '@/lib/admin-auth'
import { resolveShortfalls } from '@/lib/store-data'

// Marks an oversold order as handled (refunded or restocked in Stripe)
export async function POST(request) {
  try {
    const cookieStore = await cookies()
    if (!(await isAdminSession(cookieStore))) {
      return NextResponse.json({ ok: false, message: 'Not signed in.' }, { status: 401 })
    }
    const body = await request.json().catch(() => null)
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : ''
    if (!sessionId) {
      return NextResponse.json({ ok: false, message: 'Missing order.' }, { status: 400 })
    }
    const result = await resolveShortfalls(sessionId)
    if (result === 'no-db') {
      return NextResponse.json(
        { ok: false, message: 'No database is connected yet.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('Resolve shortfall failed', error)
    return NextResponse.json({ ok: false, message: 'Update failed. Try again.' }, { status: 500 })
  }
}

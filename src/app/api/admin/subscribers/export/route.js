import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { isAdminSession } from '@/lib/admin-auth'
import { toCsv } from '@/lib/csv-export'
import { getSubscribers } from '@/lib/store-data'

// The full list as CSV, for importing into an email service (which then
// handles unsubscribes). signed_up_utc is the consent record.
export async function GET() {
  const cookieStore = await cookies()
  if (!(await isAdminSession(cookieStore))) {
    return NextResponse.json({ ok: false, message: 'Not signed in.' }, { status: 401 })
  }
  const rows = await getSubscribers()
  if (rows === null) {
    return NextResponse.json(
      { ok: false, message: 'No database is connected yet.' },
      { status: 503 },
    )
  }
  const csv = toCsv(
    ['email', 'signed_up_utc'],
    rows.map((r) => ({ email: r.email, signed_up_utc: r.created_at })),
  )
  const date = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="subscribers-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

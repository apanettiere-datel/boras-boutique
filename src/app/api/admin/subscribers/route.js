import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { isAdminSession } from '@/lib/admin-auth'
import { removeSubscriber } from '@/lib/store-data'

// Removes one address, e.g. when someone emails asking to be taken off the list
export async function DELETE(request) {
  try {
    const cookieStore = await cookies()
    if (!(await isAdminSession(cookieStore))) {
      return NextResponse.json({ ok: false, message: 'Not signed in.' }, { status: 401 })
    }
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    if (!email) {
      return NextResponse.json({ ok: false, message: 'Missing email.' }, { status: 400 })
    }
    const result = await removeSubscriber(email)
    if (result === 'no-db') {
      return NextResponse.json(
        { ok: false, message: 'No database is connected yet.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('Remove subscriber failed', error)
    return NextResponse.json({ ok: false, message: 'Update failed. Try again.' }, { status: 500 })
  }
}

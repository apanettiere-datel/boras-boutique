import { NextResponse } from 'next/server'

import {
  checkPassword,
  createSessionCookie,
  clearSessionCookie,
  isAdminConfigured,
} from '@/lib/admin-auth'

export async function POST(request) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { ok: false, message: 'Admin is not configured. Set ADMIN_PASSWORD.' },
        { status: 503 },
      )
    }
    const body = await request.json().catch(() => null)
    const ok = await checkPassword(body?.password)
    if (!ok) {
      return NextResponse.json(
        { ok: false, message: 'That password is not right.' },
        { status: 401 },
      )
    }
    const response = NextResponse.json({ ok: true })
    response.headers.set('Set-Cookie', await createSessionCookie())
    return response
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Sign-in is unavailable right now.' },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.headers.set('Set-Cookie', clearSessionCookie())
  return response
}

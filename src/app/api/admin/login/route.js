import { NextResponse } from 'next/server'

import {
  checkPassword,
  createSessionCookie,
  clearSessionCookie,
  isAdminConfigured,
} from '@/lib/admin-auth'
import { isThrottled, recordFailure, clearFailures } from '@/lib/login-throttle'

const NO_DB_FAIL_DELAY_MS = 1000

function clientIp(request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

export async function POST(request) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { ok: false, message: 'Admin is not configured. Set ADMIN_PASSWORD.' },
        { status: 503 },
      )
    }
    const ip = clientIp(request)
    if (await isThrottled(ip)) {
      return NextResponse.json(
        { ok: false, message: 'Too many attempts. Try again in a few minutes.' },
        { status: 429 },
      )
    }

    const body = await request.json().catch(() => null)
    const ok = await checkPassword(body?.password)
    if (!ok) {
      const recorded = await recordFailure(ip)
      // No DB to count attempts: a fixed delay is the fallback brake
      if (!recorded) {
        await new Promise((resolve) => setTimeout(resolve, NO_DB_FAIL_DELAY_MS))
      }
      return NextResponse.json(
        { ok: false, message: 'That password is not right.' },
        { status: 401 },
      )
    }
    await clearFailures(ip)
    const cookie = await createSessionCookie()
    if (!cookie) {
      return NextResponse.json(
        { ok: false, message: 'Admin is not configured. Set ADMIN_PASSWORD.' },
        { status: 503 },
      )
    }
    const response = NextResponse.json({ ok: true })
    response.headers.set('Set-Cookie', cookie)
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

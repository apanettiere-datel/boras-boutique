import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { isAdminSession } from '@/lib/admin-auth'
import { setStock } from '@/lib/store-data'

const MAX_STOCK = 100000

function text(value) {
  return typeof value === 'string' ? value : ''
}

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    if (!(await isAdminSession(cookieStore))) {
      return NextResponse.json(
        { ok: false, message: 'Not signed in.' },
        { status: 401 },
      )
    }

    const body = await request.json().catch(() => null)
    const handle = text(body?.handle)
    const size = text(body?.size)
    const color = text(body?.color)
    const stock = Number(body?.stock)
    if (!handle || !Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK) {
      return NextResponse.json(
        { ok: false, message: 'Stock must be a whole number, 0 or more.' },
        { status: 400 },
      )
    }

    // setStock checks the variant against the catalog before writing
    const result = await setStock(handle, size, color, stock)
    if (result === 'unknown-variant') {
      return NextResponse.json(
        { ok: false, message: 'That size and color isn\'t in the catalog.' },
        { status: 400 },
      )
    }
    if (result === 'no-db') {
      return NextResponse.json(
        { ok: false, message: 'No database is connected yet.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ ok: true, handle, size, color, stock })
  } catch (error) {
    console.error('Admin inventory update failed', error)
    return NextResponse.json(
      { ok: false, message: 'Update failed. Try again.' },
      { status: 500 },
    )
  }
}

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { isAdminSession } from '@/lib/admin-auth'
import { getProduct } from '@/data/catalog'
import { setStock } from '@/lib/store-data'

const MAX_STOCK = 100000

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
    const handle = body?.handle
    const stock = Number(body?.stock)
    if (
      !getProduct(handle) ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      stock > MAX_STOCK
    ) {
      return NextResponse.json(
        { ok: false, message: 'Invalid product or stock value.' },
        { status: 400 },
      )
    }

    const updated = await setStock(handle, stock)
    if (!updated) {
      return NextResponse.json(
        { ok: false, message: 'No database is connected yet.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ ok: true, handle, stock })
  } catch (error) {
    console.error('Admin inventory update failed', error)
    return NextResponse.json(
      { ok: false, message: 'Update failed. Try again.' },
      { status: 500 },
    )
  }
}

'use client'

import { useEffect } from 'react'

import { useCart } from '@/lib/cart'

// Clears the bag once we know the visitor arrived from a real Stripe redirect.
export function ClearBag() {
  const { clearBag } = useCart()
  useEffect(() => {
    clearBag()
  }, [clearBag])
  return null
}

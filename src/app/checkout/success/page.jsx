'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Button, BotanicalDivider, Eyebrow } from '@/components/ds'
import { useCart } from '@/lib/cart'

export default function CheckoutSuccessPage() {
  const { clearBag } = useCart()

  useEffect(() => {
    // Only clear when arriving from Stripe (success_url carries session_id);
    // a direct visit to this URL must not wipe the bag.
    const params = new URLSearchParams(window.location.search)
    if (params.get('session_id')) clearBag()
  }, [clearBag])

  return (
    <main className="mx-auto flex max-w-[680px] flex-col items-center px-5 py-24 text-center lg:px-10">
      <Eyebrow>Order confirmed</Eyebrow>
      <h1 className="mt-4 font-display text-[clamp(2rem,1.5rem+2.4vw,3rem)] leading-[1.08] text-ink-900">
        Thank you, truly
      </h1>
      <p className="mt-4 max-w-[52ch] text-base leading-[1.65] text-ink-700">
        Your order is in and a confirmation is on its way to your inbox. We pack
        every piece by hand here in Naples, so give us a day or two before it
        ships.
      </p>
      <BotanicalDivider className="my-10" />
      <Button as={Link} href="/shop">
        Keep shopping
      </Button>
    </main>
  )
}

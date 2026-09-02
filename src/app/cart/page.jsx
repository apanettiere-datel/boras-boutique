'use client'

import { useRouter } from 'next/navigation'
import {
  Breadcrumb,
  CartLineItem,
  ProgressBar,
  Button,
  EmptyState,
  Price,
  Card,
} from '@/components/ds'
import { MAX_QTY, useCart } from '@/lib/cart'

const FREE_AT = 75

export default function CartPage() {
  const {
    items,
    subtotal,
    hydrated,
    updateQty,
    removeLine,
    checkout,
    checkingOut,
    checkoutError,
  } = useCart()

  // Enrich cart items into the shape CartLineItem expects
  const enrichedLines = items.map((item) => ({
    ...item.product,
    color: item.color,
    size: item.size,
    qty: item.qty,
    key: item.key,
  }))

  const router = useRouter()
  const remaining = Math.max(0, FREE_AT - subtotal)
  const shippingCost = remaining ? 6 : 0
  const total = subtotal + shippingCost

  // Avoid flash of empty bag on server render
  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-5 py-10 lg:px-10">
        <div className="h-64 animate-pulse rounded-lg bg-blush-200" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-10 lg:px-10">
      <Breadcrumb
        className="mb-6"
        items={[{ label: 'Home', href: '/' }, { label: 'Your bag' }]}
      />
      <h1
        className="mb-8 font-display font-medium text-ink-900"
        style={{ fontSize: 'var(--display-md)' }}
      >
        Your bag
      </h1>

      {enrichedLines.length === 0 ? (
        <EmptyState
          icon="bag"
          title="Your bag is empty"
          body="Nothing in here yet. New pieces land every Tuesday at 11AM."
          action="Keep shopping"
          onAction={() => router.push('/shop')}
        />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Line items */}
          <div className="divide-y divide-line-soft border-y border-line-soft">
            {enrichedLines.map((line) => (
              <CartLineItem
                key={line.key}
                line={line}
                maxQty={MAX_QTY}
                onQty={(l, n) => updateQty(l.key, n)}
                onRemove={(l) => removeLine(l.key)}
              />
            ))}
          </div>

          {/* Order summary */}
          <Card tone="cream" padding="lg" className="h-fit lg:sticky lg:top-24">
            <p className="mb-5 font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-900">
              Order summary
            </p>
            <ProgressBar
              className="mb-5"
              tone={remaining ? 'rose' : 'sage'}
              value={Math.min(100, (subtotal / FREE_AT) * 100)}
              label={
                remaining
                  ? `Spend $${remaining.toFixed(0)} more for free shipping`
                  : 'Free shipping unlocked'
              }
            />
            <dl className="flex flex-col gap-2.5 border-b border-line-medium pb-4 font-body text-[14px]">
              <div className="flex justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="text-ink-900">${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Shipping</dt>
                <dd className="text-ink-900">{remaining ? '$6.00' : 'Free'}</dd>
              </div>
            </dl>
            <p className="pt-3 font-body text-[12px] text-ink-500">
              Taxes calculated at checkout.
            </p>
            <div className="flex items-baseline justify-between py-4">
              <span className="font-body text-[12px] font-bold uppercase tracking-eyebrow text-ink-900">
                Total
              </span>
              <Price price={total} size="lg" />
            </div>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={checkingOut}
              onClick={checkout}
            >
              Check out
            </Button>
            {checkoutError ? (
              <p className="mt-3 text-center font-body text-[12px] text-terracotta-700">
                {checkoutError}
              </p>
            ) : null}
          </Card>
        </div>
      )}
    </div>
  )
}

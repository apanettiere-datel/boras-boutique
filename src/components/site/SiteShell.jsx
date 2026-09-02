'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AnnouncementBar,
  SiteHeader,
  SiteFooter,
  Drawer,
  CartLineItem,
  ProgressBar,
  Button,
  EmptyState,
  Price,
  Icon,
} from '@/components/ds'
import { MAX_QTY, useCart } from '@/lib/cart'
import { SearchDialog } from '@/components/site/SearchDialog'

const FREE_AT = 75

const NAV_MAP = {
  home: '/',
  new: '/shop/new',
  sale: '/shop/sale',
  saved: '/saved',
  collection: '/shop',
}

const MOBILE_NAV_ITEMS = [
  { label: 'New Arrivals', href: '/shop/new' },
  { label: 'Dresses', href: '/shop/dresses' },
  { label: 'Tops', href: '/shop/tops' },
  { label: 'Bottoms', href: '/shop/bottoms' },
  { label: 'Matching Sets', href: '/shop/matching-sets' },
  { label: 'Outerwear', href: '/shop/outerwear' },
  { label: 'Shoes', href: '/shop/shoes' },
  { label: 'Accessories', href: '/shop/accessories' },
  { label: 'Jewelry', href: '/shop/jewelry' },
  { label: 'Swim', href: '/shop/swim' },
  { label: 'Sale', href: '/shop/sale' },
]

const SHOP_LINKS = MOBILE_NAV_ITEMS.filter(
  (item) => !['New Arrivals', 'Sale'].includes(item.label),
)

function MobileNav({ open, onClose }) {
  return (
    <Drawer open={open} onClose={onClose} title="Shop" side="left" width={300}>
      <nav className="flex flex-col divide-y divide-line-soft px-5">
        {MOBILE_NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="flex items-center justify-between py-4 font-body text-[13px] font-bold uppercase tracking-eyebrow text-ink-900 hover:text-rose-600"
          >
            {item.label} <Icon name="chevronRight" size={14} />
          </Link>
        ))}
      </nav>
    </Drawer>
  )
}

export function SiteShell({ children }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const {
    items,
    subtotal,
    count,
    hydrated,
    isOpen,
    openCart,
    closeCart,
    updateQty,
    removeLine,
    checkout,
    checkingOut,
    checkoutError,
  } = useCart()

  // Enrich useCart items into the shape CartLineItem expects
  const enrichedLines = items.map((item) => ({
    ...item.product,
    color: item.color,
    size: item.size,
    qty: item.qty,
    key: item.key,
  }))

  const remaining = Math.max(0, FREE_AT - subtotal)

  function handleNav(key) {
    router.push(NAV_MAP[key] || '/')
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnnouncementBar
        messages={[
          'Free shipping on orders over $75',
          'New arrivals every Tuesday at 11AM',
          '10% off your first order with code BORA10',
        ]}
      />

      <SiteHeader
        cartCount={hydrated ? count : 0}
        onCart={openCart}
        onMenu={() => setMenuOpen(true)}
        featured={{ label: 'Spring Break Shop', href: '/shop/spring-break' }}
        shopLinks={SHOP_LINKS}
        onNav={handleNav}
        onSearch={() => setSearchOpen(true)}
      />

      <main>{children}</main>

      <SiteFooter />

      {/* Cart drawer */}
      <Drawer
        open={isOpen}
        onClose={closeCart}
        title={`Your bag (${hydrated ? count : 0})`}
        width={440}
        footer={
          enrichedLines.length ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <span className="font-body text-[12px] font-bold uppercase tracking-eyebrow text-ink-500">
                  Subtotal
                </span>
                <Price price={subtotal} size="lg" />
              </div>
              <p className="font-body text-[12px] text-ink-500">
                Shipping and taxes calculated at checkout.
              </p>
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
                <p className="text-center font-body text-[12px] text-terracotta-700">
                  {checkoutError}
                </p>
              ) : null}
              <Link
                href="/cart"
                onClick={closeCart}
                className="text-center font-body text-[13px] text-rose-600 underline underline-offset-4 decoration-rose-300 hover:text-rose-800"
              >
                View bag
              </Link>
            </div>
          ) : null
        }
      >
        {enrichedLines.length === 0 ? (
          <EmptyState
            icon="bag"
            title="Your bag is empty"
            body="Nothing in here yet. New pieces land every Tuesday at 11AM."
            action="Shop new arrivals"
            onAction={() => {
              closeCart()
              router.push('/shop')
            }}
          />
        ) : (
          <>
            <div className="border-b border-line-soft px-5 py-4">
              <ProgressBar
                tone={remaining ? 'rose' : 'sage'}
                value={Math.min(100, (subtotal / FREE_AT) * 100)}
                label={
                  remaining ? (
                    <>
                      You&apos;re{' '}
                      <strong className="font-bold text-ink-900">
                        ${remaining.toFixed(0)}
                      </strong>{' '}
                      away from free shipping
                    </>
                  ) : (
                    <span className="font-semibold text-sage-700">
                      Free shipping unlocked
                    </span>
                  )
                }
              />
            </div>
            <div className="divide-y divide-line-soft px-5">
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
          </>
        )}
      </Drawer>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

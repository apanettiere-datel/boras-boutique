'use client'

import { useRouter } from 'next/navigation'

import { Breadcrumb, EmptyState, ProductCard } from '@/components/ds'
import { useCart } from '@/lib/cart'
import { useSaved } from '@/lib/saved'

export default function SavedPage() {
  const router = useRouter()
  const { savedProducts, hydrated } = useSaved()
  const { addLine } = useCart()

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-10 lg:px-10">
      <Breadcrumb
        className="mb-6"
        items={[{ label: 'Home', href: '/' }, { label: 'Saved pieces' }]}
      />
      <h1
        className="mb-8 font-display font-medium text-ink-900"
        style={{ fontSize: 'var(--display-md)' }}
      >
        Saved pieces
      </h1>

      {!hydrated ? (
        <div className="h-64 animate-pulse rounded-lg bg-blush-200" />
      ) : savedProducts.length === 0 ? (
        <EmptyState
          icon="heart"
          title="Nothing saved yet"
          body="Tap the heart on any piece and it will wait for you here."
          action="Shop new arrivals"
          onAction={() => router.push('/shop/new')}
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          {savedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={(product, color) =>
                addLine(product.handle, {
                  color: color || product.colors[0]?.name,
                  size: null,
                  qty: 1,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import {
  Breadcrumb,
  Eyebrow,
  Price,
  Badge,
  SizePicker,
  SwatchPicker,
  QuantityStepper,
  Button,
  Accordion,
  SectionHeader,
  ProductCard,
  Icon,
  BotanicalDivider,
  Dialog,
} from '@/components/ds'
import { useCart } from '@/lib/cart'

function Gallery({ product, color }) {
  const active = product.colors.find((c) => c.name === color)
  const shots = [
    (active && active.image) || product.image,
    product.hoverImage,
    product.image,
    product.colors[1]?.image,
  ].filter(Boolean)

  const [i, setI] = useState(0)
  useEffect(() => setI(0), [color])

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-3 sm:flex-col">
        {shots.map((s, n) => (
          <button
            key={n}
            onClick={() => setI(n)}
            className={[
              'h-16 w-[52px] shrink-0 overflow-hidden rounded-sm border transition-colors duration-150 cursor-pointer sm:h-24 sm:w-[76px]',
              i === n ? 'border-ink-900' : 'border-transparent hover:border-line-strong',
            ].join(' ')}
          >
            <img src={s} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div
        className="relative flex-1 overflow-hidden rounded-lg bg-blush-200"
        style={{ aspectRatio: '3 / 4' }}
      >
        <img
          src={shots[i]}
          alt={product.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {product.badge ? (
          <span className="absolute left-4 top-4">
            <Badge tone={product.badgeTone}>{product.badge}</Badge>
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function ProductView({ product, stock, related }) {
  const { addLine } = useCart()
  const [color, setColor] = useState(product.colors[0]?.name)
  const [size, setSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  const soldOut = stock <= 0
  const lowStock = !soldOut && stock < 8

  function handleAddToBag() {
    if (soldOut) return
    if (product.sizes?.length && !size) return
    addLine(product.handle, {
      color,
      size: size || null,
      qty,
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-6 lg:px-10 lg:py-10">
      <Breadcrumb
        className="mb-6"
        items={[
          { label: 'Home', href: '/' },
          {
            label: product.collection,
            href: `/shop/${product.collection.toLowerCase().replace(/\s+/g, '-')}`,
          },
          { label: product.title },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Gallery product={product} color={color} />

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          {/* Title + price */}
          <div className="flex flex-col gap-2.5">
            <Eyebrow>{product.vendor}</Eyebrow>
            <h1
              className="font-display font-medium leading-[1.08] text-ink-900"
              style={{ fontSize: 'var(--display-md)' }}
            >
              {product.title}
            </h1>
            <div className="flex items-center gap-4">
              <Price price={product.price} compareAt={product.compareAt} size="lg" />
              {soldOut ? (
                <span className="font-body text-[12px] font-bold uppercase tracking-eyebrow text-ink-500">
                  Sold out
                </span>
              ) : lowStock ? (
                <span className="font-body text-[12px] font-bold uppercase tracking-eyebrow text-terracotta-700">
                  Only {stock} left
                </span>
              ) : null}
            </div>
          </div>

          {/* Color */}
          <SwatchPicker
            showLabel
            size="lg"
            colors={product.colors}
            value={color}
            onChange={setColor}
          />

          {/* Size */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between">
              <p className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500">
                Size
              </p>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="cursor-pointer font-body text-[12.5px] text-rose-600 underline underline-offset-4 decoration-rose-300 hover:text-rose-800"
              >
                Sizing guide
              </button>
            </div>
            <SizePicker sizes={product.sizes} value={size} onChange={setSize} />
          </div>

          {/* Qty + Add */}
          <div className="flex items-center gap-3">
            <QuantityStepper value={qty} max={Math.max(stock, 1)} onChange={setQty} />
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={soldOut}
              onClick={handleAddToBag}
            >
              {soldOut ? 'Sold out' : size ? 'Add to bag' : 'Select a size'}
            </Button>
          </div>

          {/* Service info */}
          <div className="flex flex-col gap-2 rounded-lg border border-line-soft bg-cream-50 p-4">
            {[
              ['truck', 'Free shipping on orders over $75'],
              ['package', 'Ships from Naples in 1–2 business days'],
              ['heart', '30-day returns, no questions'],
            ].map(([ic, t]) => (
              <p key={t} className="flex items-center gap-2.5 font-body text-[13px] text-ink-700">
                <span className="text-sage-700">
                  <Icon name={ic} size={16} />
                </span>
                {t}
              </p>
            ))}
          </div>

          {/* Accordions */}
          <Accordion
            defaultOpen={0}
            items={[
              {
                title: 'Description',
                body:
                  product.blurb +
                  ' Lined bodice, adjustable straps, side pockets. SKU ' +
                  product.sku +
                  '.',
              },
              {
                title: 'Fit & sizing',
                body: 'Relaxed through the body with a defined waist. Runs true to size. Size down if you\'re between and prefer a closer fit. Model is 5\'8" and wears a small.',
              },
              {
                title: 'Fabric & care',
                body: '100% cotton gauze. Machine wash cold on delicate, hang to dry, warm iron if you must.',
              },
              {
                title: 'Shipping & returns',
                body: 'Free US shipping over $75, $6 flat otherwise. Orders placed before 2PM ET ship the same day. Returns accepted within 30 days on unworn items with tags; sale items are final.',
              },
            ]}
          />
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 ? (
        <>
          <div className="mx-auto my-16 max-w-[880px]">
            <BotanicalDivider />
          </div>
          <SectionHeader eyebrow="You might also love" title="Pairs well with" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      ) : null}

      <Dialog
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        title="Sizing guide"
        size="sm"
      >
        <div className="p-6">
          <h3 className="font-display text-[22px] text-ink-900">Sizing guide</h3>
          <p className="mt-2 font-body text-[13.5px] leading-[1.65] text-ink-700">
            Measurements are in inches, taken flat. Between sizes? Size down for
            a closer fit, up for an easier one.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse font-body text-[13px] text-ink-700">
              <thead>
                <tr className="border-b border-line-medium">
                  <th className="py-2 pr-4 text-left font-bold uppercase tracking-eyebrow text-[10.5px] text-ink-500">Size</th>
                  <th className="py-2 pr-4 text-left font-bold uppercase tracking-eyebrow text-[10.5px] text-ink-500">Bust</th>
                  <th className="py-2 pr-4 text-left font-bold uppercase tracking-eyebrow text-[10.5px] text-ink-500">Waist</th>
                  <th className="py-2 text-left font-bold uppercase tracking-eyebrow text-[10.5px] text-ink-500">Hip</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['XS', '31-32', '24-25', '34-35'],
                  ['S', '33-34', '26-27', '36-37'],
                  ['M', '35-36', '28-29', '38-39'],
                  ['L', '37-39', '30-32', '40-42'],
                  ['XL', '40-42', '33-35', '43-45'],
                ].map(([s, bust, waist, hip]) => (
                  <tr key={s} className="border-b border-line-soft">
                    <td className="py-2 pr-4 font-semibold text-ink-900">{s}</td>
                    <td className="py-2 pr-4">{bust}</td>
                    <td className="py-2 pr-4">{waist}</td>
                    <td className="py-2">{hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  SectionHeader,
  CollectionTile,
  ProductCard,
  BotanicalDivider,
  Eyebrow,
  Button,
  Icon,
  Dialog,
  QuickView,
} from '@/components/ds'
import { useCart } from '@/lib/cart'

// The home page UI. page.jsx (a server component) picks the products and
// attaches live stock, then hands everything in as props.

// ------- sub-sections (plain, no cart needed) -------

function DropLine() {
  return (
    <div className="flex items-center justify-center gap-3 border-y border-line-soft bg-cream-50 px-5 py-4">
      <span className="text-rose-500">
        <Icon name="clock" size={17} />
      </span>
      <p className="text-center font-body text-[12px] font-bold uppercase tracking-eyebrow text-ink-900">
        New arrivals every Tuesday at 11AM
      </p>
    </div>
  )
}

function StoryBlock({ story }) {
  return (
    <section className="bg-sage-100">
      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">
        <div className="overflow-hidden rounded-lg bg-blush-200" style={{ aspectRatio: '4 / 3' }}>
          <img src={story} alt="Bora in the shop" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col items-start gap-5">
          <Eyebrow tone="sage">From the owner</Eyebrow>
          <h2
            className="font-display font-medium leading-[1.08] text-ink-900"
            style={{ fontSize: 'var(--display-md)' }}
          >
            I buy every piece myself.
          </h2>
          <p className="max-w-[46ch] font-body text-[16px] leading-[1.7] text-ink-700">
            I started this shop because I could never find the flowy, floral,
            actually-fun pieces I wanted without driving to Miami. So I buy small
            runs, in person, from makers I trust, which is why sizes go fast and
            nothing here looks like everyone else&apos;s feed.
          </p>
          <p className="font-display text-[26px] italic text-rose-600">Bora</p>
          <Button variant="sage" as={Link} href="/visit">
            Read our story
          </Button>
        </div>
      </div>
    </section>
  )
}

function InstagramStrip({ url, handle, images }) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 py-16 lg:px-10 lg:py-24">
      <SectionHeader
        align="center"
        eyebrow={handle || 'Instagram'}
        title="Seen around Naples"
        blurb="Tag us and we'll share it."
      />
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {images.map((src, i) => (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram photo ${i + 1}`}
            className="group relative block overflow-hidden rounded-md bg-blush-200"
            style={{ aspectRatio: '1 / 1' }}
          >
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-boutique group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-ink-900/0 text-cream-50 opacity-0 transition-all duration-200 group-hover:bg-ink-900/30 group-hover:opacity-100">
              <Icon name="instagram" size={20} />
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

// Custom newsletter form: posts to /api/newsletter, includes honeypot
function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'done' | 'error'
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || website) return // honeypot filled = bot, bail silently
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message)
      setMessage(data.message || 'You’re on the list.')
      setStatus('done')
    } catch (error) {
      setMessage(error.message || 'Something went wrong. Try again.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <p className="flex items-center gap-2 font-body text-[15px] text-sage-300">
        <Icon name="check" size={18} />
        {message}
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-[420px] flex-col gap-2 sm:flex-row"
    >
      {/* Honeypot, hidden from real users */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        autoComplete="off"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="min-w-0 flex-1 rounded-full border border-transparent bg-blush-50 px-5 py-3 font-body text-[15px] text-ink-900 placeholder:text-ink-300 outline-none transition-colors duration-150 focus:border-rose-400 focus:ring-[3px] focus:ring-rose-500/25"
      />
      <Button
        type="submit"
        variant="inverse"
        loading={status === 'loading'}
      >
        Get 10% off
      </Button>
      {status === 'error' ? (
        <p className="w-full font-body text-[12px] text-terracotta-300">{message}</p>
      ) : null}
    </form>
  )
}

function SignupBlock() {
  return (
    <section className="bg-rose-500">
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-5 px-5 py-16 text-center lg:py-24">
        <Eyebrow tone="inverse">10% off your first order</Eyebrow>
        <h2
          className="font-display font-medium leading-tight text-blush-50"
          style={{ fontSize: 'var(--display-md)' }}
        >
          Get the drop before it sells out
        </h2>
        <p className="max-w-[42ch] font-body text-[15px] leading-[1.65] text-blush-200">
          One note a week: Tuesday&apos;s new arrivals, restocks and the occasional
          sandbar photo.
        </p>
        <NewsletterSignup />
      </div>
    </section>
  )
}

// ------- main page -------

export function HomeView({ justIn, edit, moodCollections, banner, story, instagram }) {
  const { addLine } = useCart()
  const [quickView, setQuickView] = useState(null)

  function handleAddToCart(product, color) {
    addLine(product.handle, {
      color: color || product.colors[0]?.name,
      size: null,
      qty: 1,
    })
  }

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div
          className="relative overflow-hidden bg-blush-200"
          // Height, not aspect-ratio + max-height: that combination narrows the
          // hero on wide screens and leaves no room for the headline on phones
          style={{ height: 'clamp(420px, 56.25vw, 620px)' }}
        >
          <img src={banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg,rgba(58,46,43,0.15) 30%,rgba(58,46,43,0.55) 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[1280px] flex-col items-start gap-4 px-5 pb-10 lg:px-10 lg:pb-16">
            <Eyebrow tone="inverse">Spring 2026</Eyebrow>
            <h1
              className="max-w-[16ch] font-display font-medium leading-[1.02] tracking-[-0.02em] text-cream-50"
              style={{ fontSize: 'var(--display-xl)' }}
            >
              Sun-soaked and softly worn
            </h1>
            <div className="flex flex-wrap gap-3">
              <Button variant="inverse" size="lg" as={Link} href="/shop/new">
                Shop new arrivals
              </Button>
              <Button
                variant="ghost"
                size="lg"
                as={Link}
                href="/shop/spring-break"
                className="!text-cream-50 hover:!bg-cream-50/15"
              >
                Spring break shop
              </Button>
            </div>
          </div>
        </div>
      </section>

      <DropLine />

      {/* Just in */}
      <section className="mx-auto w-full max-w-[1280px] px-5 py-16 lg:px-10 lg:py-24">
        <SectionHeader
          eyebrow="Just in"
          title="Fresh off the truck"
          action="Shop all new arrivals"
          actionHref="/shop/new"
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          {justIn.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onQuickView={setQuickView}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[880px] px-5">
        <BotanicalDivider />
      </div>

      {/* Collection strip */}
      <section className="mx-auto w-full max-w-[1280px] px-5 py-16 lg:px-10 lg:py-24">
        <SectionHeader align="center" eyebrow="Shop by mood" title="Where you're headed" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {moodCollections.map((c) => (
            <CollectionTile
              key={c.handle}
              eyebrow="Collection"
              title={c.title}
              image={c.image}
              ratio="4 / 5"
              href={`/shop/${c.handle}`}
            />
          ))}
        </div>
      </section>

      {/* Linen edit: pieces tagged "linen" in the catalog */}
      {edit.length > 0 ? (
        <section className="bg-cream-50 py-16 lg:py-24">
          <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-10">
            <SectionHeader
              eyebrow="Curated"
              title="The linen edit"
              blurb="Everything breathable, in one place, for the stretch of the year when Naples stops being reasonable."
              action="Shop the edit"
              actionHref="/shop"
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-5">
              {edit.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onQuickView={setQuickView}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <StoryBlock story={story} />
      {instagram ? <InstagramStrip {...instagram} /> : null}
      <SignupBlock />

      {/* Quick View dialog */}
      <Dialog
        open={!!quickView}
        onClose={() => setQuickView(null)}
        size="lg"
        title="Quick view"
      >
        {quickView ? (
          <QuickView
            product={quickView}
            onAddToCart={({ product, color, size, qty }) => {
              addLine(product.handle, { color, size, qty })
              setQuickView(null)
            }}
          />
        ) : null}
      </Dialog>
    </>
  )
}

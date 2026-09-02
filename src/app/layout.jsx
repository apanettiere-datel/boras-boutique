import { Cormorant_Garamond, Nunito_Sans } from 'next/font/google'

import '@/styles/tailwind.css'
import { CartProvider } from '@/lib/cart'
import { SavedProvider } from '@/lib/saved'
import { SITE_URL } from '@/lib/site'
import { banner } from '@/data/catalog'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display-src',
  display: 'swap',
})

const body = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-body-src',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bora's Boutique",
    template: "%s | Bora's Boutique",
  },
  description:
    'Boho-chic pieces hand-picked in Naples, Florida. New drops weekly.',
  openGraph: {
    siteName: "Bora's Boutique",
    type: 'website',
    images: [{ url: banner }],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-blush-100 font-body text-ink-700 antialiased">
        <CartProvider>
          <SavedProvider>{children}</SavedProvider>
        </CartProvider>
      </body>
    </html>
  )
}

import { products, collections } from '@/data/catalog'
import { SITE_URL } from '@/lib/site'

export default function sitemap() {
  const staticPaths = ['', '/shop', '/visit', '/returns', '/privacy', '/terms']

  const categories = [...new Set(products.map((p) => p.collection))].map(
    (c) => `/shop/${c.toLowerCase().replace(/\s+/g, '-')}`,
  )

  return [
    ...staticPaths.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...collections.map((c) => ({ url: `${SITE_URL}/shop/${c.handle}` })),
    ...categories.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...products.map((p) => ({ url: `${SITE_URL}/product/${p.handle}` })),
  ]
}

import { business } from '@/data/business'
import { products } from '@/data/catalog'
import placeholders from '@/data/placeholders.json'
import { buildFeed } from '@/lib/feed'
import { withStock } from '@/lib/inventory'

// Point Google Merchant Center and Meta Commerce Manager at
// https://<domain>/feeds/products.xml as a scheduled feed. Pieces still on
// placeholder photos are left out (Google disapproves them); add ?preview=1
// to see every item anyway.
export const dynamic = 'force-dynamic'

export async function GET(request) {
  const url = new URL(request.url)
  const preview = url.searchParams.get('preview') === '1'
  const { xml, itemCount, skipped } = buildFeed({
    products: await withStock(products),
    siteUrl: process.env.SITE_URL || url.origin,
    title: business.name,
    placeholderImages: new Set(placeholders),
    includePlaceholders: preview,
  })
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
      'X-Feed-Items': String(itemCount),
      'X-Feed-Skipped-Placeholder-Items': String(skipped),
    },
  })
}

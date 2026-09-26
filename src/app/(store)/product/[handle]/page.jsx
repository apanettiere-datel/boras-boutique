import { notFound } from 'next/navigation'

import { getProduct, products } from '@/data/catalog'
import { withStock } from '@/lib/inventory'
import { SITE_URL } from '@/lib/site'
import { totalStock } from '@/lib/variants'
import { ProductView } from './ProductView'

export async function generateMetadata({ params }) {
  const { handle } = await params
  const product = getProduct(handle)
  if (!product) return { title: 'Product not found' }
  return {
    title: product.title,
    description: product.blurb,
    alternates: { canonical: `/product/${product.handle}` },
    openGraph: {
      title: product.title,
      description: product.blurb,
      images: [{ url: product.image }],
    },
  }
}

function param(value) {
  return typeof value === 'string' ? value : undefined
}

// ?color=Sage&size=M preselects a variant (the product feed links this way)
export default async function ProductPage({ params, searchParams }) {
  const { handle } = await params
  const query = await searchParams
  const base = getProduct(handle)
  if (!base) notFound()

  // Related products: same category, different handle, up to 4
  const relatedBase = products
    .filter((p) => p.handle !== handle && p.collection === base.collection)
    .slice(0, 4)
  const [product, ...related] = await withStock([base, ...relatedBase])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.blurb,
    image: [new URL(product.image, SITE_URL).href],
    ...(product.sku ? { sku: product.sku } : {}),
    brand: { '@type': 'Brand', name: product.vendor },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.handle}`,
      priceCurrency: 'USD',
      price: product.price,
      availability:
        totalStock(product) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        // Escape < so catalog text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductView
        key={product.handle}
        product={product}
        related={related}
        initialColor={param(query?.color)}
        initialSize={param(query?.size)}
      />
    </>
  )
}

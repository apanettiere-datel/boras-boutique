import { getProduct, products } from '@/data/catalog'
import { getStock } from '@/lib/inventory'
import { SITE_URL } from '@/lib/site'
import { notFound } from 'next/navigation'
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

export default async function ProductPage({ params }) {
  const { handle } = await params
  const product = getProduct(handle)
  if (!product) notFound()

  // Live stock from D1; catalog number is the fallback when no DB is bound
  const liveStock = await getStock(handle)
  const stock = liveStock ?? (product.soldOut ? 0 : product.inventory)

  // Related products: same collection, different handle, up to 4
  const related = products
    .filter((p) => p.handle !== handle && p.collection === product.collection)
    .slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.blurb,
    image: [product.image],
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.vendor },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.handle}`,
      priceCurrency: 'USD',
      price: product.price,
      availability:
        stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductView product={product} stock={stock} related={related} />
    </>
  )
}

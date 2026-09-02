import { notFound } from 'next/navigation'

import { products, getCollection } from '@/data/catalog'
import { CollectionView } from '../CollectionView'

// /shop/[slug] resolves both taxonomies: curated collections from the
// catalog's collections list (new, sale, spring-break...) and product
// categories from product.collection (tops, bottoms, matching-sets...).
function slugify(value) {
  return value.toLowerCase().replace(/\s+/g, '-')
}

function resolve(slug) {
  const curated = getCollection(slug)
  if (curated) {
    const matched = products.filter(
      (p) =>
        (p.tags || []).includes(curated.handle) ||
        slugify(p.collection) === curated.handle,
    )
    return {
      collection: curated,
      // Mood collections (spring-break, game-day, vacation) have no tag
      // matches; they show the full catalogue under their own banner.
      products: matched.length > 0 ? matched : products,
    }
  }

  const inCategory = products.filter((p) => slugify(p.collection) === slug)
  if (inCategory.length === 0) return null
  return {
    collection: {
      handle: slug,
      title: inCategory[0].collection,
      blurb: '',
      image: inCategory[0].image,
    },
    products: inCategory,
  }
}

export async function generateMetadata({ params }) {
  const { collection: slug } = await params
  const resolved = resolve(slug)
  return { title: resolved ? resolved.collection.title : 'Collection' }
}

export default async function CollectionPage({ params }) {
  const { collection: slug } = await params
  const resolved = resolve(slug)
  if (!resolved) notFound()

  return (
    <CollectionView
      collection={resolved.collection}
      allProducts={resolved.products}
    />
  )
}

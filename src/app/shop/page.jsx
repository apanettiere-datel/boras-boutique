import { products, collections } from '@/data/catalog'
import { CollectionView } from './CollectionView'

export const metadata = { title: 'Shop All' }

// "Shop All" shows all products, no collection filter
export default function ShopPage() {
  const allCollection = {
    handle: 'all',
    title: 'Shop All',
    blurb: 'Everything in the shop, in one place.',
    image: collections[1]?.image || products[0]?.image,
  }
  return <CollectionView collection={allCollection} allProducts={products} />
}

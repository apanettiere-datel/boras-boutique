import { products, collections } from '@/data/catalog'
import { withStock } from '@/lib/inventory'
import { CollectionView } from './CollectionView'

export const metadata = { title: 'Shop All' }
// Live stock (sold-out and low-stock badges) is read per request
export const dynamic = 'force-dynamic'

// "Shop All" shows all products, no collection filter
export default async function ShopPage() {
  const allCollection = {
    handle: 'all',
    title: 'Shop All',
    blurb: 'Everything in the shop, in one place.',
    image: collections[1]?.image || products[0]?.image,
  }
  return <CollectionView collection={allCollection} allProducts={await withStock(products)} />
}

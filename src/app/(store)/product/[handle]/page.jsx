import { getProduct, products } from '@/data/catalog'
import { getStock } from '@/lib/inventory'
import { notFound } from 'next/navigation'
import { ProductView } from './ProductView'

export async function generateMetadata({ params }) {
  const { handle } = await params
  const product = getProduct(handle)
  return { title: product ? product.title : 'Product not found' }
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

  return <ProductView product={product} stock={stock} related={related} />
}

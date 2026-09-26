import { collections, instagram, banner, story, newestFirst, products } from '@/data/catalog'
import { business, filled, instagramHandle } from '@/data/business'
import { withStock } from '@/lib/inventory'
import { HomeView } from './HomeView'

// Live stock (sold-out and low-stock badges) is read per request
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // "Just in": the newest pieces tagged `new`, else simply the newest
  const newest = newestFirst(products)
  const tagged = newest.filter((p) => p.tags.includes('new'))
  const justIn = (tagged.length > 0 ? tagged : newest).slice(0, 8)
  // "The linen edit": pieces tagged `linen`; the section hides when there are none
  const edit = products.filter((p) => p.tags.includes('linen')).slice(0, 4)

  const live = await withStock([...justIn, ...edit])
  const instagramUrl = filled(business.instagramUrl)

  return (
    <HomeView
      justIn={live.slice(0, justIn.length)}
      edit={live.slice(justIn.length)}
      moodCollections={collections.slice(2, 6)}
      banner={banner}
      story={story}
      instagram={instagramUrl ? { url: instagramUrl, handle: instagramHandle(), images: instagram } : null}
    />
  )
}

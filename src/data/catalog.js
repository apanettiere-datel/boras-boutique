// The catalog ships with the site. Products are edited in catalog/products.csv
// and turned into products.json by `npm run catalog` (see README "Adding
// products and photos"); don't edit products.json by hand.
//
// Images live under public/images. Each path below is a slot: `npm run catalog`
// fills it with a placeholder until a real photo is dropped into photos/.
import productData from './products.json'

export const products = productData

export const collections = [
  { handle: 'new', title: 'New Arrivals', blurb: 'Everything that landed this Tuesday at 11AM.', image: '/images/site/collections/new.jpg' },
  { handle: 'dresses', title: 'Dresses', blurb: "Tiered, smocked and floral, the pieces we're known for.", image: '/images/site/collections/dresses.jpg' },
  { handle: 'spring-break', title: 'Spring Break Shop', blurb: 'Packed and ready for the sandbar.', image: '/images/site/collections/spring-break.jpg' },
  { handle: 'game-day', title: 'Game Day', blurb: 'Green-and-blue Friday fits for the FGCU crowd.', image: '/images/site/collections/game-day.jpg' },
  { handle: 'vacation', title: 'Vacation Shop', blurb: 'Linen sets and straw everything.', image: '/images/site/collections/vacation.jpg' },
  { handle: 'sale', title: 'Sale', blurb: 'Last of the season, final markdowns.', image: '/images/site/collections/sale.jpg' },
]

// Paths are written out in full (not built with template strings) because
// `npm run catalog` finds every image slot by scanning src/ for them.
export const instagram = [
  '/images/site/instagram/1.jpg',
  '/images/site/instagram/2.jpg',
  '/images/site/instagram/3.jpg',
  '/images/site/instagram/4.jpg',
  '/images/site/instagram/5.jpg',
  '/images/site/instagram/6.jpg',
]
export const banner = '/images/site/banner.jpg'
export const story = '/images/site/story.jpg'
export const siteImages = {
  visit: '/images/site/visit.jpg',
  menu: '/images/site/menu.jpg',
}

const byHandle = new Map(products.map((p) => [p.handle, p]))

export function getProduct(handle) {
  return (typeof handle === 'string' && byHandle.get(handle)) || null
}

export function getCollection(nameOrHandle) {
  const q = nameOrHandle.toLowerCase()
  return collections.find((c) => c.handle === q || c.title.toLowerCase() === q) || null
}

// "Matching Sets" -> "matching-sets", used for /shop/<category> URLs
export function categorySlug(category) {
  return category.toLowerCase().replace(/\s+/g, '-')
}

// Product categories in catalog order, e.g. for navigation
export const categories = [...new Set(products.map((p) => p.collection))]

// Newest first: rows added at the bottom of the spreadsheet get higher ids
export function newestFirst(list) {
  const n = (p) => Number(String(p.id).replace(/\D/g, '')) || 0
  return [...list].sort((a, b) => n(b) - n(a))
}

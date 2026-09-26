// Product feed in Google Merchant Center's RSS 2.0 format, one item per size
// and color (Google requires variants as separate items for apparel). Meta's
// Commerce Manager reads the same file, so one feed serves both.
// https://support.google.com/merchants/answer/7052112
import { variantKey } from './variants.js'

// Bora's is a women's boutique; Google requires both for apparel
const GENDER = 'female'
const AGE_GROUP = 'adult'

function xml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Short, stable hash so long ids still fit Google's 50-character limit
function fnv1a(text) {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

export function feedItemId(product, size, color) {
  const id = [product.sku || product.handle, size, color].filter(Boolean).map(slug).join('-')
  return id.length <= 50 ? id : `${id.slice(0, 41)}-${fnv1a(id)}`
}

function money(dollars) {
  return `${dollars.toFixed(2)} USD`
}

// products carry variantStock (from withStock); placeholderImages is the set
// of image paths still showing a generated placeholder. Google rejects
// placeholder product images, so those variants are left out unless
// includePlaceholders is set (for previewing the feed before photos exist).
export function buildFeed({ products, siteUrl, title, placeholderImages = new Set(), includePlaceholders = false }) {
  const abs = (path) => new URL(path, siteUrl).href
  const items = []
  let skipped = 0

  for (const p of products) {
    const multi = p.variants.length > 1
    for (const v of p.variants) {
      const colorInfo = p.colors.find((c) => c.name === v.color)
      const image = colorInfo?.image || p.image
      if (!includePlaceholders && placeholderImages.has(image)) {
        skipped++
        continue
      }
      const stock = p.variantStock?.[variantKey(v.size, v.color)] ?? 0
      const query = new URLSearchParams()
      if (v.color) query.set('color', v.color)
      if (v.size) query.set('size', v.size)
      const qs = query.toString()
      const link = abs(`/product/${p.handle}${qs ? `?${qs}` : ''}`)
      const name = [p.title, v.color, v.size].filter(Boolean).join(' - ').slice(0, 150)
      const extra = [p.hoverImage, ...p.colors.map((c) => c.image)]
        .filter((img, i, all) => img && img !== image && all.indexOf(img) === i)
        .filter((img) => includePlaceholders || !placeholderImages.has(img))
        .slice(0, 10)

      const fields = [
        ['g:id', feedItemId(p, v.size, v.color)],
        ...(multi ? [['g:item_group_id', slug(p.sku || p.handle)]] : []),
        ['title', name],
        ['description', p.blurb.slice(0, 5000)],
        ['link', link],
        ['g:image_link', abs(image)],
        ...extra.map((img) => ['g:additional_image_link', abs(img)]),
        ['g:availability', stock > 0 ? 'in_stock' : 'out_of_stock'],
        // A sale piece lists its "was" price as price and the current one as sale_price
        ['g:price', money(p.compareAt || p.price)],
        ...(p.compareAt ? [['g:sale_price', money(p.price)]] : []),
        ['g:brand', p.vendor],
        ['g:condition', 'new'],
        // Boutique and house-label pieces rarely have GTIN barcodes
        ['g:identifier_exists', 'no'],
        ['g:product_type', p.collection],
        ['g:gender', GENDER],
        ['g:age_group', AGE_GROUP],
        ...(v.color ? [['g:color', v.color]] : []),
        ...(v.size ? [['g:size', v.size], ['g:size_system', 'US']] : []),
      ]
      items.push(
        `<item>\n${fields.map(([k, val]) => `  <${k}>${xml(val)}</${k}>`).join('\n')}\n</item>`,
      )
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${xml(title)}</title>
<link>${xml(abs('/'))}</link>
<description>${xml(`${title} products`)}</description>
${items.join('\n')}
</channel>
</rss>
`
  return { xml: body, itemCount: items.length, skipped }
}

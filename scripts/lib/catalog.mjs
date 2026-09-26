// Turns catalog/products.csv (one row per size/color variant) into the
// product list the site ships with (src/data/products.json) and a stock seed
// for D1 (seed/stock.sql). Pure functions so tests can run them on fixtures.

export const COLUMNS = [
  'handle',
  'title',
  'vendor',
  'collection',
  'price',
  'compare_at',
  'sku',
  'tags',
  'badge',
  'badge_tone',
  'description',
  'fit',
  'fabric_care',
  'color',
  'color_hex',
  'size',
  'stock',
]

const REQUIRED_COLUMNS = ['handle', 'title', 'vendor', 'collection', 'price', 'description', 'stock']

// Set once per product; later rows for the same handle may leave them blank
const PRODUCT_FIELDS = [
  'title',
  'vendor',
  'collection',
  'price',
  'compare_at',
  'sku',
  'tags',
  'badge',
  'badge_tone',
  'description',
  'fit',
  'fabric_care',
]

// Editorial badges only; "Almost gone" and "Sold out" come from live stock
export const BADGE_TONES = ['new', 'sale', 'restock']

// Size and color travel through Stripe metadata and the orders table as
// "handle|size|color:qty,..." so these characters can't appear in them.
const RESERVED = /[,:|]/

const HANDLE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const HEX_RE = /^#[0-9a-fA-F]{6}$/
const DOLLARS_RE = /^\$?(\d{1,6})(?:\.0{1,2})?$/

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Image slots by convention, so a real photo replaces a placeholder by
// dropping a file at the same path with no data or code change.
export function colorImagePath(handle, color) {
  return `/images/products/${handle}/${color ? slugify(color) : 'main'}.jpg`
}

export function detailImagePath(handle) {
  return `/images/products/${handle}/detail.jpg`
}

function parseDollars(value) {
  const m = DOLLARS_RE.exec(value.replaceAll(',', ''))
  return m ? Number(m[1]) : null
}

export function buildCatalog(records, { columns = COLUMNS } = {}) {
  const errors = []
  const warnings = []
  const err = (line, msg) => errors.push(line ? `line ${line}: ${msg}` : msg)

  for (const col of REQUIRED_COLUMNS) {
    if (!columns.includes(col)) err(null, `missing column "${col}"`)
  }
  for (const col of columns) {
    if (!COLUMNS.includes(col)) warnings.push(`ignoring unknown column "${col}"`)
  }
  if (errors.length) return { products: [], errors, warnings }

  const byHandle = new Map()
  for (const r of records) {
    const handle = r.handle
    if (!handle) {
      err(r.line, 'handle is empty')
      continue
    }
    if (!HANDLE_RE.test(handle)) {
      err(r.line, `handle "${handle}" must be lowercase letters, numbers and single dashes (e.g. marigold-tiered-maxi)`)
      continue
    }
    if (!byHandle.has(handle)) {
      byHandle.set(handle, { handle, fields: {}, fieldLines: {}, rows: [] })
    }
    const entry = byHandle.get(handle)
    for (const f of PRODUCT_FIELDS) {
      const v = r[f] ?? ''
      if (!v) continue
      if (entry.fields[f] === undefined) {
        entry.fields[f] = v
        entry.fieldLines[f] = r.line
      } else if (entry.fields[f] !== v) {
        err(r.line, `${f} "${v}" differs from line ${entry.fieldLines[f]} ("${entry.fields[f]}") for ${handle}; leave it blank or make them match`)
      }
    }
    entry.rows.push(r)
  }

  const products = []
  const skus = new Map()
  let index = 0

  for (const entry of byHandle.values()) {
    const { handle, fields, rows } = entry
    const first = rows[0].line
    index += 1

    for (const f of ['title', 'vendor', 'collection', 'price', 'description']) {
      if (!fields[f]) err(first, `${handle} has no ${f}`)
    }

    const price = fields.price ? parseDollars(fields.price) : null
    if (fields.price && (price === null || price < 1)) {
      err(entry.fieldLines.price, `${handle} price "${fields.price}" must be whole dollars, like 58 (cents are not supported)`)
    }
    let compareAt = null
    if (fields.compare_at) {
      compareAt = parseDollars(fields.compare_at)
      if (compareAt === null) {
        err(entry.fieldLines.compare_at, `${handle} compare_at "${fields.compare_at}" must be whole dollars`)
      } else if (price !== null && compareAt <= price) {
        err(entry.fieldLines.compare_at, `${handle} compare_at (${compareAt}) must be higher than price (${price}); it is the "was" price on sale items`)
      }
    }

    if (fields.sku) {
      if (skus.has(fields.sku)) {
        err(entry.fieldLines.sku, `sku ${fields.sku} is also used by ${skus.get(fields.sku)}`)
      } else {
        skus.set(fields.sku, handle)
      }
    }

    let badgeTone = null
    if (fields.badge) {
      if (fields.badge.length > 24) err(entry.fieldLines.badge, `${handle} badge is longer than 24 characters`)
      badgeTone = fields.badge_tone || (compareAt ? 'sale' : 'new')
      if (!BADGE_TONES.includes(badgeTone)) {
        err(entry.fieldLines.badge_tone, `${handle} badge_tone "${badgeTone}" must be one of ${BADGE_TONES.join(', ')}`)
      }
    } else if (fields.badge_tone) {
      warnings.push(`line ${entry.fieldLines.badge_tone}: ${handle} has a badge_tone but no badge; ignoring it`)
    }

    // Variants
    const hasColor = rows.some((r) => r.color)
    const hasSize = rows.some((r) => r.size)
    const colors = []
    const colorHex = new Map()
    const sizes = []
    const variants = []
    const seen = new Set()

    for (const r of rows) {
      if (hasColor && !r.color) err(r.line, `${handle} has colors on other rows; every row needs a color`)
      if (hasSize && !r.size) err(r.line, `${handle} has sizes on other rows; every row needs a size (leave size blank on all rows for one-size pieces)`)
      for (const [name, v] of [['color', r.color], ['size', r.size]]) {
        if (v && RESERVED.test(v)) err(r.line, `${name} "${v}" can't contain commas, colons or | characters`)
        if (v && v.length > 32) err(r.line, `${name} "${v}" is longer than 32 characters`)
      }
      if (r.color) {
        if (!colorHex.has(r.color)) {
          colorHex.set(r.color, r.color_hex || '')
          colors.push(r.color)
        } else if (r.color_hex && colorHex.get(r.color) && r.color_hex !== colorHex.get(r.color)) {
          err(r.line, `${handle} ${r.color} color_hex ${r.color_hex} differs from an earlier row (${colorHex.get(r.color)})`)
        } else if (r.color_hex && !colorHex.get(r.color)) {
          colorHex.set(r.color, r.color_hex)
        }
      } else if (r.color_hex) {
        warnings.push(`line ${r.line}: ${handle} has a color_hex but no color; ignoring it`)
      }
      if (r.size && !sizes.includes(r.size)) sizes.push(r.size)

      const stockText = r.stock ?? ''
      const stock = /^\d{1,5}$/.test(stockText) ? Number(stockText) : null
      if (stock === null) err(r.line, `${handle} stock "${stockText}" must be a whole number, 0 or more`)

      const key = `${r.size || ''}|${r.color || ''}`
      if (seen.has(key)) {
        err(r.line, `${handle} lists ${[r.size, r.color].filter(Boolean).join(' / ') || 'the same variant'} twice`)
      }
      seen.add(key)
      variants.push({ size: r.size || '', color: r.color || '', initialStock: stock ?? 0 })
    }
    for (const name of colors) {
      const hex = colorHex.get(name)
      if (!hex) err(first, `${handle} color ${name} needs a color_hex like #F2D2C8 (the swatch color)`)
      else if (!HEX_RE.test(hex)) err(first, `${handle} color ${name} color_hex "${hex}" must look like #F2D2C8`)
    }
    if (colors.length > 1 && new Set(colors.map(slugify)).size !== colors.length) {
      err(first, `${handle} has two colors that would share one photo filename; rename one`)
    }

    const tags = [
      ...new Set(
        (fields.tags || '')
          .split(/[;,]/)
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
      ),
    ]

    const colorList = colors.map((name) => ({
      name,
      hex: (colorHex.get(name) || '').toUpperCase(),
      image: colorImagePath(handle, name),
    }))

    const product = {
      id: `p${index}`,
      handle,
      title: fields.title || '',
      vendor: fields.vendor || '',
      collection: fields.collection || '',
      price: price ?? 0,
      ...(compareAt ? { compareAt } : {}),
      sku: fields.sku || '',
      image: colorImagePath(handle, colors[0] || ''),
      hoverImage: detailImagePath(handle),
      colors: colorList,
      sizes: sizes.map((label) => ({ label })),
      variants,
      ...(fields.badge ? { badge: fields.badge, badgeTone } : {}),
      tags,
      blurb: fields.description || '',
      ...(fields.fit ? { fit: fields.fit } : {}),
      ...(fields.fabric_care ? { fabricCare: fields.fabric_care } : {}),
    }
    products.push(product)
  }

  if (records.length === 0) err(null, 'the spreadsheet has no product rows')

  return { products, errors, warnings }
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}

// INSERT OR IGNORE: a variant that already has a live count keeps it, so
// re-running the seed after a new drop only adds the new variants.
export function buildStockSeed(products) {
  const lines = [
    '-- Generated by `npm run catalog` from catalog/products.csv. Do not edit by hand.',
    '-- Apply with `npm run db:seed:local` (local) or `npm run db:seed` (production).',
    '-- INSERT OR IGNORE: variants that already have a live count keep it; only new',
    '-- variants get their starting stock. Change live stock in /admin/inventory.',
  ]
  for (const p of products) {
    for (const v of p.variants) {
      lines.push(
        `INSERT OR IGNORE INTO variant_stock (handle, size, color, stock) VALUES (${sqlString(p.handle)}, ${sqlString(v.size)}, ${sqlString(v.color)}, ${v.initialStock});`,
      )
    }
  }
  return lines.join('\n') + '\n'
}

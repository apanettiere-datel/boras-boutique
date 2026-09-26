#!/usr/bin/env node
// npm run catalog            import catalog/products.csv, process photos/, fill placeholders
// npm run catalog -- --check validate everything and write nothing (exit 1 on problems)
//
// See README "Adding products and photos" for the full workflow.

import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildCatalog, buildStockSeed } from './lib/catalog.mjs'
import { parseCsvObjects } from './lib/csv.mjs'
import {
  PHOTO_EXT,
  listPhotos,
  photoTarget,
  referencedImagePaths,
  renderPhoto,
  renderPlaceholder,
} from './lib/images.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const paths = {
  csv: join(root, 'catalog/products.csv'),
  productsJson: join(root, 'src/data/products.json'),
  placeholdersJson: join(root, 'src/data/placeholders.json'),
  seed: join(root, 'seed/stock.sql'),
  src: join(root, 'src'),
  photos: join(root, 'photos'),
  public: join(root, 'public'),
}

const check = process.argv.includes('--check')
const problems = []
const notes = []

function writeIfChanged(file, content) {
  if (existsSync(file) && Buffer.compare(readFileSync(file), Buffer.from(content)) === 0) return false
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
  return true
}

// 1. Spreadsheet -> products.json + stock seed
const { columns, records } = parseCsvObjects(readFileSync(paths.csv, 'utf8'))
const { products, errors, warnings } = buildCatalog(records, { columns })
warnings.forEach((w) => notes.push(w))
if (errors.length) {
  console.error(`\ncatalog/products.csv has ${errors.length} problem(s):\n`)
  errors.forEach((e) => console.error(`  - ${e}`))
  console.error('\nNothing was written. Fix the rows above and run it again.\n')
  process.exit(1)
}

const productsJson = JSON.stringify(products, null, 2) + '\n'
const seedSql = buildStockSeed(products)
if (check) {
  if (!existsSync(paths.productsJson) || readFileSync(paths.productsJson, 'utf8') !== productsJson) {
    problems.push('src/data/products.json is out of date with catalog/products.csv (run npm run catalog)')
  }
  if (!existsSync(paths.seed) || readFileSync(paths.seed, 'utf8') !== seedSql) {
    problems.push('seed/stock.sql is out of date with catalog/products.csv (run npm run catalog)')
  }
} else {
  writeIfChanged(paths.productsJson, productsJson)
  writeIfChanged(paths.seed, seedSql)
}

// 2. Which image slots does the site use, and what should a placeholder say?
const specs = new Map()
for (const p of products) {
  const colors = p.colors.length ? p.colors : [{ name: '', hex: '#E2D2BE', image: p.image }]
  for (const c of colors) {
    specs.set(c.image, { kind: 'product', title: p.title, subtitle: c.name, hex: c.hex })
  }
  // Tint the detail shot with the second color so the hover swap is visible
  specs.set(p.hoverImage, { kind: 'product', title: p.title, subtitle: 'Detail', hex: (colors[1] || colors[0]).hex })
}
const SITE_TINTS = ['#F2D2C8', '#C2CDB8', '#E2D2BE', '#E9B8AC', '#C6D3DA', '#E9B99B']
function siteSpec(path, i) {
  const name = path.replace('/images/site/', '').replace('.jpg', '')
  const labels = { banner: 'Home hero', story: 'Owner story', visit: 'Visit page', menu: 'Menu feature' }
  let title = labels[name]
  if (!title && name.startsWith('collections/')) title = `${name.slice(12).replaceAll('-', ' ')} collection`
  if (!title && name.startsWith('instagram/')) title = `Instagram ${name.slice(10)}`
  return { kind: 'site', title: title || name, hex: SITE_TINTS[i % SITE_TINTS.length] }
}

const referenced = referencedImagePaths(paths.src, { ignore: ['placeholders.json'] })
// products.json may not be written yet in --check mode; count its slots too
const slots = [...new Set([...referenced, ...specs.keys()])].sort()
let siteIndex = 0
for (const path of slots) {
  if (!specs.has(path)) specs.set(path, siteSpec(path, siteIndex++))
}

const manifest = new Set(
  existsSync(paths.placeholdersJson) ? JSON.parse(readFileSync(paths.placeholdersJson, 'utf8')) : [],
)
const publicFile = (path) => join(paths.public, path)

// 3. Real photos dropped into photos/ replace their slot's placeholder
let processed = 0
const slotSet = new Set(slots)
for (const photo of listPhotos(paths.photos)) {
  if (photo.rel === 'README.md') continue
  if (photo.ext === '.heic' || photo.ext === '.heif') {
    problems.push(`photos/${photo.rel}: HEIC isn't supported. Export it as JPEG (on iPhone: Settings > Camera > Formats > Most Compatible, or share as JPEG)`)
    continue
  }
  if (!PHOTO_EXT.has(photo.ext)) {
    notes.push(`photos/${photo.rel}: not an image type we read (jpg, png, webp, tiff, avif); skipped`)
    continue
  }
  const target = photoTarget(photo.rel)
  if (!slotSet.has(target)) {
    problems.push(`photos/${photo.rel} doesn't match any image the site uses (expected something like photos/products/<handle>/<color>.jpg). Check the handle and color spelling.`)
    continue
  }
  const out = publicFile(target)
  const stale =
    !existsSync(out) || manifest.has(target) || statSync(photo.file).mtimeMs > statSync(out).mtimeMs
  if (!stale) continue
  if (check) {
    problems.push(`photos/${photo.rel} hasn't been processed yet (run npm run catalog)`)
    continue
  }
  writeIfChanged(out, await renderPhoto(photo.file, target))
  manifest.delete(target)
  processed++
}

// 4. Every slot without a real photo gets a placeholder (never overwrites a photo)
const toRender = []
for (const path of slots) {
  const out = publicFile(path)
  if (existsSync(out) && !manifest.has(path)) continue
  if (check) {
    if (!existsSync(out)) problems.push(`${path} is missing (run npm run catalog)`)
    continue
  }
  toRender.push(path)
}
let placeholders = 0
for (let i = 0; i < toRender.length; i += 8) {
  await Promise.all(
    toRender.slice(i, i + 8).map(async (path) => {
      if (writeIfChanged(publicFile(path), await renderPlaceholder({ path, ...specs.get(path) }))) {
        placeholders++
      }
      manifest.add(path)
    }),
  )
}

// 5. Placeholders nobody references any more (renamed color, removed product) go;
//    real photos that nothing references are only reported, never deleted.
for (const path of [...manifest]) {
  if (slotSet.has(path)) continue
  if (!check) {
    rmSync(publicFile(path), { force: true })
    manifest.delete(path)
  }
}
const productDirs = new Set(products.map((p) => p.handle))
for (const photo of listPhotos(join(paths.public, 'images/products'))) {
  const path = `/images/products/${photo.rel}`
  if (!slotSet.has(path) && !manifest.has(path)) {
    const handle = photo.rel.split('/')[0]
    notes.push(
      productDirs.has(handle)
        ? `public${path} isn't used by ${handle} any more (renamed color?); delete it if it's not needed`
        : `public${path} belongs to a product that's no longer in the catalog; delete it if it's not needed`,
    )
  }
}

if (!check) {
  writeIfChanged(paths.placeholdersJson, JSON.stringify([...manifest].sort(), null, 2) + '\n')
}

// Summary
const variantCount = products.reduce((n, p) => n + p.variants.length, 0)
const waiting = slots.filter((s) => manifest.has(s))
const productWaiting = new Set(
  waiting.filter((s) => s.startsWith('/images/products/')).map((s) => s.split('/')[3]),
)
console.log(`\n${products.length} products, ${variantCount} size/color variants`)
if (!check) console.log(`${processed} photo(s) processed, ${placeholders} placeholder(s) written or updated`)
console.log(`${slots.length - waiting.length} of ${slots.length} image slots have real photos`)
if (productWaiting.size) {
  console.log(`${productWaiting.size} product(s) still need photos: ${[...productWaiting].slice(0, 8).join(', ')}${productWaiting.size > 8 ? ', ...' : ''}`)
}
if (notes.length) {
  console.log('\nNotes:')
  notes.forEach((n) => console.log(`  - ${n}`))
}
if (problems.length) {
  console.error('\nProblems:')
  problems.forEach((p) => console.error(`  - ${p}`))
  process.exit(1)
}
if (!check) console.log('\nNext: npm run db:seed:local to load starting stock for any new variants.')
console.log('')

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { buildCatalog, buildStockSeed, COLUMNS } from '../scripts/lib/catalog.mjs'
import { parseCsv, parseCsvObjects, toCsv } from '../scripts/lib/csv.mjs'

const HEADER = COLUMNS.join(',')

function catalogFrom(lines) {
  const { columns, records } = parseCsvObjects([HEADER, ...lines].join('\n'))
  return buildCatalog(records, { columns })
}

// Build a CSV line from a partial row, in COLUMNS order
function row(fields) {
  return toCsv(COLUMNS, [fields]).split('\n')[1]
}

const dress = {
  handle: 'marigold-maxi',
  title: 'Marigold Maxi',
  vendor: "Bora's House Label",
  collection: 'Dresses',
  price: '98',
  description: 'Soft and easy.',
}

test('parseCsv handles quotes, embedded commas and newlines, CRLF and a BOM', () => {
  const text = '﻿a,b,c\r\n"x, y","say ""hi""","line1\nline2"\r\n\r\n'
  assert.deepEqual(parseCsv(text), [
    ['a', 'b', 'c'],
    ['x, y', 'say "hi"', 'line1\nline2'],
  ])
})

test('parseCsv rejects an unterminated quote', () => {
  assert.throws(() => parseCsv('a\n"oops'), /quoted field/)
})

test('toCsv round-trips through parseCsv', () => {
  const records = [{ a: 'plain', b: 'has, comma', c: 'has "quote"' }]
  const [, parsed] = parseCsv(toCsv(['a', 'b', 'c'], records))
  assert.deepEqual(parsed, ['plain', 'has, comma', 'has "quote"'])
})

test('builds variants, inheriting product fields from the first row', () => {
  const { products, errors } = catalogFrom([
    row({ ...dress, tags: 'Dresses; New', color: 'Blush', color_hex: '#f2d2c8', size: 'S', stock: '2' }),
    row({ handle: 'marigold-maxi', color: 'Blush', size: 'M', stock: '0' }),
    row({ handle: 'marigold-maxi', color: 'Sage', color_hex: '#C2CDB8', size: 'S', stock: '1' }),
  ])
  assert.deepEqual(errors, [])
  const [p] = products
  assert.equal(p.price, 98)
  assert.deepEqual(p.tags, ['dresses', 'new'])
  assert.deepEqual(p.sizes, [{ label: 'S' }, { label: 'M' }])
  assert.deepEqual(p.colors, [
    { name: 'Blush', hex: '#F2D2C8', image: '/images/products/marigold-maxi/blush.jpg' },
    { name: 'Sage', hex: '#C2CDB8', image: '/images/products/marigold-maxi/sage.jpg' },
  ])
  assert.equal(p.image, '/images/products/marigold-maxi/blush.jpg')
  assert.equal(p.hoverImage, '/images/products/marigold-maxi/detail.jpg')
  assert.deepEqual(p.variants, [
    { size: 'S', color: 'Blush', initialStock: 2 },
    { size: 'M', color: 'Blush', initialStock: 0 },
    { size: 'S', color: 'Sage', initialStock: 1 },
  ])
})

test('one-size, one-color pieces use the main image slot', () => {
  const { products, errors } = catalogFrom([
    row({ ...dress, handle: 'gold-hoops', collection: 'Jewelry', stock: '5' }),
  ])
  assert.deepEqual(errors, [])
  assert.deepEqual(products[0].sizes, [])
  assert.deepEqual(products[0].colors, [])
  assert.equal(products[0].image, '/images/products/gold-hoops/main.jpg')
  assert.deepEqual(products[0].variants, [{ size: '', color: '', initialStock: 5 }])
})

test('rejects prices with cents and sale prices that are not higher', () => {
  const { errors } = catalogFrom([
    row({ ...dress, price: '49.99', stock: '1' }),
    row({ ...dress, handle: 'b', compare_at: '98', stock: '1' }),
  ])
  assert.match(errors.join('\n'), /whole dollars/)
  assert.match(errors.join('\n'), /must be higher than price/)
})

test('accepts $58 and 58.00 as whole dollars', () => {
  const { products, errors } = catalogFrom([
    row({ ...dress, price: '$58', stock: '1' }),
    row({ ...dress, handle: 'b', price: '58.00', compare_at: '$80', stock: '1' }),
  ])
  assert.deepEqual(errors, [])
  assert.equal(products[0].price, 58)
  assert.equal(products[1].compareAt, 80)
})

test('catches conflicting product fields, duplicate variants and missing swatches', () => {
  const { errors } = catalogFrom([
    row({ ...dress, color: 'Blush', size: 'S', stock: '1' }),
    row({ handle: 'marigold-maxi', title: 'Marigold Midi', color: 'Blush', size: 'S', stock: '1' }),
  ])
  const all = errors.join('\n')
  assert.match(all, /title "Marigold Midi" differs/)
  assert.match(all, /lists S \/ Blush twice/)
  assert.match(all, /needs a color_hex/)
})

test('requires sizes on every row once any row has one, and blocks separator characters', () => {
  const { errors } = catalogFrom([
    row({ ...dress, size: 'S', stock: '1' }),
    row({ handle: 'marigold-maxi', stock: '1' }),
    row({ ...dress, handle: 'b', size: 'S|M', stock: '1' }),
  ])
  const all = errors.join('\n')
  assert.match(all, /every row needs a size/)
  assert.match(all, /can't contain commas, colons or \|/)
})

test('rejects bad handles, bad stock, duplicate SKUs and unknown badge tones', () => {
  const { errors } = catalogFrom([
    row({ ...dress, handle: 'Marigold Maxi', stock: '1' }),
    row({ ...dress, handle: 'a', sku: 'BB-1', stock: '-1' }),
    row({ ...dress, handle: 'b', sku: 'BB-1', badge: 'Hot', badge_tone: 'low', stock: '1' }),
  ])
  const all = errors.join('\n')
  assert.match(all, /lowercase letters, numbers and single dashes/)
  assert.match(all, /stock "-1" must be a whole number/)
  assert.match(all, /sku BB-1 is also used by a/)
  assert.match(all, /badge_tone "low" must be one of/)
})

test('reports a missing required column', () => {
  const { columns, records } = parseCsvObjects('handle,title\nx,X\n')
  const { errors } = buildCatalog(records, { columns })
  assert.match(errors.join('\n'), /missing column "price"/)
})

test('stock seed escapes quotes and never overwrites live counts', () => {
  const sql = buildStockSeed([
    { handle: 'a', variants: [{ size: '', color: "Bora's Pink", initialStock: 3 }] },
  ])
  assert.match(sql, /INSERT OR IGNORE INTO variant_stock/)
  assert.match(sql, /'Bora''s Pink', 3\);/)
})

test('the committed products.json matches catalog/products.csv', () => {
  const { columns, records } = parseCsvObjects(readFileSync('catalog/products.csv', 'utf8'))
  const { products, errors } = buildCatalog(records, { columns })
  assert.deepEqual(errors, [])
  const committed = JSON.parse(readFileSync('src/data/products.json', 'utf8'))
  assert.deepEqual(committed, products, 'run `npm run catalog` after editing the spreadsheet')
})

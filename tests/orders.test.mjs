import assert from 'node:assert/strict'
import { test } from 'node:test'

import { toCsv } from '../src/lib/csv-export.js'
import { buildFeed, feedItemId } from '../src/lib/feed.js'
import { decodeOrderItems, encodeOrderItems } from '../src/lib/order-metadata.js'
import {
  aggregateLines,
  lineProblem,
  parseLines,
  sizeOptions,
  stockOf,
  variantKey,
} from '../src/lib/variants.js'

const dress = {
  handle: 'marigold-maxi',
  title: 'Marigold Maxi',
  vendor: "Bora's House Label",
  collection: 'Dresses',
  price: 88,
  compareAt: 128,
  sku: 'BB-1000',
  blurb: 'Soft & easy.',
  image: '/images/products/marigold-maxi/blush.jpg',
  hoverImage: '/images/products/marigold-maxi/detail.jpg',
  colors: [
    { name: 'Blush', hex: '#F2D2C8', image: '/images/products/marigold-maxi/blush.jpg' },
    { name: 'Sage', hex: '#C2CDB8', image: '/images/products/marigold-maxi/sage.jpg' },
  ],
  sizes: [{ label: 'S' }, { label: 'M' }],
  variants: [
    { size: 'S', color: 'Blush', initialStock: 1 },
    { size: 'M', color: 'Blush', initialStock: 0 },
    { size: 'S', color: 'Sage', initialStock: 2 },
    { size: 'M', color: 'Sage', initialStock: 2 },
  ],
}

const hoops = {
  handle: 'gold-hoops',
  title: 'Gold Hoops',
  vendor: 'Palma Row',
  collection: 'Jewelry',
  price: 30,
  sku: '',
  blurb: 'Everyday gold.',
  image: '/images/products/gold-hoops/main.jpg',
  hoverImage: '/images/products/gold-hoops/detail.jpg',
  colors: [],
  sizes: [],
  variants: [{ size: '', color: '', initialStock: 4 }],
}

test('a sized piece without a size is not buyable (the card "Add" bug)', () => {
  assert.equal(lineProblem(dress, { size: null, color: 'Blush' }), 'needs-size')
  assert.equal(lineProblem(dress, { size: 'S', color: '' }), 'needs-color')
  assert.equal(lineProblem(dress, { size: 'XL', color: 'Blush' }), 'unavailable')
  assert.equal(lineProblem(dress, { size: 'M', color: 'Sage' }), null)
  assert.equal(lineProblem(hoops, {}), null)
  assert.equal(lineProblem(hoops, { size: 'M' }), 'unavailable')
  assert.equal(lineProblem(null, {}), 'unavailable')
})

test('sizes are crossed out per color from live stock', () => {
  const live = { ...dress, variantStock: { 'S|Blush': 1, 'M|Blush': 0, 'S|Sage': 2, 'M|Sage': 2 } }
  assert.deepEqual(sizeOptions(live, 'Blush'), [
    { label: 'S', soldOut: false },
    { label: 'M', soldOut: true },
  ])
  assert.deepEqual(sizeOptions(live, 'Sage').map((s) => s.soldOut), [false, false])
  assert.equal(stockOf(live, 'M', 'Blush'), 0)
  // Without live counts nothing is crossed out; checkout has the final say
  assert.equal(stockOf(dress, 'M', 'Blush'), null)
  assert.deepEqual(sizeOptions(dress, 'Blush').map((s) => s.soldOut), [false, false])
})

test('order metadata round-trips variants and merges duplicates', () => {
  const lines = [
    { handle: 'marigold-maxi', size: 'M', color: 'Sage', qty: 1 },
    { handle: 'marigold-maxi', size: 'M', color: 'Sage', qty: 2 },
    { handle: 'gold-hoops', size: '', color: '', qty: 1 },
  ]
  const metadata = encodeOrderItems(lines)
  assert.deepEqual(decodeOrderItems(metadata), [
    { handle: 'marigold-maxi', size: 'M', color: 'Sage', qty: 3 },
    { handle: 'gold-hoops', size: '', color: '', qty: 1 },
  ])
})

test('order metadata splits long orders under Stripe\'s 500-character limit', () => {
  const lines = Array.from({ length: 50 }, (_, i) => ({
    handle: `a-rather-long-product-handle-number-${i}`,
    size: 'XL',
    color: 'Dusty Rose',
    qty: 20,
  }))
  const metadata = encodeOrderItems(lines)
  assert.ok(Object.keys(metadata).length > 1)
  for (const value of Object.values(metadata)) assert.ok(value.length <= 500)
  assert.deepEqual(decodeOrderItems(metadata), lines)
})

test('old "handle:qty" order rows still read, with no size or color', () => {
  assert.deepEqual(parseLines('marigold-maxi:2,gold-hoops:1'), [
    { handle: 'marigold-maxi', size: '', color: '', qty: 2 },
    { handle: 'gold-hoops', size: '', color: '', qty: 1 },
  ])
  assert.deepEqual(parseLines('bad,x:0,y:-1,z:1.5'), [])
})

test('aggregateLines keys on handle, size and color', () => {
  assert.equal(
    aggregateLines([
      { handle: 'a', size: 'S', color: 'Blush', qty: 1 },
      { handle: 'a', size: 'S', color: 'Sage', qty: 1 },
    ]).length,
    2,
  )
  assert.equal(variantKey(null, undefined), '|')
})

test('CSV export neutralizes spreadsheet formulas and quotes', () => {
  const csv = toCsv(['email'], [{ email: '=HYPERLINK("http://evil")@x.com' }, { email: 'jane@x.com' }])
  const lines = csv.replace('﻿', '').trim().split('\r\n')
  assert.equal(lines[1], `"'=HYPERLINK(""http://evil"")@x.com"`)
  assert.equal(lines[2], 'jane@x.com')
})

test('feed lists one item per variant with live availability and sale pricing', () => {
  const live = { ...dress, variantStock: { 'S|Blush': 1, 'M|Blush': 0, 'S|Sage': 2, 'M|Sage': 2 } }
  const { xml, itemCount } = buildFeed({
    products: [live, { ...hoops, variantStock: { '|': 4 } }],
    siteUrl: 'https://example.com',
    title: "Bora's Boutique",
  })
  assert.equal(itemCount, 5)
  assert.match(xml, /<g:id>bb-1000-m-blush<\/g:id>/)
  assert.match(xml, /<g:item_group_id>bb-1000<\/g:item_group_id>/)
  assert.match(xml, /<link>https:\/\/example.com\/product\/marigold-maxi\?color=Blush&amp;size=M<\/link>/)
  assert.match(xml, /<g:price>128.00 USD<\/g:price>\s*<g:sale_price>88.00 USD<\/g:sale_price>/)
  assert.match(xml, /<title>Bora&apos;s Boutique<\/title>/)
  assert.match(xml, /<description>Soft &amp; easy.<\/description>/)
  // M / Blush has none left
  const mBlush = xml.split('<item>').find((i) => i.includes('bb-1000-m-blush'))
  assert.match(mBlush, /<g:availability>out_of_stock<\/g:availability>/)
  // One-size, one-color piece: no group, no size, no color
  const hoopsItem = xml.split('<item>').find((i) => i.includes('gold-hoops'))
  assert.doesNotMatch(hoopsItem, /item_group_id|g:size|g:color/)
})

test('feed leaves out variants still on placeholder photos unless previewing', () => {
  const args = {
    products: [{ ...dress, variantStock: {} }],
    siteUrl: 'https://example.com',
    title: 'Shop',
    placeholderImages: new Set(['/images/products/marigold-maxi/sage.jpg']),
  }
  assert.equal(buildFeed(args).itemCount, 2)
  assert.equal(buildFeed(args).skipped, 2)
  assert.equal(buildFeed({ ...args, includePlaceholders: true }).itemCount, 4)
})

test('feed ids stay within Google\'s 50 characters and are stable', () => {
  const long = { ...hoops, handle: 'an-extremely-long-product-handle-that-goes-on-and-on', sku: '' }
  const id = feedItemId(long, 'XL', 'Dusty Rose Pink')
  assert.ok(id.length <= 50)
  assert.equal(id, feedItemId(long, 'XL', 'Dusty Rose Pink'))
})

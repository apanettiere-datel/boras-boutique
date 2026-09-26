import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'

import sharp from 'sharp'

// Every image the site shows lives under public/images and is referenced by
// a literal "/images/....jpg" path somewhere in src/ (products.json included).
// Those references are the list of slots; each slot holds either a real photo
// or a generated placeholder.

const IMAGE_REF = /\/images\/[a-z0-9_\-/]+\.jpg/g
const SOURCE_EXT = new Set(['.js', '.jsx', '.json'])

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

export function referencedImagePaths(srcDir, { ignore = [] } = {}) {
  const found = new Set()
  for (const file of walk(srcDir)) {
    if (!SOURCE_EXT.has(extname(file)) || ignore.some((i) => file.endsWith(i))) continue
    for (const m of readFileSync(file, 'utf8').matchAll(IMAGE_REF)) found.add(m[0])
  }
  return [...found].sort()
}

export function listPhotos(photosDir) {
  return walk(photosDir).map((file) => ({
    file,
    rel: relative(photosDir, file).split(sep).join('/'),
    ext: extname(file).toLowerCase(),
  }))
}

// photos/products/<handle>/<color>.jpg -> /images/products/<handle>/<color>.jpg
export function photoTarget(rel) {
  return `/images/${rel.replace(/\.[^./]+$/, '').toLowerCase()}.jpg`
}

export const PHOTO_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif'])

// Placeholder size and the long-edge cap for real photos, per slot
export function slotSize(path) {
  if (path.startsWith('/images/products/')) return { width: 1200, height: 1600, maxEdge: 2000 }
  if (path === '/images/site/banner.jpg') return { width: 2400, height: 1350, maxEdge: 2400 }
  if (path === '/images/site/visit.jpg') return { width: 2400, height: 900, maxEdge: 2400 }
  if (path === '/images/site/story.jpg') return { width: 1600, height: 1200, maxEdge: 2000 }
  if (path === '/images/site/menu.jpg') return { width: 1200, height: 900, maxEdge: 1600 }
  if (path.startsWith('/images/site/collections/')) return { width: 1600, height: 1600, maxEdge: 2000 }
  if (path.startsWith('/images/site/instagram/')) return { width: 1000, height: 1000, maxEdge: 1200 }
  return { width: 1600, height: 1200, maxEdge: 2000 }
}

const INK = '#3A2E2B'
const CREAM = '#FDFAF4'

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function mix(hex, other, amount) {
  const a = hexToRgb(hex)
  const b = hexToRgb(other)
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * amount))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function wrap(text, maxChars) {
  if (text.length <= maxChars) return [text]
  const words = text.split(' ')
  let best = [text]
  let bestScore = Infinity
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ')
    const b = words.slice(i).join(' ')
    const score = Math.max(a.length, b.length)
    if (score < bestScore) {
      best = [a, b]
      bestScore = score
    }
  }
  return best
}

// A single botanical sprig in the spirit of the design system's divider
function sprig(x, y, scale, color, opacity) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 110 C 4 50, 2 -10, 0 -110"/>
    <path d="M1 70 C -30 62, -52 40, -58 12 C -30 18, -10 38, 1 70 Z"/>
    <path d="M2 30 C 32 22, 54 0, 60 -28 C 32 -22, 12 -2, 2 30 Z"/>
    <path d="M1 -12 C -28 -20, -46 -42, -50 -68 C -24 -62, -6 -42, 1 -12 Z"/>
    <path d="M1 -52 C 24 -60, 38 -80, 40 -102 C 18 -96, 4 -78, 1 -52 Z"/>
  </g>`
}

// spec: { path, title, subtitle, hex, kind: 'product' | 'site' }
export function placeholderSvg(spec) {
  const { width, height } = slotSize(spec.path)
  const base = spec.hex || '#F2D2C8'
  const top = mix(base, '#FFFFFF', 0.35)
  const bottom = mix(base, INK, 0.08)
  const dark = luminance(base) < 0.35
  const ink = dark ? CREAM : INK
  const min = Math.min(width, height)
  const cx = width / 2

  if (spec.kind === 'product') {
    const lines = wrap(spec.title, 20)
    const size = Math.round(width * 0.062)
    const titleY = height * 0.56
    const titleSvg = lines
      .map((line, i) => `<text x="${cx}" y="${titleY + i * size * 1.15}" text-anchor="middle" font-family="Georgia, 'DejaVu Serif', serif" font-size="${size}" fill="${ink}" fill-opacity="0.9">${esc(line)}</text>`)
      .join('')
    const subY = titleY + lines.length * size * 1.15 + size * 0.35
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  ${sprig(cx, height * 0.36, min / 520, ink, 0.28)}
  ${titleSvg}
  ${spec.subtitle ? `<text x="${cx}" y="${subY}" text-anchor="middle" font-family="'Helvetica Neue', 'DejaVu Sans', sans-serif" font-size="${Math.round(size * 0.42)}" letter-spacing="${Math.round(size * 0.08)}" fill="${ink}" fill-opacity="0.7">${esc(spec.subtitle.toUpperCase())}</text>` : ''}
  <text x="${cx}" y="${height * 0.9}" text-anchor="middle" font-family="'Helvetica Neue', 'DejaVu Sans', sans-serif" font-size="${Math.round(size * 0.34)}" letter-spacing="${Math.round(size * 0.1)}" fill="${ink}" fill-opacity="0.55">PHOTO COMING SOON</text>
</svg>`
  }

  // Site imagery. Each slot is cropped by its page and carries the page's own
  // overlay text, so the label goes where both survive:
  // - heroes (banner, visit) have a headline bottom-left and lose their sides
  //   on phones: small label top-center
  // - collection images are cropped to a portrait tile, a wide desktop band
  //   and a short phone band, and the page already names the collection over
  //   them: no label, just the botanical motif
  // - everything else (story, menu, Instagram tiles): centered label
  const size = Math.round(min * 0.034)
  const labelFont = `font-family="'Helvetica Neue', 'DejaVu Sans', sans-serif" letter-spacing="${Math.round(size * 0.12)}" fill="${ink}"`
  const title = esc((spec.title || 'Photo').toUpperCase())
  const open = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>`
  const label = (y, anchorX = cx) => `
  <text x="${anchorX}" y="${y}" text-anchor="middle" ${labelFont} font-size="${size}" fill-opacity="0.6">${title}</text>
  <text x="${anchorX}" y="${y + size * 1.35}" text-anchor="middle" ${labelFont} font-size="${Math.round(size * 0.7)}" fill-opacity="0.48">PHOTO COMING SOON</text>`

  if (spec.path === '/images/site/banner.jpg' || spec.path === '/images/site/visit.jpg') {
    return `${open}
  ${sprig(width * 0.8, height * 0.58, min / 520, ink, 0.16)}
  ${label(height * 0.17)}
</svg>`
  }

  if (spec.path.startsWith('/images/site/collections/')) {
    return `${open}
  ${sprig(cx - min * 0.12, height * 0.5, min / 420, ink, 0.2)}
  ${sprig(cx + min * 0.14, height * 0.56, min / 640, ink, 0.14)}
</svg>`
  }

  return `${open}
  ${sprig(cx, height / 2 - size * 4, min / 1000, ink, 0.24)}
  ${label(height / 2 + size * 1.2)}
</svg>`
}

export async function renderPlaceholder(spec) {
  return sharp(Buffer.from(placeholderSvg(spec)))
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()
}

// Real photos: honor the camera's rotation, then drop all metadata (sharp
// strips EXIF by default, which removes phone GPS and device details), cap
// the long edge, and write a progressive JPEG.
export async function renderPhoto(inputFile, path) {
  const { maxEdge } = slotSize(path)
  return sharp(inputFile)
    .rotate()
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toBuffer()
}

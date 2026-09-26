'use client'

import { useState } from 'react'

import { MAX_QTY } from '@/lib/cart'
import { LOW_STOCK, sizeOptions, stockOf } from '@/lib/variants'

// Color, size and quantity selection for one product, against the live
// per-variant counts the server attached as product.variantStock. Used by the
// product page and Quick View so both enforce the same rules: a sized piece
// needs a size, sold-out sizes are crossed out per color, and quantity can't
// exceed what's left.
export function useVariantPicker(product, { initialColor, initialSize } = {}) {
  const colorNames = product.colors.map((c) => c.name)
  const hasSizes = product.sizes.length > 0

  const [color, setColorState] = useState(
    colorNames.includes(initialColor) ? initialColor : (colorNames[0] ?? ''),
  )
  const [size, setSize] = useState(() => {
    const ok = product.sizes.some((s) => s.label === initialSize)
    return ok && stockOf(product, initialSize, color) !== 0 ? initialSize : null
  })
  const [requestedQty, setQty] = useState(1)

  const sizes = sizeOptions(product, color)
  const stock = hasSizes ? (size ? stockOf(product, size, color) : null) : stockOf(product, '', color)
  const colorSoldOut = hasSizes
    ? sizes.length > 0 && sizes.every((s) => s.soldOut)
    : stock !== null && stock <= 0
  const maxQty = stock === null ? MAX_QTY : Math.max(1, Math.min(stock, MAX_QTY))
  // Never more than the chosen variant has left
  const qty = Math.min(requestedQty, maxQty)

  function setColor(next) {
    setColorState(next)
    // Drop a size that this color doesn't have left
    if (size && stockOf(product, size, next) === 0) setSize(null)
  }

  const soldOut = Boolean(product.soldOut)
  const canAdd =
    !soldOut && !colorSoldOut && (!hasSizes || Boolean(size)) && (stock === null || stock > 0)

  let label = 'Add to bag'
  if (soldOut) label = 'Sold out'
  else if (colorSoldOut) label = color ? `Sold out in ${color}` : 'Sold out'
  else if (hasSizes && !size) label = 'Select a size'

  // "Only 2 left" once a specific variant is chosen and running low
  const lowStockNote = stock !== null && stock > 0 && stock <= LOW_STOCK ? `Only ${stock} left` : null

  return {
    color,
    setColor,
    size,
    setSize,
    qty,
    setQty,
    sizes,
    hasSizes,
    maxQty,
    canAdd,
    label,
    soldOut,
    lowStockNote,
  }
}

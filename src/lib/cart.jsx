'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { getProduct } from '@/data/catalog'
import { lineProblem } from '@/lib/variants'

const STORAGE_KEY = 'boras-bag'
// Per-line cap, enforced here and by /api/checkout; UI steppers take it as max
export const MAX_QTY = 20

const CartContext = createContext(null)

export function lineKey({ handle, size, color }) {
  return [handle, size || '', color || ''].join('|')
}

// A line is kept only if it's a real variant of a product still in the
// catalog: drops pieces that were removed, sizes/colors that no longer exist,
// and sized pieces saved without a size.
function isBuyable(line) {
  return Boolean(line) && lineProblem(getProduct(line.handle), line) === null
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const stored = JSON.parse(raw)
        if (Array.isArray(stored)) {
          // Read after mount so the first render matches the server's (empty)
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLines(stored.filter(isBuyable))
        }
      }
    } catch {
      // A corrupt bag just starts empty.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // Storage unavailable (private mode); the bag still works in memory.
    }
  }, [lines, hydrated])

  const addLine = useCallback((handle, { size, color, qty = 1 } = {}) => {
    if (!isBuyable({ handle, size, color })) return
    setLines((prev) => {
      const key = lineKey({ handle, size, color })
      const existing = prev.find((l) => lineKey(l) === key)
      if (existing) {
        return prev.map((l) =>
          lineKey(l) === key ? { ...l, qty: Math.min(l.qty + qty, MAX_QTY) } : l,
        )
      }
      return [
        ...prev,
        { handle, size: size || null, color: color || null, qty: Math.min(qty, MAX_QTY) },
      ]
    })
    setIsOpen(true)
  }, [])

  const removeLine = useCallback((key) => {
    setLines((prev) => prev.filter((l) => lineKey(l) !== key))
  }, [])

  const updateQty = useCallback((key, qty) => {
    setLines((prev) => {
      if (qty < 1) return prev.filter((l) => lineKey(l) !== key)
      return prev.map((l) =>
        lineKey(l) === key ? { ...l, qty: Math.min(qty, MAX_QTY) } : l,
      )
    })
  }, [])

  const clearBag = useCallback(() => setLines([]), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const items = useMemo(
    () =>
      lines
        .map((l) => ({ ...l, key: lineKey(l), product: getProduct(l.handle) }))
        .filter((i) => i.product),
    [lines],
  )

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.qty, 0),
    [items],
  )

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

  const checkout = useCallback(async () => {
    if (lines.length === 0 || checkingOut) return
    setCheckingOut(true)
    setCheckoutError('')
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: lines }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) {
        throw new Error(data.message || 'Checkout is unavailable right now.')
      }
      window.location.assign(data.url)
    } catch (error) {
      setCheckoutError(error.message || 'Checkout is unavailable right now.')
      setCheckingOut(false)
    }
  }, [lines, checkingOut])

  const value = {
    items,
    subtotal,
    count,
    hydrated,
    isOpen,
    openCart,
    closeCart,
    addLine,
    removeLine,
    updateQty,
    clearBag,
    checkout,
    checkingOut,
    checkoutError,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

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

const STORAGE_KEY = 'boras-saved'

const SavedContext = createContext(null)

export function SavedProvider({ children }) {
  const [handles, setHandles] = useState([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const stored = JSON.parse(raw)
        if (Array.isArray(stored)) {
          // Read after mount so the first render matches the server's (empty)
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setHandles(stored.filter((h) => getProduct(h)))
        }
      }
    } catch {
      // A corrupt list just starts empty.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(handles))
    } catch {
      // Storage unavailable; saving still works in memory.
    }
  }, [handles, hydrated])

  const toggleSaved = useCallback((handle) => {
    if (!getProduct(handle)) return
    setHandles((prev) =>
      prev.includes(handle)
        ? prev.filter((h) => h !== handle)
        : [...prev, handle],
    )
  }, [])

  const isSaved = useCallback((handle) => handles.includes(handle), [handles])

  const savedProducts = useMemo(
    () => handles.map((h) => getProduct(h)).filter(Boolean),
    [handles],
  )

  const value = { handles, savedProducts, hydrated, toggleSaved, isSaved }

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved() {
  const context = useContext(SavedContext)
  if (!context) throw new Error('useSaved must be used within SavedProvider')
  return context
}

'use client'

import { useState, useEffect, useCallback } from 'react'

export type GridDensity = 'compact' | 'normal' | 'large'

const STORAGE_KEY = 'grid-density'
const DEFAULT_DENSITY: GridDensity = 'normal'

export function useGridDensity() {
  const [density, setDensityState] = useState<GridDensity>(DEFAULT_DENSITY)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as GridDensity | null
    if (stored && ['compact', 'normal', 'large'].includes(stored)) {
      setDensityState(stored)
    }
  }, [])

  const setDensity = useCallback((value: GridDensity) => {
    setDensityState(value)
    localStorage.setItem(STORAGE_KEY, value)
  }, [])

  return { density, setDensity }
}

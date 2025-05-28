"use client"

import { useState, useCallback } from "react"

/**
 * A simplified stable state hook that prevents infinite loops
 */
export function useStableState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue)

  // Memoize the update function to prevent recreating it on every render
  const updateState = useCallback((value: T | ((prev: T) => T)) => {
    setState(value)
  }, [])

  return [state, updateState] as const
}

"use client"

import { useState, useCallback, useRef, useEffect } from "react"

/**
 * Custom hook for managing debounced state updates
 * Prevents infinite loops by properly managing state updates and cleanup
 */
export function useDebouncedState<T>(initialValue: T, onChange: (value: T) => void, delay = 100) {
  const [localValue, setLocalValue] = useState<T>(initialValue)
  const [committedValue, setCommittedValue] = useState<T>(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUpdatingRef = useRef(false)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Update local value when initial value changes (from props)
  useEffect(() => {
    if (!isUpdatingRef.current && initialValue !== committedValue) {
      setLocalValue(initialValue)
      setCommittedValue(initialValue)
    }
  }, [initialValue, committedValue])

  const updateValue = useCallback(
    (newValue: T) => {
      // Prevent updates while another update is in progress
      if (isUpdatingRef.current) return

      setLocalValue(newValue)

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout for debounced update
      timeoutRef.current = setTimeout(() => {
        isUpdatingRef.current = true
        setCommittedValue(newValue)
        onChange(newValue)

        // Reset the updating flag after a short delay
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 50)
      }, delay)
    },
    [onChange, delay],
  )

  return [localValue, updateValue] as const
}

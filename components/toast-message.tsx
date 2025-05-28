"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

export interface ToastMessageRef {
  show: (message: string) => void
  hide: () => void
}

interface ToastMessageProps {
  duration?: number
}

export const ToastMessage = forwardRef<ToastMessageRef, ToastMessageProps>(({ duration = 5000 }, ref) => {
  const [message, setMessage] = useState("")
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useImperativeHandle(ref, () => ({
    show: (msg: string) => {
      setMessage(msg)
      setVisible(true)

      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      // Auto-hide after duration
      timerRef.current = setTimeout(() => {
        setVisible(false)
      }, duration)
    },
    hide: () => {
      setVisible(false)
    },
  }))

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-3 rounded-lg z-50 flex items-center gap-4 min-w-[200px] max-w-[80vw] shadow-lg"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="flex-1">{message}</div>
          <button
            onClick={() => setVisible(false)}
            className="rounded-full bg-white/20 p-1 hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

ToastMessage.displayName = "ToastMessage"

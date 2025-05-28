"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConnectionStatusProps {
  isConnected: boolean
  isLoading?: boolean
  onRetry?: () => void
}

export function ConnectionStatus({ isConnected, isLoading = false, onRetry }: ConnectionStatusProps) {
  return (
    <AnimatePresence mode="wait">
      {isConnected ? (
        <motion.div
          key="connected"
          className="flex items-center gap-2 text-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="flex items-center gap-1 text-green-500"
          >
            <Wifi className="h-4 w-4" />
            <span className="w-2 h-2 bg-green-500 rounded-full" />
          </motion.div>
          <span className="text-gray-400">Connected</span>
        </motion.div>
      ) : (
        <motion.div
          key="disconnected"
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-1 text-red-500">
            <WifiOff className="h-4 w-4" />
            <span className="w-2 h-2 bg-red-500 rounded-full" />
          </div>
          <span className="text-gray-400">Disconnected</span>
          {onRetry && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-gray-400 hover:text-white"
              onClick={onRetry}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Retry
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

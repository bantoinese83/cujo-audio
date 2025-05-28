"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Loader2, AlertCircle, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface StateWrapperProps {
  isLoading?: boolean
  isEmpty?: boolean
  error?: string | null
  loadingMessage?: string
  emptyMessage?: string
  onRetry?: () => void
  children: ReactNode
}

export function StateWrapper({
  isLoading = false,
  isEmpty = false,
  error = null,
  loadingMessage = "Loading...",
  emptyMessage = "No data available",
  onRetry,
  children,
}: StateWrapperProps) {
  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full h-full min-h-[200px] bg-black/30 border-purple-900/30 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center justify-center h-full p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Loader2 className="h-12 w-12 text-purple-500" />
            </motion.div>
            <p className="text-lg text-gray-400">{loadingMessage}</p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card className="w-full h-full min-h-[200px] bg-black/30 border-red-900/30 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center justify-center h-full p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center gap-4"
          >
            <div className="rounded-full bg-red-900/20 p-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-red-500">Something went wrong</p>
              <p className="text-sm text-gray-400 max-w-md">{error}</p>
            </div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="mt-2">
                Try Again
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  // Show empty state
  if (isEmpty) {
    return (
      <Card className="w-full h-full min-h-[200px] bg-black/30 border-purple-900/30 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center justify-center h-full p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center gap-4"
          >
            <div className="rounded-full bg-gray-800 p-3">
              <Ban className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-lg text-gray-400">{emptyMessage}</p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  // Show content
  return <>{children}</>
}

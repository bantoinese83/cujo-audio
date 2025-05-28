"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function PromptCardSkeleton() {
  return (
    <motion.div
      className="block w-full max-w-[180px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl h-[180px]",
          "backdrop-blur-xl",
          "border border-zinc-800/50",
          "shadow-lg",
        )}
        style={{
          background: "linear-gradient(to bottom, #3f3f46, #27272a)",
        }}
      >
        {/* Animated loading effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)",
            }}
          />
        </div>

        {/* Skeleton UI */}
        <div className="absolute top-3 right-3 w-10 h-6 rounded-lg bg-zinc-700/50" />
        <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-zinc-700/50" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="space-y-2">
            <div className="w-3/4 h-5 rounded bg-zinc-700/50 mx-auto" />
            <div className="w-1/2 h-4 rounded bg-zinc-700/50 mx-auto" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

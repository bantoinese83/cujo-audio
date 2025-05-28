"use client"

import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlayCircle, PauseCircle, RefreshCw, Loader2, Music } from "lucide-react"
import type { MusicControlsProps } from "@/types/app-types"
import { colors } from "@/lib/design-system"

function MusicControls({ playbackState, onPlayPause, onReset, disabled = false }: MusicControlsProps) {
  const isPlaying = playbackState === "playing"
  const isLoading = playbackState === "loading"

  return (
    <Card
      className={`bg-black/30 border-purple-900/30 backdrop-blur-xl overflow-hidden ${disabled ? "opacity-70" : ""}`}
    >
      <CardContent className="flex flex-col justify-center items-center p-6 gap-4 relative">
        {/* Background animation */}
        <AnimatePresence>
          {isPlaying && !disabled && (
            <motion.div
              className="absolute inset-0 opacity-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-full w-1"
                  style={{
                    left: `${i * 25}%`,
                    background: `linear-gradient(to top, transparent, ${colors.accent.purple}, transparent)`,
                  }}
                  animate={{
                    scaleY: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main controls */}
        <div className="flex items-center gap-4 relative z-10">
          <motion.div whileHover={{ scale: disabled ? 1 : 1.1 }} whileTap={{ scale: disabled ? 1 : 0.9 }}>
            <Button
              onClick={onPlayPause}
              size="lg"
              className={`h-16 w-16 rounded-full ${
                disabled
                  ? "bg-gray-700 hover:bg-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              } relative overflow-hidden`}
              disabled={disabled}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </motion.div>
                ) : isPlaying ? (
                  <motion.div
                    key="pause"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <PauseCircle className="h-8 w-8" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <PlayCircle className="h-8 w-8" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulse effect when playing */}
              {isPlaying && !disabled && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-white"
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeOut",
                  }}
                />
              )}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: disabled ? 1 : 1.1 }} whileTap={{ scale: disabled ? 1 : 0.9 }}>
            <Button
              onClick={onReset}
              variant="outline"
              size="icon"
              className={`h-12 w-12 rounded-full ${
                disabled
                  ? "border-gray-700 text-gray-500 hover:bg-transparent cursor-not-allowed"
                  : "border-gray-700 hover:border-purple-500 transition-colors duration-300"
              }`}
              disabled={disabled}
            >
              <motion.div
                animate={{ rotate: isPlaying && !disabled ? 360 : 0 }}
                transition={{
                  duration: 2,
                  repeat: isPlaying && !disabled ? Number.POSITIVE_INFINITY : 0,
                  ease: "linear",
                }}
              >
                <RefreshCw className="h-6 w-6" />
              </motion.div>
            </Button>
          </motion.div>
        </div>

        {/* Status text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={disabled ? "disabled" : playbackState}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-gray-400 flex items-center gap-2"
          >
            <Music className="w-4 h-4" />
            {disabled && "Service unavailable"}
            {!disabled && playbackState === "playing" && "Generating music..."}
            {!disabled && playbackState === "loading" && "Preparing..."}
            {!disabled && playbackState === "paused" && "Paused"}
            {!disabled && playbackState === "stopped" && "Ready to play"}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

export default memo(MusicControls)

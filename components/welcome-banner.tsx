"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if the user has seen the banner before
    const hasSeenBanner = localStorage.getItem("cujo_welcome_seen")

    if (!hasSeenBanner) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem("cujo_welcome_seen", "true")
  }

  if (isDismissed) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-x-0 top-0 z-50 p-4 flex justify-center"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <div className="relative w-full max-w-4xl">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-cyan-600/20 rounded-lg blur-xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            <div className="relative bg-gray-900/90 backdrop-blur-md rounded-lg border border-purple-500/30 shadow-xl overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 rounded-full hover:bg-gray-800/50 z-10"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="p-6 flex flex-col sm:flex-row items-center gap-4">
                <Logo size="lg" />

                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">Welcome to Cujo Audio</h2>
                  <p className="text-gray-300 text-sm mb-3">
                    Create stunning AI-generated music with just a few prompts. Experiment with different genres, moods,
                    and instruments to craft your perfect sound.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={handleDismiss} className="gap-1">
                      <Sparkles className="h-4 w-4" />
                      Get Started
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDismiss}>
                      Watch Tutorial
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/10 via-fuchsia-600/10 to-cyan-600/10 px-6 py-2 text-xs text-gray-400 flex justify-between items-center">
                <span>Powered by Gemini AI</span>
                <span>New features added: Multiple prompts, real-time generation, advanced controls</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

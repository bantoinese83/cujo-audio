"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wand2, X, Check, Sparkles, Music, Code } from "lucide-react"

interface PromptEnhancerProps {
  initialPrompt: string
  onEnhancedPrompt: (prompt: string) => void
  onClose: () => void
}

type EnhancementStyle = "creative" | "detailed" | "technical"

export function PromptEnhancer({ initialPrompt, onEnhancedPrompt, onClose }: PromptEnhancerProps) {
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enhancementStyle, setEnhancementStyle] = useState<EnhancementStyle>("creative")

  const enhancePrompt = async () => {
    if (!initialPrompt.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: initialPrompt,
          style: enhancementStyle,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to enhance prompt")
      }

      const data = await response.json()
      setEnhancedPrompt(data.enhancedPrompt)
    } catch (err) {
      console.error("Error enhancing prompt:", err)
      setError("Failed to enhance prompt. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const applyEnhancedPrompt = () => {
    if (enhancedPrompt) {
      onEnhancedPrompt(enhancedPrompt)
    }
  }

  const getStyleDescription = () => {
    switch (enhancementStyle) {
      case "creative":
        return "Transforms basic prompts into rich, evocative descriptions"
      case "detailed":
        return "Adds production elements, instruments, and sonic characteristics"
      case "technical":
        return "Enhances with music theory and audio engineering terminology"
      default:
        return ""
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Enhance Prompt with AI</h2>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-800" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Original Prompt</h3>
            <div className="bg-gray-800 rounded-lg p-3 text-gray-200">{initialPrompt}</div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Enhancement Style</h3>
            <Tabs
              value={enhancementStyle}
              onValueChange={(value) => setEnhancementStyle(value as EnhancementStyle)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="creative" className="data-[state=active]:bg-purple-900/50">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Creative
                </TabsTrigger>
                <TabsTrigger value="detailed" className="data-[state=active]:bg-purple-900/50">
                  <Music className="h-4 w-4 mr-2" />
                  Detailed
                </TabsTrigger>
                <TabsTrigger value="technical" className="data-[state=active]:bg-purple-900/50">
                  <Code className="h-4 w-4 mr-2" />
                  Technical
                </TabsTrigger>
              </TabsList>
              <p className="text-xs text-gray-400 mt-2">{getStyleDescription()}</p>
            </Tabs>
          </div>

          <Button
            onClick={enhancePrompt}
            disabled={isLoading || !initialPrompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mb-6"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-white" />
                Enhancing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Enhance with AI
              </>
            )}
          </Button>

          {error && <div className="text-red-400 text-sm mb-6">{error}</div>}

          {enhancedPrompt && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Enhanced Prompt</h3>
              <div className="bg-gray-800 rounded-lg p-3 text-gray-200 border border-purple-500/30">
                {enhancedPrompt}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={!enhancedPrompt}
              onClick={applyEnhancedPrompt}
            >
              <Check className="h-4 w-4 mr-2" />
              Apply Enhanced Prompt
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

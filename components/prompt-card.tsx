"use client"

import type React from "react"

import { useEffect, useRef, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { X, AlertCircle, Sliders, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Prompt } from "@/types/music"
import { useStableState } from "@/hooks/use-stable-state"
import { animations } from "@/lib/design-system"
import { Logo } from "@/components/logo"

interface PromptCardProps {
  prompt: Prompt
  isFiltered?: boolean
  onUpdate: (prompt: Prompt) => void
  onRemove: (promptId: string) => void
}

function PromptCard({ prompt, isFiltered = false, onUpdate, onRemove }: PromptCardProps) {
  // Use refs for values that don't need to trigger re-renders
  const promptRef = useRef(prompt)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Use stable state for UI state
  const [isEditing, setIsEditing] = useStableState(false)
  const [showSlider, setShowSlider] = useStableState(false)
  const [isHovered, setIsHovered] = useStableState(false)
  const [localText, setLocalText] = useStableState(prompt.text)
  const [localWeight, setLocalWeight] = useStableState(prompt.weight)

  // Update local state when props change
  useEffect(() => {
    // Only update if the prompt has actually changed
    if (prompt.text !== promptRef.current.text && !isEditing) {
      setLocalText(prompt.text)
    }

    if (prompt.weight !== promptRef.current.weight) {
      setLocalWeight(prompt.weight)
    }

    // Always update the ref
    promptRef.current = prompt
  }, [prompt.text, prompt.weight, isEditing]) // Specific dependencies

  // Handle text change
  const handleTextChange = () => {
    setIsEditing(false)

    if (localText.trim() === "") {
      setLocalText(promptRef.current.text)
      return
    }

    if (localText !== promptRef.current.text) {
      onUpdate({
        ...promptRef.current,
        text: localText.trim(),
      })
    }
  }

  // Handle weight change with debouncing
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = Number.parseFloat(e.target.value)
    setLocalWeight(newWeight)

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      onUpdate({
        ...promptRef.current,
        weight: newWeight,
      })
    }, 200)
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Generate gradient based on prompt color
  const generateGradient = () => {
    const color = promptRef.current.color.replace("#", "")
    const r = Number.parseInt(color.substring(0, 2), 16)
    const g = Number.parseInt(color.substring(2, 4), 16)
    const b = Number.parseInt(color.substring(4, 6), 16)
    const darkerColor = `rgba(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)}, 1)`
    return `linear-gradient(to bottom, ${promptRef.current.color}, ${darkerColor})`
  }

  return (
    <motion.div
      className="block w-full max-w-[180px]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: animations.easings.easeOut }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className={cn(
          "relative overflow-hidden rounded-2xl h-[180px]",
          "backdrop-blur-xl",
          "border border-zinc-200/50 dark:border-zinc-800/50",
          "shadow-lg",
          "transition-all duration-300",
          isFiltered && "border-red-500 dark:border-red-500",
        )}
        style={{
          background: !isFiltered ? generateGradient() : "linear-gradient(to bottom, #3f3f46, #27272a)",
        }}
        animate={{
          boxShadow: isHovered
            ? `0 20px 40px -10px ${promptRef.current.color}66`
            : "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Centered Logo for branding */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <Logo withText={false} size="md" className="opacity-80" />
        </div>

        {/* Sparkle effect on hover */}
        <AnimatePresence>
          {isHovered && localWeight > 0 && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{
                    x: Math.random() * 180,
                    y: Math.random() * 180,
                    scale: 0,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 1,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white/50" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weight badge */}
        <AnimatePresence>
          {localWeight > 0 && (
            <motion.div
              className="absolute top-3 right-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium",
                  "bg-white/90 text-zinc-800",
                  "dark:bg-zinc-900/90 dark:text-zinc-200",
                  "backdrop-blur-md",
                  "shadow-xs",
                  "border border-white/20 dark:border-zinc-800/50",
                )}
              >
                {localWeight.toFixed(1)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remove button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: isHovered ? 1 : 0.7 }} transition={{ duration: 0.2 }}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 left-3 h-6 w-6 rounded-full bg-black/30 hover:bg-black/50 z-10"
            onClick={() => onRemove(promptRef.current.promptId)}
          >
            <X className="h-3 w-3 text-white" />
          </Button>
        </motion.div>

        {/* Filtered indicator */}
        <AnimatePresence>
          {isFiltered && (
            <motion.div
              className="absolute top-3 left-12 z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={localText}
                  onChange={(e) => setLocalText(e.target.value)}
                  onBlur={handleTextChange}
                  onKeyDown={(e) => e.key === "Enter" && handleTextChange()}
                  autoFocus
                  className="w-full bg-black/50 border border-white/40 focus:border-white/80 outline-none px-2 py-1 text-white rounded text-sm"
                  style={{ maxWidth: "120px" }}
                />
              ) : (
                <motion.h3
                  className="text-base font-semibold text-white leading-tight tracking-tight cursor-pointer line-clamp-2 overflow-ellipsis shadow-sm"
                  onClick={() => setIsEditing(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={localText}
                  style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.5)" }}
                >
                  {localText}
                </motion.h3>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "p-2 rounded-full",
                  "bg-white/10",
                  "backdrop-blur-md",
                  "hover:bg-white/20",
                  "transition-colors duration-300",
                )}
                onClick={() => setShowSlider(!showSlider)}
              >
                <Sliders className="w-4 h-4 text-white" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Slider overlay */}
        <AnimatePresence>
          {showSlider && (
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-full space-y-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between text-xs text-white">
                  <span>Weight</span>
                  <motion.span
                    key={localWeight.toString()}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {localWeight.toFixed(1)}
                  </motion.span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={localWeight}
                  onChange={handleWeightChange}
                  disabled={isFiltered}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${promptRef.current.color} 0%, ${promptRef.current.color} ${
                      (localWeight / 2) * 100
                    }%, rgba(255,255,255,0.2) ${(localWeight / 2) * 100}%, rgba(255,255,255,0.2) 100%)`,
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-white/20 text-white hover:bg-white/20"
                  onClick={() => setShowSlider(false)}
                >
                  Done
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// Use a custom comparison function to prevent unnecessary re-renders
export default memo(PromptCard, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.prompt.promptId === nextProps.prompt.promptId &&
    prevProps.prompt.text === nextProps.prompt.text &&
    prevProps.prompt.weight === nextProps.prompt.weight &&
    prevProps.prompt.color === nextProps.prompt.color &&
    prevProps.isFiltered === nextProps.isFiltered
  )
})

"use client"

import { useState, useCallback, useEffect, memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { X, AlertCircle } from "lucide-react"
import type { Prompt } from "@/lib/types"
import { cn } from "@/lib/utils"
import type React from "react"

interface PromptItemProps {
  prompt: Prompt
  isFiltered?: boolean
  onUpdate: (prompt: Prompt) => void
  onRemove: (promptId: string) => void
}

function PromptItem({ prompt, isFiltered = false, onUpdate, onRemove }: PromptItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(prompt.text)
  const [localWeight, setLocalWeight] = useState(prompt.weight)

  // Update local state when props change
  useEffect(() => {
    setText(prompt.text)
    setLocalWeight(prompt.weight)
  }, [prompt.text, prompt.weight])

  // Debounced weight change handler
  const handleWeightChange = useCallback(
    (value: number[]) => {
      const newWeight = value[0]
      setLocalWeight(newWeight)

      // Use a timeout to debounce updates
      const timeoutId = setTimeout(() => {
        onUpdate({
          ...prompt,
          weight: newWeight,
        })
      }, 100)

      return () => clearTimeout(timeoutId)
    },
    [prompt, onUpdate],
  )

  const handleTextChange = useCallback(() => {
    if (text.trim() !== "") {
      onUpdate({
        ...prompt,
        text: text.trim(),
      })
    } else {
      setText(prompt.text)
    }
    setIsEditing(false)
  }, [text, prompt, onUpdate])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleTextChange()
      }
    },
    [handleTextChange],
  )

  return (
    <Card
      className={cn("relative overflow-hidden border-2 transition-all", isFiltered && "border-red-500 bg-red-950/20")}
      style={{
        borderColor: !isFiltered && localWeight > 0 ? prompt.color : undefined,
        boxShadow: !isFiltered && localWeight > 0 ? `0 0 20px ${prompt.color}44` : undefined,
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundColor: !isFiltered ? prompt.color : "transparent" }}
      />

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-gray-800/80 hover:bg-gray-700 z-10"
        onClick={() => onRemove(prompt.promptId)}
      >
        <X className="h-3 w-3" />
      </Button>

      {isFiltered && (
        <div className="absolute top-2 left-2 z-10">
          <AlertCircle className="h-4 w-4 text-red-500" />
        </div>
      )}

      <CardContent className="p-4 space-y-4 relative">
        {isEditing ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleTextChange}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full bg-transparent border-b border-gray-600 focus:border-purple-500 outline-none px-1 py-1 text-center"
          />
        ) : (
          <div
            className={cn(
              "text-center font-medium cursor-pointer py-1 px-2 rounded hover:bg-black/20",
              isFiltered && "text-red-400",
            )}
            onClick={() => setIsEditing(true)}
          >
            {prompt.text}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Weight</span>
            <span>{localWeight.toFixed(1)}</span>
          </div>
          <Slider
            value={[localWeight]}
            min={0}
            max={2}
            step={0.1}
            onValueChange={handleWeightChange}
            className="py-4"
            disabled={isFiltered}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(PromptItem)

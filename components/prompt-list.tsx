"use client"

import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Prompt, PlaybackState } from "@/lib/types"
import PromptCard from "./prompt-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Music, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AudioVisualizer } from "./audio-visualizer"

interface PromptListProps {
  prompts: Prompt[]
  filteredPrompts?: Set<string>
  onPromptUpdate: (prompt: Prompt) => void
  onPromptRemove: (promptId: string) => void
  onAddPrompt?: () => void
  playbackState?: PlaybackState
  audioContext?: AudioContext | null
  sourceNode?: AudioNode | null
}

function PromptList({
  prompts,
  filteredPrompts = new Set(),
  onPromptUpdate,
  onPromptRemove,
  onAddPrompt,
  playbackState = "stopped",
  audioContext,
  sourceNode,
}: PromptListProps) {
  if (prompts.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-full bg-purple-900/20 p-6 mb-4">
          <Music className="h-12 w-12 text-purple-500" />
        </div>
        <h3 className="text-xl font-medium mb-2">No prompts yet</h3>
        <p className="text-gray-400 max-w-md mb-6">
          Add a prompt to start generating music. Try something like "Trap Soul", "Lo-Fi Drill", or "Phonk".
        </p>
        {onAddPrompt && (
          <Button
            onClick={onAddPrompt}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Prompt
          </Button>
        )}
      </motion.div>
    )
  }

  return (
    <ScrollArea className="flex-1 w-full relative">
      <AnimatePresence>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-4">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.promptId}
              prompt={prompt}
              isFiltered={filteredPrompts.has(prompt.text)}
              onUpdate={onPromptUpdate}
              onRemove={onPromptRemove}
            />
          ))}
        </div>
      </AnimatePresence>
      <AudioVisualizer isPlaying={playbackState === "playing"} audioContext={audioContext || undefined} sourceNode={sourceNode || undefined} />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(PromptList)

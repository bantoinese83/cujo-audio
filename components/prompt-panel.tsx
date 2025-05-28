"use client"

import { useRef, useEffect } from "react"
import type { Prompt } from "@/types/music"
import { PromptCard } from "@/components/prompt-card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface PromptPanelProps {
  prompts: Map<string, Prompt>
  filteredPrompts: Set<string>
  onPromptChange: (prompt: Prompt) => void
  onPromptRemove: (promptId: string) => void
  onAddPrompt: () => string
}

export function PromptPanel({
  prompts,
  filteredPrompts,
  onPromptChange,
  onPromptRemove,
  onAddPrompt,
}: PromptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastPromptRef = useRef<string | null>(null)

  useEffect(() => {
    // Scroll to the newly added prompt
    if (lastPromptRef.current && containerRef.current) {
      const element = document.getElementById(lastPromptRef.current)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "end" })

        // Focus on the text input of the new prompt
        const input = element.querySelector("input[type='text']") as HTMLInputElement
        if (input) {
          input.focus()
          input.select()
        }

        lastPromptRef.current = null
      }
    }
  }, [prompts])

  const handleAddPrompt = () => {
    const newPromptId = onAddPrompt()
    lastPromptRef.current = newPromptId
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
          Cujo Audio
        </h2>
      </div>

      <ScrollArea className="flex-1 w-full">
        <div ref={containerRef} className="flex flex-wrap gap-4 pb-4">
          {Array.from(prompts.values()).map((prompt) => (
            <PromptCard
              key={prompt.promptId}
              id={prompt.promptId}
              prompt={prompt}
              isFiltered={filteredPrompts.has(prompt.text)}
              onChange={onPromptChange}
              onRemove={onPromptRemove}
            />
          ))}

          <Button
            variant="outline"
            size="lg"
            className="h-[180px] w-[160px] border-dashed border-2 bg-black/20 hover:bg-black/40 transition-colors"
            onClick={handleAddPrompt}
          >
            <PlusCircle className="h-8 w-8 mr-2" />
            <span>Add Prompt</span>
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

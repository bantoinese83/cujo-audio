"use client"

import type React from "react"
import { createContext, useContext, useCallback, useRef, useState } from "react"
import type { Prompt, MusicGenerationConfig } from "@/lib/types"

interface MusicStateContextType {
  updatePrompt: (prompt: Prompt) => void
  updateConfig: (config: Partial<MusicGenerationConfig>) => void
  subscribeToPromptUpdates: (callback: (prompts: Map<string, Prompt>) => void) => () => void
  subscribeToConfigUpdates: (callback: (config: MusicGenerationConfig) => void) => () => void
}

const MusicStateContext = createContext<MusicStateContextType | null>(null)

export function MusicStateProvider({ children }: { children: React.ReactNode }) {
  const promptUpdateQueue = useRef<Map<string, Prompt>>(new Map())
  const configUpdateQueue = useRef<Partial<MusicGenerationConfig>>({})
  const promptSubscribers = useRef<Set<(prompts: Map<string, Prompt>) => void>>(new Set())
  const configSubscribers = useRef<Set<(config: MusicGenerationConfig) => void>>(new Set())
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [currentPrompts] = useState<Map<string, Prompt>>(new Map())
  const [currentConfig] = useState<MusicGenerationConfig>({
    temperature: 1.1,
    topK: 40,
    guidance: 4.0,
  })

  const flushUpdates = useCallback(() => {
    // Process prompt updates
    if (promptUpdateQueue.current.size > 0) {
      const updates = new Map(promptUpdateQueue.current)
      promptUpdateQueue.current.clear()

      // Merge with current prompts
      updates.forEach((prompt, id) => {
        currentPrompts.set(id, prompt)
      })

      // Notify subscribers
      promptSubscribers.current.forEach((callback) => {
        callback(new Map(currentPrompts))
      })
    }

    // Process config updates
    if (Object.keys(configUpdateQueue.current).length > 0) {
      const updates = { ...configUpdateQueue.current }
      configUpdateQueue.current = {}

      // Merge with current config
      Object.assign(currentConfig, updates)

      // Notify subscribers
      configSubscribers.current.forEach((callback) => {
        callback({ ...currentConfig })
      })
    }
  }, [currentPrompts, currentConfig])

  const scheduleUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      flushUpdates()
    }, 50)
  }, [flushUpdates])

  const updatePrompt = useCallback(
    (prompt: Prompt) => {
      promptUpdateQueue.current.set(prompt.promptId, prompt)
      scheduleUpdate()
    },
    [scheduleUpdate],
  )

  const updateConfig = useCallback(
    (config: Partial<MusicGenerationConfig>) => {
      Object.assign(configUpdateQueue.current, config)
      scheduleUpdate()
    },
    [scheduleUpdate],
  )

  const subscribeToPromptUpdates = useCallback((callback: (prompts: Map<string, Prompt>) => void) => {
    promptSubscribers.current.add(callback)
    return () => {
      promptSubscribers.current.delete(callback)
    }
  }, [])

  const subscribeToConfigUpdates = useCallback((callback: (config: MusicGenerationConfig) => void) => {
    configSubscribers.current.add(callback)
    return () => {
      configSubscribers.current.delete(callback)
    }
  }, [])

  const value: MusicStateContextType = {
    updatePrompt,
    updateConfig,
    subscribeToPromptUpdates,
    subscribeToConfigUpdates,
  }

  return <MusicStateContext.Provider value={value}>{children}</MusicStateContext.Provider>
}

export function useMusicState() {
  const context = useContext(MusicStateContext)
  if (!context) {
    throw new Error("useMusicState must be used within a MusicStateProvider")
  }
  return context
}

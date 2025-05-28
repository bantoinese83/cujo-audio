"use client"

import type React from "react"
import { createContext, useContext, useReducer, useRef, useCallback, useEffect } from "react"
import { type AppContextType, type AppState, ActionType } from "./types"
import { reducer, initialState } from "./reducer"
import type { Prompt, MusicGenerationConfig } from "@/types/music"
import { colors } from "@/lib/design-system"
import { useToast } from "@/hooks/use-toast"
import { MusicConfigBuilder } from "@/utils/config-builder"

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * Provider component for the application state
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { toast } = useToast()

  // Create a stable reference to the current state to avoid stale closures
  const stateRef = useRef<AppState>(state)

  // Update the ref whenever state changes
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Provide the context value
  const contextValue: AppContextType = {
    state,
    dispatch,
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

/**
 * Custom hook to use the app context
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

/**
 * Custom hook for prompt-related actions
 */
export function usePromptActions() {
  const { dispatch, state } = useAppContext()
  const { toast } = useToast()

  /**
   * Adds a new prompt
   */
  const addPrompt = useCallback(
    (text: string): string | null => {
      if (!text.trim()) {
        toast({
          title: "Empty prompt",
          description: "Please enter a prompt text",
          variant: "destructive",
        })
        return null
      }

      const promptId = `prompt-${Date.now()}`
      const colorOptions = Object.values(colors.accent)
      const usedColors = Array.from(state.prompts.values()).map((p) => p.color)
      const availableColors = colorOptions.filter((c) => !usedColors.includes(c))
      const randomColor =
        availableColors.length > 0 ? availableColors[0] : colorOptions[Math.floor(Math.random() * colorOptions.length)]

      const newPrompt: Prompt = {
        promptId,
        text: text.trim(),
        weight: 1.0,
        color: randomColor,
      }

      dispatch({ type: ActionType.ADD_PROMPT, payload: newPrompt })
      dispatch({ type: ActionType.SET_NEW_PROMPT_TEXT, payload: "" })

      toast({
        title: "Prompt added",
        description: `"${text}" has been added to your composition`,
      })

      return promptId
    },
    [dispatch, state.prompts, toast],
  )

  /**
   * Updates an existing prompt
   */
  const updatePrompt = useCallback(
    (prompt: Prompt): void => {
      dispatch({ type: ActionType.UPDATE_PROMPT, payload: prompt })
    },
    [dispatch],
  )

  /**
   * Removes a prompt
   */
  const removePrompt = useCallback(
    (promptId: string): void => {
      dispatch({ type: ActionType.REMOVE_PROMPT, payload: promptId })
    },
    [dispatch],
  )

  /**
   * Sets the new prompt text (UI state)
   */
  const setNewPromptText = useCallback(
    (text: string): void => {
      dispatch({ type: ActionType.SET_NEW_PROMPT_TEXT, payload: text })
    },
    [dispatch],
  )

  return {
    addPrompt,
    updatePrompt,
    removePrompt,
    setNewPromptText,
  }
}

/**
 * Custom hook for playback-related actions
 */
export function usePlaybackActions() {
  const { dispatch } = useAppContext()

  /**
   * Sets the playback state
   */
  const setPlaybackState = useCallback(
    (state: AppState["playbackState"]): void => {
      dispatch({ type: ActionType.SET_PLAYBACK_STATE, payload: state })
    },
    [dispatch],
  )

  return {
    setPlaybackState,
  }
}

/**
 * Custom hook for configuration-related actions
 */
export function useConfigActions() {
  const { dispatch } = useAppContext()

  /**
   * Updates the configuration
   */
  const updateConfig = useCallback(
    (config: Partial<MusicGenerationConfig>): void => {
      dispatch({ type: ActionType.UPDATE_CONFIG, payload: config })
    },
    [dispatch],
  )

  /**
   * Resets the configuration to defaults
   */
  const resetConfig = useCallback((): void => {
    const defaultConfig = MusicConfigBuilder.defaultConfig()
    dispatch({ type: ActionType.UPDATE_CONFIG, payload: defaultConfig })
  }, [dispatch])

  return {
    updateConfig,
    resetConfig,
  }
}

/**
 * Custom hook for UI-related actions
 */
export function useUIActions() {
  const { dispatch } = useAppContext()

  /**
   * Sets the initializing state
   */
  const setInitializing = useCallback(
    (isInitializing: boolean): void => {
      dispatch({ type: ActionType.SET_INITIALIZING, payload: isInitializing })
    },
    [dispatch],
  )

  /**
   * Sets the current step
   */
  const setCurrentStep = useCallback(
    (step: number): void => {
      dispatch({ type: ActionType.SET_CURRENT_STEP, payload: step })
    },
    [dispatch],
  )

  /**
   * Sets the show tip state
   */
  const setShowTip = useCallback(
    (show: boolean): void => {
      dispatch({ type: ActionType.SET_SHOW_TIP, payload: show })
    },
    [dispatch],
  )

  return {
    setInitializing,
    setCurrentStep,
    setShowTip,
  }
}

/**
 * Custom hook for connection-related actions
 */
export function useConnectionActions() {
  const { dispatch } = useAppContext()

  /**
   * Sets the connection state
   */
  const setConnectionState = useCallback(
    (isConnected: boolean): void => {
      dispatch({ type: ActionType.SET_CONNECTION_STATE, payload: isConnected })
    },
    [dispatch],
  )

  /**
   * Sets the error state
   */
  const setError = useCallback(
    (error: string | null): void => {
      dispatch({ type: ActionType.SET_ERROR, payload: error })
    },
    [dispatch],
  )

  /**
   * Adds a filtered prompt
   */
  const addFilteredPrompt = useCallback(
    (promptText: string): void => {
      dispatch({ type: ActionType.ADD_FILTERED_PROMPT, payload: promptText })
    },
    [dispatch],
  )

  return {
    setConnectionState,
    setError,
    addFilteredPrompt,
  }
}

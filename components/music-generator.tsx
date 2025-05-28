"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import PromptList from "./prompt-list"
import MusicControls from "./music-controls"
import SettingsPanel from "./settings-panel"
import { StateWrapper } from "./state-wrapper"
import { PromptCardSkeleton } from "./prompt-card-skeleton"
import { GenreSuggestions } from "./genre-suggestions"
import { ConnectionStatus } from "./connection-status"
import { PromptEnhancer } from "./prompt-enhancer"
import PromptBuilder from "@/components/prompt-builder"
import { animations } from "@/lib/design-system"
import { Sparkles, RefreshCw, Info, Lightbulb, X, Wand2, Music } from "lucide-react"
import { useAppContext, usePromptActions, useUIActions, useConfigActions } from "@/store/context"
import { useMusicSessionWithStore } from "@/hooks/use-music-session-with-store"
import type { SessionInitOptions } from "@/types/app-types"
import type { MusicGenerationConfig } from "@/types/music"
import { ToastMessage } from "@/components/toast-message"
import type { ToastMessageRef } from "@/components/toast-message"

/**
 * Main component for the music generation application
 * Manages UI state and coordinates between different components
 */
export default function MusicGenerator() {
  // Access global state and actions
  const { state } = useAppContext()
  const { addPrompt, updatePrompt, removePrompt, setNewPromptText } = usePromptActions()
  const { setShowTip, setCurrentStep, setInitializing } = useUIActions()
  const { updateConfig, resetConfig } = useConfigActions()
  const { toast } = useToast()

  // Local UI state
  const [showEnhancer, setShowEnhancer] = useState<boolean>(false)
  const [showPromptBuilder, setShowPromptBuilder] = useState<boolean>(false)
  const [showStemModal, setShowStemModal] = useState(false)
  const [stemLoading, setStemLoading] = useState(false)
  const [stemError, setStemError] = useState<string | null>(null)
  const [stems, setStems] = useState<{ vocals: string; accompaniment: string; vocalsFilename: string; accompanimentFilename: string } | null>(null)
  const audioBlobRef = useRef<Blob | null>(null)

  // Refs
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const toastRef = useRef<ToastMessageRef>(null)

  // Music session hooks
  const { initSession, updatePrompts, updateSettings, play, pause, stop, resetContext, audioContextRef, outputNodeRef } = useMusicSessionWithStore()

  // Initialize the app and set isInitializing to false after a short delay
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize the session with options
        const initOptions: SessionInitOptions = {
          mockOnFailure: true,
          timeout: 5000,
        }

        await initSession(initOptions)
      } catch (error) {
        console.error("Failed to initialize session:", error)
        toastRef.current?.show("Failed to initialize music session")
      } finally {
        // Always set initializing to false after attempting to initialize
        setTimeout(() => {
          setInitializing(false)
        }, 500)
      }
    }

    initializeApp()
  }, [initSession, setInitializing])

  // Update prompts in the session with debouncing
  useEffect(() => {
    if (state.isConnected && state.prompts.size > 0) {
      // Clear any existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }

      // Set a new timeout
      updateTimeoutRef.current = setTimeout(() => {
        updatePrompts(Array.from(state.prompts.values()))
      }, 300)
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [state.isConnected, state.prompts, updatePrompts])

  // Update step based on state
  useEffect(() => {
    if (state.prompts.size === 0) {
      setCurrentStep(1)
    } else if (state.playbackState === "stopped" || state.playbackState === "paused") {
      setCurrentStep(2)
    } else {
      setCurrentStep(3)
    }
  }, [state.prompts.size, state.playbackState, setCurrentStep])

  /**
   * Handles adding a new prompt
   */
  const handleAddPrompt = useCallback(() => {
    if (state.newPromptText.trim()) {
      addPrompt(state.newPromptText)
    }
  }, [addPrompt, state.newPromptText])

  /**
   * Handles play/pause toggle
   */
  const handlePlayPause = useCallback(() => {
    if (state.playbackState === "playing") {
      pause()
    } else {
      play()
    }
  }, [pause, play, state.playbackState])

  /**
   * Handles resetting the music generation
   */
  const handleReset = useCallback(async () => {
    await resetContext()
    resetConfig()
    toast({
      title: "Reset complete",
      description: "Music generation has been reset",
    })
  }, [resetConfig, resetContext, toast])

  /**
   * Handles retrying connection
   */
  const handleRetry = useCallback(async () => {
    try {
      setInitializing(true)

      const initOptions: SessionInitOptions = {
        forceRefresh: true,
        mockOnFailure: true,
      }

      await initSession(initOptions)

      toast({
        title: "Connection restored",
        description: "Successfully reconnected to the music service",
      })
    } catch (err) {
      toast({
        title: "Connection failed",
        description: "Failed to reconnect. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setInitializing(false)
    }
  }, [initSession, setInitializing, toast])

  /**
   * Handles settings changes
   */
  const handleSettingsChange = useCallback(
    (config: MusicGenerationConfig) => {
      updateConfig(config)
      updateSettings(config)
    },
    [updateConfig, updateSettings],
  )

  /**
   * Handles genre selection from suggestions
   */
  const handleGenreSelect = useCallback(
    (genre: string) => {
      setNewPromptText(genre)
    },
    [setNewPromptText],
  )

  /**
   * Handles enhanced prompt from AI
   */
  const handleEnhancedPrompt = useCallback(
    (enhancedPrompt: string) => {
      setNewPromptText(enhancedPrompt)
      toastRef.current?.show("Prompt enhanced with AI")
    },
    [setNewPromptText],
  )

  /**
   * Handles built prompt from prompt builder
   */
  const handleBuiltPrompt = useCallback(
    (builtPrompt: string) => {
      addPrompt(builtPrompt)
      setShowPromptBuilder(false)
    },
    [addPrompt],
  )

  /**
   * Toggles prompt builder visibility
   */
  const togglePromptBuilder = useCallback(() => {
    setShowPromptBuilder((prev) => !prev)
  }, [])

  // Generate background gradients based on active prompts
  const backgroundGradients = Array.from(state.prompts.values())
    .filter((p) => p.weight > 0)
    .map((prompt, index) => {
      const opacity = Math.min(prompt.weight * 0.3, 0.6)
      const x = (index % 3) * 33 + 16
      const y = Math.floor(index / 3) * 33 + 16
      return `radial-gradient(circle at ${x}% ${y}%, ${prompt.color}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")} 0%, transparent ${prompt.weight * 50}%)`
    })
    .join(", ")

  // Function to export audio (simulate for now)
  const handleExportAudio = async () => {
    // TODO: Replace with actual audio export logic from your app
    // For now, simulate with a dummy blob
    if (!outputNodeRef.current) {
      toast({ title: "No audio to export", description: "Generate music first." })
      return
    }
    // Simulate: create a blank WAV file (replace with real audio export)
    const dummyWav = new Uint8Array([82,73,70,70,36,0,0,0,87,65,86,69,102,109,116,32,16,0,0,0,1,0,1,0,68,172,0,0,68,172,0,0,2,0,16,0,100,97,116,97,0,0,0,0])
    const blob = new Blob([dummyWav], { type: "audio/wav" })
    audioBlobRef.current = blob
    setShowStemModal(true)
  }

  // Function to upload audio and get stems
  const handleUploadForStems = async () => {
    if (!audioBlobRef.current) return
    setStemLoading(true)
    setStemError(null)
    setStems(null)
    try {
      const formData = new FormData()
      formData.append("file", audioBlobRef.current, "music.wav")
      const res = await fetch("/api/separate-stems", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Stem separation failed")
      const data = await res.json()
      setStems(data)
    } catch (err: any) {
      setStemError(err.message || "Unknown error")
    } finally {
      setStemLoading(false)
    }
  }

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Content */}
      <motion.div
        className="relative overflow-hidden rounded-3xl border border-gray-800 bg-black/50 backdrop-blur-xl"
        style={{
          background: backgroundGradients || "transparent",
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: animations.easings.easeOut }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="relative z-10 flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <motion.h2
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Music Studio
            </motion.h2>

            <ConnectionStatus isConnected={state.isConnected} isLoading={state.isInitializing} onRetry={handleRetry} />
          </div>

          <motion.div
            className="flex flex-col md:flex-row gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Enter a music prompt (e.g., 'Trap Soul', 'Lo-Fi Drill', 'Phonk')"
                  value={state.newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPrompt()}
                  className="flex-1 bg-gray-900/50 border-purple-700/50 focus:border-purple-500 transition-all duration-300 pr-20"
                  disabled={!state.isConnected || !!state.error}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20",
                      showPromptBuilder && "bg-purple-900/40 text-purple-300",
                    )}
                    onClick={togglePromptBuilder}
                    title="Prompt Builder"
                  >
                    <Music className="h-4 w-4" />
                  </Button>
                  {state.newPromptText.trim() && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                      onClick={() => setShowEnhancer(true)}
                      title="Enhance with AI"
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <GenreSuggestions onSelect={handleGenreSelect} />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleAddPrompt}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 h-10"
                disabled={!state.isConnected || !!state.error}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Add Prompt
              </Button>
            </motion.div>
          </motion.div>

          {/* Prompt Builder */}
          <AnimatePresence>
            {showPromptBuilder && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PromptBuilder onBuiltPrompt={handleBuiltPrompt} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tip box */}
          <AnimatePresence>
            {state.showTip && state.prompts.size === 0 && !state.isInitializing && (
              <motion.div
                className="mb-6 bg-purple-900/20 border border-purple-900/30 rounded-lg p-4 relative"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 rounded-full hover:bg-purple-900/50"
                  onClick={() => setShowTip(false)}
                >
                  <X className="h-3 w-3" />
                </Button>

                <div className="flex gap-3">
                  <div className="rounded-full bg-purple-900/50 p-2 h-fit">
                    <Lightbulb className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-purple-300 mb-1">Pro Tip</h3>
                    <p className="text-sm text-gray-300">
                      Try combining multiple prompts with different weights to create complex, layered compositions. For
                      example, add "Neo Soul Chords" and "Trap Drums" together. Use the prompt builder (
                      <Music className="inline h-3 w-3" />) to explore all available options!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Progress - Only show when generating music */}
          <AnimatePresence>
            {state.playbackState === "playing" && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.4 }}
              >
              </motion.div>
            )}
          </AnimatePresence>

          <StateWrapper
            isLoading={state.isInitializing}
            isEmpty={state.prompts.size === 0 && !state.isInitializing}
            error={state.error}
            loadingMessage="Initializing music studio..."
            emptyMessage="Add a prompt to start generating music"
            onRetry={handleRetry}
          >
            <AnimatePresence>
              {state.isInitializing ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-4">
                  {[...Array(3)].map((_, i) => (
                    <PromptCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <PromptList
                  prompts={Array.from(state.prompts.values())}
                  filteredPrompts={state.filteredPrompts}
                  onPromptUpdate={updatePrompt}
                  onPromptRemove={removePrompt}
                  onAddPrompt={() => document.querySelector("input")?.focus()}
                  playbackState={state.playbackState}
                  audioContext={audioContextRef.current}
                  sourceNode={outputNodeRef.current}
                />
              )}
            </AnimatePresence>
          </StateWrapper>
        </div>
      </motion.div>

      {/* Controls Section */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="md:col-span-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <StateWrapper isLoading={state.isInitializing} error={null} loadingMessage="Loading settings...">
            <SettingsPanel
              onSettingsChange={handleSettingsChange}
              disabled={!state.isConnected || !!state.error}
              config={state.config}
            />
          </StateWrapper>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <StateWrapper isLoading={state.isInitializing} error={null} loadingMessage="Loading controls...">
            <MusicControls
              playbackState={state.playbackState}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
              disabled={!state.isConnected || !!state.error || state.prompts.size === 0}
            />
          </StateWrapper>
        </motion.div>
      </motion.div>

      {/* Stem Separation Section */}
      <div className="mt-6 flex flex-col items-center">
        <Button onClick={handleExportAudio} className="bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700 mb-2">
          Export & Separate Stems
        </Button>
        {showStemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setShowStemModal(false)}>
                <X className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-bold mb-2 text-white">Stem Separation</h3>
              <p className="text-gray-400 text-sm mb-4">Upload your generated music to separate vocals and accompaniment using Spleeter.</p>
              <Button onClick={handleUploadForStems} disabled={stemLoading} className="w-full mb-4">
                {stemLoading ? "Separating..." : "Upload & Separate"}
              </Button>
              {stemError && <div className="text-red-400 text-sm mb-2">{stemError}</div>}
              {stems && (
                <div className="space-y-2 mt-2">
                  <a
                    href={`data:audio/wav;base64,${stems.vocals}`}
                    download={stems.vocalsFilename}
                    className="block text-blue-400 underline"
                  >
                    Download Vocals
                  </a>
                  <a
                    href={`data:audio/wav;base64,${stems.accompaniment}`}
                    download={stems.accompanimentFilename}
                    className="block text-blue-400 underline"
                  >
                    Download Accompaniment
                  </a>
                  <audio controls className="mt-2 w-full">
                    <source src={`data:audio/wav;base64,${stems.vocals}`} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                  <audio controls className="mt-2 w-full">
                    <source src={`data:audio/wav;base64,${stems.accompaniment}`} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info box */}
      <motion.div
        className="mt-4 bg-gray-900/30 border border-gray-800 rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex gap-3">
          <div className="rounded-full bg-gray-800 p-2 h-fit">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">About Cujo Audio</h3>
            <p className="text-sm text-gray-400">
              Cujo Audio uses Gemini AI to generate music in real-time based on your text prompts. The music is streamed
              directly to your browser and is not stored on our servers. Experiment with different prompts, settings,
              and combinations to create your perfect sound.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Connection Error Indicator */}
      <AnimatePresence>
        {!state.isConnected && !state.isInitializing && !state.error && (
          <motion.div
            className="fixed bottom-4 right-4 bg-red-900/80 backdrop-blur-md p-4 rounded-lg shadow-lg flex items-center gap-3"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="text-white">
              <p className="font-medium">Connection lost</p>
              <p className="text-sm text-red-200">Music generation service is disconnected</p>
            </div>
            <Button size="sm" variant="outline" className="border-red-400 text-white" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reconnect
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Prompt Enhancer Modal */}
      <AnimatePresence>
        {showEnhancer && (
          <PromptEnhancer
            initialPrompt={state.newPromptText}
            onEnhancedPrompt={handleEnhancedPrompt}
            onClose={() => setShowEnhancer(false)}
          />
        )}
      </AnimatePresence>
      <ToastMessage ref={toastRef} />
    </motion.div>
  )
}

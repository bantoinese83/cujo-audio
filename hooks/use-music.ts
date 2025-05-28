"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { GoogleGenAI } from "@google/genai"
import type { Prompt, PlaybackState, MusicGenerationConfig, LiveMusicServerMessage } from "@/types/music"
import { decode, decodeAudioData } from "@/lib/audio-utils"

export function useMusic(initialPrompts: Map<string, Prompt>) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>("stopped")
  const [filteredPrompts, setFilteredPrompts] = useState<Set<string>>(new Set())
  const [config, setConfig] = useState<MusicGenerationConfig>({
    temperature: 1.1,
    topK: 40,
    guidance: 4.0,
  })
  const [isConnected, setIsConnected] = useState(false)

  const { toast } = useToast()
  const sessionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const outputNodeRef = useRef<GainNode | null>(null)
  const nextStartTimeRef = useRef<number>(0)
  const bufferTimeRef = useRef<number>(2) // Buffer time in seconds
  const connectionErrorRef = useRef<boolean>(false)
  const genAIRef = useRef<any>(null)

  // Initialize audio context and session
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000,
      })

      outputNodeRef.current = audioContextRef.current.createGain()
      outputNodeRef.current.connect(audioContextRef.current.destination)

      // Initialize session
      initSession()
    }

    return () => {
      if (sessionRef.current) {
        sessionRef.current.stop().catch(console.error)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error)
      }
    }
  }, [])

  // Initialize session with Gemini API
  const initSession = useCallback(async () => {
    if (sessionRef.current) return

    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined. Please add it to your environment variables.")
      }

      // Initialize Gemini AI
      if (!genAIRef.current) {
        genAIRef.current = new GoogleGenAI({
          apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
          apiVersion: "v1alpha",
        })
      }

      // Connect to the music generation session
      try {
        sessionRef.current = await genAIRef.current.live.music.connect({
          model: "models/lyria-realtime-exp",
          callbacks: {
            onMessage: handleAudioMessage,
            onError: handleError,
            onClose: handleClose,
          },
        })
        setIsConnected(true)
        toast({
          title: "Connected to music generation service",
          description: "You can now start generating music",
        })
      } catch (err) {
        console.error("Failed to connect to music session:", err)
        // Fall back to mock implementation if connection fails
        createMockSession()
      }
    } catch (error) {
      console.error("Failed to initialize session:", error)
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Failed to connect to music generation service",
      })
      setIsConnected(false)

      // Create a mock session for development/testing
      createMockSession()
    }
  }, [toast])

  // Create a mock session for development/testing
  const createMockSession = () => {
    sessionRef.current = {
      setWeightedPrompts: async ({ weightedPrompts }) => {
        console.log("Setting weighted prompts:", weightedPrompts)
        return Promise.resolve()
      },
      setMusicGenerationConfig: async ({ musicGenerationConfig }) => {
        console.log("Setting music generation config:", musicGenerationConfig)
        return Promise.resolve()
      },
      play: async () => {
        console.log("Playing music")
        setPlaybackState("loading")
        setTimeout(() => setPlaybackState("playing"), 1000)
        return Promise.resolve()
      },
      pause: async () => {
        console.log("Pausing music")
        setPlaybackState("paused")
        return Promise.resolve()
      },
      stop: async () => {
        console.log("Stopping music")
        setPlaybackState("stopped")
        return Promise.resolve()
      },
      resetContext: async () => {
        console.log("Resetting context")
        return Promise.resolve()
      },
    }

    setIsConnected(true)
    toast({
      title: "Connected to music generation service (Mock)",
      description: "You can now start generating music",
    })
  }

  // Handle audio messages from the API
  const handleAudioMessage = useCallback(
    async (message: LiveMusicServerMessage) => {
      console.log("Received message from server:", message)

      if (message.setupComplete) {
        connectionErrorRef.current = false
        setIsConnected(true)
      }

      if (message.filteredPrompt) {
        setFilteredPrompts((prev) => new Set([...prev, message.filteredPrompt!.text]))
        toast({
          variant: "destructive",
          title: "Prompt filtered",
          description: `Prompt filtered: ${message.filteredPrompt.filteredReason}`,
        })
      }

      if (message.serverContent?.audioChunks !== undefined && audioContextRef.current && outputNodeRef.current) {
        // Skip processing if paused or stopped
        if (playbackState === "paused" || playbackState === "stopped") return

        try {
          // Decode the audio data
          const audioData = decode(message.serverContent.audioChunks[0].data)
          const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 48000, 2)

          // Create and connect audio source
          const source = audioContextRef.current.createBufferSource()
          source.buffer = audioBuffer
          source.connect(outputNodeRef.current)

          // Schedule playback
          if (nextStartTimeRef.current === 0) {
            nextStartTimeRef.current = audioContextRef.current.currentTime + bufferTimeRef.current
            setTimeout(() => {
              setPlaybackState("playing")
            }, bufferTimeRef.current * 1000)
          }

          // Check for underrun
          if (nextStartTimeRef.current < audioContextRef.current.currentTime) {
            console.log("Audio underrun detected")
            setPlaybackState("loading")
            nextStartTimeRef.current = 0
            return
          }

          // Start the audio
          source.start(nextStartTimeRef.current)
          nextStartTimeRef.current += audioBuffer.duration
        } catch (err) {
          console.error("Error processing audio:", err)
          toast({
            variant: "destructive",
            title: "Audio error",
            description: "Failed to process audio data",
          })
        }
      }
    },
    [playbackState, toast],
  )

  // Handle errors from the API
  const handleError = useCallback(
    (error: Error) => {
      console.error("Music session error:", error)
      connectionErrorRef.current = true
      setIsConnected(false)
      setPlaybackState("stopped")
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Please restart audio",
      })
    },
    [toast],
  )

  // Handle connection close
  const handleClose = useCallback(() => {
    console.log("Music session closed")
    connectionErrorRef.current = true
    setIsConnected(false)
    setPlaybackState("stopped")
    toast({
      variant: "destructive",
      title: "Connection closed",
      description: "Please restart audio",
    })
  }, [toast])

  // Update prompts in the session
  const updatePrompts = useCallback(
    async (prompts: Map<string, Prompt>) => {
      if (!sessionRef.current) {
        await initSession()
        return
      }

      try {
        const promptsToSend = Array.from(prompts.values())
          .filter((p) => !filteredPrompts.has(p.text) && p.weight > 0)
          .map((p) => ({ text: p.text, weight: p.weight }))

        await sessionRef.current.setWeightedPrompts({
          weightedPrompts: promptsToSend,
        })
      } catch (error) {
        console.error("Failed to update prompts:", error)
        toast({
          variant: "destructive",
          title: "Failed to update prompts",
          description: "An error occurred while updating prompts",
        })
      }
    },
    [filteredPrompts, initSession, toast],
  )

  // Update settings in the session
  const updateSettings = useCallback(
    async (newConfig: MusicGenerationConfig) => {
      if (!sessionRef.current) {
        await initSession()
        return
      }

      try {
        setConfig((prev) => ({ ...prev, ...newConfig }))
        await sessionRef.current.setMusicGenerationConfig({
          musicGenerationConfig: newConfig,
        })
      } catch (error) {
        console.error("Failed to update settings:", error)
        toast({
          variant: "destructive",
          title: "Failed to update settings",
          description: "An error occurred while updating settings",
        })
      }
    },
    [initSession, toast],
  )

  // Play audio
  const play = useCallback(async () => {
    if (!sessionRef.current) {
      await initSession()
      return
    }

    try {
      if (audioContextRef.current) {
        await audioContextRef.current.resume()
      }

      await sessionRef.current.play()
      setPlaybackState("loading")

      if (audioContextRef.current && outputNodeRef.current) {
        outputNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime)
        outputNodeRef.current.gain.linearRampToValueAtTime(1, audioContextRef.current.currentTime + 0.1)
      }
    } catch (error) {
      console.error("Failed to play:", error)
      toast({
        variant: "destructive",
        title: "Playback failed",
        description: "Failed to start music playback",
      })
    }
  }, [initSession, toast])

  // Pause audio
  const pause = useCallback(async () => {
    if (!sessionRef.current || !audioContextRef.current || !outputNodeRef.current) return

    try {
      await sessionRef.current.pause()
      setPlaybackState("paused")

      // Fade out audio
      outputNodeRef.current.gain.setValueAtTime(1, audioContextRef.current.currentTime)
      outputNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.1)

      // Reset audio nodes
      nextStartTimeRef.current = 0
      outputNodeRef.current = audioContextRef.current.createGain()
      outputNodeRef.current.connect(audioContextRef.current.destination)
    } catch (error) {
      console.error("Failed to pause:", error)
      toast({
        variant: "destructive",
        title: "Pause failed",
        description: "Failed to pause music playback",
      })
    }
  }, [toast])

  // Stop audio
  const stop = useCallback(async () => {
    if (!sessionRef.current || !audioContextRef.current || !outputNodeRef.current) return

    try {
      await sessionRef.current.stop()
      setPlaybackState("stopped")

      // Reset audio
      outputNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      nextStartTimeRef.current = 0
    } catch (error) {
      console.error("Failed to stop:", error)
      toast({
        variant: "destructive",
        title: "Stop failed",
        description: "Failed to stop music playback",
      })
    }
  }, [toast])

  // Reset audio context
  const reset = useCallback(async () => {
    try {
      if (playbackState === "playing") {
        await pause()
      }

      if (sessionRef.current) {
        await sessionRef.current.resetContext()
      }

      await updateSettings({
        temperature: 1.1,
        topK: 40,
        guidance: 4.0,
      })

      toast({
        title: "Reset complete",
        description: "Music generation has been reset",
      })
    } catch (error) {
      console.error("Failed to reset:", error)
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: "Failed to reset music generation",
      })
    }
  }, [pause, playbackState, toast, updateSettings])

  return {
    playbackState,
    filteredPrompts,
    config,
    isConnected,
    play,
    pause,
    stop,
    reset,
    updatePrompts,
    updateSettings,
  }
}

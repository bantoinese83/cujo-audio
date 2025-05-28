"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { GoogleGenAI } from "@google/genai"
import type { Prompt, PlaybackState, MusicGenerationConfig } from "@/lib/types"
import { decode, decodeAudioData } from "@/lib/audio-utils"

interface UseMusicSessionProps {
  onPlaybackStateChange: (state: PlaybackState) => void
  onError: (message: string) => void
}

interface LiveMusicServerMessage {
  setupComplete?: boolean
  filteredPrompt?: {
    text: string
    filteredReason: string
  }
  serverContent?: {
    audioChunks?: Array<{
      data: string
    }>
  }
}

export function useMusicSession({ onPlaybackStateChange, onError }: UseMusicSessionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filteredPrompts, setFilteredPrompts] = useState<Set<string>>(new Set())
  const [playbackState, setPlaybackState] = useState<PlaybackState>("stopped")

  const sessionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const outputNodeRef = useRef<GainNode | null>(null)
  const nextStartTimeRef = useRef<number>(0)
  const bufferTimeRef = useRef<number>(2) // Buffer time in seconds
  const connectionErrorRef = useRef<boolean>(false)
  const genAIRef = useRef<any>(null)

  const initSession = useCallback(async () => {
    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined. Please add it to your environment variables.")
      }

      // Initialize audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 48000,
        })

        outputNodeRef.current = audioContextRef.current.createGain()
        outputNodeRef.current.connect(audioContextRef.current.destination)
      }

      // Initialize Gemini AI
      if (!genAIRef.current) {
        genAIRef.current = new GoogleGenAI({
          apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
          apiVersion: "v1alpha",
        })
      }

      // Connect to the music generation session
      if (!sessionRef.current) {
        try {
          sessionRef.current = await genAIRef.current.live.music.connect({
            model: "models/lyria-realtime-exp",
            callbacks: {
              onmessage: handleAudioMessage,
              onerror: handleError,
              onclose: handleClose,
            },
          })
          setIsConnected(true)
          onPlaybackStateChange("stopped")
        } catch (err) {
          console.error("Failed to connect to music session:", err)
          // Fall back to mock implementation if connection fails
          createMockSession()
        }
      }

      return true
    } catch (err) {
      console.error("Failed to initialize session:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize music session"
      setError(errorMessage)
      onError(errorMessage)
      setIsConnected(false)

      // Create a mock session for development/testing
      createMockSession()

      return false
    }
  }, [onError, onPlaybackStateChange])

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
        onPlaybackStateChange("loading")
        setTimeout(() => onPlaybackStateChange("playing"), 1000)
        return Promise.resolve()
      },
      pause: async () => {
        console.log("Pausing music")
        onPlaybackStateChange("paused")
        return Promise.resolve()
      },
      stop: async () => {
        console.log("Stopping music")
        onPlaybackStateChange("stopped")
        return Promise.resolve()
      },
      resetContext: async () => {
        console.log("Resetting context")
        return Promise.resolve()
      },
    }

    setIsConnected(true)
    onPlaybackStateChange("stopped")
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
        onError(`Prompt filtered: ${message.filteredPrompt.filteredReason}`)
      }

      if (message.serverContent?.audioChunks !== undefined && audioContextRef.current && outputNodeRef.current) {
        // Only play if not paused/stopped
        if (playbackState === "paused" || playbackState === "stopped") return
        try {
          // Decode the audio data
          const audioData = decode(message.serverContent.audioChunks[0].data)
          const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 48000, 2)

          // Create and connect audio source
          const source = audioContextRef.current.createBufferSource()
          source.buffer = audioBuffer
          source.connect(outputNodeRef.current)

          // Schedule playback with buffer time to prevent underruns
          if (nextStartTimeRef.current === 0) {
            nextStartTimeRef.current = audioContextRef.current.currentTime + bufferTimeRef.current
            setTimeout(() => {
              onPlaybackStateChange("playing")
            }, bufferTimeRef.current * 1000)
          }

          // Check for underrun - if we're behind schedule, reset and buffer again
          if (nextStartTimeRef.current < audioContextRef.current.currentTime) {
            console.log("Audio underrun detected - resetting buffer")
            onPlaybackStateChange("loading")
            nextStartTimeRef.current = audioContextRef.current.currentTime + bufferTimeRef.current
            setTimeout(() => {
              onPlaybackStateChange("playing")
            }, bufferTimeRef.current * 1000)
          }

          // Start the audio at the scheduled time
          source.start(nextStartTimeRef.current)
          nextStartTimeRef.current += audioBuffer.duration
        } catch (err) {
          console.error("Error processing audio:", err)
          onError("Failed to process audio data")
        }
      }
    },
    [onError, onPlaybackStateChange, playbackState],
  )

  // Handle errors from the API
  const handleError = useCallback(
    (error: Error) => {
      console.error("Music session error:", error)
      connectionErrorRef.current = true
      setIsConnected(false)
      onPlaybackStateChange("stopped")
      onError("Connection error, please restart audio.")
    },
    [onError, onPlaybackStateChange],
  )

  // Handle connection close
  const handleClose = useCallback(() => {
    console.log("Music session closed")
    connectionErrorRef.current = true
    setIsConnected(false)
    onPlaybackStateChange("stopped")
    onError("Connection closed, please restart audio.")
  }, [onError, onPlaybackStateChange])

  // Update prompts in the session
  const updatePrompts = useCallback(
    async (prompts: Prompt[]) => {
      if (!sessionRef.current || !isConnected) return

      try {
        const promptsToSend = prompts
          .filter((p) => p.weight > 0 && !filteredPrompts.has(p.text))
          .map((p) => ({ text: p.text, weight: p.weight }))

        await sessionRef.current.setWeightedPrompts({
          weightedPrompts: promptsToSend,
        })
      } catch (err) {
        console.error("Failed to update prompts:", err)
        onError("Failed to update prompts")
      }
    },
    [isConnected, filteredPrompts, onError],
  )

  // Play audio
  const play = useCallback(async () => {
    if (!sessionRef.current || !audioContextRef.current || !outputNodeRef.current) {
      await initSession()
      return
    }

    try {
      await audioContextRef.current.resume()
      await sessionRef.current.play()
      onPlaybackStateChange("loading")

      outputNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      outputNodeRef.current.gain.linearRampToValueAtTime(1, audioContextRef.current.currentTime + 0.1)
    } catch (err) {
      console.error("Failed to play:", err)
      onError("Failed to start playback")
    }
  }, [initSession, onPlaybackStateChange, onError])

  // Pause audio
  const pause = useCallback(async () => {
    if (!sessionRef.current || !audioContextRef.current || !outputNodeRef.current) return

    try {
      await sessionRef.current.pause()
      onPlaybackStateChange("paused")

      // Fade out audio
      outputNodeRef.current.gain.setValueAtTime(1, audioContextRef.current.currentTime)
      outputNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.1)

      // Reset for next playback
      nextStartTimeRef.current = 0
      outputNodeRef.current = audioContextRef.current.createGain()
      outputNodeRef.current.connect(audioContextRef.current.destination)
    } catch (err) {
      console.error("Failed to pause:", err)
      onError("Failed to pause playback")
    }
  }, [onPlaybackStateChange, onError])

  // Stop audio
  const stop = useCallback(async () => {
    if (!sessionRef.current || !audioContextRef.current || !outputNodeRef.current) return

    try {
      await sessionRef.current.stop()
      onPlaybackStateChange("stopped")

      // Fade out and reset
      outputNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      outputNodeRef.current.gain.linearRampToValueAtTime(1, audioContextRef.current.currentTime + 0.1)
      nextStartTimeRef.current = 0
    } catch (err) {
      console.error("Failed to stop:", err)
      onError("Failed to stop playback")
    }
  }, [onPlaybackStateChange, onError])

  // Reset context
  const resetContext = useCallback(async () => {
    if (!sessionRef.current) return

    try {
      await sessionRef.current.resetContext()
    } catch (err) {
      console.error("Failed to reset context:", err)
      onError("Failed to reset context")
    }
  }, [onError])

  // Update settings
  const updateSettings = useCallback(
    async (config: MusicGenerationConfig) => {
      if (!sessionRef.current || !isConnected) return

      try {
        await sessionRef.current.setMusicGenerationConfig({
          musicGenerationConfig: config,
        })
      } catch (err) {
        console.error("Failed to update settings:", err)
        onError("Failed to update settings")
      }
    },
    [isConnected, onError],
  )

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current && sessionRef.current.stop) {
        const stopPromise = sessionRef.current.stop()
        if (stopPromise && typeof stopPromise.catch === "function") {
          stopPromise.catch(console.error)
        }
      }
      if (audioContextRef.current && audioContextRef.current.close) {
        const closePromise = audioContextRef.current.close()
        if (closePromise && typeof closePromise.catch === "function") {
          closePromise.catch(console.error)
        }
      }
    }
  }, [])

  // Initialize session on mount only once
  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (mounted && !sessionRef.current) {
        await initSession()
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, []) // Empty dependency array to run only once

  return {
    initSession,
    updatePrompts,
    updateSettings,
    play,
    pause,
    stop,
    resetContext,
    isConnected,
    error,
    filteredPrompts,
  }
}

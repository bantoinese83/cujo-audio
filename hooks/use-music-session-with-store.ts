"use client"

import { useCallback, useEffect, useRef } from "react"
import { GoogleGenAI } from "@google/genai"
import type { Prompt, MusicGenerationConfig } from "@/types/music"
import type {
  LiveMusicServerMessage,
  MusicSession,
  MusicSessionCallbacks,
  SessionInitOptions,
  AudioProcessingOptions,
} from "@/types/app-types"
import { decode, decodeAudioData } from "@/lib/audio-utils"
import { useAppContext, usePlaybackActions, useConnectionActions } from "@/store/context"
import { useToast } from "@/hooks/use-toast"

/**
 * Hook for managing music session with the application store
 * Handles initialization, audio processing, and communication with the Gemini API
 */
export function useMusicSessionWithStore(onAudioSizeUpdate?: (sizeBytes: number) => void) {
  const { state } = useAppContext()
  const { setPlaybackState } = usePlaybackActions()
  const { setConnectionState, setError, addFilteredPrompt } = useConnectionActions()
  const { toast } = useToast()

  // Refs for maintaining state across renders without triggering re-renders
  const sessionRef = useRef<MusicSession | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const outputNodeRef = useRef<GainNode | null>(null)
  const nextStartTimeRef = useRef<number>(0)
  const bufferTimeRef = useRef<number>(2) // Buffer time in seconds
  const genAIRef = useRef<GoogleGenAI | null>(null)
  const initializingRef = useRef<boolean>(false)

  // Ref to always have the latest playback state (prevents stale closure bugs)
  const playbackStateRef = useRef(state.playbackState)

  // Add refs for recording
  const mediaStreamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const audioBlobRef = useRef<Blob | null>(null)

  // Start recording when playback starts
  const startRecording = useCallback(() => {
    if (!mediaStreamDestRef.current) {
      return
    }
    recordedChunksRef.current = []
    try {
      mediaRecorderRef.current = new MediaRecorder(mediaStreamDestRef.current.stream)
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
          if (onAudioSizeUpdate) {
            // Sum all chunk sizes
            const totalBytes = recordedChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
            onAudioSizeUpdate(totalBytes)
          }
        }
      }
      mediaRecorderRef.current.onstart = () => {
        console.log('[AUDIO] MediaRecorder started')
      }
      mediaRecorderRef.current.onstop = () => {
        console.log('[AUDIO] MediaRecorder stopped')
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/wav' })
        audioBlobRef.current = blob
        console.log('[AUDIO] audioBlobRef.current updated:', audioBlobRef.current)
      }
      mediaRecorderRef.current.start()
      console.log('[AUDIO] startRecording called, MediaRecorder started')
    } catch (err) {
      console.error('[AUDIO] Failed to start MediaRecorder', err)
    }
  }, [onAudioSizeUpdate])

  // Stop recording when playback stops
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      console.log('[AUDIO] stopRecording called, MediaRecorder stopped')
    }
  }, [])

  // Patch setPlaybackState to log all state changes and update the ref
  const setPlaybackStateWithLog = useCallback((newState: any) => {
    console.log("[AUDIO] setPlaybackState called with:", newState)
    playbackStateRef.current = newState
    setPlaybackState(newState)
  }, [setPlaybackState])

  // Keep playbackStateRef in sync with state.playbackState
  useEffect(() => {
    playbackStateRef.current = state.playbackState
  }, [state.playbackState])

  /**
   * Creates a mock session for development or when API connection fails
   */
  const createMockSession = useCallback((): MusicSession => {
    const mockSession: MusicSession = {
      setWeightedPrompts: async () => {
        console.log("Mock: Setting weighted prompts")
        return Promise.resolve()
      },
      setMusicGenerationConfig: async () => {
        console.log("Mock: Setting music generation config")
        return Promise.resolve()
      },
      play: async () => {
        console.log("Mock: Playing music")
        setPlaybackState("loading")
        setTimeout(() => setPlaybackState("playing"), 1000)
        return Promise.resolve()
      },
      pause: async () => {
        console.log("Mock: Pausing music")
        setPlaybackState("paused")
        return Promise.resolve()
      },
      stop: async () => {
        console.log("Mock: Stopping music")
        setPlaybackState("stopped")
        return Promise.resolve()
      },
      resetContext: async () => {
        console.log("Mock: Resetting context")
        return Promise.resolve()
      },
    }

    sessionRef.current = mockSession
    setConnectionState(true)
    setPlaybackState("stopped")

    toast({
      title: "Using mock session",
      description: "Connected to a simulated music generation service",
    })

    return mockSession
  }, [setConnectionState, setPlaybackState, toast])

  const createAndConnectGainNode = useCallback(() => {
    if (!audioContextRef.current) {
      return
    }
    outputNodeRef.current = audioContextRef.current.createGain()
    // Create MediaStreamDestination if not already
    if (!mediaStreamDestRef.current) {
      mediaStreamDestRef.current = audioContextRef.current.createMediaStreamDestination()
    }
    outputNodeRef.current.connect(audioContextRef.current.destination)
    outputNodeRef.current.connect(mediaStreamDestRef.current)
  }, [])

  /**
   * Handles audio messages from the API
   */
  const handleAudioMessage = useCallback(
    async (message: LiveMusicServerMessage) => {
      console.log("[AUDIO] handleAudioMessage called", message)
      console.log("[AUDIO] Current playbackState:", playbackStateRef.current)

      if (message.setupComplete) {
        setConnectionState(true)
        console.log("[AUDIO] Connection setup complete")
      }

      if (message.filteredPrompt) {
        addFilteredPrompt(message.filteredPrompt.text)
        toast({
          title: "Prompt filtered",
          description: `Prompt filtered: ${message.filteredPrompt.filteredReason}`,
          variant: "destructive",
        })
        console.log("[AUDIO] Prompt filtered:", message.filteredPrompt)
      }

      if (message.serverContent?.audioChunks !== undefined && audioContextRef.current && outputNodeRef.current) {
        // Only play if not paused/stopped (use ref to avoid stale closure)
        if (playbackStateRef.current === "paused" || playbackStateRef.current === "stopped") {
          console.log("[AUDIO] Skipping audio chunk: playback is paused or stopped")
          return
        }
        try {
          const audioData = decode(message.serverContent.audioChunks[0].data)
          console.log("[AUDIO] Decoded audioData length:", audioData.length)
          const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 48000, 2)
          console.log("[AUDIO] Decoded AudioBuffer duration:", audioBuffer.duration, "channels:", audioBuffer.numberOfChannels)

          // Create and connect audio source
          const source = audioContextRef.current.createBufferSource()
          source.buffer = audioBuffer
          source.connect(outputNodeRef.current)
          console.log("[AUDIO] Created BufferSource, scheduled for playback")

          // Schedule playback with buffer time to prevent underruns
          if (nextStartTimeRef.current === 0) {
            nextStartTimeRef.current = audioContextRef.current.currentTime + bufferTimeRef.current
            setTimeout(() => {
              setPlaybackStateWithLog("playing")
              console.log("[AUDIO] Playback state set to playing after buffer time")
            }, bufferTimeRef.current * 1000)
            console.log("[AUDIO] Initial buffer: nextStartTime set to", nextStartTimeRef.current)
          }

          // Check for underrun - if we're behind schedule, reset and buffer again
          if (nextStartTimeRef.current < audioContextRef.current.currentTime) {
            console.warn("[AUDIO] Audio underrun detected - resetting buffer")
            setPlaybackStateWithLog("loading")
            nextStartTimeRef.current = 0
            return
          }

          // Only start if nextStartTimeRef.current is set (enough buffer)
          if (nextStartTimeRef.current > 0) {
            source.start(nextStartTimeRef.current)
            console.log("[AUDIO] source.start at", nextStartTimeRef.current, "duration:", audioBuffer.duration)
            nextStartTimeRef.current += audioBuffer.duration
          }
        } catch (err) {
          console.error("[AUDIO] Error processing audio:", err)
          toast({
            title: "Audio error",
            description: "Failed to process audio data",
            variant: "destructive",
          })
        }
      } else {
        if (!audioContextRef.current) {
          console.warn("[AUDIO] No audioContextRef.current!")
        }
        if (!outputNodeRef.current) {
          console.warn("[AUDIO] No outputNodeRef.current!")
        }
        if (!message.serverContent?.audioChunks) {
          console.warn("[AUDIO] No audioChunks in message!")
        }
      }
    },
    [addFilteredPrompt, setConnectionState, setPlaybackStateWithLog, toast],
  )

  /**
   * Handles errors from the API
   */
  const handleError = useCallback(
    (error: Error) => {
      console.error("Music session error:", error)
      setConnectionState(false)
      setPlaybackState("stopped")
      toast({
        title: "Connection error",
        description: "Please restart audio",
        variant: "destructive",
      })
    },
    [setConnectionState, setPlaybackState, toast],
  )

  /**
   * Handles connection close
   */
  const handleClose = useCallback(() => {
    console.log("Music session closed")
    setConnectionState(false)
    setPlaybackState("stopped")
    toast({
      title: "Connection closed",
      description: "Please restart audio",
      variant: "destructive",
    })
  }, [setConnectionState, setPlaybackState, toast])

  /**
   * Initializes the audio context and output node
   */
  const initializeAudioContext = useCallback((options?: AudioProcessingOptions): boolean => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: options?.sampleRate || 48000,
        })

        outputNodeRef.current = audioContextRef.current.createGain()
        outputNodeRef.current.connect(audioContextRef.current.destination)

        // Set buffer time for smoother playback
        bufferTimeRef.current = options?.bufferTime || 2
      }
      return true
    } catch (err) {
      console.error("Failed to initialize audio context:", err)
      return false
    }
  }, [])

  /**
   * Initializes the session with the Gemini API
   */
  const initSession = useCallback(
    async (options?: SessionInitOptions): Promise<boolean> => {
      // Prevent multiple simultaneous initialization attempts
      if (initializingRef.current) {
        return false
      }

      initializingRef.current = true

      try {
        // Skip if already initialized and not forcing refresh
        if (sessionRef.current && !options?.forceRefresh) {
          initializingRef.current = false
          return true
        }

        // Check for API key
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
          console.warn("GEMINI_API_KEY is not defined. Using mock session.")
          createMockSession()
          initializingRef.current = false
          return true
        }

        // Initialize audio context
        const audioInitialized = initializeAudioContext()
        if (!audioInitialized) {
          throw new Error("Failed to initialize audio context")
        }

        // Initialize Gemini AI
        if (!genAIRef.current) {
          genAIRef.current = new GoogleGenAI({
            apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
            apiVersion: "v1alpha",
          })
        }

        // Set up callbacks
        const callbacks = {
          onmessage: handleAudioMessage,
          onerror: handleError,
          onclose: handleClose,
        }

        // Connect to the music generation session
        try {
          // Type-cast to any to suppress type errors due to SDK/local type mismatch
          sessionRef.current = await (genAIRef.current.live.music.connect({
            model: "models/lyria-realtime-exp",
            callbacks: callbacks as any,
          }) as any)

          setConnectionState(true)
          setPlaybackState("stopped")

          toast({
            title: "Connected",
            description: "Successfully connected to music generation service",
          })

          initializingRef.current = false
          return true
        } catch (err) {
          console.error("Failed to connect to music session:", err)

          // Fall back to mock implementation if connection fails and mockOnFailure is true
          if (options?.mockOnFailure !== false) {
            createMockSession()
            initializingRef.current = false
            return true
          }

          throw err
        }
      } catch (err) {
        console.error("Failed to initialize session:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize music session"
        setError(errorMessage)
        setConnectionState(false)

        // Create a mock session for development/testing if mockOnFailure is true
        if (options?.mockOnFailure !== false) {
          createMockSession()
          initializingRef.current = false
        }

        initializingRef.current = false
        return false
      }
    },
    [
      createMockSession,
      handleAudioMessage,
      handleClose,
      handleError,
      initializeAudioContext,
      setConnectionState,
      setError,
      setPlaybackState,
      toast,
    ],
  )

  /**
   * Updates prompts in the session
   */
  const updatePrompts = useCallback(
    async (prompts: Prompt[]): Promise<boolean> => {
      if (!sessionRef.current || !state.isConnected) {
        return false
      }

      try {
        const promptsToSend = prompts
          .filter((p) => p.weight > 0 && !state.filteredPrompts.has(p.text))
          .map((p) => ({ text: p.text, weight: p.weight }))

        await sessionRef.current.setWeightedPrompts({
          weightedPrompts: promptsToSend,
        })
        return true
      } catch (err) {
        console.error("Failed to update prompts:", err)
        toast({
          title: "Failed to update prompts",
          description: "An error occurred while updating prompts",
          variant: "destructive",
        })
        return false
      }
    },
    [state.isConnected, state.filteredPrompts, toast],
  )

  /**
   * Plays audio
   */
  const play = useCallback(async (): Promise<boolean> => {
    if (!sessionRef.current) {
      await initSession()
      return false
    }
    if (audioContextRef.current) {
      await audioContextRef.current.resume()
    }
    try {
      await sessionRef.current.play()
      setPlaybackStateWithLog('loading')
      if (audioContextRef.current && outputNodeRef.current) {
        outputNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime)
        outputNodeRef.current.gain.linearRampToValueAtTime(1, audioContextRef.current.currentTime + 0.1)
      }
      startRecording() // <-- Start recording
      return true
    } catch (error) {
      console.error('Failed to play:', error)
      toast({
        title: 'Playback failed',
        description: 'Failed to start music playback',
        variant: 'destructive',
      })
      return false
    }
  }, [initSession, setPlaybackStateWithLog, toast, startRecording])

  /**
   * Pauses audio
   */
  const pause = useCallback(async (): Promise<boolean> => {
    if (!sessionRef.current || !audioContextRef.current || !outputNodeRef.current) {
      return false
    }
    try {
      await sessionRef.current.pause()
      setPlaybackStateWithLog('paused')
      outputNodeRef.current.gain.setValueAtTime(1, audioContextRef.current.currentTime)
      outputNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.1)
      nextStartTimeRef.current = 0
      createAndConnectGainNode()
      stopRecording() // <-- Stop recording
      return true
    } catch (err) {
      console.error('Failed to pause:', err)
      toast({
        title: 'Pause failed',
        description: 'Failed to pause music playback',
        variant: 'destructive',
      })
      return false
    }
  }, [setPlaybackStateWithLog, toast, createAndConnectGainNode, stopRecording])

  /**
   * Stops audio
   */
  const stop = useCallback(async (): Promise<boolean> => {
    if (!sessionRef.current || !audioContextRef.current || !outputNodeRef.current) {
      return false
    }
    try {
      await sessionRef.current.stop()
      setPlaybackStateWithLog('stopped')
      outputNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      outputNodeRef.current.gain.linearRampToValueAtTime(1, audioContextRef.current.currentTime + 0.1)
      nextStartTimeRef.current = 0
      createAndConnectGainNode()
      stopRecording() // <-- Stop recording
      return true
    } catch (err) {
      console.error('Failed to stop:', err)
      toast({
        title: 'Stop failed',
        description: 'Failed to stop music playback',
        variant: 'destructive',
      })
      return false
    }
  }, [setPlaybackStateWithLog, toast, createAndConnectGainNode, stopRecording])

  /**
   * Resets context
   */
  const resetContext = useCallback(async (): Promise<boolean> => {
    if (!sessionRef.current) {
      return false
    }

    try {
      await sessionRef.current.resetContext()
      return true
    } catch (err) {
      console.error("Failed to reset context:", err)
      toast({
        title: "Reset failed",
        description: "Failed to reset context",
        variant: "destructive",
      })
      return false
    }
  }, [toast])

  /**
   * Updates settings
   */
  const updateSettings = useCallback(
    async (config: MusicGenerationConfig): Promise<boolean> => {
      if (!sessionRef.current || !state.isConnected) {
        return false
      }

      try {
        await sessionRef.current.setMusicGenerationConfig({
          musicGenerationConfig: config,
        })
        return true
      } catch (err) {
        console.error("Failed to update settings:", err)
        toast({
          title: "Failed to update settings",
          description: "An error occurred while updating settings",
          variant: "destructive",
        })
        return false
      }
    },
    [state.isConnected, toast],
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
    let initialized = false

    const init = async () => {
      if (mounted && !initialized && !sessionRef.current) {
        initialized = true
        await initSession({ mockOnFailure: true, timeout: 5000 })
      }
    }

    // Add a small delay to ensure all components are mounted
    const timer = setTimeout(() => {
      init()
    }, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, []) // Empty dependency array to run only once

  // Update step based on state
  useEffect(() => {
    // This effect updates the current step based on the state
    const promptCount = state.prompts.size

    if (promptCount === 0) {
      // Step 1: Add prompts
      setPlaybackState("stopped")
    } else if (state.playbackState === "playing") {
      // Step 3: Music is playing
    } else {
      // Step 2: Configure settings
    }
  }, [state.prompts.size, state.playbackState, setPlaybackState])

  // Add a helper to stop and wait for audioBlobRef to be set
  const stopAndWaitForAudio = useCallback(async (): Promise<Blob | null> => {
    // Clear previous blob so we don't get stale data
    audioBlobRef.current = null
    await stop()
    // Wait for audioBlobRef to be set by MediaRecorder.onstop
    return new Promise((resolve) => {
      let checks = 0
      const check = () => {
        // Resolve as soon as onstop fires, even if blob is empty
        if (audioBlobRef.current !== null) {
          resolve(audioBlobRef.current)
        } else if (checks++ < 20) {
          setTimeout(check, 100)
        } else {
          resolve(null)
        }
      }
      check()
    })
  }, [stop, audioBlobRef])

  return {
    initSession,
    updatePrompts,
    updateSettings,
    play,
    pause,
    stop,
    resetContext,
    audioContextRef,
    outputNodeRef,
    audioBlobRef,
    stopAndWaitForAudio,
  }
}

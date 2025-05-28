import type { MusicGenerationConfig, WeightedPrompt } from "@/types/music"
import { GoogleGenAI } from "@google/genai"

export interface MusicSession {
  setWeightedPrompts: (params: { weightedPrompts: WeightedPrompt[] }) => Promise<void>
  setMusicGenerationConfig: (params: { musicGenerationConfig: MusicGenerationConfig }) => Promise<void>
  play: () => Promise<void>
  pause: () => Promise<void>
  stop: () => Promise<void>
  resetContext: () => Promise<void>
}

export interface MusicSessionCallbacks {
  onMessage: (message: any) => void
  onError: (error: Error) => void
  onClose: () => void
}

/**
 * Creates a music generation session using the Gemini API.
 *
 * @param callbacks - Object containing callback functions for handling session events
 * @returns A Promise that resolves to a MusicSession object
 */
export async function createMusicSession(callbacks: MusicSessionCallbacks): Promise<MusicSession> {
  try {
    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (!apiKey) {
      console.warn("No Gemini API key found. Using mock session.")
      return createMockSession()
    }

    // Initialize the Gemini API client
    const ai = new GoogleGenAI({
      apiKey,
      apiVersion: "v1alpha",
    })

    // Create a music session with the Lyria RealTime model
    const session = await ai.live.music.connect({
      model: "models/lyria-realtime-exp",
      callbacks: {
        onmessage: callbacks.onMessage,
        onerror: (e: ErrorEvent) => {
          // Convert ErrorEvent to Error
          callbacks.onError(new Error(e.message))
        },
        onclose: callbacks.onClose,
      },
    })

    console.log("Successfully connected to Gemini music session")
    // Adapter to match the MusicSession interface
    return {
      setWeightedPrompts: session.setWeightedPrompts,
      setMusicGenerationConfig: async ({ musicGenerationConfig }) => {
        // Map scale and musicGenerationMode to undefined if they are strings (not valid enum values)
        const { scale, musicGenerationMode, ...rest } = musicGenerationConfig
        const mappedScale = typeof scale === 'string' ? undefined : scale
        const mappedMusicGenerationMode = typeof musicGenerationMode === 'string' ? undefined : musicGenerationMode
        await session.setMusicGenerationConfig({ musicGenerationConfig: { ...rest, scale: mappedScale, ...(mappedMusicGenerationMode !== undefined ? { musicGenerationMode: mappedMusicGenerationMode } : {}) } })
      },
      play: async () => { await session.play() },
      pause: async () => { await session.pause() },
      stop: async () => { await session.stop() },
      resetContext: async () => { await session.resetContext() },
    }
  } catch (error) {
    console.error("Failed to create Gemini music session:", error)
    const errMsg = error instanceof Error ? error.message : String(error)
    callbacks.onError(new Error(`Failed to initialize music session: ${errMsg}`))

    // Fall back to mock session if real connection fails
    return createMockSession()
  }
}

/**
 * Creates a mock music session for testing or when the API is unavailable.
 *
 * @returns A mock MusicSession object
 */
function createMockSession(): MusicSession {
  console.log("Using mock music session")
  return {
    setWeightedPrompts: async () => {
      console.log("Mock: setWeightedPrompts called")
    },
    setMusicGenerationConfig: async () => {
      console.log("Mock: setMusicGenerationConfig called")
    },
    play: async () => {
      console.log("Mock: play called")
    },
    pause: async () => {
      console.log("Mock: pause called")
    },
    stop: async () => {
      console.log("Mock: stop called")
    },
    resetContext: async () => {
      console.log("Mock: resetContext called")
    },
  }
}

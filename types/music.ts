export interface Prompt {
  promptId: string
  text: string
  weight: number
  color: string
}

export type PlaybackState = "stopped" | "playing" | "loading" | "paused"

export interface WeightedPrompt {
  text: string
  weight: number
}

export interface MusicGenerationConfig {
  temperature?: number
  topK?: number
  guidance?: number
  bpm?: number
  density?: number
  brightness?: number
  scale?: string
  seed?: number
  muteBass?: boolean
  muteDrums?: boolean
  onlyBassAndDrums?: boolean
  musicGenerationMode?: "QUALITY" | "DIVERSITY"
}

export interface LiveMusicGenerationConfig extends MusicGenerationConfig {
  // Additional fields specific to live music generation
}

export interface LiveMusicServerMessage {
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

export interface LiveMusicSession {
  setWeightedPrompts: (params: { weightedPrompts: WeightedPrompt[] }) => Promise<void>
  setMusicGenerationConfig: (params: { musicGenerationConfig: MusicGenerationConfig }) => Promise<void>
  play: () => Promise<void>
  pause: () => Promise<void>
  stop: () => Promise<void>
  resetContext: () => Promise<void>
}

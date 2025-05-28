import type React from "react"
import type { Prompt, PlaybackState, MusicGenerationConfig, WeightedPrompt } from "@/types/music"

// Session types
export interface MusicSessionConfig {
  model: string
  callbacks: MusicSessionCallbacks
}

export interface MusicSessionCallbacks {
  onMessage: (message: LiveMusicServerMessage) => void
  onError: (error: Error) => void
  onClose: () => void
}

export interface MusicSession {
  setWeightedPrompts: (params: { weightedPrompts: WeightedPrompt[] }) => Promise<void>
  setMusicGenerationConfig: (params: { musicGenerationConfig: MusicGenerationConfig }) => Promise<void>
  play: () => Promise<void>
  pause: () => Promise<void>
  stop: () => Promise<void>
  resetContext: () => Promise<void>
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

// UI Component Props
export interface MusicControlsProps {
  playbackState: PlaybackState
  onPlayPause: () => void
  onReset: () => void
  disabled?: boolean
}

export interface SettingsPanelProps {
  onSettingsChange: (config: MusicGenerationConfig) => void
  disabled?: boolean
  config: MusicGenerationConfig
}

export interface PromptBuilderProps {
  onBuiltPrompt: (prompt: string) => void
  className?: string
}

export interface PromptEnhancerProps {
  initialPrompt: string
  onEnhancedPrompt: (prompt: string) => void
  onClose: () => void
}

export interface ConnectionStatusProps {
  isConnected: boolean
  isLoading?: boolean
  onRetry?: () => void
}

export interface StateWrapperProps {
  isLoading?: boolean
  isEmpty?: boolean
  error?: string | null
  loadingMessage?: string
  emptyMessage?: string
  onRetry?: () => void
  children: React.ReactNode
}

export interface GenreSuggestionsProps {
  onSelect: (genre: string) => void
}

export interface PromptListProps {
  prompts: Prompt[]
  filteredPrompts?: Set<string>
  onPromptUpdate: (prompt: Prompt) => void
  onPromptRemove: (promptId: string) => void
  onAddPrompt?: () => void
  playbackState?: PlaybackState
}

// Builder patterns for complex configurations
export interface MusicGenerationConfigBuilder {
  withTemperature: (temperature: number) => MusicGenerationConfigBuilder
  withTopK: (topK: number) => MusicGenerationConfigBuilder
  withGuidance: (guidance: number) => MusicGenerationConfigBuilder
  withBpm: (bpm?: number) => MusicGenerationConfigBuilder
  withDensity: (density?: number) => MusicGenerationConfigBuilder
  withBrightness: (brightness?: number) => MusicGenerationConfigBuilder
  withScale: (scale?: string) => MusicGenerationConfigBuilder
  withSeed: (seed?: number) => MusicGenerationConfigBuilder
  withMuteBass: (muteBass?: boolean) => MusicGenerationConfigBuilder
  withMuteDrums: (muteDrums?: boolean) => MusicGenerationConfigBuilder
  withOnlyBassAndDrums: (onlyBassAndDrums?: boolean) => MusicGenerationConfigBuilder
  withMusicGenerationMode: (mode?: "QUALITY" | "DIVERSITY") => MusicGenerationConfigBuilder
  build: () => MusicGenerationConfig
}

// Audio processing types
export interface AudioProcessingOptions {
  sampleRate: number
  numChannels: number
  bufferTime?: number
}

// Session initialization options
export interface SessionInitOptions {
  forceRefresh?: boolean
  mockOnFailure?: boolean
  timeout?: number
}

import type React from "react"
import type { Prompt, PlaybackState, MusicGenerationConfig } from "@/types/music"

// Define all possible action types
export enum ActionType {
  // Business state actions
  ADD_PROMPT = "ADD_PROMPT",
  UPDATE_PROMPT = "UPDATE_PROMPT",
  REMOVE_PROMPT = "REMOVE_PROMPT",
  SET_PROMPTS = "SET_PROMPTS",
  SET_PLAYBACK_STATE = "SET_PLAYBACK_STATE",
  SET_CONNECTION_STATE = "SET_CONNECTION_STATE",
  SET_ERROR = "SET_ERROR",
  ADD_FILTERED_PROMPT = "ADD_FILTERED_PROMPT",
  CLEAR_FILTERED_PROMPTS = "CLEAR_FILTERED_PROMPTS",
  UPDATE_CONFIG = "UPDATE_CONFIG",
  RESET_CONFIG = "RESET_CONFIG",

  // UI state actions
  SET_INITIALIZING = "SET_INITIALIZING",
  SET_CURRENT_STEP = "SET_CURRENT_STEP",
  SET_SHOW_TIP = "SET_SHOW_TIP",
  SET_NEW_PROMPT_TEXT = "SET_NEW_PROMPT_TEXT",
}

// Define the shape of each action
export type Action =
  // Business state actions
  | { type: ActionType.ADD_PROMPT; payload: Prompt }
  | { type: ActionType.UPDATE_PROMPT; payload: Prompt }
  | { type: ActionType.REMOVE_PROMPT; payload: string }
  | { type: ActionType.SET_PROMPTS; payload: Map<string, Prompt> }
  | { type: ActionType.SET_PLAYBACK_STATE; payload: PlaybackState }
  | { type: ActionType.SET_CONNECTION_STATE; payload: boolean }
  | { type: ActionType.SET_ERROR; payload: string | null }
  | { type: ActionType.ADD_FILTERED_PROMPT; payload: string }
  | { type: ActionType.CLEAR_FILTERED_PROMPTS }
  | { type: ActionType.UPDATE_CONFIG; payload: Partial<MusicGenerationConfig> }
  | { type: ActionType.RESET_CONFIG }

  // UI state actions
  | { type: ActionType.SET_INITIALIZING; payload: boolean }
  | { type: ActionType.SET_CURRENT_STEP; payload: number }
  | { type: ActionType.SET_SHOW_TIP; payload: boolean }
  | { type: ActionType.SET_NEW_PROMPT_TEXT; payload: string }

// Define the business state
export interface BusinessState {
  prompts: Map<string, Prompt>
  playbackState: PlaybackState
  isConnected: boolean
  error: string | null
  filteredPrompts: Set<string>
  config: MusicGenerationConfig
}

// Define the UI state
export interface UIState {
  isInitializing: boolean
  currentStep: number
  showTip: boolean
  newPromptText: string
}

// Define the combined application state
export interface AppState extends BusinessState, UIState {}

// Define the context shape
export interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
}

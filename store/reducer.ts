import { type Action, ActionType, type AppState, type BusinessState, type UIState } from "./types"
import { MusicConfigBuilder } from "@/utils/config-builder"

// Default configuration
export const DEFAULT_CONFIG = MusicConfigBuilder.defaultConfig()

// Initial business state
const initialBusinessState: BusinessState = {
  prompts: new Map(),
  playbackState: "stopped",
  isConnected: false,
  error: null,
  filteredPrompts: new Set(),
  config: { ...DEFAULT_CONFIG },
}

// Initial UI state
const initialUIState: UIState = {
  isInitializing: true,
  currentStep: 1,
  showTip: true,
  newPromptText: "",
}

// Combined initial state
export const initialState: AppState = {
  ...initialBusinessState,
  ...initialUIState,
}

/**
 * Business state reducer - handles all business logic state changes
 */
function businessReducer(state: BusinessState, action: Action): BusinessState {
  switch (action.type) {
    case ActionType.ADD_PROMPT: {
      const newPrompts = new Map(state.prompts)
      newPrompts.set(action.payload.promptId, action.payload)
      return {
        ...state,
        prompts: newPrompts,
      }
    }

    case ActionType.UPDATE_PROMPT: {
      const newPrompts = new Map(state.prompts)
      newPrompts.set(action.payload.promptId, action.payload)
      return {
        ...state,
        prompts: newPrompts,
      }
    }

    case ActionType.REMOVE_PROMPT: {
      const newPrompts = new Map(state.prompts)
      newPrompts.delete(action.payload)
      return {
        ...state,
        prompts: newPrompts,
      }
    }

    case ActionType.SET_PROMPTS:
      return {
        ...state,
        prompts: action.payload,
      }

    case ActionType.SET_PLAYBACK_STATE:
      return {
        ...state,
        playbackState: action.payload,
      }

    case ActionType.SET_CONNECTION_STATE:
      return {
        ...state,
        isConnected: action.payload,
      }

    case ActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      }

    case ActionType.ADD_FILTERED_PROMPT: {
      const newFilteredPrompts = new Set(state.filteredPrompts)
      newFilteredPrompts.add(action.payload)
      return {
        ...state,
        filteredPrompts: newFilteredPrompts,
      }
    }

    case ActionType.CLEAR_FILTERED_PROMPTS:
      return {
        ...state,
        filteredPrompts: new Set(),
      }

    case ActionType.UPDATE_CONFIG:
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload,
        },
      }

    case ActionType.RESET_CONFIG:
      return {
        ...state,
        config: { ...DEFAULT_CONFIG },
      }

    default:
      return state
  }
}

/**
 * UI state reducer - handles all UI-related state changes
 */
function uiReducer(state: UIState, action: Action): UIState {
  switch (action.type) {
    case ActionType.SET_INITIALIZING:
      return {
        ...state,
        isInitializing: action.payload,
      }

    case ActionType.SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: action.payload,
      }

    case ActionType.SET_SHOW_TIP:
      return {
        ...state,
        showTip: action.payload,
      }

    case ActionType.SET_NEW_PROMPT_TEXT:
      return {
        ...state,
        newPromptText: action.payload,
      }

    default:
      return state
  }
}

/**
 * Combined reducer that delegates to the appropriate sub-reducer
 */
export function reducer(state: AppState, action: Action): AppState {
  // Extract business and UI state
  const { isInitializing, currentStep, showTip, newPromptText, ...businessState } = state
  const uiState = { isInitializing, currentStep, showTip, newPromptText }

  // Apply the appropriate reducer based on action type
  const isBusinessAction =
    action.type === ActionType.ADD_PROMPT ||
    action.type === ActionType.UPDATE_PROMPT ||
    action.type === ActionType.REMOVE_PROMPT ||
    action.type === ActionType.SET_PROMPTS ||
    action.type === ActionType.SET_PLAYBACK_STATE ||
    action.type === ActionType.SET_CONNECTION_STATE ||
    action.type === ActionType.SET_ERROR ||
    action.type === ActionType.ADD_FILTERED_PROMPT ||
    action.type === ActionType.CLEAR_FILTERED_PROMPTS ||
    action.type === ActionType.UPDATE_CONFIG ||
    action.type === ActionType.RESET_CONFIG

  const isUIAction =
    action.type === ActionType.SET_INITIALIZING ||
    action.type === ActionType.SET_CURRENT_STEP ||
    action.type === ActionType.SET_SHOW_TIP ||
    action.type === ActionType.SET_NEW_PROMPT_TEXT

  // Apply business reducer if it's a business action
  const newBusinessState = isBusinessAction
    ? businessReducer(businessState as BusinessState, action)
    : (businessState as BusinessState)

  // Apply UI reducer if it's a UI action
  const newUIState = isUIAction ? uiReducer(uiState, action) : uiState

  // Combine the results
  return {
    ...newBusinessState,
    ...newUIState,
  }
}

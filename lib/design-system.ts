/**
 * Design System Constants
 * Centralized design tokens for consistent styling across the app
 */

export const colors = {
  // Primary colors
  primary: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
  },
  // Secondary colors
  secondary: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
  },
  // Accent colors
  accent: {
    pink: "#ff25f6",
    orange: "#ff6b35",
    yellow: "#ffdd28",
    green: "#3dffab",
    blue: "#2af6de",
    purple: "#9900ff",
    indigo: "#5200ff",
  },
  // Neutral colors
  neutral: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b",
  },
  // Semantic colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const

export const typography = {
  fonts: {
    sans: "Inter, system-ui, -apple-system, sans-serif",
    mono: "JetBrains Mono, Consolas, monospace",
  },
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
  weights: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const

export const spacing = {
  0: "0",
  px: "1px",
  0.5: "0.125rem",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
} as const

export const animations = {
  durations: {
    instant: "0ms",
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
    slower: "700ms",
    slowest: "1000ms",
  },
  easings: {
    linear: "linear",
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    elastic: [0.68, -0.55, 0.265, 1.55],
  },
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    slideUp: {
      from: { transform: "translateY(100%)" },
      to: { transform: "translateY(0)" },
    },
    slideDown: {
      from: { transform: "translateY(-100%)" },
      to: { transform: "translateY(0)" },
    },
    scaleIn: {
      from: { transform: "scale(0.9)", opacity: 0 },
      to: { transform: "scale(1)", opacity: 1 },
    },
    pulse: {
      "0%, 100%": { opacity: 1 },
      "50%": { opacity: 0.5 },
    },
    spin: {
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(360deg)" },
    },
    bounce: {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-25%)" },
    },
    glow: {
      "0%, 100%": { boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)" },
      "50%": { boxShadow: "0 0 40px rgba(168, 85, 247, 0.8)" },
    },
  },
} as const

export const effects = {
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    glow: "0 0 20px rgba(168, 85, 247, 0.5)",
  },
  blurs: {
    sm: "4px",
    md: "8px",
    lg: "16px",
    xl: "24px",
  },
  gradients: {
    primary: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`,
    secondary: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[700]} 100%)`,
    accent: `linear-gradient(135deg, ${colors.accent.purple} 0%, ${colors.accent.pink} 100%)`,
    dark: `linear-gradient(135deg, ${colors.neutral[900]} 0%, ${colors.neutral[950]} 100%)`,
    rainbow: `linear-gradient(135deg, ${colors.accent.purple} 0%, ${colors.accent.pink} 25%, ${colors.accent.orange} 50%, ${colors.accent.yellow} 75%, ${colors.accent.green} 100%)`,
  },
} as const

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const

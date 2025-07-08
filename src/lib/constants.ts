// Application constants (based on lib/common.js)

// Color theme (Monokai-inspired)
export const COLORS = {
  background: '#2d2a2e',
  foreground: '#fcfcfa',
  comment: '#727072',
  red: '#f38ba8',
  orange: '#fab387',
  yellow: '#f9e2af',
  green: '#a6e3a1',
  cyan: '#89dceb',
  blue: '#89b4fa',
  purple: '#b4befe',
  pink: '#f5c2e7',
  white: '#fcfcfa',
  black: '#1e1e2e'
} as const

// Profession colors (should match data/metadata/professions.json)
export const PROFESSION_COLORS = {
  farming: '#4ade80',    // green-400
  cooking: '#f97316',    // orange-500
  blacksmithing: '#64748b', // slate-500
  carpentry: '#a3a3a3',  // neutral-400
  mining: '#fbbf24',     // amber-400
  stonecutting: '#71717a', // zinc-500
  hunting: '#84cc16',    // lime-500
  fishing: '#0ea5e9'     // sky-500
} as const

// Base craft items (items treated as base resources)
export const BASE_CRAFT_ITEMS = new Set([
  'item:farming:embergrain',
  'item:farming:basic-starbulb',
  'item:farming:rough-wispweave-filament'
])

// Default graph layout options
export const DEFAULT_LAYOUT_OPTIONS = {
  direction: 'TB' as const,
  nodeSpacing: 160,
  rankSpacing: 220,
  layoutType: 'hierarchical' as const
}

// Layout presets for different visualization approaches
export const LAYOUT_PRESETS = {
  spacious: {
    name: 'Spacious Flow',
    spacing: { x: 300, y: 200 },
    algorithm: 'dagre',
    direction: 'TB'
  },
  radial: {
    name: 'Spider Web',
    spacing: { x: 150, y: 150 },
    algorithm: 'radial',
    center: { x: 600, y: 500 }
  },
  workflow: {
    name: 'Workflow Chain',
    spacing: { x: 200, y: 150 },
    algorithm: 'dagre',
    direction: 'LR'
  },
  subway: {
    name: 'Subway Map',
    spacing: { x: 250, y: 120 },
    algorithm: 'dagre',
    direction: 'TB'
  }
} as const

// Theme presets for different color schemes
export const THEME_PRESETS = {
  'rose-pine': {
    name: 'Rosé Pine',
    variant: 'main',
    colors: {
      background: '#191724',
      surface: '#1f1d2e',
      overlay: '#26233a',
      muted: '#6e6a86',
      subtle: '#908caa',
      text: '#e0def4',
      love: '#eb6f92',
      gold: '#f6c177',
      rose: '#ebbcba',
      pine: '#31748f',
      foam: '#9ccfd8',
      iris: '#c4a7e7',
      highlight: 'rgba(224, 222, 244, 0.1)',
      accent: '#eb6f92'
    }
  },
  'rose-pine-moon': {
    name: 'Rosé Pine Moon',
    variant: 'moon',
    colors: {
      background: '#232136',
      surface: '#2a273f',
      overlay: '#393552',
      muted: '#6e6a86',
      subtle: '#908caa',
      text: '#e0def4',
      love: '#eb6f92',
      gold: '#f6c177',
      rose: '#ea9a97',
      pine: '#3e8fb0',
      foam: '#9ccfd8',
      iris: '#c4a7e7',
      highlight: 'rgba(224, 222, 244, 0.1)',
      accent: '#eb6f92'
    }
  },
  'monokai': {
    name: 'Monokai',
    variant: 'dark',
    colors: {
      background: '#2d2a2e',
      surface: '#403e41',
      overlay: '#5b595c',
      muted: '#939293',
      subtle: '#c1c0c0',
      text: '#fcfcfa',
      love: '#ff6188',
      gold: '#ffd866',
      rose: '#ff8cc8',
      pine: '#78dce8',
      foam: '#ab9df2',
      iris: '#a9dc76',
      highlight: 'rgba(252, 252, 250, 0.1)',
      accent: '#ff6188'
    }
  }
} as const

// Default focus options
export const DEFAULT_FOCUS_OPTIONS = {
  scale: 1.2,
  duration: 300,
  padding: 50
}

// Node styling constants
export const NODE_STYLES = {
  item: {
    width: 120,
    height: 60,
    borderRadius: 8,
    borderWidth: 2
  },
  craft: {
    width: 100,
    height: 40,
    borderRadius: 20,
    borderWidth: 2
  }
} as const

// Edge styling constants
export const EDGE_STYLES = {
  input: {
    color: COLORS.cyan,
    width: 2
  },
  output: {
    color: COLORS.pink,
    width: 2
  }
} as const

// Animation durations
export const ANIMATION_DURATION = {
  nodeSelection: 200,
  filterToggle: 300,
  layoutTransition: 500
} as const

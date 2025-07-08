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
    direction: 'TB' as const,
    nodeSpacing: 160,
    rankSpacing: 220,
    layoutType: 'hierarchical' as const
  },
  radial: {
    direction: 'TB' as const,
    nodeSpacing: 220,
    rankSpacing: 280,
    layoutType: 'radial' as const
  },
  workflow: {
    direction: 'LR' as const,
    nodeSpacing: 120,
    rankSpacing: 200,
    layoutType: 'hierarchical' as const
  },
  subway: {
    direction: 'LR' as const,
    nodeSpacing: 80,
    rankSpacing: 300,
    layoutType: 'subway' as const,
    align: 'UL' as const,
    ranker: 'longest-path' as const
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

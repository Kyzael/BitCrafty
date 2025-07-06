import { ItemData, CraftData, ProfessionData, QueueItem } from './data'
import { GraphData } from './graph'

// Store state types (based on existing state.js)
export interface AppState {
  // Data
  items: Record<string, ItemData>
  crafts: Record<string, CraftData>
  professions: Record<string, ProfessionData>
  
  // UI state
  selectedNode: string | null
  hoveredNode: string | null
  highlightedEdges: Set<string>
  searchQuery: string
  searchResults: Set<string>
  searchMode: 'name' | 'profession' | 'all'
  visibleProfessions: Set<string>
  craftingQueue: QueueItem[]
  
  // Sidebar state
  sidebarCollapsed: boolean
  sidebarWidth: number
  
  // Graph state
  graphData: GraphData
  focusMode: boolean
}

// Action types for store mutations
export interface AppActions {
  // Data actions
  loadData: () => Promise<void>
  
  // Selection actions
  selectNode: (nodeId: string | null) => void
  setHoveredNode: (nodeId: string | null) => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: Set<string>) => void
  setSearchMode: (mode: 'name' | 'profession' | 'all') => void
  
  // Filter actions
  toggleProfession: (professionName: string) => void
  setVisibleProfessions: (professions: Set<string>) => void
  
  // Queue actions
  addToQueue: (item: QueueItem) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  updateQueueItem: (index: number, updates: Partial<QueueItem>) => void
  
  // Graph actions
  updateGraphData: (data: GraphData) => void
  setFocusMode: (enabled: boolean) => void
  
  // Sidebar actions
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarWidth: (width: number) => void
}

import { ItemData, CraftData, ProfessionData, RequirementData } from './data'
import { GraphData } from './graph'
import { EnhancedQueueItem, QueueSummary, DragState, SharedSurplus, CraftingPath } from './crafting'

// Store state types (based on existing state.js)
export interface AppState {
  // Data
  items: Record<string, ItemData>
  crafts: Record<string, CraftData>
  professions: Record<string, ProfessionData>
  requirements: Record<string, RequirementData>
  baseResources: Set<string> // Dynamically identified base resources
  
  // UI state
  selectedNode: string | null
  hoveredNode: string | null
  highlightedEdges: Set<string>
  searchQuery: string
  searchResults: Set<string>
  searchMode: 'name' | 'profession' | 'all'
  visibleProfessions: Set<string>
  
  // Enhanced crafting queue state (Phase 4)
  enhancedQueue: EnhancedQueueItem[]
  queueSummary: QueueSummary | null
  dragState: DragState
  sharedSurplus: SharedSurplus
  
  // Sidebar state
  sidebarCollapsed: boolean
  sidebarWidth: number
  
  // Graph state
  graphData: GraphData
  focusMode: boolean
  
  // Subtree selection state
  subtreeMode: boolean
  subtreeRootNode: string | null
  subtreeNodes: Set<string>
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
  
  // Enhanced queue actions (Phase 4)
  addToEnhancedQueue: (itemId: string, qty: number, notes?: string) => void
  removeFromEnhancedQueue: (id: string) => void
  updateEnhancedQueueItem: (id: string, updates: Partial<EnhancedQueueItem>) => void
  reorderEnhancedQueue: (fromIndex: number, toIndex: number) => void
  clearEnhancedQueue: () => void
  calculateQueueSummary: () => void
  
  // Drag and drop actions
  setDragState: (state: Partial<DragState>) => void
  resetDragState: () => void
  
  // Resource management
  updateSharedSurplus: (itemId: string, qty: number) => void
  clearSharedSurplus: () => void
  getCraftingPaths: () => CraftingPath[]
  
  // Graph actions
  updateGraphData: (data: GraphData) => void
  setFocusMode: (enabled: boolean) => void
  
  // Sidebar actions
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarWidth: (width: number) => void
  
  // Subtree selection actions
  enableSubtreeMode: (rootNodeId: string) => void
  disableSubtreeMode: () => void
}

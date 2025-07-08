import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useMemo } from 'react'
import { AppState, AppActions, GraphData, EnhancedQueueItem, QueueSummary, DragState, SharedSurplus, LayoutPreset, LayoutOptions } from '../types'
import { loadBitCraftyData, arrayToRecord, professionsArrayToRecord, identifyBaseResources } from './data-loader'
import { buildGraphData } from './graph-builder'
import { calculateQueueResources, generateCraftingPaths } from './resource-calculator'
import { SearchMode } from './utils'
import { LAYOUT_PRESETS } from './constants'

// Helper function to calculate subtree nodes for subtree selection
function calculateSubtreeNodes(
  rootNodeId: string, 
  crafts: Record<string, any>,
  baseResources: Set<string>
): Set<string> {
  const subtreeNodes = new Set<string>()
  const visited = new Set<string>()
  
  // Add the root node
  subtreeNodes.add(rootNodeId)
  
  // Function to get all craft dependencies (crafting path TO the node)
  function addCraftingPath(nodeId: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    subtreeNodes.add(nodeId)
    
    // If it's an item, find crafts that produce it
    // BUT stop if this item is a base resource
    if (nodeId.startsWith('item:')) {
      // Don't traverse further if this is a base resource
      if (baseResources.has(nodeId)) {
        return // Stop here - base resources are gathered, not crafted
      }
      
      Object.values(crafts).forEach((craft: any) => {
        if (craft.outputs && craft.outputs.some((output: any) => output.item === nodeId)) {
          addCraftingPath(craft.id)
        }
      })
    }
    
    // If it's a craft, add all its input materials and their crafting paths
    if (nodeId.startsWith('craft:')) {
      const craft = crafts[nodeId]
      if (craft && craft.materials) {
        craft.materials.forEach((material: any) => {
          addCraftingPath(material.item)
        })
      }
    }
  }
  
  // Function to get direct children (1 step down FROM the node)
  function addDirectChildren(nodeId: string) {
    // If it's an item, find crafts that use it as material
    if (nodeId.startsWith('item:')) {
      Object.values(crafts).forEach((craft: any) => {
        if (craft.materials && craft.materials.some((material: any) => material.item === nodeId)) {
          subtreeNodes.add(craft.id)
          // Add the outputs of those crafts too
          if (craft.outputs) {
            craft.outputs.forEach((output: any) => {
              subtreeNodes.add(output.item)
            })
          }
        }
      })
    }
    
    // If it's a craft, add all its output items
    if (nodeId.startsWith('craft:')) {
      const craft = crafts[nodeId]
      if (craft && craft.outputs) {
        craft.outputs.forEach((output: any) => {
          subtreeNodes.add(output.item)
        })
      }
    }
  }
  
  // Calculate the full crafting path to the root node
  addCraftingPath(rootNodeId)
  
  // Reset visited for direct children calculation (but keep subtreeNodes)
  visited.clear()
  
  // Add direct children (1 step down) from the root node
  addDirectChildren(rootNodeId)
  
  return subtreeNodes
}

// Combined store interface
interface BitCraftyStore extends AppState, AppActions {
  // Loading state
  isLoading: boolean
  loadError: string | null
}

// Initial state
const initialState: AppState = {
  // Data
  items: {},
  crafts: {},
  professions: {},
  requirements: {},
  baseResources: new Set(),
  
  // UI state
  selectedNode: null,
  hoveredNode: null,
  highlightedEdges: new Set(),
  searchResults: new Set(),
  searchQuery: '',
  searchMode: 'all',
  visibleProfessions: new Set(),
  
  // Enhanced crafting queue state (Phase 4)
  enhancedQueue: [],
  queueSummary: null,
  dragState: {
    isDragging: false,
    draggedItemId: null,
    dropTargetIndex: null
  },
  sharedSurplus: {} as SharedSurplus,
  
  // Graph state
  graphData: { nodes: [], edges: [] },
  focusMode: false,
  layoutPreset: 'spacious' as LayoutPreset,
  layoutOptions: LAYOUT_PRESETS.spacious,
  
  // Subtree selection state
  subtreeMode: false,
  subtreeRootNode: null,
  subtreeNodes: new Set(),
  
  // Sidebar state
  sidebarCollapsed: false,
  sidebarWidth: 280
}

// Create Zustand store with React integration
export const useBitCraftyStore = create<BitCraftyStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    // Loading state
    isLoading: false,
    loadError: null,

    // Enhanced data loading
    loadData: async () => {
      set({ isLoading: true, loadError: null })
      
      try {
        const data = await loadBitCraftyData()
        
        // Identify base resources by analyzing craft outputs
        const baseResources = identifyBaseResources(data.items, data.crafts)
        
        const graphData = buildGraphData(data.items, data.crafts, data.professions, get().layoutOptions)
        
        const itemsMap = arrayToRecord(data.items)
        const craftsMap = arrayToRecord(data.crafts)
        const professionsMap = professionsArrayToRecord(data.professions)
        const requirementsMap = arrayToRecord(data.requirements)
        const allProfessions = new Set(data.professions.map(p => p.name))
        
        set({
          items: itemsMap,
          crafts: craftsMap,
          professions: professionsMap,
          requirements: requirementsMap,
          baseResources,
          graphData,
          visibleProfessions: allProfessions,
          isLoading: false,
          loadError: null
        })
        
      } catch (error) {
        console.error('Failed to load BitCrafty data:', error)
        set({ 
          isLoading: false, 
          loadError: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    },

    // Selection actions
    selectNode: (nodeId: string | null) => {
      const { graphData } = get()
      
      if (nodeId) {
        // Calculate connected edges for highlighting
        const connectedEdges = graphData.edges
          .filter(edge => edge.source === nodeId || edge.target === nodeId)
          .map(edge => edge.id)
        
        set({ 
          selectedNode: nodeId,
          highlightedEdges: new Set(connectedEdges)
        })
        
      } else {
        set({ 
          selectedNode: null,
          highlightedEdges: new Set()
        })
      }
    },

    setHoveredNode: (nodeId: string | null) => {
      set({ hoveredNode: nodeId })
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query })
    },

    setSearchMode: (mode: SearchMode) => {
      set({ searchMode: mode })
    },

    setSearchResults: (results: Set<string>) => {
      set({ searchResults: results })
    },

    // Filter actions
    toggleProfession: (professionName: string) => {
      const { visibleProfessions } = get()
      const newVisible = new Set(visibleProfessions)
      
      if (newVisible.has(professionName)) {
        newVisible.delete(professionName)
      } else {
        newVisible.add(professionName)
      }
      
      set({ visibleProfessions: newVisible })
    },

    setVisibleProfessions: (professions: Set<string>) => {
      set({ visibleProfessions: new Set(professions) })
    },

    // Enhanced queue actions (Phase 4)
    addToEnhancedQueue: (itemId: string, qty: number, notes?: string) => {
      const { enhancedQueue } = get()
      
      // Check if item already exists in queue
      const existingItemIndex = enhancedQueue.findIndex(item => item.itemId === itemId)
      
      if (existingItemIndex !== -1) {
        // Update existing item quantity
        const newQueue = enhancedQueue.map((item, index) => 
          index === existingItemIndex 
            ? { 
                ...item, 
                qty: item.qty + qty,
                notes: notes ? `${item.notes ? item.notes + '; ' : ''}${notes}` : item.notes,
                addedAt: new Date() // Update timestamp to show recent activity
              }
            : item
        )
        set({ enhancedQueue: newQueue })
      } else {
        // Add new item
        const newItem: EnhancedQueueItem = {
          id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          itemId,
          qty,
          priority: enhancedQueue.length,
          dependencies: [],
          status: 'pending',
          notes,
          addedAt: new Date()
        }
        const newQueue = [...enhancedQueue, newItem]
        set({ enhancedQueue: newQueue })
      }
      
      // Trigger summary recalculation
      get().calculateQueueSummary()
    },

    removeFromEnhancedQueue: (id: string) => {
      const { enhancedQueue } = get()
      const newQueue = enhancedQueue.filter(item => item.id !== id)
      // Reorder priorities
      const reorderedQueue = newQueue.map((item, index) => ({
        ...item,
        priority: index
      }))
      set({ enhancedQueue: reorderedQueue })
      get().calculateQueueSummary()
    },

    updateEnhancedQueueItem: (id: string, updates: Partial<EnhancedQueueItem>) => {
      const { enhancedQueue } = get()
      const newQueue = enhancedQueue.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
      set({ enhancedQueue: newQueue })
      get().calculateQueueSummary()
    },

    reorderEnhancedQueue: (fromIndex: number, toIndex: number) => {
      const { enhancedQueue } = get()
      const newQueue = [...enhancedQueue]
      const [moved] = newQueue.splice(fromIndex, 1)
      newQueue.splice(toIndex, 0, moved)
      
      // Update priorities to match new order
      const reorderedQueue = newQueue.map((item, index) => ({
        ...item,
        priority: index
      }))
      
      set({ enhancedQueue: reorderedQueue })
      get().calculateQueueSummary()
    },

    clearEnhancedQueue: () => {
      set({ 
        enhancedQueue: [],
        queueSummary: null,
        sharedSurplus: {} as SharedSurplus
      })
    },

    calculateQueueSummary: () => {
      const { enhancedQueue, items, crafts, baseResources } = get()
      
      if (enhancedQueue.length === 0) {
        set({ queueSummary: null })
        return
      }

      // Use resource calculator to get accurate summary
      const resourceSummary = calculateQueueResources(enhancedQueue, items, crafts, baseResources)
      
      const summary: QueueSummary = {
        totalItems: enhancedQueue.length,
        baseResources: resourceSummary.baseResources,
        surplus: resourceSummary.surplus,
        bottlenecks: [] // TODO: Implement bottleneck detection
      }

      set({ queueSummary: summary })
    },

    // Drag and drop actions
    setDragState: (state: Partial<DragState>) => {
      const { dragState } = get()
      set({ dragState: { ...dragState, ...state } })
    },

    resetDragState: () => {
      set({ 
        dragState: {
          isDragging: false,
          draggedItemId: null,
          dropTargetIndex: null
        }
      })
    },

    // Resource management
    updateSharedSurplus: (itemId: string, qty: number) => {
      const { sharedSurplus } = get()
      const newSurplus = { ...sharedSurplus }
      
      if (qty <= 0) {
        delete newSurplus[itemId]
      } else {
        newSurplus[itemId] = qty
      }
      
      set({ sharedSurplus: newSurplus })
    },

    clearSharedSurplus: () => {
      set({ sharedSurplus: {} as SharedSurplus })
    },

    // Get crafting paths for the queue
    getCraftingPaths: () => {
      const { enhancedQueue, items, crafts, baseResources } = get()
      return generateCraftingPaths(enhancedQueue, items, crafts, baseResources)
    },

    // Graph actions
    updateGraphData: (data: GraphData) => {
      set({ graphData: data })
    },

    setFocusMode: (enabled: boolean) => {
      set({ focusMode: enabled })
    },
    
    setLayoutPreset: (preset: LayoutPreset) => {
      const newLayoutOptions = LAYOUT_PRESETS[preset]
      set({ 
        layoutPreset: preset,
        layoutOptions: newLayoutOptions
      })
      
      // Rebuild graph with new layout
      const { items, crafts, professions } = get()
      if (Object.keys(items).length > 0) {
        const newGraphData = buildGraphData(
          Object.values(items), 
          Object.values(crafts), 
          Object.values(professions),
          newLayoutOptions
        )
        set({ graphData: newGraphData })
      }
    },

    updateLayoutOptions: (options: Partial<LayoutOptions>) => {
      const current = get().layoutOptions
      const newLayoutOptions = { ...current, ...options }
      set({ layoutOptions: newLayoutOptions })
      
      // Rebuild graph with new layout
      const { items, crafts, professions } = get()
      if (Object.keys(items).length > 0) {
        const newGraphData = buildGraphData(
          Object.values(items), 
          Object.values(crafts), 
          Object.values(professions),
          newLayoutOptions
        )
        set({ graphData: newGraphData })
      }
    },
    
    // Sidebar actions
    setSidebarCollapsed: (collapsed: boolean) => {
      set({ sidebarCollapsed: collapsed })
    },

    setSidebarWidth: (width: number) => {
      const clampedWidth = Math.max(200, Math.min(600, width)) // Min 200px, max 600px
      set({ sidebarWidth: clampedWidth })
    },

    // Subtree selection actions
    enableSubtreeMode: (rootNodeId: string) => {
      const state = get()
      const subtreeNodes = calculateSubtreeNodes(rootNodeId, state.crafts, state.baseResources)
      
      // Calculate highlighted edges for all nodes in the subtree (ant trail effect)
      const subtreeEdges = state.graphData.edges
        .filter(edge => subtreeNodes.has(edge.source) && subtreeNodes.has(edge.target))
        .map(edge => edge.id)
      
      set({ 
        subtreeMode: true, 
        subtreeRootNode: rootNodeId,
        subtreeNodes,
        selectedNode: rootNodeId, // Also select the root node
        highlightedEdges: new Set(subtreeEdges) // Add ant trail highlighting for subtree
      })
    },

    disableSubtreeMode: () => {
      set({ 
        subtreeMode: false, 
        subtreeRootNode: null,
        subtreeNodes: new Set(),
        highlightedEdges: new Set() // Clear ant trail highlighting when exiting subtree mode
      })
    }
  }))
)

// Memoized selectors with proper caching for React 18
// These avoid the "getSnapshot" warning and infinite loops
export const useSelectedNode = () => useBitCraftyStore(state => state.selectedNode)
export const useHoveredNode = () => useBitCraftyStore(state => state.hoveredNode)
export const useHighlightedEdges = () => useBitCraftyStore(state => state.highlightedEdges)
export const useSearchResults = () => useBitCraftyStore(state => state.searchResults)
export const useSearchQuery = () => useBitCraftyStore(state => state.searchQuery)
export const useSearchMode = () => useBitCraftyStore(state => state.searchMode)
export const useVisibleProfessions = () => useBitCraftyStore(state => state.visibleProfessions)
export const useEnhancedQueue = () => useBitCraftyStore(state => state.enhancedQueue)
export const useQueueSummary = () => useBitCraftyStore(state => state.queueSummary)
export const useDragState = () => useBitCraftyStore(state => state.dragState)
export const useSharedSurplus = () => useBitCraftyStore(state => state.sharedSurplus)
export const useGraphData = () => useBitCraftyStore(state => state.graphData)
export const useFocusMode = () => useBitCraftyStore(state => state.focusMode)
export const useLayoutPreset = () => useBitCraftyStore(state => state.layoutPreset)
export const useLayoutOptions = () => useBitCraftyStore(state => state.layoutOptions)
export const useIsLoading = () => useBitCraftyStore(state => state.isLoading)
export const useLoadError = () => useBitCraftyStore(state => state.loadError)
export const useSidebarCollapsed = () => useBitCraftyStore(state => state.sidebarCollapsed)
export const useSidebarWidth = () => useBitCraftyStore(state => state.sidebarWidth)

// Subtree selection selectors
export const useSubtreeMode = () => useBitCraftyStore(state => state.subtreeMode)
export const useSubtreeRootNode = () => useBitCraftyStore(state => state.subtreeRootNode)
export const useSubtreeNodes = () => useBitCraftyStore(state => state.subtreeNodes)

// Memoized data array selectors
// These ensure Object.values() calls don't create new arrays on every render
export const useItemsArray = () => {
  const items = useBitCraftyStore(state => state.items)
  // Use useMemo to ensure the array is only created once per items reference
  return useMemo(() => Object.values(items), [items])
}

export const useCraftsArray = () => {
  const crafts = useBitCraftyStore(state => state.crafts)
  return useMemo(() => Object.values(crafts), [crafts])
}

export const useProfessionsArray = () => {
  const professions = useBitCraftyStore(state => state.professions)
  return useMemo(() => Object.values(professions), [professions])
}

// Original data object selectors
export const useItems = () => useBitCraftyStore(state => state.items)
export const useCrafts = () => useBitCraftyStore(state => state.crafts)
export const useProfessions = () => useBitCraftyStore(state => state.professions)
export const useRequirements = () => useBitCraftyStore(state => state.requirements)
export const useBaseResources = () => useBitCraftyStore(state => state.baseResources)

// Individual action hooks - these provide stable references
export const useLoadData = () => useBitCraftyStore(state => state.loadData)
export const useSelectNode = () => useBitCraftyStore(state => state.selectNode)
export const useSetHoveredNode = () => useBitCraftyStore(state => state.setHoveredNode)
export const useSetSearchQuery = () => useBitCraftyStore(state => state.setSearchQuery)
export const useSetSearchMode = () => useBitCraftyStore(state => state.setSearchMode)
export const useSetSearchResults = () => useBitCraftyStore(state => state.setSearchResults)
export const useToggleProfession = () => useBitCraftyStore(state => state.toggleProfession)
export const useSetVisibleProfessions = () => useBitCraftyStore(state => state.setVisibleProfessions)

// Enhanced queue action hooks (Phase 4)
export const useAddToEnhancedQueue = () => useBitCraftyStore(state => state.addToEnhancedQueue)
export const useRemoveFromEnhancedQueue = () => useBitCraftyStore(state => state.removeFromEnhancedQueue)
export const useUpdateEnhancedQueueItem = () => useBitCraftyStore(state => state.updateEnhancedQueueItem)
export const useReorderEnhancedQueue = () => useBitCraftyStore(state => state.reorderEnhancedQueue)
export const useClearEnhancedQueue = () => useBitCraftyStore(state => state.clearEnhancedQueue)
export const useCalculateQueueSummary = () => useBitCraftyStore(state => state.calculateQueueSummary)
export const useSetDragState = () => useBitCraftyStore(state => state.setDragState)
export const useResetDragState = () => useBitCraftyStore(state => state.resetDragState)
export const useUpdateSharedSurplus = () => useBitCraftyStore(state => state.updateSharedSurplus)
export const useClearSharedSurplus = () => useBitCraftyStore(state => state.clearSharedSurplus)
export const useGetCraftingPaths = () => useBitCraftyStore(state => state.getCraftingPaths)

export const useUpdateGraphData = () => useBitCraftyStore(state => state.updateGraphData)
export const useSetFocusMode = () => useBitCraftyStore(state => state.setFocusMode)
export const useSetLayoutPreset = () => useBitCraftyStore(state => state.setLayoutPreset)
export const useUpdateLayoutOptions = () => useBitCraftyStore(state => state.updateLayoutOptions)

// Subtree action hooks
export const useEnableSubtreeMode = () => useBitCraftyStore(state => state.enableSubtreeMode)
export const useDisableSubtreeMode = () => useBitCraftyStore(state => state.disableSubtreeMode)

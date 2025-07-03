import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useMemo } from 'react'
import { AppState, AppActions, QueueItem, GraphData } from '../types'
import { loadBitCraftyData, arrayToRecord, professionsArrayToRecord } from './data-loader'
import { buildGraphData } from './graph-builder'
import { SearchMode } from './utils'

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
  
  // UI state
  selectedNode: null,
  hoveredNode: null,
  highlightedEdges: new Set(),
  searchResults: new Set(),
  searchQuery: '',
  searchMode: 'all',
  visibleProfessions: new Set(),
  craftingQueue: [],
  
  // Graph state
  graphData: { nodes: [], edges: [] },
  focusMode: false
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
      console.log('Store: Starting data load')
      set({ isLoading: true, loadError: null })
      
      try {
        const data = await loadBitCraftyData()
        console.log('Store: Data loaded:', {
          items: data.items.length,
          crafts: data.crafts.length,
          professions: data.professions.length
        })
        
        const graphData = buildGraphData(data.items, data.crafts, data.professions)
        console.log('Store: Graph data built:', {
          nodes: graphData.nodes.length,
          edges: graphData.edges.length
        })
        
        const itemsMap = arrayToRecord(data.items)
        const craftsMap = arrayToRecord(data.crafts)
        const professionsMap = professionsArrayToRecord(data.professions)
        const allProfessions = new Set(data.professions.map(p => p.name))
        
        set({
          items: itemsMap,
          crafts: craftsMap,
          professions: professionsMap,
          graphData,
          visibleProfessions: allProfessions,
          isLoading: false,
          loadError: null
        })
        
        console.log('Store: Data loading complete')
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
        
        console.log('Node selected:', nodeId, 'Connected edges:', connectedEdges.length)
      } else {
        set({ 
          selectedNode: null,
          highlightedEdges: new Set()
        })
        console.log('Node deselected')
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
      console.log('Store: toggleProfession called with:', professionName)
      const { visibleProfessions } = get()
      const newVisible = new Set(visibleProfessions)
      
      if (newVisible.has(professionName)) {
        newVisible.delete(professionName)
        console.log('Store: Removed profession:', professionName)
      } else {
        newVisible.add(professionName)
        console.log('Store: Added profession:', professionName)
      }
      
      console.log('Store: New visible professions:', Array.from(newVisible))
      set({ visibleProfessions: newVisible })
    },

    setVisibleProfessions: (professions: Set<string>) => {
      console.log('Store: setVisibleProfessions called with:', Array.from(professions))
      set({ visibleProfessions: new Set(professions) })
    },

    // Queue actions
    addToQueue: (item: QueueItem) => {
      const { craftingQueue } = get()
      set({ craftingQueue: [...craftingQueue, item] })
    },

    removeFromQueue: (index: number) => {
      const { craftingQueue } = get()
      const newQueue = craftingQueue.filter((_, i) => i !== index)
      set({ craftingQueue: newQueue })
    },

    clearQueue: () => {
      set({ craftingQueue: [] })
    },

    updateQueueItem: (index: number, updates: Partial<QueueItem>) => {
      const { craftingQueue } = get()
      const newQueue = craftingQueue.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
      set({ craftingQueue: newQueue })
    },

    // Graph actions
    updateGraphData: (data: GraphData) => {
      set({ graphData: data })
    },

    setFocusMode: (enabled: boolean) => {
      set({ focusMode: enabled })
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
export const useCraftingQueue = () => useBitCraftyStore(state => state.craftingQueue)
export const useGraphData = () => useBitCraftyStore(state => state.graphData)
export const useFocusMode = () => useBitCraftyStore(state => state.focusMode)
export const useIsLoading = () => useBitCraftyStore(state => state.isLoading)
export const useLoadError = () => useBitCraftyStore(state => state.loadError)

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

// Individual action hooks - these provide stable references
export const useLoadData = () => useBitCraftyStore(state => state.loadData)
export const useSelectNode = () => useBitCraftyStore(state => state.selectNode)
export const useSetHoveredNode = () => useBitCraftyStore(state => state.setHoveredNode)
export const useSetSearchQuery = () => useBitCraftyStore(state => state.setSearchQuery)
export const useSetSearchMode = () => useBitCraftyStore(state => state.setSearchMode)
export const useSetSearchResults = () => useBitCraftyStore(state => state.setSearchResults)
export const useToggleProfession = () => useBitCraftyStore(state => state.toggleProfession)
export const useSetVisibleProfessions = () => useBitCraftyStore(state => state.setVisibleProfessions)
export const useAddToQueue = () => useBitCraftyStore(state => state.addToQueue)
export const useRemoveFromQueue = () => useBitCraftyStore(state => state.removeFromQueue)
export const useClearQueue = () => useBitCraftyStore(state => state.clearQueue)
export const useUpdateQueueItem = () => useBitCraftyStore(state => state.updateQueueItem)
export const useUpdateGraphData = () => useBitCraftyStore(state => state.updateGraphData)
export const useSetFocusMode = () => useBitCraftyStore(state => state.setFocusMode)

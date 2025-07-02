import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { AppState, AppActions, ItemData, CraftData, ProfessionData, QueueItem, GraphData } from '../types'

// Combined store interface
interface BitCraftyStore extends AppState, AppActions {}

// Initial state
const initialState: AppState = {
  // Data
  items: {},
  crafts: {},
  professions: {},
  
  // UI state
  selectedNode: null,
  searchQuery: '',
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

    // Data actions
    loadData: (data: { items: ItemData[], crafts: CraftData[], professions: ProfessionData[] }) => {
      const itemsMap = data.items.reduce((acc, item) => {
        acc[item.id] = item
        return acc
      }, {} as Record<string, ItemData>)
      
      const craftsMap = data.crafts.reduce((acc, craft) => {
        acc[craft.id] = craft
        return acc
      }, {} as Record<string, CraftData>)
      
      const professionsMap = data.professions.reduce((acc, profession) => {
        acc[profession.name] = profession
        return acc
      }, {} as Record<string, ProfessionData>)
      
      const allProfessions = new Set(data.professions.map(p => p.name))
      
      set({
        items: itemsMap,
        crafts: craftsMap,
        professions: professionsMap,
        visibleProfessions: allProfessions
      })
    },

    // Selection actions
    selectNode: (nodeId: string | null) => {
      set({ selectedNode: nodeId })
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query })
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

// Selector hooks for specific state slices
export const useSelectedNode = () => useBitCraftyStore(state => state.selectedNode)
export const useSearchQuery = () => useBitCraftyStore(state => state.searchQuery)
export const useVisibleProfessions = () => useBitCraftyStore(state => state.visibleProfessions)
export const useCraftingQueue = () => useBitCraftyStore(state => state.craftingQueue)
export const useGraphData = () => useBitCraftyStore(state => state.graphData)
export const useFocusMode = () => useBitCraftyStore(state => state.focusMode)

// Data selector hooks
export const useItems = () => useBitCraftyStore(state => state.items)
export const useCrafts = () => useBitCraftyStore(state => state.crafts)
export const useProfessions = () => useBitCraftyStore(state => state.professions)

// Action hooks
export const useStoreActions = () => useBitCraftyStore(state => ({
  loadData: state.loadData,
  selectNode: state.selectNode,
  setSearchQuery: state.setSearchQuery,
  toggleProfession: state.toggleProfession,
  setVisibleProfessions: state.setVisibleProfessions,
  addToQueue: state.addToQueue,
  removeFromQueue: state.removeFromQueue,
  clearQueue: state.clearQueue,
  updateQueueItem: state.updateQueueItem,
  updateGraphData: state.updateGraphData,
  setFocusMode: state.setFocusMode
}))

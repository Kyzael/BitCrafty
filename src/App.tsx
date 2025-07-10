import { useEffect } from 'react'
import { useBitCraftyStore } from './lib'
import { Header } from './components/ui/Header'
import { Sidebar } from './components/ui/Sidebar'
import { GraphContainer } from './components/graph/GraphContainer'
import { useIsLoading, useLoadError, useSidebarCollapsed, useSidebarWidth, useSelectedNode, useAddToEnhancedQueue, useRemoveFromEnhancedQueue, useEnhancedQueue, useItemsArray, useUpdateEnhancedQueueItem, useThemeColors } from './lib/store'
import 'reactflow/dist/style.css'

function App() {
  // Use memoized selectors to avoid infinite loops
  const isLoading = useIsLoading()
  const loadError = useLoadError()
  const sidebarCollapsed = useSidebarCollapsed()
  const sidebarWidth = useSidebarWidth()
  const themeColors = useThemeColors()
  
  // Queue management hooks
  const selectedNode = useSelectedNode()
  const enhancedQueue = useEnhancedQueue()
  const items = useItemsArray()
  const addToEnhancedQueue = useAddToEnhancedQueue()
  const removeFromEnhancedQueue = useRemoveFromEnhancedQueue()
  const updateEnhancedQueueItem = useUpdateEnhancedQueueItem()
  
  useEffect(() => {
    // Call loadData directly from the store to avoid dependency issues
    useBitCraftyStore.getState().loadData()
  }, []) // Empty dependency array - only run once on mount

  // Keyboard shortcuts for queue management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if we have a selected item node
      if (!selectedNode) return
      
      // Check if selected node is an item (not a craft)
      const isItem = items.some(item => item.id === selectedNode)
      if (!isItem) return
      
      // Don't trigger if user is typing in an input field
      const activeElement = document.activeElement as HTMLElement
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as any).contentEditable === 'true'
      )) {
        return
      }

      switch (e.key) {
        case '+':
        case '=': // Also handle = key (same as + without shift)
          e.preventDefault()
          // Find item name for the note
          const item = items.find(i => i.id === selectedNode)
          const itemName = item?.name || 'Unknown Item'
          addToEnhancedQueue(selectedNode, 1, `Added via + key: ${itemName}`)
          break
          
        case '-':
          e.preventDefault()
          // Find the most recent instance of this item from the queue
          const queueItem = enhancedQueue
            .filter(qi => qi.itemId === selectedNode)
            .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())[0] // Most recent first
          
          if (queueItem) {
            if (queueItem.qty > 1) {
              // Decrease quantity by 1
              const item = items.find(i => i.id === selectedNode)
              const itemName = item?.name || 'Unknown Item'
              updateEnhancedQueueItem(queueItem.id, { 
                qty: queueItem.qty - 1,
                notes: queueItem.notes ? `${queueItem.notes}; Decreased via - key: ${itemName}` : `Decreased via - key: ${itemName}`
              })
            } else {
              // Remove item when quantity would become 0
              removeFromEnhancedQueue(queueItem.id)
            }
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode, items, enhancedQueue, addToEnhancedQueue, removeFromEnhancedQueue, updateEnhancedQueueItem])

  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: themeColors.background,
        color: themeColors.text,
        fontSize: '18px'
      }}>
        <div>Loading BitCrafty data...</div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: themeColors.background,
        color: themeColors.love,
        fontSize: '18px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ marginBottom: '10px' }}>Error loading data:</div>
        <div style={{ fontSize: '14px', color: themeColors.muted }}>{loadError}</div>
        <button 
          onClick={() => useBitCraftyStore.getState().loadData()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: themeColors.accent,
            border: 'none',
            borderRadius: '4px',
            color: themeColors.background,
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="app" style={{ backgroundColor: themeColors.background }}>
      <Header />
      <div 
        className="app-content"
        style={{
          '--sidebar-width': sidebarCollapsed ? '60px' : `${sidebarWidth}px`,
          backgroundColor: themeColors.background
        } as React.CSSProperties}
      >
        <Sidebar />
        <div 
          style={{ 
            flex: 1, 
            width: '100%', 
            height: '100%', 
            position: 'relative',
            minWidth: '500px',
            minHeight: '500px',
            backgroundColor: themeColors.background
          }}
        >
          <GraphContainer />
        </div>
      </div>
    </div>
  )
}

export default App

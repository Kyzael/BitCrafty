import { useEffect } from 'react'
import { useBitCraftyStore } from './lib'
import { Header } from './components/ui/Header'
import { Sidebar } from './components/ui/Sidebar'
import { GraphContainer } from './components/graph/GraphContainer'
import { CraftingPanel } from './components/ui/CraftingPanel'
import { useIsLoading, useLoadError } from './lib/store'
import 'reactflow/dist/style.css'

function App() {
  // Use memoized selectors to avoid infinite loops
  const isLoading = useIsLoading()
  const loadError = useLoadError()
  
  useEffect(() => {
    // Call loadData directly from the store to avoid dependency issues
    useBitCraftyStore.getState().loadData()
  }, []) // Empty dependency array - only run once on mount

  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#2d2a2e',
        color: '#fcfcfa',
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
        background: '#2d2a2e',
        color: '#f38ba8',
        fontSize: '18px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ marginBottom: '10px' }}>Error loading data:</div>
        <div style={{ fontSize: '14px', color: '#727072' }}>{loadError}</div>
        <button 
          onClick={() => useBitCraftyStore.getState().loadData()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#89b4fa',
            border: 'none',
            borderRadius: '4px',
            color: '#1e1e2e',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <Sidebar />
        <div 
          style={{ 
            flex: 1, 
            width: '100%', 
            height: '100%', 
            position: 'relative',
            minWidth: '500px',
            minHeight: '500px'
          }}
        >
          <GraphContainer />
        </div>
        <CraftingPanel />
      </div>
    </div>
  )
}

export default App

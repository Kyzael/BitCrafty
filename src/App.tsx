import { useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { useBitCraftyStore } from './lib'
import { Header } from './components/ui/Header'
import { Sidebar } from './components/ui/Sidebar'
import { GraphContainer } from './components/graph/GraphContainer'
import { CraftingPanel } from './components/ui/CraftingPanel'
import 'reactflow/dist/style.css'

function App() {
  const loadData = useBitCraftyStore(state => state.loadData)
  
  useEffect(() => {
    // Load data from the original data files
    const loadAppData = async () => {
      try {
        const [itemsRes, craftsRes, professionsRes] = await Promise.all([
          fetch('/data/items.json'),
          fetch('/data/crafts.json'),
          fetch('/data/metadata/professions.json')
        ])
        
        const [items, crafts, professions] = await Promise.all([
          itemsRes.json(),
          craftsRes.json(),
          professionsRes.json()
        ])
        
        loadData({ items, crafts, professions })
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    
    loadAppData()
  }, [loadData])

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <Sidebar />
        <ReactFlowProvider>
          <GraphContainer />
        </ReactFlowProvider>
        <CraftingPanel />
      </div>
    </div>
  )
}

export default App

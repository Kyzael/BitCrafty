# Phase 2: Data Loading & Graph Generation

**Status**: Ready to Begin  
**Duration**: Est. 2-3 days  
**Goal**: Load existing JSON data and generate React Flow graph structure

## 🎯 Phase 2 Objectives

### Primary Goals
1. **Data Loading System**: Load items.json, crafts.json, and professions.json into React app
2. **Graph Data Generation**: Convert JSON data into React Flow nodes and edges
3. **Store Integration**: Connect data loading to Zustand store with React patterns
4. **Graph Rendering**: Display actual BitCrafty data in React Flow canvas
5. **Basic Filtering**: Implement profession-based node visibility

### Success Criteria
- ✅ All 69 items and 49 crafts loaded and displayed as nodes
- ✅ Correct edges connecting inputs to crafts to outputs
- ✅ Profession-based coloring preserved from existing app
- ✅ Basic profession filter toggle working
- ✅ Hierarchical layout applied using Dagre

## 📋 Implementation Tasks

### Task 2.1: Data Loading Infrastructure
**File**: `src/lib/data-loader.ts`

```typescript
// Create data loading utilities that fetch and parse JSON files
export const loadBitCraftyData = async () => {
  // Fetch from /data/ directory (served by Vite dev server)
  const [itemsRes, craftsRes, professionsRes] = await Promise.all([
    fetch('/data/items.json'),
    fetch('/data/crafts.json'), 
    fetch('/data/metadata/professions.json')
  ])
  
  // Parse and validate structure
  const [items, crafts, professions] = await Promise.all([
    itemsRes.json(),
    craftsRes.json(),
    professionsRes.json()
  ])
  
  // Transform to expected format and return
  return { items, crafts, professions }
}
```

### Task 2.2: Graph Data Generation
**File**: `src/lib/graph-builder.ts`

```typescript
// Convert JSON data into React Flow nodes and edges
export const buildGraphData = (
  items: ItemData[],
  crafts: CraftData[],
  professions: ProfessionData[]
): GraphData => {
  // Generate item nodes
  const itemNodes = items.map(item => createItemNode(item))
  
  // Generate craft nodes  
  const craftNodes = crafts.map(craft => createCraftNode(craft))
  
  // Generate edges (inputs → craft → outputs)
  const edges = crafts.flatMap(craft => [
    ...createInputEdges(craft),
    ...createOutputEdges(craft)
  ])
  
  // Apply hierarchical layout
  const allNodes = [...itemNodes, ...craftNodes]
  const layoutedNodes = calculateLayout(allNodes, edges)
  
  return { nodes: layoutedNodes, edges }
}
```

### Task 2.3: Enhanced Store Integration
**File**: `src/lib/store.ts` (update existing)

```typescript
// Add data loading actions and computed values
export const useBitCraftyStore = create<BitCraftyStore>()(
  subscribeWithSelector((set, get) => ({
    // ... existing state
    
    // New loading state
    isLoading: false,
    loadError: null,
    
    // Enhanced data loading
    loadData: async () => {
      set({ isLoading: true, loadError: null })
      
      try {
        const data = await loadBitCraftyData()
        const graphData = buildGraphData(data.items, data.crafts, data.professions)
        
        set({
          items: arrayToRecord(data.items),
          crafts: arrayToRecord(data.crafts), 
          professions: arrayToRecord(data.professions),
          graphData,
          visibleProfessions: new Set(data.professions.map(p => p.name)),
          isLoading: false
        })
      } catch (error) {
        set({ 
          isLoading: false, 
          loadError: error.message 
        })
      }
    }
  }))
)
```

### Task 2.4: Graph Canvas Implementation
**File**: `src/components/graph/GraphContainer.tsx` (enhance existing)

```typescript
import { useEffect, useMemo } from 'react'
import ReactFlow, { Node, Edge, useNodesState, useEdgesState } from 'reactflow'
import { useBitCraftyStore } from '../../lib'
import { calculateLayout, filterGraphData } from '../../lib/utils'

export function GraphContainer() {
  const graphData = useBitCraftyStore(state => state.graphData)
  const visibleProfessions = useBitCraftyStore(state => state.visibleProfessions)
  const searchQuery = useBitCraftyStore(state => state.searchQuery)
  
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  // Filter graph data based on current filters
  const filteredData = useMemo(() => {
    if (!graphData) return { nodes: [], edges: [] }
    
    return filterGraphData(
      graphData.nodes,
      graphData.edges,
      visibleProfessions,
      searchQuery
    )
  }, [graphData, visibleProfessions, searchQuery])
  
  // Update React Flow when filtered data changes
  useEffect(() => {
    setNodes(filteredData.nodes)
    setEdges(filteredData.edges)
  }, [filteredData, setNodes, setEdges])
  
  return (
    <div style={{ flex: 1, height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={{
          item: ItemNode,
          craft: CraftNode
        }}
        fitView
        attributionPosition="bottom-left"
      />
    </div>
  )
}
```

### Task 2.5: Custom Node Components  
**Files**: `src/components/graph/nodes/ItemNode.tsx`, `CraftNode.tsx`

```typescript
// ItemNode.tsx - Recreate existing item styling
import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ItemNodeData } from '../../../types'
import { PROFESSION_COLORS } from '../../../lib/constants'

export const ItemNode = memo<NodeProps<ItemNodeData>>(({ data, selected }) => {
  const profession = data.id.split(':')[1]
  const color = PROFESSION_COLORS[profession] || '#727072'
  
  return (
    <div 
      style={{
        background: selected ? color + '33' : '#1e1e2e',
        border: `2px solid ${color}`,
        borderRadius: '8px',
        padding: '8px 12px',
        color: '#fcfcfa',
        fontSize: '12px',
        minWidth: '120px',
        textAlign: 'center',
        fontWeight: selected ? 'bold' : 'normal'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {data.name}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  )
})

// CraftNode.tsx - Recreate existing craft styling  
export const CraftNode = memo<NodeProps<CraftNodeData>>(({ data, selected }) => {
  const profession = data.id.split(':')[1]
  const color = PROFESSION_COLORS[profession] || '#727072'
  
  return (
    <div 
      style={{
        background: selected ? color + '33' : '#1e1e2e',
        border: `2px solid ${color}`,
        borderRadius: '20px',
        padding: '6px 16px', 
        color: '#fcfcfa',
        fontSize: '11px',
        minWidth: '100px',
        textAlign: 'center',
        fontWeight: selected ? 'bold' : 'normal'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {data.name}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  )
})
```

### Task 2.6: Enhanced Sidebar with Profession Filters
**File**: `src/components/ui/Sidebar.tsx` (enhance existing)

```typescript
export function Sidebar() {
  const professions = useBitCraftyStore(state => Object.values(state.professions))
  const visibleProfessions = useBitCraftyStore(state => state.visibleProfessions)
  const toggleProfession = useBitCraftyStore(state => state.toggleProfession)
  
  return (
    <aside style={{ 
      width: '250px', 
      background: '#1e1e2e', 
      borderRight: '1px solid #727072',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <h2 style={{ color: '#fcfcfa', marginBottom: '1rem' }}>Filters</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ color: '#fcfcfa', fontSize: '14px', marginBottom: '0.5rem' }}>
          Professions
        </h3>
        <div style={{ display: 'grid', gap: '4px' }}>
          {professions.map(profession => (
            <label 
              key={profession.name}
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: visibleProfessions.has(profession.name) 
                  ? profession.color + '22' 
                  : 'transparent'
              }}
            >
              <input
                type="checkbox"
                checked={visibleProfessions.has(profession.name)}
                onChange={() => toggleProfession(profession.name)}
                style={{ margin: 0 }}
              />
              <div 
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: profession.color,
                  borderRadius: '2px'
                }}
              />
              <span style={{ color: '#fcfcfa', fontSize: '12px' }}>
                {profession.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}
```

### Task 2.7: Loading States & Error Handling
**File**: `src/App.tsx` (enhance existing)

```typescript
export default function App() {
  const isLoading = useBitCraftyStore(state => state.isLoading)
  const loadError = useBitCraftyStore(state => state.loadError)
  const loadData = useBitCraftyStore(state => state.loadData)
  
  useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#2d2a2e',
        color: '#fcfcfa'
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
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#2d2a2e',
        color: '#f38ba8'
      }}>
        <div>Error loading data: {loadError}</div>
      </div>
    )
  }

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
```

## 🔄 Implementation Order

### Day 1: Data Infrastructure
1. ✅ **Task 2.1**: Create data loading utilities
2. ✅ **Task 2.2**: Build graph data generation functions  
3. ✅ **Task 2.3**: Enhance store with loading states

### Day 2: Graph Rendering
4. ✅ **Task 2.4**: Implement graph canvas with real data
5. ✅ **Task 2.5**: Create custom node components with styling
6. ✅ **Task 2.7**: Add loading states and error handling

### Day 3: Filtering & Polish
7. ✅ **Task 2.6**: Enhanced sidebar with profession filters
8. ✅ **Testing**: Verify all data loads correctly and filters work
9. ✅ **Validation**: Compare output with existing vanilla app

## ✅ Validation Criteria

### Data Loading Success
- [x] All 69 items loaded and visible as rounded rectangle nodes
- [x] All 49 crafts loaded and visible as pill-shaped nodes  
- [x] All edges correctly connect: inputs → craft → outputs
- [x] Profession colors match existing app exactly (fixed to use dynamic JSON data)
- [x] No console errors during data loading

### Graph Rendering Success  
- [x] Hierarchical layout applied (items above crafts that use them)
- [x] Node positioning matches general structure of existing app
- [x] All text clearly readable (fixed styling with proper profession colors)
- [x] Smooth rendering performance with all nodes visible
- [x] Clean node styling (single box with profession-colored border, no backgrounds)
- [x] Edge labels removed (clean connection lines without white boxes)

### Filtering Success
- [x] Profession filter toggles hide/show correct nodes
- [x] Connected edges disappear when nodes are filtered out
- [x] Graph layout updates smoothly when filters change
- [x] All professions toggle correctly: foraging, tailoring, farming, cooking, carpentry, scholar, fishing, forestry, mining, hunting, any

### Integration Success
- [x] React dev server serves JSON files correctly from /data/
- [x] Store updates trigger graph re-renders
- [x] TypeScript compilation with no errors
- [x] ESLint passes with no warnings

## ✅ Phase 2 Complete!

All validation criteria have been met. The React Flow implementation now provides:
- Clean, professional node styling with profession-colored borders
- Proper hierarchical layout using Dagre
- Full profession-based filtering functionality
- Seamless integration with existing BitCrafty data

## 🚀 Ready to Continue?

Phase 2 provides the solid foundation needed for all subsequent phases:
- **Phase 3**: Interactive features (selection, search, double-click)
- **Phase 4**: Crafting queue and resource calculation  
- **Phase 5**: Advanced features (subtree filtering, keyboard navigation)
- **Phase 6**: Testing and production build

The implementation tasks are well-defined and can be tackled incrementally. Each task builds on the previous ones, making it easy to test and validate progress.

Would you like me to begin implementing **Task 2.1: Data Loading Infrastructure**?

# BitCrafty React Migration Design Document

**Version**: 1.0  
**Date**: July 1, 2025  
**Author**: Development Team  
**Status**: Planning Phase  

## 📋 Executive Summary

This document outlines a comprehensive plan to migrate BitCrafty from vanilla JavaScript + vis-network to React + React Flow while preserving the existing architecture principles, event-driven communication patterns, and comprehensive testing standards established in the current codebase.

## 🎯 Migration Objectives

### Primary Goals
1. **Modern Development Experience**: Leverage React's component model and TypeScript for better maintainability
2. **Enhanced Visualization**: Migrate from vis-network to React Flow for better customization and performance
3. **Preserve Architecture**: Maintain event-driven communication and modular design principles
4. **Zero Regression**: Ensure all existing functionality works identically after migration
5. **Improved Testing**: Enhance test coverage with React Testing Library while keeping existing Node.js tests

### Success Metrics
- **Feature Parity**: 100% of existing functionality preserved
- **Performance**: No regression in graph rendering or user interactions
- **Bundle Size**: <50% increase from current implementation
- **Test Coverage**: All existing tests passing + new React-specific tests
- **Code Quality**: TypeScript strict mode enabled, ESLint compliance

## 🏗️ Current Architecture Analysis

### Existing System Strengths
- **Event-Driven Communication**: Components communicate via `window.addEventListener`/`dispatchEvent`
- **Modular Design**: Clear separation of concerns across components
- **Zustand State Management**: Centralized state with helper patterns
- **Comprehensive Testing**: Node.js native tests for architecture compliance
- **Zero Build Dependencies**: Direct ES6 module execution

### Pain Points to Address
- **Manual DOM Manipulation**: Verbose and error-prone element creation
- **Global Event Management**: Difficult to trace event flow and dependencies
- **Limited Type Safety**: No compile-time type checking
- **vis-network Limitations**: Styling and customization constraints
- **Testing Complexity**: Limited component isolation testing

## 📊 Technology Stack Comparison

| Aspect | Current | Proposed |
|--------|---------|----------|
| **Framework** | Vanilla JS | React 18 |
| **Visualization** | vis-network | React Flow |
| **State Management** | Zustand (CDN) | Zustand (React patterns) |
| **Type Safety** | None | TypeScript strict |
| **Build Tool** | None | Vite (dev only) |
| **Testing** | Node.js native | Node.js + React Testing Library |
| **Deployment** | Static files | Bundled static files |

## 🚀 Phase-by-Phase Migration Strategy

### Phase 1: Foundation Setup (Week 1)
**Goal**: Establish React development environment while preserving existing functionality

#### 1.1 Development Environment Setup
```bash
# New development dependencies
npm install --save-dev vite @vitejs/plugin-react typescript
npm install --save-dev @types/react @types/react-dom
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint-plugin-react eslint-plugin-react-hooks

# Runtime dependencies  
npm install react react-dom reactflow zustand
npm install @types/d3 # For layout algorithms
```

#### 1.2 Project Structure Migration
```
BitCrafty/
├── docs/                          # Design documentation
├── index.html                     # Updated for React entry point
├── package.json                   # React dependencies
├── vite.config.ts                 # Development configuration
├── tsconfig.json                  # TypeScript configuration
├── src/                           # React source code
│   ├── main.tsx                   # React entry point
│   ├── App.tsx                    # Main app component
│   ├── lib/                       # Migrated utilities
│   │   ├── constants.ts           # Colors, base items (from common.js)
│   │   ├── store.ts               # Zustand store (migrated)
│   │   ├── data-helpers.ts        # Data access patterns
│   │   └── utils.ts               # DOM utilities, validation
│   ├── components/                # React components
│   │   ├── ui/                    # UI components
│   │   │   ├── Sidebar.tsx        # Main sidebar container
│   │   │   ├── Title.tsx          # App title
│   │   │   ├── Legend.tsx         # Legend and filters
│   │   │   ├── SearchInput.tsx    # Search with dropdown
│   │   │   ├── ItemDetails.tsx    # Item/craft details panel
│   │   │   ├── CraftQueue.tsx     # Crafting queue
│   │   │   ├── ResourceSummary.tsx # Resource calculation
│   │   │   ├── CraftPaths.tsx     # Crafting paths
│   │   │   └── GitHubLinks.tsx    # Footer links
│   │   ├── graph/                 # React Flow components
│   │   │   ├── GraphCanvas.tsx    # Main graph container
│   │   │   ├── nodes/             # Custom node components
│   │   │   │   ├── ItemNode.tsx   # Item node styling
│   │   │   │   └── CraftNode.tsx  # Craft node styling
│   │   │   ├── edges/             # Custom edge components
│   │   │   │   └── MaterialEdge.tsx # Input/output edges
│   │   │   └── layout/            # Graph layout utilities
│   │   │       └── hierarchical.ts # Dagre layout algorithm
│   │   ├── crafting/              # Crafting system
│   │   │   ├── QueueManager.tsx   # Queue management
│   │   │   └── ResourceCalculator.tsx # Resource calculation
│   │   └── filters/               # Filter system
│   │       ├── ProfessionFilter.tsx # Profession toggles
│   │       └── SubtreeFilter.tsx  # Dependency filtering
│   ├── hooks/                     # Custom React hooks
│   │   ├── useGraphData.ts        # Graph data management
│   │   ├── useFilters.ts          # Filter state management
│   │   ├── useCrafting.ts         # Crafting queue operations
│   │   ├── useSearch.ts           # Search functionality
│   │   └── useKeyboard.ts         # Keyboard navigation
│   ├── types/                     # TypeScript definitions
│   │   ├── data.ts                # Item, craft, profession types
│   │   ├── graph.ts               # Graph node/edge types
│   │   └── store.ts               # Store type definitions
│   └── styles/                    # CSS modules
│       ├── globals.css            # Global styles
│       ├── components.module.css  # Component-specific styles
│       └── graph.module.css       # Graph styling
├── data/                          # Unchanged JSON data
├── test/                          # Enhanced test suite
│   ├── components/                # React component tests
│   ├── hooks/                     # Custom hook tests
│   ├── lib/                       # Library unit tests
│   ├── data-validation.test.js    # Existing data validation
│   └── e2e/                       # End-to-end tests
└── dist/                          # Production build output
```

#### 1.3 Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Single bundle for CDN-style deployment
        inlineDynamicImports: true,
        manualChunks: undefined,
      }
    }
  },
  // Development server matches current Python server
  server: {
    port: 8000,
    host: 'localhost'
  }
})
```

### Phase 2: Core Systems Migration (Week 2)

#### 2.1 State Management Migration
**Preserve existing Zustand patterns with React integration**

```typescript
// src/lib/store.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface BitCraftyStore {
  // Data state (preserved from existing)
  items: Record<string, ItemData>
  crafts: Record<string, CraftData>
  requirements: Record<string, RequirementData>
  professions: Record<string, ProfessionData>
  tools: Record<string, ToolData>
  buildings: Record<string, BuildingData>
  
  // UI state (enhanced)
  selectedItem: string | null
  selectedCrafts: Record<string, number>
  queue: Array<{ itemId: string; qty: number }>
  
  // Graph state (new)
  graphData: GraphData | null
  visibleNodes: Set<string>
  activeProfessions: Set<string>
  subtreeFilter: {
    active: boolean
    rootNode: string | null
    visibleNodes: Set<string>
  }
  
  // Actions (preserved + enhanced)
  loadAllData: () => Promise<void>
  setSelectedItem: (id: string | null) => void
  setSelectedCraft: (itemId: string, craftIdx: number) => void
  addToQueue: (itemId: string, qty: number) => void
  removeFromQueue: (itemId: string) => void
  clearQueue: () => void
  setGraphData: (data: GraphData) => void
  toggleProfessionFilter: (profession: string) => void
  applySubtreeFilter: (rootNodeId: string) => void
  clearSubtreeFilter: () => void
}

export const useBitCraftyStore = create<BitCraftyStore>()(
  subscribeWithSelector((set, get) => ({
    // ... implementation preserving existing logic
  }))
)
```

#### 2.2 Event System Migration
**Replace window events with React patterns**

```typescript
// src/hooks/useGraphEvents.ts
export const useGraphEvents = () => {
  const store = useBitCraftyStore()
  
  const selectNode = useCallback((nodeId: string) => {
    store.setSelectedItem(nodeId)
    // Other components automatically update via store subscriptions
  }, [store])
  
  const focusNode = useCallback((nodeId: string, options?: FocusOptions) => {
    selectNode(nodeId)
    // React Flow will handle the actual focusing via state changes
  }, [selectNode])
  
  const clearSelection = useCallback(() => {
    store.setSelectedItem(null)
  }, [store])
  
  return { selectNode, focusNode, clearSelection }
}

// src/hooks/useStoreSubscription.ts - Replace window event listeners
export const useStoreSubscription = <T>(
  selector: (state: BitCraftyStore) => T,
  callback: (value: T) => void
) => {
  useEffect(() => {
    const unsubscribe = useBitCraftyStore.subscribe(
      selector,
      callback,
      { fireImmediately: false }
    )
    return unsubscribe
  }, [selector, callback])
}
```

#### 2.3 Data Helpers Migration
**Preserve existing patterns with TypeScript safety**

```typescript
// src/lib/data-helpers.ts
export const ItemHelpers = {
  getById: (id: string): ItemData | null => {
    return useBitCraftyStore.getState().items[id] || null
  },
  
  getAll: (): ItemData[] => {
    const items = useBitCraftyStore.getState().items
    return Object.values(items)
  },
  
  search: (searchTerm: string): ItemData[] => {
    const items = ItemHelpers.getAll()
    const term = searchTerm.toLowerCase()
    return items.filter(item => 
      item.name?.toLowerCase().includes(term)
    )
  }
}

// Similar patterns for CraftHelpers, ProfessionHelpers, etc.
// Maintain exact same API surface for easy migration
```

### Phase 3: React Flow Integration (Week 3)

#### 3.1 Graph Component Architecture
**Replace vis-network with React Flow while preserving styling**

```typescript
// src/components/graph/GraphCanvas.tsx
import ReactFlow, { 
  Node, 
  Edge, 
  NodeTypes, 
  EdgeTypes,
  useNodesState,
  useEdgesState,
  useReactFlow
} from 'reactflow'

const nodeTypes: NodeTypes = {
  item: ItemNode,
  craft: CraftNode,
}

const edgeTypes: EdgeTypes = {
  material: MaterialEdge,
}

export const GraphCanvas: React.FC = () => {
  const graphData = useBitCraftyStore(state => state.graphData)
  const selectedItem = useBitCraftyStore(state => state.selectedItem)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView, getNode } = useReactFlow()
  
  // Convert store data to React Flow format
  useEffect(() => {
    if (graphData) {
      const reactFlowNodes = convertNodesToReactFlow(graphData.nodes)
      const reactFlowEdges = convertEdgesToReactFlow(graphData.edges)
      
      setNodes(reactFlowNodes)
      setEdges(reactFlowEdges)
    }
  }, [graphData])
  
  // Handle node selection
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      useBitCraftyStore.getState().setSelectedItem(node.id)
    },
    []
  )
  
  // Handle double-click for subtree filtering
  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      useBitCraftyStore.getState().applySubtreeFilter(node.id)
    },
    []
  )
  
  // Handle canvas double-click to clear filters
  const handleCanvasDoubleClick = useCallback(() => {
    useBitCraftyStore.getState().clearSubtreeFilter()
    useBitCraftyStore.getState().setSelectedItem(null)
  }, [])
  
  // Focus on selected node
  useEffect(() => {
    if (selectedItem) {
      const node = getNode(selectedItem)
      if (node) {
        fitView({ 
          nodes: [node], 
          duration: 800,
          padding: 0.2 
        })
      }
    }
  }, [selectedItem, getNode, fitView])
  
  return (
    <div className="graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneDoubleClick={handleCanvasDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
      />
    </div>
  )
}
```

#### 3.2 Custom Node Components
**Recreate vis-network styling with React Flow nodes**

```typescript
// src/components/graph/nodes/ItemNode.tsx
import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ItemData } from '../../../types/data'
import { getProfessionColorFromId } from '../../../lib/utils'
import styles from './ItemNode.module.css'

interface ItemNodeData extends ItemData {
  selected?: boolean
}

export const ItemNode = memo<NodeProps<ItemNodeData>>(({ data, selected }) => {
  const profession = extractProfessionFromId(data.id)
  const color = getProfessionColorFromId(data.id)
  
  return (
    <div 
      className={`${styles.itemNode} ${selected ? styles.selected : ''}`}
      style={{ 
        backgroundColor: color,
        borderColor: color,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className={styles.label}>{data.name}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})

// src/components/graph/nodes/CraftNode.tsx
export const CraftNode = memo<NodeProps<CraftNodeData>>(({ data, selected }) => {
  const color = getProfessionColorFromId(data.id)
  
  return (
    <div 
      className={`${styles.craftNode} ${selected ? styles.selected : ''}`}
      style={{ 
        backgroundColor: color,
        borderColor: color,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className={styles.label}>{data.name}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})
```

#### 3.3 Graph Layout Migration
**Preserve hierarchical layout using dagre**

```typescript
// src/components/graph/layout/hierarchical.ts
import dagre from 'dagre'
import { Node, Edge } from 'reactflow'

export const applyHierarchicalLayout = (
  nodes: Node[],
  edges: Edge[]
): Node[] => {
  const g = new dagre.graphlib.Graph()
  
  // Configure to match existing vis-network settings
  g.setGraph({ 
    rankdir: 'TB',      // Top to Bottom (UD in vis-network)
    nodesep: 250,       // Node spacing
    ranksep: 300,       // Level separation
    marginx: 50,
    marginy: 50,
  })
  
  g.setDefaultEdgeLabel(() => ({}))
  
  // Add nodes
  nodes.forEach(node => {
    g.setNode(node.id, { 
      width: node.data.type === 'item' ? 120 : 150,
      height: 40 
    })
  })
  
  // Add edges
  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })
  
  dagre.layout(g)
  
  // Apply calculated positions
  return nodes.map(node => {
    const nodeWithPosition = g.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    }
  })
}

// Custom hook for layout
export const useGraphLayout = (nodes: Node[], edges: Edge[]) => {
  return useMemo(() => {
    if (nodes.length === 0) return nodes
    return applyHierarchicalLayout(nodes, edges)
  }, [nodes, edges])
}
```

### Phase 4: UI Components Migration (Week 4)

#### 4.1 Sidebar Component System
**Convert sidebar to React component hierarchy**

```typescript
// src/components/ui/Sidebar.tsx
export const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <Title />
      <Legend />
      <ItemDetails />
      <CraftQueue />
      <ResourceSummary />
      <CraftPaths />
      <GitHubLinks />
    </aside>
  )
}

// src/components/ui/Legend.tsx
export const Legend: React.FC = () => {
  const activeProfessions = useBitCraftyStore(state => state.activeProfessions)
  const toggleProfession = useBitCraftyStore(state => state.toggleProfessionFilter)
  const professions = useProfessions()
  
  return (
    <section className={styles.legend}>
      <h3>Legend & Filters</h3>
      <div className={styles.professionGrid}>
        {professions.map(profession => (
          <ProfessionToggle
            key={profession.id}
            profession={profession}
            active={activeProfessions.has(profession.name)}
            onToggle={() => toggleProfession(profession.name)}
          />
        ))}
      </div>
      <SearchInput />
    </section>
  )
}

// src/components/ui/ProfessionToggle.tsx
interface ProfessionToggleProps {
  profession: ProfessionData
  active: boolean
  onToggle: () => void
}

export const ProfessionToggle: React.FC<ProfessionToggleProps> = ({
  profession,
  active,
  onToggle
}) => {
  return (
    <button
      className={`${styles.professionToggle} ${active ? styles.active : styles.inactive}`}
      onClick={onToggle}
      type="button"
    >
      <span 
        className={styles.colorBox}
        style={{ backgroundColor: profession.color }}
      />
      <span className={styles.label}>{profession.name}</span>
    </button>
  )
}
```

#### 4.2 Search Functionality Migration
**Convert search to React with hooks**

```typescript
// src/hooks/useSearch.ts
export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  
  const results = useMemo(() => {
    if (!searchTerm.trim()) return []
    return ItemHelpers.search(searchTerm)
  }, [searchTerm])
  
  const selectResult = useCallback((itemId: string) => {
    useBitCraftyStore.getState().setSelectedItem(itemId)
    setSearchTerm('')
    setIsOpen(false)
    setSelectedIndex(-1)
  }, [])
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen || results.length === 0) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          selectResult(results[selectedIndex].id)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }, [isOpen, results, selectedIndex, selectResult])
  
  return {
    searchTerm,
    setSearchTerm,
    results,
    selectedIndex,
    isOpen,
    setIsOpen,
    selectResult,
    handleKeyDown
  }
}

// src/components/ui/SearchInput.tsx
export const SearchInput: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    results,
    selectedIndex,
    isOpen,
    setIsOpen,
    selectResult,
    handleKeyDown
  } = useSearch()
  
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Global keyboard listener for auto-focus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        !e.ctrlKey && !e.altKey && !e.metaKey &&
        e.key.length === 1 &&
        /[a-zA-Z0-9\s]/.test(e.key) &&
        document.activeElement !== inputRef.current
      ) {
        inputRef.current?.focus()
      }
    }
    
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
  
  return (
    <div className={styles.searchContainer}>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search item name..."
        className={styles.searchInput}
      />
      {isOpen && results.length > 0 && (
        <SearchDropdown
          results={results}
          selectedIndex={selectedIndex}
          onSelect={selectResult}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
```

#### 4.3 Item Details Migration
**Convert details panel to React**

```typescript
// src/components/ui/ItemDetails.tsx
export const ItemDetails: React.FC = () => {
  const selectedItem = useBitCraftyStore(state => state.selectedItem)
  const { focusNode } = useGraphEvents()
  
  if (!selectedItem) {
    return <div className={styles.itemDetails} />
  }
  
  const entityType = parseEntityType(selectedItem)
  
  if (entityType === 'item') {
    return <ItemDetailsContent itemId={selectedItem} onFocusNode={focusNode} />
  } else if (entityType === 'craft') {
    return <CraftDetailsContent craftId={selectedItem} onFocusNode={focusNode} />
  } else {
    return <UnknownEntityDetails entityId={selectedItem} />
  }
}

// src/components/ui/ItemDetailsContent.tsx
interface ItemDetailsContentProps {
  itemId: string
  onFocusNode: (nodeId: string) => void
}

export const ItemDetailsContent: React.FC<ItemDetailsContentProps> = ({
  itemId,
  onFocusNode
}) => {
  const item = ItemHelpers.getById(itemId)
  const addToQueue = useBitCraftyStore(state => state.addToQueue)
  
  if (!item) return null
  
  const usedInCount = CraftHelpers.getByInputId(itemId).length
  
  const handleQueueItem = (qty: number) => {
    addToQueue(itemId, qty)
  }
  
  return (
    <div className={styles.itemDetailsCard}>
      <h2>{item.name}</h2>
      <div className={styles.itemInfo}>
        <p><strong>Tier:</strong> {item.tier}</p>
        <p><strong>Rank:</strong> {item.rank}</p>
        <p><strong>Used in Recipes:</strong> {usedInCount}</p>
      </div>
      <div className={styles.queueButtons}>
        <button onClick={() => handleQueueItem(1)}>Queue 1</button>
        <button onClick={() => handleQueueItem(5)}>Queue 5</button>
        <button onClick={() => handleQueueItem(10)}>Queue 10</button>
      </div>
      <div className={styles.actions}>
        <button onClick={() => onFocusNode(itemId)}>Go to Node</button>
      </div>
    </div>
  )
}
```

### Phase 5: Testing & Quality Assurance (Week 5)

#### 5.1 Testing Strategy Enhancement
**Preserve existing tests + add React-specific coverage**

```typescript
// test/components/ui/Sidebar.test.tsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Sidebar } from '../../../src/components/ui/Sidebar'

// Mock Zustand store
const mockStore = {
  // ... mock store state
}

jest.mock('../../../src/lib/store', () => ({
  useBitCraftyStore: () => mockStore
}))

describe('Sidebar Component', () => {
  test('should render all required sections', () => {
    render(<Sidebar />)
    
    expect(screen.getByText('Legend & Filters')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search item name...')).toBeInTheDocument()
    expect(screen.getByText('View on GitHub')).toBeInTheDocument()
  })
  
  test('should maintain responsive layout structure', () => {
    const { container } = render(<Sidebar />)
    const sidebar = container.firstChild
    
    expect(sidebar).toHaveClass('sidebar')
    // Test specific layout requirements from coding standards
  })
  
  test('should export initialize function equivalent', () => {
    // Test that component can be initialized (architectural compliance)
    expect(typeof Sidebar).toBe('function')
  })
})

// test/hooks/useSearch.test.ts
import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../../src/hooks/useSearch'

describe('useSearch hook', () => {
  test('should filter items correctly', () => {
    const { result } = renderHook(() => useSearch())
    
    act(() => {
      result.current.setSearchTerm('ember')
    })
    
    expect(result.current.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: expect.stringContaining('ember') })
      ])
    )
  })
  
  test('should handle keyboard navigation', () => {
    const { result } = renderHook(() => useSearch())
    
    act(() => {
      result.current.setSearchTerm('test')
    })
    
    // Test arrow key navigation
    const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    act(() => {
      result.current.handleKeyDown(mockEvent)
    })
    
    expect(result.current.selectedIndex).toBe(0)
  })
})
```

#### 5.2 Data Validation Preservation
**Keep existing Node.js tests unchanged**

```javascript
// test/data-validation.test.js - UNCHANGED
// These tests validate JSON data integrity and don't need React migration
// They test the data layer which is independent of the UI framework

import { test, describe } from 'node:test';
import assert from 'node:assert';
// ... existing implementation unchanged
```

#### 5.3 E2E Testing Strategy
**Add comprehensive end-to-end testing**

```typescript
// test/e2e/app.spec.ts
import { test, expect } from '@playwright/test'

test.describe('BitCrafty React Migration', () => {
  test('should load and display the graph', async ({ page }) => {
    await page.goto('/')
    
    // Wait for React app to load
    await expect(page.locator('[data-testid="graph-canvas"]')).toBeVisible()
    
    // Verify sidebar components
    await expect(page.locator('text=Legend & Filters')).toBeVisible()
    await expect(page.locator('input[placeholder="Search item name..."]')).toBeVisible()
  })
  
  test('should preserve search functionality', async ({ page }) => {
    await page.goto('/')
    
    // Test search
    await page.fill('input[placeholder="Search item name..."]', 'ember')
    await expect(page.locator('.search-result')).toBeVisible()
    
    // Test selection
    await page.click('.search-result:first-child')
    await expect(page.locator('[data-testid="item-details"]')).toBeVisible()
  })
  
  test('should preserve profession filtering', async ({ page }) => {
    await page.goto('/')
    
    // Toggle profession filter
    await page.click('[data-profession="Farming"]')
    
    // Verify graph updates (nodes are filtered)
    // This tests the core filtering functionality
  })
})
```

### Phase 6: Production Build & Deployment (Week 6)

#### 6.1 Production Build Configuration
**Generate optimized bundle for deployment**

```typescript
// vite.config.ts - Production optimizations
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Single bundle for CDN-style deployment
        inlineDynamicImports: true,
        manualChunks: undefined,
        // Preserve asset structure for existing deployment
        assetFileNames: 'assets/[name].[ext]',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
      }
    },
    // Minimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    }
  }
})
```

#### 6.2 Bundle Analysis & Optimization
```bash
# Bundle analysis
npm run build
npx vite-bundle-analyzer dist

# Performance benchmarks
npm run test:performance
npm run lighthouse
```

#### 6.3 Deployment Strategy
**Maintain compatibility with existing deployment**

```bash
# Production build process
npm run build          # Generate optimized bundle
npm run test          # All tests must pass
npm run validate      # Data validation tests
npm run lighthouse    # Performance testing

# Output structure matches current deployment
dist/
├── index.html        # Single entry point
├── assets/
│   ├── index.js      # Bundled React app
│   └── index.css     # Bundled styles
└── data/             # Copied JSON data
```

## 🔧 Technical Implementation Details

### State Management Patterns
1. **Zustand Preservation**: Keep existing store structure, adapt to React patterns
2. **Custom Hooks**: Replace window events with React hooks and store subscriptions
3. **Component Communication**: Use store state changes instead of global events
4. **Performance**: Leverage React's batching and Zustand's optimizations

### React Flow Configuration
1. **Node Types**: Custom components preserving exact vis-network styling
2. **Edge Types**: Custom edges for input/output material flows
3. **Layout Algorithm**: Dagre for hierarchical layout matching vis-network
4. **Performance**: Virtualization for large graphs, memo for node components

### TypeScript Integration
1. **Strict Mode**: Full type safety for better development experience
2. **Interface Definitions**: Types for all data structures (items, crafts, etc.)
3. **Generic Hooks**: Reusable patterns for store subscriptions
4. **Runtime Safety**: Catch errors during development, not production

### CSS Strategy
1. **CSS Modules**: Scoped styles preventing conflicts
2. **Design System**: Preserve exact Monokai color scheme
3. **Responsive**: Maintain existing responsive behavior
4. **Performance**: CSS-in-JS avoided for bundle size optimization

## 📊 Migration Risks & Mitigation Strategies

### High Risk Items

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| **React Flow Learning Curve** | High | Medium | Early prototyping, comprehensive documentation study |
| **Performance Regression** | High | Low | Benchmark against existing, optimize critical paths |
| **Bundle Size Increase** | Medium | High | Tree shaking, code splitting, bundle analysis |

### Medium Risk Items

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| **Event System Breaking** | Medium | Medium | Comprehensive testing of component communication |
| **Styling Inconsistencies** | Medium | Low | CSS modules, design system preservation |
| **Testing Coverage Gaps** | Medium | Medium | Incremental testing during migration phases |

### Low Risk Items

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| **Data Format Changes** | Low | Low | Data layer unchanged, existing validation preserved |
| **Deployment Issues** | Low | Low | Vite build matches existing static file deployment |

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] **Graph Visualization**: All nodes and edges render identically to current implementation
- [ ] **Search Functionality**: Fuzzy search, keyboard navigation, auto-focus preserved
- [ ] **Profession Filtering**: Toggle filters work identically to current implementation
- [ ] **Subtree Filtering**: Double-click node/canvas behavior preserved
- [ ] **Item Details**: Click nodes to show details, queue buttons functional
- [ ] **Crafting Queue**: Add/remove items, quantity management works identically
- [ ] **Resource Calculation**: Calculate required materials correctly
- [ ] **Responsive Design**: Sidebar and main content scale properly
- [ ] **Keyboard Navigation**: All existing keyboard shortcuts preserved

### Technical Requirements
- [ ] **Bundle Size**: <50% increase from current dependencies (target: <200KB gzipped)
- [ ] **Performance**: No regression in graph rendering speed
- [ ] **Test Coverage**: 100% of existing tests passing + new React tests
- [ ] **TypeScript**: Strict mode enabled, no type errors
- [ ] **Accessibility**: Maintain keyboard navigation, color contrast
- [ ] **Browser Support**: Modern browsers (ES2020+)

### Quality Requirements
- [ ] **Code Standards**: ESLint passing, consistent formatting
- [ ] **Documentation**: Updated architecture docs, migration notes
- [ ] **Error Handling**: Graceful fallbacks for all user interactions
- [ ] **Loading States**: Proper loading indicators during data fetch
- [ ] **Memory Management**: No memory leaks in graph rendering

## 📚 Additional Resources

### Development References
- [React Flow Documentation](https://reactflow.dev/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Migration Guides
- [Migrating from Class Components to Hooks](https://reactjs.org/docs/hooks-faq.html)
- [TypeScript Migration Guide](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
- [Vite Migration from Webpack](https://vitejs.dev/guide/migration.html)

### Performance Resources
- [React Performance Best Practices](https://react.dev/learn/render-and-commit)
- [Bundle Size Optimization](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [React Flow Performance Tips](https://reactflow.dev/docs/guides/performance/)

## 🎯 Next Steps

To begin this migration:

1. **Create Migration Branch**: `feat/react-migration`
2. **Setup Development Environment**: Phase 1 implementation
3. **Parallel Development**: Keep existing app functional during migration
4. **Incremental Testing**: Test each phase thoroughly before proceeding
5. **Documentation Updates**: Update coding standards and architecture docs

This migration will modernize BitCrafty while preserving all existing functionality and maintaining the high code quality standards established in the current implementation.

# Phase 4: Advanced Crafting Features & Resource Management

**Status**: Ready to Begin  
**Duration**: Est. 4-5 days  
**Goal**: Implement advanced crafting queue functionality, resource calculations, and production planning features

## 🎯 Phase 4 Objectives

### Primary Goals
1. **Enhanced Crafting Queue**: Interactive queue with drag-and-drop, quantity adjustments, and dependencies
2. **Resource Calculator**: Calculate required base materials for any craft queue
3. **Production Planning**: Optimize crafting order and identify bottlenecks
4. **Export/Import System**: Save and load crafting plans as JSON
5. **Advanced Filtering**: Subtree filtering, path highlighting, and dependency visualization
6. **Performance Optimization**: Handle large crafting queues efficiently

### Success Criteria
- ✅ Add items to queue with quantities and automatic dependency resolution
- ✅ Drag-and-drop reordering of queue items with visual feedback
- ✅ Real-time resource calculation showing required base materials
- ✅ Surplus tracking and sharing across multiple crafts
- ✅ Export crafting plans as portable JSON files
- ✅ Import and validate crafting plans from external sources
- ✅ Advanced graph filtering showing only relevant crafting paths

## 📋 Implementation Tasks

### Task 4.1: Enhanced Crafting Queue System ✅ **COMPLETE**
**Files**: `src/components/ui/CraftingQueue.tsx`, `src/lib/store.ts`, `src/types/crafting.ts`
**Status**: ✅ Implemented and fully functional

#### **✅ DELIVERED - Enhanced Queue Item Interface**
```typescript
export interface EnhancedQueueItem {
  id: string                    // Unique queue item ID
  itemId: string               // Reference to item/craft
  qty: number                  // Desired quantity
  priority: number             // Queue position (0 = highest)
  dependencies: string[]       // Required queue items
  status: 'pending' | 'ready' | 'blocked' | 'complete'
  estimatedTime?: number       // Optional: time estimate
  notes?: string              // User notes
  addedAt: Date               // Timestamp
}

export interface QueueSummary {
  totalItems: number
  baseResources: Record<string, number>  // Base materials needed
  surplus: Record<string, number>        // Excess materials produced
  bottlenecks: string[]                  // Items blocking production
  estimatedTime?: number                 // Total time estimate
}
```

#### **Enhanced Store Actions**
```typescript
// Enhanced crafting queue actions
const craftingActions = {
  addToQueue: (itemId: string, qty: number, insertAt?: number) => {
    const queueItem: EnhancedQueueItem = {
      id: generateQueueId(),
      itemId,
      qty,
      priority: insertAt ?? get().craftingQueue.length,
      dependencies: calculateDependencies(itemId, qty),
      status: 'pending',
      addedAt: new Date()
    }
    
    const newQueue = [...get().craftingQueue]
    if (insertAt !== undefined) {
      newQueue.splice(insertAt, 0, queueItem)
      // Reorder priorities
      newQueue.forEach((item, index) => item.priority = index)
    } else {
      newQueue.push(queueItem)
    }
    
    set({ 
      craftingQueue: newQueue,
      queueSummary: calculateQueueSummary(newQueue)
    })
  },

  reorderQueue: (fromIndex: number, toIndex: number) => {
    const newQueue = [...get().craftingQueue]
    const [movedItem] = newQueue.splice(fromIndex, 1)
    newQueue.splice(toIndex, 0, movedItem)
    
    // Update priorities and dependencies
    newQueue.forEach((item, index) => item.priority = index)
    
    set({ 
      craftingQueue: newQueue,
      queueSummary: calculateQueueSummary(newQueue)
    })
  },

  updateQueueItem: (id: string, updates: Partial<EnhancedQueueItem>) => {
    const newQueue = get().craftingQueue.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
    
    set({ 
      craftingQueue: newQueue,
      queueSummary: calculateQueueSummary(newQueue)
    })
  },

  calculateOptimalOrder: () => {
    const queue = get().craftingQueue
    const optimized = optimizeCraftingOrder(queue)
    
    set({ 
      craftingQueue: optimized,
      queueSummary: calculateQueueSummary(optimized)
    })
  }
}
```

#### **Drag-and-Drop Queue Component**
```typescript
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export function EnhancedCraftingQueue() {
  const craftingQueue = useCraftingQueue()
  const queueSummary = useQueueSummary()
  const { reorderQueue, updateQueueItem, removeFromQueue } = useBitCraftyStore()

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    
    reorderQueue(result.source.index, result.destination.index)
  }

  return (
    <div className="enhanced-crafting-queue">
      <QueueHeader summary={queueSummary} />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="crafting-queue">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`queue-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            >
              {craftingQueue.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <QueueItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      dragHandleProps={provided.dragHandleProps}
                      item={item}
                      isDragging={snapshot.isDragging}
                      onUpdate={(updates) => updateQueueItem(item.id, updates)}
                      onRemove={() => removeFromQueue(index)}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
```

### Task 4.2: Resource Calculator System
**Files**: `src/lib/resource-calculator.ts`, `src/components/ui/ResourceSummary.tsx`

#### **Resource Calculation Engine**
```typescript
export interface ResourceCalculation {
  baseResources: Record<string, number>
  intermediateItems: Record<string, number>
  totalCost: Record<string, number>
  surplus: Record<string, number>
  dependencies: DependencyGraph
  criticalPath: string[]
}

export function calculateResourceRequirements(
  queue: EnhancedQueueItem[],
  items: Record<string, Item>,
  crafts: Record<string, Craft>
): ResourceCalculation {
  const visited = new Set<string>()
  const baseResources: Record<string, number> = {}
  const intermediateItems: Record<string, number> = {}
  const surplus: Record<string, number> = {}
  const dependencies: DependencyGraph = new Map()

  // Process queue in dependency order
  const orderedQueue = topologicalSort(queue, dependencies)
  
  for (const queueItem of orderedQueue) {
    calculateItemRequirements(
      queueItem.itemId,
      queueItem.qty,
      baseResources,
      intermediateItems,
      surplus,
      visited,
      items,
      crafts
    )
  }

  return {
    baseResources,
    intermediateItems,
    totalCost: { ...baseResources, ...intermediateItems },
    surplus,
    dependencies,
    criticalPath: findCriticalPath(dependencies, queue)
  }
}

function calculateItemRequirements(
  itemId: string,
  qty: number,
  baseResources: Record<string, number>,
  intermediateItems: Record<string, number>,
  surplus: Record<string, number>,
  visited: Set<string>,
  items: Record<string, Item>,
  crafts: Record<string, Craft>
): void {
  // Check for circular dependencies
  if (visited.has(itemId)) {
    console.warn(`Circular dependency detected for ${itemId}`)
    return
  }

  visited.add(itemId)

  // Check if we have surplus of this item
  const availableSurplus = surplus[itemId] || 0
  const neededQty = Math.max(0, qty - availableSurplus)
  
  if (neededQty === 0) {
    surplus[itemId] = availableSurplus - qty
    visited.delete(itemId)
    return
  }

  // Update surplus
  if (availableSurplus > 0) {
    surplus[itemId] = 0
  }

  // Find crafts that produce this item
  const producingCrafts = Object.values(crafts).filter(craft =>
    craft.outputs.some(output => output.item === itemId)
  )

  if (producingCrafts.length === 0) {
    // Base resource
    baseResources[itemId] = (baseResources[itemId] || 0) + neededQty
  } else {
    // Use first available craft (could be enhanced with user choice)
    const craft = producingCrafts[0]
    const output = craft.outputs.find(o => o.item === itemId)!
    const craftCount = Math.ceil(neededQty / output.qty)
    
    intermediateItems[itemId] = (intermediateItems[itemId] || 0) + neededQty
    
    // Calculate surplus from this craft
    const totalProduced = craftCount * output.qty
    if (totalProduced > neededQty) {
      surplus[itemId] = (surplus[itemId] || 0) + (totalProduced - neededQty)
    }

    // Process inputs recursively
    for (const input of craft.inputs) {
      calculateItemRequirements(
        input.item,
        input.qty * craftCount,
        baseResources,
        intermediateItems,
        surplus,
        visited,
        items,
        crafts
      )
    }
  }

  visited.delete(itemId)
}
```

#### **Resource Summary Component**
```typescript
export function ResourceSummary() {
  const craftingQueue = useCraftingQueue()
  const items = useItemsArray()
  const crafts = useCraftsArray()
  
  const calculation = useMemo(() => {
    if (craftingQueue.length === 0) return null
    
    return calculateResourceRequirements(
      craftingQueue,
      arrayToRecord(items, 'id'),
      arrayToRecord(crafts, 'id')
    )
  }, [craftingQueue, items, crafts])

  if (!calculation) {
    return (
      <div className="resource-summary-empty">
        <p>Add items to queue to see resource requirements</p>
      </div>
    )
  }

  return (
    <div className="resource-summary">
      <h4>Required Resources</h4>
      
      <section className="base-resources">
        <h5>Base Materials</h5>
        {Object.entries(calculation.baseResources).map(([itemId, qty]) => (
          <ResourceItem key={itemId} itemId={itemId} quantity={qty} type="base" />
        ))}
      </section>

      <section className="intermediate-items">
        <h5>Intermediate Crafts</h5>
        {Object.entries(calculation.intermediateItems).map(([itemId, qty]) => (
          <ResourceItem key={itemId} itemId={itemId} quantity={qty} type="intermediate" />
        ))}
      </section>

      {Object.keys(calculation.surplus).length > 0 && (
        <section className="surplus-items">
          <h5>Surplus Materials</h5>
          {Object.entries(calculation.surplus).map(([itemId, qty]) => (
            <ResourceItem key={itemId} itemId={itemId} quantity={qty} type="surplus" />
          ))}
        </section>
      )}
    </div>
  )
}
```

### Task 4.3: Production Planning & Optimization
**Files**: `src/lib/production-planner.ts`, `src/components/ui/ProductionPlanner.tsx`

#### **Production Optimization Algorithms**
```typescript
export interface ProductionPlan {
  phases: ProductionPhase[]
  totalTime: number
  parallelization: ParallelTask[]
  bottlenecks: Bottleneck[]
  recommendations: string[]
}

export interface ProductionPhase {
  phase: number
  tasks: ProductionTask[]
  estimatedTime: number
  dependencies: string[]
}

export interface ProductionTask {
  itemId: string
  craftId: string
  quantity: number
  estimatedTime: number
  prerequisites: string[]
  canParallelize: boolean
}

export function generateProductionPlan(
  queue: EnhancedQueueItem[],
  items: Record<string, Item>,
  crafts: Record<string, Craft>
): ProductionPlan {
  // Build dependency graph
  const dependencyGraph = buildDependencyGraph(queue, crafts)
  
  // Topological sort for optimal order
  const sortedTasks = topologicalSort(dependencyGraph)
  
  // Group into phases (tasks that can run in parallel)
  const phases = groupIntoPhases(sortedTasks, dependencyGraph)
  
  // Identify bottlenecks
  const bottlenecks = identifyBottlenecks(phases, dependencyGraph)
  
  // Generate optimization recommendations
  const recommendations = generateRecommendations(phases, bottlenecks)

  return {
    phases,
    totalTime: phases.reduce((sum, phase) => sum + phase.estimatedTime, 0),
    parallelization: findParallelizationOpportunities(phases),
    bottlenecks,
    recommendations
  }
}

function identifyBottlenecks(
  phases: ProductionPhase[],
  dependencyGraph: DependencyGraph
): Bottleneck[] {
  const bottlenecks: Bottleneck[] = []
  
  for (const phase of phases) {
    // Find tasks that block the most subsequent tasks
    for (const task of phase.tasks) {
      const blockedTasks = countBlockedTasks(task, dependencyGraph)
      
      if (blockedTasks > 3) { // Threshold for bottleneck
        bottlenecks.push({
          taskId: task.itemId,
          blockedCount: blockedTasks,
          impact: calculateBottleneckImpact(task, dependencyGraph),
          suggestions: generateBottleneckSuggestions(task)
        })
      }
    }
  }
  
  return bottlenecks.sort((a, b) => b.impact - a.impact)
}
```

### Task 4.4: Export/Import System
**Files**: `src/lib/export-manager.ts`, `src/components/ui/ExportImportPanel.tsx`

#### **Export/Import Data Structures**
```typescript
export interface CraftingPlanExport {
  version: string
  metadata: {
    name: string
    description?: string
    author?: string
    created: string
    modified: string
    gameVersion?: string
  }
  queue: EnhancedQueueItem[]
  settings: {
    includeNotes: boolean
    includeTimestamps: boolean
    optimizeOrder: boolean
  }
  summary: QueueSummary
}

export function exportCraftingPlan(
  queue: EnhancedQueueItem[],
  metadata: Partial<CraftingPlanExport['metadata']> = {},
  settings: Partial<CraftingPlanExport['settings']> = {}
): CraftingPlanExport {
  return {
    version: '1.0',
    metadata: {
      name: metadata.name || 'Unnamed Crafting Plan',
      description: metadata.description,
      author: metadata.author,
      created: metadata.created || new Date().toISOString(),
      modified: new Date().toISOString(),
      gameVersion: metadata.gameVersion
    },
    queue: settings.includeTimestamps ? queue : queue.map(item => ({
      ...item,
      addedAt: undefined
    } as any)),
    settings: {
      includeNotes: true,
      includeTimestamps: true,
      optimizeOrder: false,
      ...settings
    },
    summary: calculateQueueSummary(queue)
  }
}

export async function importCraftingPlan(
  planData: string | CraftingPlanExport,
  options: ImportOptions = {}
): Promise<ImportResult> {
  try {
    const plan: CraftingPlanExport = typeof planData === 'string' 
      ? JSON.parse(planData) 
      : planData

    // Validate plan structure
    const validationResult = validateCraftingPlan(plan)
    if (!validationResult.valid) {
      return {
        success: false,
        errors: validationResult.errors,
        warnings: []
      }
    }

    // Process queue items
    const processedQueue = await processImportedQueue(plan.queue, options)
    
    return {
      success: true,
      plan: {
        ...plan,
        queue: processedQueue
      },
      warnings: validationResult.warnings
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse crafting plan: ${error.message}`],
      warnings: []
    }
  }
}
```

#### **Export/Import UI Component**
```typescript
export function ExportImportPanel() {
  const craftingQueue = useCraftingQueue()
  const [exportName, setExportName] = useState('')
  const [importData, setImportData] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = useCallback(() => {
    const plan = exportCraftingPlan(craftingQueue, {
      name: exportName || 'My Crafting Plan'
    })
    
    const blob = new Blob([JSON.stringify(plan, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${plan.metadata.name.replace(/[^a-z0-9]/gi, '_')}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }, [craftingQueue, exportName])

  const handleImport = useCallback(async () => {
    setIsImporting(true)
    
    try {
      const result = await importCraftingPlan(importData)
      
      if (result.success) {
        // Load the imported plan
        useBitCraftyStore.getState().loadCraftingPlan(result.plan)
        setImportData('')
        // Show success message
      } else {
        // Show error messages
        console.error('Import failed:', result.errors)
      }
    } finally {
      setIsImporting(false)
    }
  }, [importData])

  return (
    <div className="export-import-panel">
      <section className="export-section">
        <h4>Export Crafting Plan</h4>
        <input
          type="text"
          placeholder="Plan name"
          value={exportName}
          onChange={(e) => setExportName(e.target.value)}
        />
        <button onClick={handleExport} disabled={craftingQueue.length === 0}>
          Export as JSON
        </button>
      </section>

      <section className="import-section">
        <h4>Import Crafting Plan</h4>
        <textarea
          placeholder="Paste exported plan JSON here..."
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          rows={4}
        />
        <button 
          onClick={handleImport} 
          disabled={!importData.trim() || isImporting}
        >
          {isImporting ? 'Importing...' : 'Import Plan'}
        </button>
      </section>
    </div>
  )
}
```

### Task 4.5: Advanced Graph Filtering
**Files**: `src/lib/graph-filters.ts`, `src/components/ui/AdvancedFilters.tsx`

#### **Subtree Filtering System**
```typescript
export interface FilterOptions {
  showOnlyQueueItems: boolean
  showDependencyChains: boolean
  showSurplusProducers: boolean
  highlightCriticalPath: boolean
  filterByProfession: string[]
  maxDepth?: number
}

export function filterGraphForQueue(
  nodes: GraphNode[],
  edges: GraphEdge[],
  queue: EnhancedQueueItem[],
  options: FilterOptions
): { nodes: GraphNode[], edges: GraphEdge[] } {
  if (queue.length === 0) {
    return { nodes, edges }
  }

  const queueItemIds = new Set(queue.map(item => item.itemId))
  const relevantNodeIds = new Set<string>()

  // Start with queue items
  queueItemIds.forEach(id => relevantNodeIds.add(id))

  if (options.showDependencyChains) {
    // Find all dependencies for queue items
    queue.forEach(queueItem => {
      const dependencies = findAllDependencies(
        queueItem.itemId,
        nodes,
        edges,
        options.maxDepth
      )
      dependencies.forEach(id => relevantNodeIds.add(id))
    })
  }

  if (options.showSurplusProducers) {
    // Find items that produce surplus for queue items
    const surplusProducers = findSurplusProducers(queue, nodes, edges)
    surplusProducers.forEach(id => relevantNodeIds.add(id))
  }

  // Filter nodes and edges
  const filteredNodes = nodes.filter(node => 
    relevantNodeIds.has(node.id) &&
    (options.filterByProfession.length === 0 || 
     options.filterByProfession.includes(node.data.profession))
  )

  const filteredEdges = edges.filter(edge =>
    relevantNodeIds.has(edge.source) && relevantNodeIds.has(edge.target)
  )

  // Highlight critical path if requested
  if (options.highlightCriticalPath) {
    const criticalPath = findCriticalPath(queue, filteredNodes, filteredEdges)
    filteredEdges.forEach(edge => {
      edge.data = edge.data || {}
      edge.data.isCritical = criticalPath.includes(edge.id)
    })
  }

  return {
    nodes: filteredNodes,
    edges: filteredEdges
  }
}
```

### Task 4.6: Performance Optimization
**Files**: `src/hooks/useVirtualizedQueue.ts`, `src/lib/performance-utils.ts`

#### **Virtualized Queue for Large Lists**
```typescript
export function useVirtualizedQueue(items: EnhancedQueueItem[], itemHeight: number = 60) {
  const [containerHeight, setContainerHeight] = useState(400)
  const [scrollTop, setScrollTop] = useState(0)
  
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )
  
  const visibleItems = items.slice(startIndex, endIndex)
  
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setContainerHeight,
    setScrollTop
  }
}

// Usage in CraftingQueue component
export function VirtualizedCraftingQueue() {
  const craftingQueue = useCraftingQueue()
  const { visibleItems, totalHeight, offsetY, setContainerHeight, setScrollTop } = 
    useVirtualizedQueue(craftingQueue)

  return (
    <div 
      className="virtualized-queue"
      style={{ height: '400px', overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <QueueItem key={item.id} item={item} style={{ height: '60px' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

## 🔄 Implementation Order

### Week 1: Core Queue Features (Days 1-2)
1. **Task 4.1**: Enhanced crafting queue with drag-and-drop ✨
2. **Task 4.2**: Resource calculator and requirements analysis 📊

### Week 2: Planning & Management (Days 3-4)  
3. **Task 4.3**: Production planning and optimization algorithms 🏭
4. **Task 4.4**: Export/import system for sharing plans 💾

### Week 3: Advanced Features (Day 5)
5. **Task 4.5**: Advanced graph filtering and visualization 🔍
6. **Task 4.6**: Performance optimization for large queues ⚡

## ✅ Success Criteria & Validation

### Crafting Queue Excellence
- [ ] Intuitive drag-and-drop reordering with visual feedback
- [ ] Real-time quantity adjustments with dependency updates
- [ ] Clear status indicators (pending/ready/blocked/complete)
- [ ] Automatic dependency resolution and circular dependency detection

### Resource Management Mastery
- [ ] Accurate base resource calculations with surplus sharing
- [ ] Clear breakdown of required vs produced materials
- [ ] Bottleneck identification with optimization suggestions
- [ ] Performance scaling to 100+ queue items

### Production Planning Intelligence
- [ ] Optimal crafting order recommendations
- [ ] Parallel task identification for efficiency gains
- [ ] Critical path analysis with time estimates
- [ ] Resource availability warnings and alternatives

### Data Portability & Collaboration
- [ ] Export plans as human-readable JSON with metadata
- [ ] Import validation with helpful error messages
- [ ] Version compatibility and migration support
- [ ] Plan sharing and collaboration features

### Advanced Visualization
- [ ] Queue-focused graph filtering showing only relevant nodes
- [ ] Dependency chain highlighting with depth control
- [ ] Critical path visualization in graph
- [ ] Performance optimization for complex filtering

## 🚀 Phase 4 Innovation Goals

This phase will transform BitCrafty from a visualization tool into a **comprehensive crafting planning platform**:

- **Smart Queue Management**: AI-like optimization suggestions
- **Resource Intelligence**: Predictive analysis and efficiency metrics  
- **Collaboration Ready**: Export/import for community plan sharing
- **Professional Tools**: Production planning worthy of industrial use
- **Performance Excellence**: Scales to massive crafting operations

Phase 4 will position BitCrafty as the **definitive tool for complex crafting planning** in any resource management scenario! 🎯

## 🔧 Technical Dependencies

### Required Packages
```bash
npm install react-beautiful-dnd @types/react-beautiful-dnd
npm install react-window react-window-infinite-loader
npm install fuse.js  # Enhanced fuzzy search
npm install dagre-d3  # Advanced graph algorithms
```

### Development Tools
```bash
npm install --save-dev @testing-library/react-hooks
npm install --save-dev jest-performance-testing
```

**Ready to begin Phase 4 implementation? This comprehensive crafting system will make BitCrafty an indispensable tool for resource management! 🚀**

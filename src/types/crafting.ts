/**
 * Enhanced crafting queue types for Phase 4 advanced features
 */

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

export interface DragState {
  isDragging: boolean
  draggedItemId: string | null
  dropTargetIndex: number | null
}

export interface ResourceCalculation {
  itemId: string
  directMaterials: Record<string, number>    // Immediate crafting requirements
  baseMaterials: Record<string, number>      // Reduced to base resources
  surplus: Record<string, number>            // Excess produced
  dependencies: string[]                     // Items this depends on
}

export interface CraftingPath {
  itemId: string
  itemName: string
  requiredQty: number
  craftId?: string
  craftName?: string
  dependencies: CraftingPath[]
  isBaseResource: boolean
  profession?: string
}

export interface CraftingPlan {
  id: string
  name: string
  description?: string
  queue: EnhancedQueueItem[]
  summary: QueueSummary
  createdAt: Date
  updatedAt: Date
  version: string
}

// Export type for resource sharing across queue
export interface SharedSurplus {
  [itemId: string]: number
}

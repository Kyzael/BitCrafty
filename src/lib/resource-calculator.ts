/**
 * Resource Calculator System - Phase 4 Task 4.2
 * Calculates base resources and crafting requirements for enhanced queue
 */

import type { EnhancedQueueItem, ResourceCalculation, SharedSurplus } from '../types/crafting'
import type { ItemData, CraftData } from '../types/data'

export interface ResourceSummary {
  baseResources: Record<string, number>
  intermediateItems: Record<string, number>
  surplus: Record<string, number>
  totalItemsNeeded: number
  queueComplexity: 'simple' | 'moderate' | 'complex'
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

/**
 * Calculate resource requirements for the entire enhanced queue
 */
export function calculateQueueResources(
  queue: EnhancedQueueItem[],
  items: Record<string, ItemData>,
  crafts: Record<string, CraftData>,
  dynamicBaseResources: Set<string>
): ResourceSummary {
  const sharedSurplus: SharedSurplus = {}
  const baseResources: Record<string, number> = {}
  const intermediateItems: Record<string, number> = {}
  let totalItemsNeeded = 0

  // Process queue items in order
  for (const queueItem of queue) {
    const itemCalculation = calculateItemResources(
      queueItem.itemId,
      queueItem.qty,
      items,
      crafts,
      sharedSurplus,
      new Set(),
      dynamicBaseResources
    )

    // Merge base resources
    for (const [itemId, qty] of Object.entries(itemCalculation.baseMaterials)) {
      baseResources[itemId] = (baseResources[itemId] || 0) + qty
      totalItemsNeeded += qty
    }

    // Merge intermediate items
    for (const [itemId, qty] of Object.entries(itemCalculation.directMaterials)) {
      if (!isBaseResource(itemId, dynamicBaseResources)) {
        intermediateItems[itemId] = (intermediateItems[itemId] || 0) + qty
      }
    }
  }

  // Determine complexity based on number of unique items and queue size
  const uniqueItems = Object.keys(baseResources).length + Object.keys(intermediateItems).length
  let queueComplexity: 'simple' | 'moderate' | 'complex' = 'simple'
  
  if (queue.length > 10 || uniqueItems > 15) {
    queueComplexity = 'complex'
  } else if (queue.length > 5 || uniqueItems > 8) {
    queueComplexity = 'moderate'
  }

  return {
    baseResources,
    intermediateItems,
    surplus: sharedSurplus,
    totalItemsNeeded,
    queueComplexity
  }
}

/**
 * Calculate resource requirements for a single item
 * Based on legacy tracePath() function
 */
export function calculateItemResources(
  itemId: string,
  qty: number,
  items: Record<string, ItemData>,
  crafts: Record<string, CraftData>,
  sharedSurplus: SharedSurplus = {},
  visited: Set<string> = new Set(),
  dynamicBaseResources: Set<string>
): ResourceCalculation {
  // Prevent circular dependencies
  if (visited.has(itemId)) {
    console.warn(`Circular dependency detected for item: ${itemId}`)
    return {
      itemId,
      directMaterials: {},
      baseMaterials: {},
      surplus: {},
      dependencies: []
    }
  }

  visited.add(itemId)

  // Check if we can use surplus from previous calculations
  const availableSurplus = sharedSurplus[itemId] || 0
  const neededQty = Math.max(0, qty - availableSurplus)

  if (neededQty === 0) {
    // Use surplus and update shared state
    sharedSurplus[itemId] = availableSurplus - qty
    visited.delete(itemId)
    return {
      itemId,
      directMaterials: {},
      baseMaterials: {},
      surplus: { [itemId]: qty },
      dependencies: []
    }
  }

  // Update surplus if we used some
  if (availableSurplus > 0) {
    sharedSurplus[itemId] = 0
  }

  const directMaterials: Record<string, number> = {}
  const baseMaterials: Record<string, number> = {}
  const surplus: Record<string, number> = {}
  const dependencies: string[] = []

  // Check if this is a base resource
  if (isBaseResource(itemId, dynamicBaseResources)) {
    baseMaterials[itemId] = neededQty
    visited.delete(itemId)
    return {
      itemId,
      directMaterials: { [itemId]: neededQty },
      baseMaterials,
      surplus,
      dependencies
    }
  }

  // Find crafts that produce this item
  const producingCrafts = Object.values(crafts).filter(craft =>
    craft.outputs?.some(output => output.item === itemId)
  )

  if (producingCrafts.length === 0) {
    // No craft found, treat as base resource
    baseMaterials[itemId] = neededQty
    visited.delete(itemId)
    return {
      itemId,
      directMaterials: { [itemId]: neededQty },
      baseMaterials,
      surplus,
      dependencies
    }
  }

  // Use the first available craft (in a full implementation, this could be user-selectable)
  const craft = producingCrafts[0]
  const output = craft.outputs?.find(o => o.item === itemId)!
  const outputQty = typeof output.qty === 'string' ? parseInt(output.qty.split('-')[0]) : output.qty
  const craftCount = Math.ceil(neededQty / outputQty)
  const actualOutput = craftCount * outputQty

  // Calculate surplus from this craft
  if (actualOutput > neededQty) {
    const surplusAmount = actualOutput - neededQty
    surplus[itemId] = surplusAmount
    sharedSurplus[itemId] = (sharedSurplus[itemId] || 0) + surplusAmount
  }

  // Process additional outputs (byproducts)
  if (craft.outputs) {
    for (const additionalOutput of craft.outputs) {
      if (additionalOutput.item !== itemId) {
        const byproductQty = craftCount * (typeof additionalOutput.qty === 'string' ? 
          parseInt(additionalOutput.qty.split('-')[0]) : additionalOutput.qty)
        surplus[additionalOutput.item] = (surplus[additionalOutput.item] || 0) + byproductQty
        sharedSurplus[additionalOutput.item] = (sharedSurplus[additionalOutput.item] || 0) + byproductQty
      }
    }
  }

  // Process materials recursively
  if (craft.materials) {
    for (const material of craft.materials) {
      const requiredMaterialQty = craftCount * material.qty
      directMaterials[material.item] = (directMaterials[material.item] || 0) + requiredMaterialQty
      dependencies.push(material.item)

      const materialCalculation = calculateItemResources(
        material.item,
        requiredMaterialQty,
        items,
        crafts,
        sharedSurplus,
        visited,
        dynamicBaseResources
      )

      // Merge base materials from material
      for (const [baseItemId, baseQty] of Object.entries(materialCalculation.baseMaterials)) {
        baseMaterials[baseItemId] = (baseMaterials[baseItemId] || 0) + baseQty
      }

      // Merge surplus from material
      for (const [surplusItemId, surplusQty] of Object.entries(materialCalculation.surplus)) {
        surplus[surplusItemId] = (surplus[surplusItemId] || 0) + surplusQty
      }
    }
  }

  visited.delete(itemId)
  return {
    itemId,
    directMaterials,
    baseMaterials,
    surplus,
    dependencies
  }
}

/**
 * Generate crafting paths for visualization
 * Based on legacy updateCraftingPaths() function
 */
export function generateCraftingPaths(
  queue: EnhancedQueueItem[],
  items: Record<string, ItemData>,
  crafts: Record<string, CraftData>,
  baseResources: Set<string>
): CraftingPath[] {
  const paths: CraftingPath[] = []

  for (const queueItem of queue) {
    const path = buildCraftingPath(queueItem.itemId, queueItem.qty, items, crafts, baseResources)
    if (path) {
      paths.push(path)
    }
  }

  return paths
}

/**
 * Build a single crafting path tree
 */
function buildCraftingPath(
  itemId: string,
  qty: number,
  items: Record<string, ItemData>,
  crafts: Record<string, CraftData>,
  baseResources: Set<string>,
  visited: Set<string> = new Set()
): CraftingPath | null {
  if (visited.has(itemId)) {
    return null // Prevent infinite recursion
  }

  visited.add(itemId)

  const item = items[itemId]
  if (!item) {
    visited.delete(itemId)
    return null
  }

  const isBase = isBaseResource(itemId, baseResources)
  const path: CraftingPath = {
    itemId,
    itemName: item.name,
    requiredQty: qty,
    dependencies: [],
    isBaseResource: isBase
  }

  if (isBase) {
    visited.delete(itemId)
    return path
  }

  // Find producing craft
  const producingCrafts = Object.values(crafts).filter(craft =>
    craft.outputs?.some(output => output.item === itemId)
  )

  if (producingCrafts.length > 0) {
    const craft = producingCrafts[0]
    const output = craft.outputs?.find(o => o.item === itemId)!
    const outputQty = typeof output.qty === 'string' ? parseInt(output.qty.split('-')[0]) : output.qty
    const craftCount = Math.ceil(qty / outputQty)

    path.craftId = craft.id
    path.craftName = craft.name

    // Build dependency paths
    if (craft.materials) {
      for (const material of craft.materials) {
        const requiredMaterialQty = craftCount * material.qty
        const materialPath = buildCraftingPath(material.item, requiredMaterialQty, items, crafts, baseResources, visited)
        if (materialPath) {
          path.dependencies.push(materialPath)
        }
      }
    }
  }

  visited.delete(itemId)
  return path
}

/**
 * Check if an item should be treated as a base resource
 * Uses the dynamically identified base resources from data loading
 */
function isBaseResource(itemId: string, baseResources: Set<string>): boolean {
  return baseResources.has(itemId)
}

/**
 * Get base resources only (filtered from all resources)
 */
export function getBaseResourcesOnly(
  allResources: Record<string, number>,
  baseResources: Set<string>
): Record<string, number> {
  const baseOnly: Record<string, number> = {}
  
  for (const [itemId, qty] of Object.entries(allResources)) {
    if (isBaseResource(itemId, baseResources)) {
      baseOnly[itemId] = qty
    }
  }
  
  return baseOnly
}

/**
 * Format resource summary for display
 */
export function formatResourceSummary(summary: ResourceSummary): {
  baseResourceCount: number
  intermediateItemCount: number
  totalUniqueItems: number
  complexityDescription: string
} {
  const baseResourceCount = Object.keys(summary.baseResources).length
  const intermediateItemCount = Object.keys(summary.intermediateItems).length
  const totalUniqueItems = baseResourceCount + intermediateItemCount

  const complexityDescriptions = {
    simple: 'Simple queue with basic requirements',
    moderate: 'Moderate complexity with multiple dependencies',
    complex: 'Complex queue requiring careful planning'
  }

  return {
    baseResourceCount,
    intermediateItemCount,
    totalUniqueItems,
    complexityDescription: complexityDescriptions[summary.queueComplexity]
  }
}

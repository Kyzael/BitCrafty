import { ItemData, CraftData, ProfessionData, RequirementData } from '../types'
import { BASE_CRAFT_ITEMS } from './constants'

/**
 * Load all BitCrafty data from JSON files
 */
export async function loadBitCraftyData(): Promise<{
  items: ItemData[]
  crafts: CraftData[]
  professions: ProfessionData[]
  requirements: RequirementData[]
}> {
  try {
    // Fetch all data files in parallel
    const [itemsRes, craftsRes, professionsRes, requirementsRes] = await Promise.all([
      fetch('/data/items.json'),
      fetch('/data/crafts.json'),
      fetch('/data/metadata/professions.json'),
      fetch('/data/requirements.json')
    ])

    // Check if all requests were successful
    if (!itemsRes.ok) {
      throw new Error(`Failed to fetch items.json: ${itemsRes.status}`)
    }
    if (!craftsRes.ok) {
      throw new Error(`Failed to fetch crafts.json: ${craftsRes.status}`)
    }
    if (!professionsRes.ok) {
      throw new Error(`Failed to fetch professions.json: ${professionsRes.status}`)
    }
    if (!requirementsRes.ok) {
      throw new Error(`Failed to fetch requirements.json: ${requirementsRes.status}`)
    }

    // Parse JSON data
    const [items, crafts, professions, requirements] = await Promise.all([
      itemsRes.json(),
      craftsRes.json(),
      professionsRes.json(),
      requirementsRes.json()
    ])

    // Validate data structure
    if (!Array.isArray(items)) {
      throw new Error('Items data is not an array')
    }
    if (!Array.isArray(crafts)) {
      throw new Error('Crafts data is not an array')
    }
    if (!Array.isArray(professions)) {
      throw new Error('Professions data is not an array')
    }
    if (!Array.isArray(requirements)) {
      throw new Error('Requirements data is not an array')
    }

    // Validate required fields exist
    validateItemsData(items)
    validateCraftsData(crafts)
    validateProfessionsData(professions)

    return { items, crafts, professions, requirements }
  } catch (error) {
    console.error('Error loading BitCrafty data:', error)
    throw error
  }
}

/**
 * Validate items data structure
 */
function validateItemsData(items: any[]): asserts items is ItemData[] {
  for (const item of items) {
    if (!item.id || typeof item.id !== 'string') {
      throw new Error(`Item missing required id field: ${JSON.stringify(item)}`)
    }
    if (!item.name || typeof item.name !== 'string') {
      throw new Error(`Item ${item.id} missing required name field`)
    }
    if (!item.id.includes(':')) {
      throw new Error(`Item ${item.id} does not follow TYPE:PROFESSION:IDENTIFIER format`)
    }
  }
}

/**
 * Validate crafts data structure
 */
function validateCraftsData(crafts: any[]): asserts crafts is CraftData[] {
  for (const craft of crafts) {
    if (!craft.id || typeof craft.id !== 'string') {
      throw new Error(`Craft missing required id field: ${JSON.stringify(craft)}`)
    }
    if (!craft.name || typeof craft.name !== 'string') {
      throw new Error(`Craft ${craft.id} missing required name field`)
    }
    if (!craft.id.includes(':')) {
      throw new Error(`Craft ${craft.id} does not follow TYPE:PROFESSION:IDENTIFIER format`)
    }
    if (craft.materials && !Array.isArray(craft.materials)) {
      throw new Error(`Craft ${craft.id} materials field is not an array`)
    }
    if (craft.outputs && !Array.isArray(craft.outputs)) {
      throw new Error(`Craft ${craft.id} outputs field is not an array`)
    }
  }
}

/**
 * Validate professions data structure
 */
function validateProfessionsData(professions: any[]): asserts professions is ProfessionData[] {
  for (const profession of professions) {
    if (!profession.name || typeof profession.name !== 'string') {
      throw new Error(`Profession missing required name field: ${JSON.stringify(profession)}`)
    }
    if (!profession.color || typeof profession.color !== 'string') {
      throw new Error(`Profession ${profession.name} missing required color field`)
    }
  }
}

/**
 * Convert array to record/map for fast lookup
 */
export function arrayToRecord<T extends { id: string }>(array: T[]): Record<string, T> {
  return array.reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {} as Record<string, T>)
}

/**
 * Convert professions array to record using name as key
 */
export function professionsArrayToRecord(professions: ProfessionData[]): Record<string, ProfessionData> {
  return professions.reduce((acc, profession) => {
    acc[profession.name] = profession
    return acc
  }, {} as Record<string, ProfessionData>)
}

/**
 * Analyze crafts data to identify true base resources
 * Base resources are items that meet any of these criteria:
 * 1. Items that have no craft node parent (never produced by any craft)
 * 2. Items where parent crafts have 0-X random output (unreliable production)
 * 3. Items in BASE_CRAFT_ITEMS constant (loop prevention guardrails)
 */
export function identifyBaseResources(
  items: ItemData[],
  crafts: CraftData[]
): Set<string> {
  const allItemIds = new Set(items.map(item => item.id))
  const baseResources = new Set<string>()
  
  // Case 3: Always include hardcoded base items (loop prevention)
  for (const itemId of BASE_CRAFT_ITEMS) {
    if (allItemIds.has(itemId)) {
      baseResources.add(itemId)
    }
  }
  
  // Find all items that are reliably produced by crafts
  const reliablyProducedItems = new Set<string>()
  
  for (const craft of crafts) {
    if (craft.outputs) {
      for (const output of craft.outputs) {
        // Case 2: Check if this is a reliable production (not random 0-X)
        const isReliableOutput = !isRandomOutput(output.qty)
        
        if (isReliableOutput) {
          reliablyProducedItems.add(output.item)
        }
        // If it's random (0-X), we DON'T add it to reliablyProducedItems
        // This means it will be treated as a base resource
      }
    }
  }
  
  // Case 1: Items that exist but are never reliably produced are base resources
  for (const itemId of allItemIds) {
    if (!reliablyProducedItems.has(itemId)) {
      baseResources.add(itemId)
    }
  }
  
  console.log('Identified base resources:', {
    total: baseResources.size,
    reliablyProduced: reliablyProducedItems.size,
    allItems: allItemIds.size,
    hardcodedIncluded: BASE_CRAFT_ITEMS.size,
    baseResourceIds: Array.from(baseResources).slice(0, 10) // Log first 10 for debugging
  })
  
  return baseResources
}

/**
 * Check if an output quantity represents random production (0-X range)
 */
function isRandomOutput(qty: number | string): boolean {
  if (typeof qty === 'string') {
    // Check for patterns like "0-5", "1-3", etc.
    const rangeMatch = qty.match(/^(\d+)-(\d+)$/)
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1])
      return min === 0 // Random if minimum is 0
    }
  }
  
  // Fixed quantities are reliable
  return false
}

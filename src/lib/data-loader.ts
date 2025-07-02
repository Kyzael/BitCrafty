import { ItemData, CraftData, ProfessionData } from '../types'

/**
 * Load all BitCrafty data from JSON files
 */
export async function loadBitCraftyData(): Promise<{
  items: ItemData[]
  crafts: CraftData[]
  professions: ProfessionData[]
}> {
  try {
    // Fetch all data files in parallel
    const [itemsRes, craftsRes, professionsRes] = await Promise.all([
      fetch('/data/items.json'),
      fetch('/data/crafts.json'),
      fetch('/data/metadata/professions.json')
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

    // Parse JSON data
    const [items, crafts, professions] = await Promise.all([
      itemsRes.json(),
      craftsRes.json(),
      professionsRes.json()
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

    // Validate required fields exist
    validateItemsData(items)
    validateCraftsData(crafts)
    validateProfessionsData(professions)

    return { items, crafts, professions }
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

// Core data types based on existing JSON structure

export interface ItemData {
  id: string
  name: string
  tier: number
  rank: string
}

export interface MaterialRequirement {
  item: string
  qty: number
}

export interface CraftOutput {
  item: string
  qty: number | string // Can be "1-3" format
}

export interface CraftData {
  id: string
  name: string
  requirement?: string
  materials?: MaterialRequirement[]
  outputs?: CraftOutput[]
}

export interface RequirementData {
  id: string
  profession?: {
    name: string
    level: number
  }
  tool?: {
    name: string
    level: number
  }
  building?: {
    name: string
    level: number
  }
}

export interface ProfessionData {
  id: string
  name: string
  color: string
}

export interface ToolData {
  id: string
  name: string
}

export interface BuildingData {
  id: string
  name: string
}

// Queue types
export interface QueueItem {
  itemId: string
  qty: number
}

// Entity type for validation
export type EntityType = 'item' | 'craft' | 'requirement' | 'profession' | 'tool' | 'building'

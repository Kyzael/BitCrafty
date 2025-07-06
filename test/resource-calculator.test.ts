/**
 * Resource Calculator Tests - Phase 4 Task 4.2
 * Test file to validate resource calculation functionality
 */

import { calculateQueueResources, calculateItemResources, generateCraftingPaths } from '../src/lib/resource-calculator'
import type { EnhancedQueueItem } from '../src/types/crafting'
import type { ItemData, CraftData } from '../src/types/data'

// Mock data for testing
const mockItems: Record<string, ItemData> = {
  'item:farming:carrot': {
    id: 'item:farming:carrot',
    name: 'Carrot',
    tier: 1,
    rank: 'common'
  },
  'item:cooking:carrot-soup': {
    id: 'item:cooking:carrot-soup',
    name: 'Carrot Soup',
    tier: 2,
    rank: 'common'
  },
  'item:cooking:water': {
    id: 'item:cooking:water',
    name: 'Water',
    tier: 1,
    rank: 'common'
  }
}

const mockCrafts: Record<string, CraftData> = {
  'craft:cooking:carrot-soup': {
    id: 'craft:cooking:carrot-soup',
    name: 'Cook Carrot Soup',
    materials: [
      { item: 'item:farming:carrot', qty: 2 },
      { item: 'item:cooking:water', qty: 1 }
    ],
    outputs: [
      { item: 'item:cooking:carrot-soup', qty: 1 }
    ]
  }
}

const mockQueue: EnhancedQueueItem[] = [
  {
    id: 'queue-1',
    itemId: 'item:cooking:carrot-soup',
    qty: 5,
    priority: 0,
    dependencies: [],
    status: 'pending',
    addedAt: new Date()
  }
]

/**
 * Test basic resource calculation
 */
function testBasicResourceCalculation() {
  console.log('Testing basic resource calculation...')
  
  const result = calculateQueueResources(mockQueue, mockItems, mockCrafts)
  
  console.log('Result:', result)
  
  // Expected: 5 carrot soup requires 10 carrots + 5 water
  const expectedCarrots = 10
  const expectedWater = 5
  
  if (result.baseResources['item:farming:carrot'] === expectedCarrots &&
      result.baseResources['item:cooking:water'] === expectedWater) {
    console.log('✅ Basic resource calculation test passed')
  } else {
    console.log('❌ Basic resource calculation test failed')
    console.log('Expected carrots:', expectedCarrots, 'Got:', result.baseResources['item:farming:carrot'])
    console.log('Expected water:', expectedWater, 'Got:', result.baseResources['item:cooking:water'])
  }
}

/**
 * Test crafting path generation
 */
function testCraftingPathGeneration() {
  console.log('Testing crafting path generation...')
  
  const paths = generateCraftingPaths(mockQueue, mockItems, mockCrafts)
  
  console.log('Crafting paths:', paths)
  
  if (paths.length > 0 && paths[0].dependencies.length === 2) {
    console.log('✅ Crafting path generation test passed')
  } else {
    console.log('❌ Crafting path generation test failed')
    console.log('Expected 1 path with 2 dependencies, got:', paths.length, 'paths')
  }
}

/**
 * Run all tests
 */
function runResourceCalculatorTests() {
  console.log('🧪 Running Resource Calculator Tests')
  console.log('=====================================')
  
  testBasicResourceCalculation()
  testCraftingPathGeneration()
  
  console.log('=====================================')
  console.log('✅ Resource Calculator Tests Complete')
}

// Export for potential use in browser console
if (typeof window !== 'undefined') {
  (window as any).runResourceCalculatorTests = runResourceCalculatorTests
}

export { runResourceCalculatorTests }

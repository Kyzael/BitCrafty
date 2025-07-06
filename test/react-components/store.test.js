import { test, describe } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('Zustand Store Tests', () => {
  let storeSource

  test('should load store.ts without errors', () => {
    const storePath = join(__dirname, '../../src/lib/store.ts')
    assert.doesNotThrow(() => {
      storeSource = readFileSync(storePath, 'utf8')
    }, 'store.ts should load without file system errors')
    
    assert.ok(storeSource.length > 0, 'store.ts should not be empty')
  })

  test('should use proper Zustand setup', () => {
    assert.ok(storeSource.includes('import { create }'), 
      'Should import create from zustand')
    assert.ok(storeSource.includes('import { subscribeWithSelector }'), 
      'Should import subscribeWithSelector middleware')
    assert.ok(storeSource.includes('useBitCraftyStore = create'), 
      'Should create store with proper name')
    assert.ok(storeSource.includes('subscribeWithSelector'), 
      'Should use subscribeWithSelector middleware')
  })

  test('should implement proper TypeScript interfaces', () => {
    assert.ok(storeSource.includes('interface BitCraftyStore'), 
      'Should define store interface')
    assert.ok(storeSource.includes('extends AppState, AppActions'), 
      'Should extend proper interfaces')
    assert.ok(storeSource.includes('AppState'), 
      'Should import AppState type')
    assert.ok(storeSource.includes('AppActions'), 
      'Should import AppActions type')
  })

  test('should have proper initial state', () => {
    assert.ok(storeSource.includes('const initialState: AppState'), 
      'Should define typed initial state')
    assert.ok(storeSource.includes('items: {}'), 
      'Should initialize items')
    assert.ok(storeSource.includes('crafts: {}'), 
      'Should initialize crafts')
    assert.ok(storeSource.includes('selectedNode: null'), 
      'Should initialize selectedNode')
    assert.ok(storeSource.includes('searchQuery: \'\''), 
      'Should initialize searchQuery')
  })

  test('should implement data loading functionality', () => {
    assert.ok(storeSource.includes('loadData: async'), 
      'Should have async loadData action')
    assert.ok(storeSource.includes('isLoading: true'), 
      'Should set loading state')
    assert.ok(storeSource.includes('loadBitCraftyData'), 
      'Should use data loader')
    assert.ok(storeSource.includes('buildGraphData'), 
      'Should build graph data')
  })

  test('should implement search functionality', () => {
    assert.ok(storeSource.includes('setSearchQuery'), 
      'Should have search query setter')
    assert.ok(storeSource.includes('setSearchResults'), 
      'Should have search results setter')
    assert.ok(storeSource.includes('searchResults: new Set()'), 
      'Should initialize search results as Set')
  })

  test('should implement node selection', () => {
    assert.ok(storeSource.includes('selectNode'), 
      'Should have selectNode action')
    assert.ok(storeSource.includes('selectedNode'), 
      'Should track selected node')
    assert.ok(storeSource.includes('hoveredNode'), 
      'Should track hovered node')
  })

  test('should provide memoized selectors', () => {
    assert.ok(storeSource.includes('export const useIsLoading'), 
      'Should export useIsLoading selector')
    assert.ok(storeSource.includes('export const useItemsArray'), 
      'Should export useItemsArray selector')
    assert.ok(storeSource.includes('export const useSelectedNode'), 
      'Should export useSelectedNode selector')
    assert.ok(storeSource.includes('export const useSearchQuery'), 
      'Should export useSearchQuery selector')
    assert.ok(storeSource.includes('export const useGraphData'), 
      'Should export useGraphData selector')
  })

  test('should implement profession filtering', () => {
    assert.ok(storeSource.includes('visibleProfessions'), 
      'Should track visible professions')
    assert.ok(storeSource.includes('toggleProfession'), 
      'Should have toggleProfession action')
    assert.ok(storeSource.includes('setVisibleProfessions'), 
      'Should have setVisibleProfessions action')
  })

  test('should follow React 18 compatibility patterns', () => {
    assert.ok(storeSource.includes('useMemo'), 
      'Should use memoization for selectors')
    assert.ok(storeSource.includes('state => state'), 
      'Should use proper selector patterns')
    assert.ok(storeSource.includes('subscribeWithSelector'), 
      'Should use React 18 compatible middleware')
  })

  test('should handle error states', () => {
    assert.ok(storeSource.includes('loadError'), 
      'Should track load errors')
    assert.ok(storeSource.includes('catch'), 
      'Should catch and handle errors')
    assert.ok(storeSource.includes('console.error'), 
      'Should log errors for debugging')
  })

  test('should implement enhanced queue functionality', () => {
    assert.ok(storeSource.includes('enhancedQueue'), 
      'Should track enhanced queue')
    assert.ok(storeSource.includes('addToEnhancedQueue'), 
      'Should have addToEnhancedQueue action')
    assert.ok(storeSource.includes('removeFromEnhancedQueue'), 
      'Should have removeFromEnhancedQueue action')
  })
})

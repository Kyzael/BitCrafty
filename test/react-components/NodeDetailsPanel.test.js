import { test, describe } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('NodeDetailsPanel Component Tests', () => {
  let componentSource

  test('should load NodeDetailsPanel.tsx without errors', () => {
    const componentPath = join(__dirname, '../../src/components/ui/NodeDetailsPanel.tsx')
    assert.doesNotThrow(() => {
      componentSource = readFileSync(componentPath, 'utf8')
    }, 'NodeDetailsPanel.tsx should load without file system errors')
    
    assert.ok(componentSource.length > 0, 'NodeDetailsPanel.tsx should not be empty')
  })

  test('should be a proper React functional component', () => {
    assert.ok(componentSource.includes('export const NodeDetailsPanel: React.FC'), 
      'Should export a typed React functional component')
    assert.ok(componentSource.includes('import React'), 
      'Should import React with useRef and useEffect')
  })

  test('should implement keyboard navigation', () => {
    assert.ok(componentSource.includes('useRef<HTMLDivElement>'), 
      'Should use typed ref for panel')
    assert.ok(componentSource.includes('useEffect'), 
      'Should use useEffect for keyboard listener')
    assert.ok(componentSource.includes('handleKeyDown'), 
      'Should implement keyboard handler')
    assert.ok(componentSource.includes('isWithinPanel'), 
      'Should check if focus is within panel')
  })

  test('should handle keyboard events properly', () => {
    assert.ok(componentSource.includes('case \'Tab\''), 
      'Should handle Tab key')
    assert.ok(componentSource.includes('case \'Enter\''), 
      'Should handle Enter key')
    assert.ok(componentSource.includes('case \' \''), 
      'Should handle Space key')
    assert.ok(componentSource.includes('case \'Escape\''), 
      'Should handle Escape key')
  })

  test('should use Zustand store selectors', () => {
    assert.ok(componentSource.includes('useSelectedNode'), 
      'Should use selected node selector')
    assert.ok(componentSource.includes('useGraphData'), 
      'Should use graph data selector')
    assert.ok(componentSource.includes('useSelectNode'), 
      'Should use node selection action')
    assert.ok(componentSource.includes('useAddToEnhancedQueue'), 
      'Should use enhanced queue action')
    assert.ok(componentSource.includes('useCrafts'), 
      'Should use crafts selector')
    assert.ok(componentSource.includes('useRequirements'), 
      'Should use requirements selector')
  })

  test('should render different content for items vs crafts', () => {
    assert.ok(componentSource.includes('ItemDetails'), 
      'Should have ItemDetails component')
    assert.ok(componentSource.includes('CraftDetails'), 
      'Should have CraftDetails component')
    assert.ok(componentSource.includes('isItem'), 
      'Should determine if node is an item')
    assert.ok(componentSource.includes('node.type === \'item\''), 
      'Should check node type')
  })

  test('should implement proper button elements for accessibility', () => {
    assert.ok(componentSource.includes('<button'), 
      'Should use button elements for clickable items')
    assert.ok(componentSource.includes('tabIndex={0}'), 
      'Should set proper tab index')
    assert.ok(componentSource.includes('navigation-button'), 
      'Should use navigation-button class')
    assert.ok(componentSource.includes('onFocus'), 
      'Should handle focus events')
    assert.ok(componentSource.includes('onBlur'), 
      'Should handle blur events')
  })

  test('should handle connected items and crafts', () => {
    assert.ok(componentSource.includes('usedInCrafts'), 
      'Should find crafts that use the item')
    assert.ok(componentSource.includes('producedByCrafts'), 
      'Should find crafts that produce the item')
    assert.ok(componentSource.includes('inputItems'), 
      'Should find input items for crafts')
    assert.ok(componentSource.includes('outputItems'), 
      'Should find output items for crafts')
  })

  test('should implement proper error handling', () => {
    assert.ok(componentSource.includes('if (!selectedNode)'), 
      'Should handle no selected node')
    assert.ok(componentSource.includes('if (!node)'), 
      'Should handle node not found')
    assert.ok(componentSource.includes('details-panel-empty'), 
      'Should show empty state')
    assert.ok(componentSource.includes('details-panel-error'), 
      'Should show error state')
  })

  test('should use proper TypeScript interfaces', () => {
    assert.ok(componentSource.includes('interface ItemDetailsProps'), 
      'Should define ItemDetails props interface')
    assert.ok(componentSource.includes('interface CraftDetailsProps'), 
      'Should define CraftDetails props interface')
    assert.ok(componentSource.includes('React.FC<'), 
      'Should use proper component typing')
  })

  test('should implement profession color coding', () => {
    assert.ok(componentSource.includes('backgroundColor: item!.data.color'), 
      'Should use item color for dots')
    assert.ok(componentSource.includes('profession-badge'), 
      'Should show profession badge')
    assert.ok(componentSource.includes('node.data.color'), 
      'Should access node color data')
  })
})

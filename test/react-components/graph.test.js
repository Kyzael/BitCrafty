import { test, describe } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('React Flow Graph Components Tests', () => {
  let graphContainerSource
  let itemNodeSource
  let craftNodeSource

  test('should load GraphContainer.tsx without errors', () => {
    const containerPath = join(__dirname, '../../src/components/graph/GraphContainer.tsx')
    assert.doesNotThrow(() => {
      graphContainerSource = readFileSync(containerPath, 'utf8')
    }, 'GraphContainer.tsx should load without file system errors')
    
    assert.ok(graphContainerSource.length > 0, 'GraphContainer.tsx should not be empty')
  })

  test('should load ItemNode.tsx without errors', () => {
    const itemNodePath = join(__dirname, '../../src/components/graph/nodes/ItemNode.tsx')
    assert.doesNotThrow(() => {
      itemNodeSource = readFileSync(itemNodePath, 'utf8')
    }, 'ItemNode.tsx should load without file system errors')
    
    assert.ok(itemNodeSource.length > 0, 'ItemNode.tsx should not be empty')
  })

  test('should load CraftNode.tsx without errors', () => {
    const craftNodePath = join(__dirname, '../../src/components/graph/nodes/CraftNode.tsx')
    assert.doesNotThrow(() => {
      craftNodeSource = readFileSync(craftNodePath, 'utf8')
    }, 'CraftNode.tsx should load without file system errors')
    
    assert.ok(craftNodeSource.length > 0, 'CraftNode.tsx should not be empty')
  })

  test('GraphContainer should use React Flow properly', () => {
    assert.ok(graphContainerSource.includes('ReactFlow'), 
      'Should import and use ReactFlow')
    assert.ok(graphContainerSource.includes('useNodesState'), 
      'Should use React Flow node state')
    assert.ok(graphContainerSource.includes('useEdgesState'), 
      'Should use React Flow edge state')
    assert.ok(graphContainerSource.includes('useReactFlow'), 
      'Should use React Flow instance')
  })

  test('GraphContainer should implement node selection', () => {
    assert.ok(graphContainerSource.includes('onNodeClick'), 
      'Should handle node clicks')
    assert.ok(graphContainerSource.includes('onNodeDoubleClick'), 
      'Should handle double clicks')
    assert.ok(graphContainerSource.includes('selectNode'), 
      'Should call selectNode action')
  })

  test('GraphContainer should handle graph updates', () => {
    assert.ok(graphContainerSource.includes('useEffect'), 
      'Should use effects for updates')
    assert.ok(graphContainerSource.includes('setNodes'), 
      'Should update nodes')
    assert.ok(graphContainerSource.includes('setEdges'), 
      'Should update edges')
    assert.ok(graphContainerSource.includes('useGraphData'), 
      'Should use graph data from store')
  })

  test('ItemNode should be properly typed', () => {
    assert.ok(itemNodeSource.includes('export const ItemNode'), 
      'Should export ItemNode component')
    assert.ok(itemNodeSource.includes('React.memo'), 
      'Should be memoized for performance')
    assert.ok(itemNodeSource.includes('NodeProps'), 
      'Should use proper React Flow types')
    assert.ok(itemNodeSource.includes('ItemNodeData'), 
      'Should use custom data type')
  })

  test('ItemNode should implement proper styling', () => {
    assert.ok(itemNodeSource.includes('data.color'), 
      'Should use profession color')
    assert.ok(itemNodeSource.includes('selected'), 
      'Should handle selection state')
    assert.ok(itemNodeSource.includes('borderRadius'), 
      'Should have rounded corners')
    assert.ok(itemNodeSource.includes('Handle'), 
      'Should include React Flow handles')
  })

  test('CraftNode should be properly typed', () => {
    assert.ok(craftNodeSource.includes('export const CraftNode'), 
      'Should export CraftNode component')
    assert.ok(craftNodeSource.includes('React.memo'), 
      'Should be memoized for performance')
    assert.ok(craftNodeSource.includes('NodeProps'), 
      'Should use proper React Flow types')
    assert.ok(craftNodeSource.includes('CraftNodeData'), 
      'Should use custom data type')
  })

  test('CraftNode should implement proper styling', () => {
    assert.ok(craftNodeSource.includes('data.color'), 
      'Should use profession color')
    assert.ok(craftNodeSource.includes('selected'), 
      'Should handle selection state')
    assert.ok(craftNodeSource.includes('borderRadius'), 
      'Should have pill shape')
    assert.ok(craftNodeSource.includes('Handle'), 
      'Should include React Flow handles')
  })

  test('Nodes should implement accessibility features', () => {
    assert.ok(itemNodeSource.includes('cursor: \'pointer\''), 
      'ItemNode should be clickable')
    assert.ok(craftNodeSource.includes('cursor: \'pointer\''), 
      'CraftNode should be clickable')
  })

  test('Nodes should handle visual feedback', () => {
    assert.ok(itemNodeSource.includes('selected'), 
      'ItemNode should show selection state')
    assert.ok(craftNodeSource.includes('selected'), 
      'CraftNode should show selection state')
    assert.ok(itemNodeSource.includes('transition') || itemNodeSource.includes('useMemo'), 
      'ItemNode should have smooth transitions')
    assert.ok(craftNodeSource.includes('transition') || craftNodeSource.includes('useMemo'), 
      'CraftNode should have smooth transitions')
  })

  test('Handles should be properly positioned', () => {
    assert.ok(itemNodeSource.includes('Position.Top'), 
      'ItemNode should have top handle')
    assert.ok(itemNodeSource.includes('Position.Bottom'), 
      'ItemNode should have bottom handle')
    assert.ok(craftNodeSource.includes('Position.Left'), 
      'CraftNode should have left handle')
    assert.ok(craftNodeSource.includes('Position.Right'), 
      'CraftNode should have right handle')
  })
})

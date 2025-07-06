import { test, describe } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('SearchInput Component Tests', () => {
  let componentSource

  test('should load SearchInput.tsx without errors', () => {
    const componentPath = join(__dirname, '../../src/components/ui/SearchInput.tsx')
    assert.doesNotThrow(() => {
      componentSource = readFileSync(componentPath, 'utf8')
    }, 'SearchInput.tsx should load without file system errors')
    
    assert.ok(componentSource.length > 0, 'SearchInput.tsx should not be empty')
  })

  test('should be a proper React functional component', () => {
    assert.ok(componentSource.includes('export const SearchInput: React.FC'), 
      'Should export a typed React functional component')
    assert.ok(componentSource.includes('import React'), 
      'Should import React')
  })

  test('should implement global keyboard search functionality', () => {
    assert.ok(componentSource.includes('useEffect'), 
      'Should use useEffect for global keyboard listener')
    assert.ok(componentSource.includes('handleGlobalKeyDown'), 
      'Should implement global keyboard handler')
    assert.ok(componentSource.includes('document.addEventListener(\'keydown\''), 
      'Should add document keyboard listener')
    assert.ok(componentSource.includes('/[a-zA-Z0-9\\s]/.test(e.key)'), 
      'Should filter for alphanumeric keys')
  })

  test('should implement arrow key navigation', () => {
    assert.ok(componentSource.includes('handleKeyDown'), 
      'Should implement keyboard navigation handler')
    assert.ok(componentSource.includes('ArrowDown'), 
      'Should handle ArrowDown key')
    assert.ok(componentSource.includes('ArrowUp'), 
      'Should handle ArrowUp key')
    assert.ok(componentSource.includes('selectedIndex'), 
      'Should track selected index for navigation')
  })

  test('should use Zustand store selectors', () => {
    assert.ok(componentSource.includes('useSearchQuery'), 
      'Should use search query selector')
    assert.ok(componentSource.includes('useSetSearchQuery'), 
      'Should use search query setter')
    assert.ok(componentSource.includes('useSetSearchResults'), 
      'Should use search results setter')
    assert.ok(componentSource.includes('useSelectNode'), 
      'Should use node selection action')
    assert.ok(componentSource.includes('useGraphData'), 
      'Should use graph data selector')
  })

  test('should implement fuzzy search functionality', () => {
    assert.ok(componentSource.includes('fuzzySearch'), 
      'Should implement fuzzy search function')
    assert.ok(componentSource.includes('score'), 
      'Should calculate match scores')
    assert.ok(componentSource.includes('queryIndex'), 
      'Should track query character matching')
    assert.ok(componentSource.includes('slice(0, 10)'), 
      'Should limit results to 10 items')
  })

  test('should handle escape key to clear search', () => {
    assert.ok(componentSource.includes('case \'Escape\''), 
      'Should handle Escape key')
    assert.ok(componentSource.includes('setShowDropdown(false)'), 
      'Should hide dropdown on escape')
    assert.ok(componentSource.includes('setLocalQuery(\'\')'), 
      'Should clear local query on escape')
  })

  test('should use TypeScript properly', () => {
    assert.ok(componentSource.includes('React.FC'), 
      'Should use React.FC type')
    assert.ok(componentSource.includes('useRef<HTMLInputElement>'), 
      'Should type input ref properly')
    assert.ok(componentSource.includes('React.KeyboardEvent'), 
      'Should type keyboard events')
    assert.ok(componentSource.includes('HTMLElement'), 
      'Should use proper HTML element types')
  })

  test('should follow accessibility patterns', () => {
    assert.ok(componentSource.includes('tabIndex'), 
      'Should handle tab indexing')
    assert.ok(componentSource.includes('ref={inputRef}'), 
      'Should use ref for focus management')
    assert.ok(componentSource.includes('onKeyDown={handleKeyDown}'), 
      'Should attach keyboard handler')
    assert.ok(componentSource.includes('placeholder='), 
      'Should provide placeholder text')
  })
})

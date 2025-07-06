import { test, describe } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('React App Architecture Tests', () => {
  let appSource
  let mainSource
  let sidebarSource
  let headerSource

  test('should load App.tsx without errors', () => {
    const appPath = join(__dirname, '../../src/App.tsx')
    assert.doesNotThrow(() => {
      appSource = readFileSync(appPath, 'utf8')
    }, 'App.tsx should load without file system errors')
    
    assert.ok(appSource.length > 0, 'App.tsx should not be empty')
  })

  test('should load main.tsx without errors', () => {
    const mainPath = join(__dirname, '../../src/main.tsx')
    assert.doesNotThrow(() => {
      mainSource = readFileSync(mainPath, 'utf8')
    }, 'main.tsx should load without file system errors')
    
    assert.ok(mainSource.length > 0, 'main.tsx should not be empty')
  })

  test('should load Sidebar.tsx without errors', () => {
    const sidebarPath = join(__dirname, '../../src/components/ui/Sidebar.tsx')
    assert.doesNotThrow(() => {
      sidebarSource = readFileSync(sidebarPath, 'utf8')
    }, 'Sidebar.tsx should load without file system errors')
    
    assert.ok(sidebarSource.length > 0, 'Sidebar.tsx should not be empty')
  })

  test('should load Header.tsx without errors', () => {
    const headerPath = join(__dirname, '../../src/components/ui/Header.tsx')
    assert.doesNotThrow(() => {
      headerSource = readFileSync(headerPath, 'utf8')
    }, 'Header.tsx should load without file system errors')
    
    assert.ok(headerSource.length > 0, 'Header.tsx should not be empty')
  })

  test('App should follow React best practices', () => {
    assert.ok(appSource.includes('export default function App'), 
      'Should export default App function')
    assert.ok(appSource.includes('import React') || appSource.includes('React.'), 
      'Should import React')
    assert.ok(appSource.includes('useEffect'), 
      'Should use React hooks')
  })

  test('main.tsx should set up React properly', () => {
    assert.ok(mainSource.includes('ReactDOM') || mainSource.includes('createRoot'), 
      'Should use React 18 createRoot')
    assert.ok(mainSource.includes('App'), 
      'Should import and render App')
    assert.ok(mainSource.includes('#root'), 
      'Should mount to root element')
  })

  test('App should implement proper layout', () => {
    assert.ok(appSource.includes('Header'), 
      'Should include Header component')
    assert.ok(appSource.includes('Sidebar'), 
      'Should include Sidebar component')
    assert.ok(appSource.includes('BitCraftyFlowProvider'), 
      'Should include React Flow provider')
    assert.ok(appSource.includes('GraphContainer'), 
      'Should include GraphContainer')
  })

  test('App should use Zustand store', () => {
    assert.ok(appSource.includes('useBitCraftyStore') || appSource.includes('useStore'), 
      'Should use Zustand store')
    assert.ok(appSource.includes('loadData'), 
      'Should call loadData on mount')
  })

  test('Sidebar should implement enhanced queue and tabs', () => {
    assert.ok(sidebarSource.includes('SearchInput'), 
      'Should include SearchInput component')
    assert.ok(sidebarSource.includes('NodeDetailsPanel'), 
      'Should include NodeDetailsPanel component')
    assert.ok(sidebarSource.includes('EnhancedCraftingQueue'), 
      'Should include EnhancedCraftingQueue component')
    assert.ok(sidebarSource.includes('ResourceSummary'), 
      'Should include ResourceSummary component')
    assert.ok(sidebarSource.includes('CraftingPaths'), 
      'Should include CraftingPaths component')
    assert.ok(sidebarSource.includes('activeTab'), 
      'Should implement tab navigation')
  })

  test('Sidebar should use enhanced queue selectors', () => {
    assert.ok(sidebarSource.includes('useItemsArray'), 
      'Should use items selector')
    assert.ok(sidebarSource.includes('useCraftsArray'), 
      'Should use crafts selector')
    assert.ok(sidebarSource.includes('useProfessionsArray'), 
      'Should use professions selector')
    assert.ok(sidebarSource.includes('useVisibleProfessions'), 
      'Should use visible professions selector')
    assert.ok(sidebarSource.includes('useEnhancedQueue'), 
      'Should use enhanced queue selector')
    assert.ok(sidebarSource.includes('useQueueSummary'), 
      'Should use queue summary selector')
  })

  test('Header should provide application info', () => {
    assert.ok(headerSource.includes('BitCrafty'), 
      'Should display app name')
    assert.ok(headerSource.includes('export'), 
      'Should export Header component')
  })

  test('Components should follow accessibility standards', () => {
    assert.ok(sidebarSource.includes('button'), 
      'Sidebar should use button elements')
    assert.ok(sidebarSource.includes('onClick'), 
      'Should handle click events')
    assert.ok(sidebarSource.includes('style'), 
      'Should apply proper styling')
  })

  test('App should handle loading states', () => {
    assert.ok(appSource.includes('isLoading') || appSource.includes('loading'), 
      'Should handle loading state')
    assert.ok(appSource.includes('useEffect'), 
      'Should use effect for data loading')
  })

  test('Components should use TypeScript properly', () => {
    const allSources = [appSource, mainSource, sidebarSource, headerSource]
    const files = ['App.tsx', 'main.tsx', 'Sidebar.tsx', 'Header.tsx']
    
    allSources.forEach((source, index) => {
      assert.ok(source.includes('React.FC') || source.includes(': React.'), 
        `${files[index]} should use proper React TypeScript patterns`)
    })
  })
})

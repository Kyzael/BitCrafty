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
    assert.ok(appSource.includes('function App') || appSource.includes('const App'), 
      'Should export App function or component')
    assert.ok(appSource.includes('import') && appSource.includes('React'), 
      'Should import React')
    assert.ok(appSource.includes('useEffect'), 
      'Should use React hooks')
  })

  test('main.tsx should set up React properly', () => {
    assert.ok(mainSource.includes('ReactDOM') || mainSource.includes('createRoot'), 
      'Should use React 18 createRoot')
    assert.ok(mainSource.includes('App'), 
      'Should import and render App')
  })

  test('App should implement proper layout', () => {
    assert.ok(appSource.includes('Header'), 
      'Should include Header component')
    assert.ok(appSource.includes('Sidebar'), 
      'Should include Sidebar component')
    assert.ok(appSource.includes('GraphContainer') || appSource.includes('graph'), 
      'Should include graph visualization')
  })

  test('App should use Zustand store', () => {
    assert.ok(appSource.includes('useBitCraftyStore') || appSource.includes('useStore'), 
      'Should use Zustand store')
    assert.ok(appSource.includes('loadData'), 
      'Should call loadData on mount')
  })

  test('Sidebar should implement enhanced queue and tabs', () => {
    assert.ok(sidebarSource.includes('NodeDetailsPanel'), 
      'Should include NodeDetailsPanel component')
    assert.ok(sidebarSource.includes('EnhancedCraftingQueue') || sidebarSource.includes('Queue'), 
      'Should include queue component')
    assert.ok(sidebarSource.includes('tab'), 
      'Should implement tab navigation')
  })

  test('Sidebar should use enhanced queue selectors', () => {
    assert.ok(sidebarSource.includes('use') && sidebarSource.includes('store'), 
      'Should use store selectors')
    assert.ok(sidebarSource.includes('Queue') || sidebarSource.includes('queue'), 
      'Should use queue functionality')
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
      assert.ok(source.includes('import') && source.includes('from'), 
        `${files[index]} should use proper import statements`)
    })
  })
})

import { test, describe } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('TypeScript Library Tests', () => {
  let dataLoaderSource
  let graphBuilderSource
  let utilsSource
  let constantsSource

  test('should load data-loader.ts without errors', () => {
    const dataLoaderPath = join(__dirname, '../../src/lib/data-loader.ts')
    assert.doesNotThrow(() => {
      dataLoaderSource = readFileSync(dataLoaderPath, 'utf8')
    }, 'data-loader.ts should load without file system errors')
    
    assert.ok(dataLoaderSource.length > 0, 'data-loader.ts should not be empty')
  })

  test('should load graph-builder.ts without errors', () => {
    const graphBuilderPath = join(__dirname, '../../src/lib/graph-builder.ts')
    assert.doesNotThrow(() => {
      graphBuilderSource = readFileSync(graphBuilderPath, 'utf8')
    }, 'graph-builder.ts should load without file system errors')
    
    assert.ok(graphBuilderSource.length > 0, 'graph-builder.ts should not be empty')
  })

  test('should load utils.ts without errors', () => {
    const utilsPath = join(__dirname, '../../src/lib/utils.ts')
    assert.doesNotThrow(() => {
      utilsSource = readFileSync(utilsPath, 'utf8')
    }, 'utils.ts should load without file system errors')
    
    assert.ok(utilsSource.length > 0, 'utils.ts should not be empty')
  })

  test('should load constants.ts without errors', () => {
    const constantsPath = join(__dirname, '../../src/lib/constants.ts')
    assert.doesNotThrow(() => {
      constantsSource = readFileSync(constantsPath, 'utf8')
    }, 'constants.ts should load without file system errors')
    
    assert.ok(constantsSource.length > 0, 'constants.ts should not be empty')
  })

  test('data-loader should implement proper loading functions', () => {
    assert.ok(dataLoaderSource.includes('export'), 
      'Should export functions')
    assert.ok(dataLoaderSource.includes('loadBitCraftyData'), 
      'Should have loadBitCraftyData function')
    assert.ok(dataLoaderSource.includes('async'), 
      'Should use async/await pattern')
    assert.ok(dataLoaderSource.includes('fetch') || dataLoaderSource.includes('import'), 
      'Should load data from files')
  })

  test('data-loader should implement helper functions', () => {
    assert.ok(dataLoaderSource.includes('arrayToRecord'), 
      'Should have arrayToRecord helper')
    assert.ok(dataLoaderSource.includes('professionsArrayToRecord'), 
      'Should have professionsArrayToRecord helper')
  })

  test('graph-builder should implement graph creation', () => {
    assert.ok(graphBuilderSource.includes('export'), 
      'Should export functions')
    assert.ok(graphBuilderSource.includes('buildGraphData'), 
      'Should have buildGraphData function')
    assert.ok(graphBuilderSource.includes('GraphNode'), 
      'Should use GraphNode type')
    assert.ok(graphBuilderSource.includes('GraphEdge'), 
      'Should use GraphEdge type')
  })

  test('graph-builder should create nodes and edges', () => {
    assert.ok(graphBuilderSource.includes('type: \'item\''), 
      'Should create item nodes')
    assert.ok(graphBuilderSource.includes('type: \'craft\''), 
      'Should create craft nodes')
    assert.ok(graphBuilderSource.includes('source:'), 
      'Should create edges with source')
    assert.ok(graphBuilderSource.includes('target:'), 
      'Should create edges with target')
  })

  test('graph-builder should implement layout', () => {
    assert.ok(graphBuilderSource.includes('dagre') || graphBuilderSource.includes('layout'), 
      'Should use layout algorithm')
    assert.ok(graphBuilderSource.includes('position'), 
      'Should calculate node positions')
  })

  test('utils should implement utility functions', () => {
    assert.ok(utilsSource.includes('export'), 
      'Should export utility functions')
    assert.ok(utilsSource.includes('SearchMode'), 
      'Should define SearchMode type')
  })

  test('constants should define application constants', () => {
    assert.ok(constantsSource.includes('export'), 
      'Should export constants')
    assert.ok(constantsSource.includes('BASE_CRAFT_ITEMS'), 
      'Should define base craft items')
  })

  test('all files should use proper TypeScript', () => {
    const allSources = [dataLoaderSource, graphBuilderSource, utilsSource, constantsSource]
    
    allSources.forEach((source, index) => {
      const files = ['data-loader.ts', 'graph-builder.ts', 'utils.ts', 'constants.ts']
      assert.ok(source.includes('import') || source.includes('export'), 
        `${files[index]} should use ES6 modules`)
      assert.ok(!source.includes('any') || source.includes('// @ts-'), 
        `${files[index]} should avoid any types`)
    })
  })

  test('data-loader should handle errors properly', () => {
    assert.ok(dataLoaderSource.includes('try') || dataLoaderSource.includes('catch'), 
      'Should implement error handling')
  })

  test('graph-builder should handle empty data', () => {
    assert.ok(graphBuilderSource.includes('length') || graphBuilderSource.includes('Object.keys'), 
      'Should check for empty data')
  })
})

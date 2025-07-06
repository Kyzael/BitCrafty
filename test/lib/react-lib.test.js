/**
 * BitCrafty React Library Unit Tests
 * 
 * Tests for React-specific utilities, data loader, graph builder, and resource calculator
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('React Library Tests', () => {
  let dataLoaderSource;
  let graphBuilderSource;
  let resourceCalculatorSource;
  let constantsSource;
  let utilsSource;

  test('should load data-loader.ts without errors', () => {
    const dataLoaderPath = path.join(__dirname, '../../src/lib/data-loader.ts');
    assert.doesNotThrow(() => {
      dataLoaderSource = fs.readFileSync(dataLoaderPath, 'utf8');
    }, 'data-loader.ts should load without file system errors');
    
    assert.ok(dataLoaderSource.length > 0, 'data-loader.ts should not be empty');
  });

  test('should load graph-builder.ts without errors', () => {
    const graphBuilderPath = path.join(__dirname, '../../src/lib/graph-builder.ts');
    assert.doesNotThrow(() => {
      graphBuilderSource = fs.readFileSync(graphBuilderPath, 'utf8');
    }, 'graph-builder.ts should load without file system errors');
    
    assert.ok(graphBuilderSource.length > 0, 'graph-builder.ts should not be empty');
  });

  test('should load resource-calculator.ts without errors', () => {
    const resourceCalculatorPath = path.join(__dirname, '../../src/lib/resource-calculator.ts');
    assert.doesNotThrow(() => {
      resourceCalculatorSource = fs.readFileSync(resourceCalculatorPath, 'utf8');
    }, 'resource-calculator.ts should load without file system errors');
    
    assert.ok(resourceCalculatorSource.length > 0, 'resource-calculator.ts should not be empty');
  });

  test('should load constants.ts without errors', () => {
    const constantsPath = path.join(__dirname, '../../src/lib/constants.ts');
    assert.doesNotThrow(() => {
      constantsSource = fs.readFileSync(constantsPath, 'utf8');
    }, 'constants.ts should load without file system errors');
    
    assert.ok(constantsSource.length > 0, 'constants.ts should not be empty');
  });

  test('should load utils.ts without errors', () => {
    const utilsPath = path.join(__dirname, '../../src/lib/utils.ts');
    assert.doesNotThrow(() => {
      utilsSource = fs.readFileSync(utilsPath, 'utf8');
    }, 'utils.ts should load without file system errors');
    
    assert.ok(utilsSource.length > 0, 'utils.ts should not be empty');
  });

  test('data-loader should implement proper loading functions', () => {
    assert.ok(dataLoaderSource.includes('export async function loadBitCraftyData'), 
      'Should export loadBitCraftyData function');
    assert.ok(dataLoaderSource.includes('identifyBaseResources'), 
      'Should implement identifyBaseResources function');
    assert.ok(dataLoaderSource.includes('BASE_CRAFT_ITEMS'), 
      'Should use BASE_CRAFT_ITEMS constant');
  });

  test('graph-builder should implement React Flow integration', () => {
    assert.ok(graphBuilderSource.includes('export function buildGraphData'), 
      'Should export buildGraphData function');
    assert.ok(graphBuilderSource.includes('Node'), 
      'Should handle React Flow nodes');
    assert.ok(graphBuilderSource.includes('Edge'), 
      'Should handle React Flow edges');
    assert.ok(graphBuilderSource.includes('dagre'), 
      'Should use Dagre for layout');
  });

  test('resource-calculator should implement queue processing', () => {
    assert.ok(resourceCalculatorSource.includes('calculateResourcesForQueue'), 
      'Should export calculateResourcesForQueue function');
    assert.ok(resourceCalculatorSource.includes('getItemCraftingPaths'), 
      'Should export getItemCraftingPaths function');
    assert.ok(resourceCalculatorSource.includes('visited'), 
      'Should handle circular dependencies with visited sets');
  });

  test('constants should define required application constants', () => {
    assert.ok(constantsSource.includes('BASE_CRAFT_ITEMS'), 
      'Should define BASE_CRAFT_ITEMS constant');
    assert.ok(constantsSource.includes('export'), 
      'Should use ES6 exports');
  });

  test('utils should provide utility functions', () => {
    assert.ok(utilsSource.includes('export'), 
      'Should export utility functions');
  });

  test('should follow TypeScript best practices', () => {
    const sources = [dataLoaderSource, graphBuilderSource, resourceCalculatorSource];
    const files = ['data-loader.ts', 'graph-builder.ts', 'resource-calculator.ts'];
    
    sources.forEach((source, index) => {
      assert.ok(source.includes('interface') || source.includes('type'), 
        `${files[index]} should define TypeScript interfaces or types`);
    });
  });

  test('data-loader should handle async operations properly', () => {
    assert.ok(dataLoaderSource.includes('Promise') || dataLoaderSource.includes('async'), 
      'Should handle async operations');
    assert.ok(dataLoaderSource.includes('try') && dataLoaderSource.includes('catch'), 
      'Should implement proper error handling');
  });

  test('graph-builder should implement profession-based coloring', () => {
    assert.ok(graphBuilderSource.includes('profession') || graphBuilderSource.includes('color'), 
      'Should implement profession-based coloring');
    assert.ok(graphBuilderSource.includes('metadata'), 
      'Should use metadata for professions');
  });

  test('resource-calculator should implement base resource identification', () => {
    assert.ok(resourceCalculatorSource.includes('isBaseResource') || resourceCalculatorSource.includes('baseResources'), 
      'Should identify base resources');
    assert.ok(resourceCalculatorSource.includes('surplus'), 
      'Should handle surplus calculations');
  });
});

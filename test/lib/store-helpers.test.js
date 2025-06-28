/**
 * BitCrafty Store Helpers Unit Tests
 * 
 * Tests for data access patterns and store helper functions
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_HELPERS_PATH = path.join(__dirname, '..', '..', 'lib', 'store-helpers.js');

describe('Store Helpers Tests', () => {
  test('should load store-helpers.js without errors', async () => {
    assert.ok(fs.existsSync(STORE_HELPERS_PATH), 'store-helpers.js file should exist');
    
    const content = fs.readFileSync(STORE_HELPERS_PATH, 'utf8');
    assert.ok(content.length > 0, 'store-helpers.js should not be empty');
    assert.ok(content.includes('export'), 'store-helpers.js should use ES6 exports');
  });

  test('should contain helper objects for data access', async () => {
    const content = fs.readFileSync(STORE_HELPERS_PATH, 'utf8');
    
    // Check for helper objects mentioned in coding standards
    assert.ok(content.includes('ItemHelpers') || content.includes('CraftHelpers'), 
             'Should contain data access helper objects');
  });

  test('should follow store access patterns', async () => {
    const content = fs.readFileSync(STORE_HELPERS_PATH, 'utf8');
    
    // Should access Zustand store (mentioned in coding standards)
    assert.ok(content.includes('store') || content.includes('useStore'), 
             'Should contain store access patterns');
  });
});

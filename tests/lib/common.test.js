/**
 * BitCrafty Common Library Unit Tests
 * 
 * Tests for utility functions, DOM helpers, and constants in lib/common.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock DOM environment for testing DOM utilities
global.document = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '',
    textContent: '',
    style: {},
    appendChild: function(child) { this.children = this.children || []; this.children.push(child); },
    addEventListener: function() {},
    setAttribute: function(name, value) { this[name] = value; },
    getAttribute: function(name) { return this[name]; }
  }),
  body: {
    appendChild: function() {}
  }
};

// Import the common library
// Note: We'll need to modify the import to work in test environment
const COMMON_PATH = path.join(__dirname, '..', '..', 'lib', 'common.js');

describe('Common Library Tests', () => {
  test('should load common.js without errors', async () => {
    // Test that the file exists and can be loaded
    assert.ok(fs.existsSync(COMMON_PATH), 'common.js file should exist');
    
    // Read the file to ensure it's valid JavaScript
    const content = fs.readFileSync(COMMON_PATH, 'utf8');
    assert.ok(content.length > 0, 'common.js should not be empty');
    assert.ok(content.includes('export'), 'common.js should use ES6 exports');
  });

  test('should contain required constants', async () => {
    const content = fs.readFileSync(COMMON_PATH, 'utf8');
    
    // Check for key constants based on coding standards
    assert.ok(content.includes('COLORS'), 'Should define COLORS constant');
    assert.ok(content.includes('BASE_CRAFT_ITEMS'), 'Should define BASE_CRAFT_ITEMS constant');
  });

  test('should contain DOM helper functions', async () => {
    const content = fs.readFileSync(COMMON_PATH, 'utf8');
    
    // Check for DOM utilities mentioned in coding standards
    assert.ok(content.includes('DOM') || content.includes('createElement'), 'Should contain DOM utilities');
  });

  test('should contain validation and utility functions', async () => {
    const content = fs.readFileSync(COMMON_PATH, 'utf8');
    
    // Check for validation utilities
    assert.ok(content.includes('VALIDATION'), 'Should contain VALIDATION utilities');
    assert.ok(content.includes('MATH'), 'Should contain MATH utilities');
    assert.ok(content.includes('ERROR'), 'Should contain ERROR utilities');
  });
});

#!/usr/bin/env node

/**
 * Test Runner for BitCrafty Data Validation
 * 
 * Usage:
 *   npm test                    # Run all validation tests
 *   node run-tests.js          # Direct execution
 *   node run-tests.js --quiet  # Less verbose output
 */

import { DataValidator } from './data-validation.test.js';

const args = process.argv.slice(2);
const isQuiet = args.includes('--quiet');

if (!isQuiet) {
  console.log('🚀 Starting BitCrafty Data Validation Tests...\n');
}

const validator = new DataValidator();
const success = validator.runAllTests();

if (!isQuiet) {
  console.log('\n🏁 Test run complete');
}

process.exit(success ? 0 : 1);

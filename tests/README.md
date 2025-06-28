# BitCrafty Testing Suite

This directory contains all tests for the BitCrafty application, including unit tests for components and libraries, plus data validation tests.

## Test Structure

```
tests/
├── components/           # Component unit tests
│   ├── crafting.test.js
│   ├── filters.test.js
│   ├── graph.test.js
│   └── ui.test.js
├── lib/                  # Library unit tests
│   ├── common.test.js
│   └── store-helpers.test.js
├── data-validation.test.js  # Data integrity validation
├── package.json            # Test dependencies and scripts
└── README.md              # This file
```

## Running Tests

### All Tests (Unit + Data Validation)
```bash
npm test
# Uses: node --test (finds all .test.js files)
```

### Unit Tests Only (Excludes Data Validation)
```bash
npm run test:unit
# Uses: node --test components/**/*.test.js lib/**/*.test.js
```

### Data Validation Only
```bash
npm run validate
# Uses: node data-validation.test.js
```

### GitHub-Friendly Data Validation (Markdown Output)
```bash
npm run validate:github
# Uses: node data-validation.test.js --github
```

## Test Types

### 1. Unit Tests
Tests individual components and libraries to ensure they:
- Load without syntax errors
- Export required functions (especially `initialize()`)
- Follow architectural patterns from coding standards
- Use proper event-driven communication
- Implement required functionality

**Philosophy**: These tests validate structure and patterns rather than detailed implementation, making them robust against refactoring while ensuring architectural compliance.

### 2. Data Validation Tests
Comprehensive validation of JSON data files:
- **Reference Integrity**: All item/craft/requirement references are valid
- **ID Format Validation**: Entity IDs follow `type:profession:identifier` format
- **Profession Mapping**: All professions exist in metadata
- **Orphaned Data**: Detect unused requirements
- **Data Completeness**: Ensure all entities have required fields

## Testing Framework

**Node.js Native Test Runner** (Node.js 18+)
- ✅ Zero external dependencies
- ✅ Native ES6 module support
- ✅ Built-in assertions with `node --test`
- ✅ Spec reporter for readable output
- ✅ Works with your existing Node.js setup

## Writing New Tests

### Component Test Example
```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('My Component Tests', () => {
  test('should export initialize function', async () => {
    const content = fs.readFileSync(COMPONENT_PATH, 'utf8');
    assert.ok(content.includes('initialize'), 'Should export initialize function');
  });
});
```

### Adding Mock DOM
For components that use DOM:
```javascript
// Add to top of test file
global.document = {
  createElement: (tag) => ({ /* mock element */ }),
  getElementById: () => null,
  // ... other DOM methods
};
```

## Test Guidelines

1. **Keep Tests Simple**: Focus on structure and patterns, not implementation details
2. **Mock Minimally**: Only mock what's necessary (DOM, external APIs)
3. **Test Architecture**: Verify coding standards compliance
4. **Fast Execution**: Tests should run quickly for rapid feedback
5. **Zero Dependencies**: Use only Node.js built-ins

## Integration with Development

- Run tests before committing changes
- Add tests when creating new components
- Update data validation when changing data schema
- Use in CI/CD pipelines for automated validation

## GitHub Actions Integration

The project uses two GitHub Actions workflows:

1. **Unit Tests** (`unit-tests.yml`)
   - Triggers on changes to `components/**`, `lib/**`, or `tests/**`
   - Runs unit tests with native GitHub test result display
   - GitHub automatically shows test results in PR checks

2. **Data Validation** (`data-validation.yml`)
   - Triggers on changes to `data/**` or `tests/**`
   - Validates JSON data integrity with custom markdown output
   - Generates detailed validation tables in PR summaries

## Example Output

### Unit Tests
```
▶ UI Component Tests
  ✔ should load ui.js without errors
  ✔ should export initialize function
  ✔ should use event-driven communication
  ✔ should use DOM helpers from common.js
✔ UI Component Tests (2.0ms)

ℹ tests 24
ℹ suites 6
ℹ pass 24
ℹ fail 0
```

### Data Validation
```
🧪 BitCrafty Data Validation
┌─────────┬────────────────┬───────┬──────────────────────┬─────────┐
│ (index) │ Data Type      │ Count │ Missing References   │ Status  │
├─────────┼────────────────┼───────┼──────────────────────┼─────────┤
│ 0       │ 'Items'        │ 58    │ '✅ All valid'       │ '✅ OK' │
│ 1       │ 'Crafts'       │ 38    │ '✅ All valid'       │ '✅ OK' │
└─────────┴────────────────┴───────┴──────────────────────┴─────────┘
✅ All data references are valid!
📋 Validation Result: ✅ PASSED
```

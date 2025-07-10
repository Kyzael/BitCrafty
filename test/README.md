# BitCrafty Test Suite

This directory contains the test suite for BitCrafty, a React-based crafting tree visualization tool.

## Test Structure

### Data Validation Tests
- `data-validation.test.js` - Validates data integrity and references

### Unit Tests
- `lib/react-lib.test.js` - Tests React library utilities (data-loader, graph-builder, resource-calculator)
- `react-components/store.test.js` - Tests Zustand store implementation

### Legacy Tests
- `resource-calculator.test.ts` - Legacy TypeScript test (retained for reference)

## Running Tests

### Primary Test Commands
```bash
npm test               # Runs data validation (primary test)
npm run test:unit      # Runs unit tests for core React components
npm run validate       # Runs data validation
npm run validate:github # Runs data validation with GitHub output format
```

### Test Coverage
- ✅ **Data Validation**: Comprehensive validation of all game data references
- ✅ **Store Architecture**: Zustand store implementation and selectors
- ✅ **Library Functions**: Data loading, graph building, and resource calculation
- ✅ **TypeScript Compliance**: Proper typing and interface validation

## Test Philosophy

The test suite focuses on:
1. **Data Integrity** - Ensuring all game data references are valid
2. **Architectural Compliance** - Verifying React/TypeScript best practices
3. **Core Functionality** - Testing essential library functions

## Notes

- Tests are designed to validate the React architecture, not the legacy vanilla JS implementation
- Data validation is the primary test as it ensures game data integrity
- Unit tests verify architectural patterns and core functionality
- All tests use Node.js built-in test runner (no external testing framework required)

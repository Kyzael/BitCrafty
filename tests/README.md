# BitCrafty Data Validation Tests

This directory contains comprehensive data validation tests to ensure data integrity across all BitCrafty data files.

## 🎯 What We Test

1. **Craft Item References** - All item IDs referenced in crafts.json exist in items.json
2. **Entity Profession Categories** - All items and crafts have valid profession categories in their entity IDs
3. **Craft Requirements** - All crafts have valid requirement references
4. **Requirement Metadata** - All requirements reference valid tools, buildings, and professions
5. **Data Integrity** - No duplicate IDs, missing names, or orphaned data
6. **Profession Distribution** - Analysis of data distribution across professions

## 🚀 Running Tests

### Manual Testing
```bash
# Navigate to tests directory
cd tests

# Run all validation tests
node node run-tests.js

# Quiet mode (less verbose)
node run-tests.js --quiet
```

### npm Scripts
```bash
# From tests directory
npm test
npm run validate
```

### GitHub Actions
Tests automatically run on:
- Pull requests that modify `data/**` or `tests/**`
- Pushes to main branch
- Manual workflow dispatch

## 📋 Test Output

### Success Example
```
🧪 BitCrafty Data Validation Tests
=====================================

ℹ️  Test 1: Validating craft item references...
✅ All 156 item references in crafts are valid
ℹ️  Test 2: Validating entity profession categories...
✅ All 58 items and 38 crafts have valid profession categories
ℹ️  Test 3: Validating craft requirements...
✅ All 38 crafts have valid requirements
ℹ️  Test 4: Validating requirement metadata references...
✅ All 14 requirements have valid metadata references
ℹ️  Test 5: Additional data integrity checks...
✅ Data integrity checks passed

📋 Test Summary:
✅ PASSED
Errors: 0
Warnings: 0

🎉 All data validation tests passed!
```

### Error Example
```
❌ ERROR: Craft "craft:cooking:mystery-dish" references non-existent item "item:cooking:unknown-ingredient" in materials
❌ ERROR: Item "item:invalid:bad-profession" has invalid profession "invalid" (not found in professions.json)
❌ ERROR: Craft "craft:cooking:broken-recipe" is missing requirement field

📋 Test Summary:
❌ FAILED
Errors: 3
Warnings: 0

❌ Errors found - fix these before merging:
  - Craft "craft:cooking:mystery-dish" references non-existent item "item:cooking:unknown-ingredient" in materials
  - Item "item:invalid:bad-profession" has invalid profession "invalid" (not found in professions.json)
  - Craft "craft:cooking:broken-recipe" is missing requirement field
```

## 🔧 Adding New Tests

To add new validation tests:

1. Open `data-validation.test.js`
2. Add your test method to the `DataValidator` class
3. Call it from `runAllTests()`
4. Follow the pattern of using `this.error()`, `this.warning()`, and `this.success()`

Example:
```javascript
validateNewDataRule() {
  this.info("Test X: Validating new data rule...");
  let validCount = 0;
  
  items.forEach(item => {
    if (/* your validation logic */) {
      validCount++;
    } else {
      this.error(`Item "${item.id}" violates new rule`);
    }
  });
  
  if (validCount === items.length) {
    this.success(`All ${items.length} items pass new validation rule`);
  }
}
```

## 📁 File Structure

- `data-validation.test.js` - Main validation test suite
- `run-tests.js` - Simple test runner script
- `package.json` - Test package configuration
- `README.md` - This documentation

## 🎯 Best Practices

1. **Run tests before commits** - Catch issues early
2. **Fix all errors** - Warnings are optional, errors block merges
3. **Test locally first** - Don't rely only on CI/CD
4. **Update tests** - When adding new data types, add corresponding validations

## 🔗 Integration

These tests integrate with:
- **GitHub Actions** - Automatic PR validation
- **Local Development** - Manual testing during development
- **Data Migration** - Validation after data structure changes

The tests ensure that the BitCrafty application will not encounter runtime errors due to invalid data references or malformed entity IDs.

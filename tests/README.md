# BitCrafty Data Validation Tests

This directory contains comprehensive data validation tests to ensure data integrity across all BitCrafty data files.

## 🎯 What We Test

1. **Craft Item References** - All item IDs referenced in crafts.json exist in items.json
2. **Entity Profession Categories** - All items and crafts have valid profession categories in their entity IDs
3. **Craft Requirements** - All crafts have valid requirement references
4. **Requirement Metadata** - All requirements reference valid tools, buildings, and professions
5. **Data Integrity** - No duplicate IDs, missing names, or orphaned data

The validation runs silently and focuses on providing a clear console table overview with detailed missing reference information when needed.

## 🚀 Running Tests

### Manual Testing
```bash
# Navigate to tests directory
cd tests

# Run all validation tests directly
node data-validation.test.js
```

### npm Scripts
```bash
# From tests directory
npm test                # Full validation with table output
npm run validate        # Same as npm test
```

### GitHub Actions
Tests automatically run on:
- Pull requests that modify `data/**` or `tests/**`
- Pushes to main branch
- Manual workflow dispatch

## 📋 Test Output

The validation script now focuses on a clean, table-based output showing a comprehensive data overview:

### Success Example
```
🧪 BitCrafty Data Validation
============================

📋 Data Overview Table:
┌─────────┬────────────────┬───────┬──────────────────────┬─────────┐
│ (index) │ Data Type      │ Count │ Missing References   │ Status  │
├─────────┼────────────────┼───────┼──────────────────────┼─────────┤
│ 0       │ 'Items'        │ 58    │ '✅ All valid'       │ '✅ OK' │
│ 1       │ 'Crafts'       │ 38    │ '✅ All valid'       │ '✅ OK' │
│ 2       │ 'Requirements' │ 14    │ '✅ All valid'       │ '✅ OK' │
│ 3       │ 'Professions'  │ 10    │ '✅ N/A (base data)' │ '✅ OK' │
│ 4       │ 'Tools'        │ 10    │ '✅ N/A (base data)' │ '✅ OK' │
│ 5       │ 'Buildings'    │ 14    │ '✅ N/A (base data)' │ '✅ OK' │
└─────────┴────────────────┴───────┴──────────────────────┴─────────┘
✅ All data references are valid - no missing entities found!

📋 Validation Result: ✅ PASSED
```

### Error Example
When validation errors are found, the table will show missing reference counts and additional detailed tables will display the specific missing entity IDs:

```
📋 Data Overview Table:
┌─────────┬────────────────┬───────┬──────────────────────┬─────────┐
│ (index) │ Data Type      │ Count │ Missing References   │ Status  │
├─────────┼────────────────┼───────┼──────────────────────┼─────────┤
│ 0       │ 'Items'        │ 58    │ '✅ All valid'       │ '✅ OK' │
│ 1       │ 'Crafts'       │ 38    │ '2 missing'          │ '❌ ISSUES' │
│ 2       │ 'Requirements' │ 14    │ '✅ All valid'       │ '✅ OK' │
└─────────┴────────────────┴───────┴──────────────────────┴─────────┘

❌ Missing Item References:
┌─────────┬──────────────────────────────────────┐
│ (index) │ Missing Item ID                      │
├─────────┼──────────────────────────────────────┤
│ 0       │ 'item:cooking:unknown-ingredient'    │
│ 1       │ 'item:farming:missing-seed'          │
└─────────┴──────────────────────────────────────┘

📋 Validation Result: ❌ FAILED
Errors: 2

❌ Errors found:
  - Craft "craft:cooking:mystery-dish" references non-existent item "item:cooking:unknown-ingredient" in materials
  - Craft "craft:farming:advanced-crop" references non-existent item "item:farming:missing-seed" in materials
```

## 📊 Console Table Output

The validation script provides a comprehensive data overview table showing:

- **Data Type** - Items, Crafts, Requirements, Professions, Tools, Buildings
- **Count** - Number of entities of each type
- **Missing References** - Number of invalid references found, or "✅ All valid" if none
- **Status** - Overall health status (✅ OK or ❌ ISSUES)

### Key Features:
- **Silent Validation** - All validation tests run quietly in the background
- **Clean Table Output** - Primary focus on the data overview table
- **Detailed Debugging** - Additional tables show specific missing entity IDs when issues are found
- **Quick Assessment** - Immediate visual understanding of data health

The table handles all detailed missing reference information automatically, eliminating the need for verbose step-by-step output.

## 🔧 Adding New Tests

To add new validation tests:

1. Open `data-validation.test.js`
2. Add your test method to the `DataValidator` class
3. Call it from `runAllTests()`
4. Use `this.error()` and `this.warning()` methods to report issues

Example:
```javascript
validateNewDataRule() {
  items.forEach(item => {
    if (/* your validation logic fails */) {
      this.error(`Item "${item.id}" violates new rule`);
    }
  });
}
```

Note: The validation methods now run silently. All verbose output has been removed in favor of the clean table-based reporting system.

## 📁 File Structure

- `data-validation.test.js` - Standalone validation test suite with console table output
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

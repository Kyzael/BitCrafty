# BitCrafty GitHub Actions Workflows

This directory contains automated testing workflows for the BitCrafty project. These workflows ensure code quality and data integrity before merging changes.

## 📁 Workflow Files

### 1. `data-validation.yml`
**Purpose**: Validates JSON data integrity  
**Triggers**: Changes to `data/**` or `tests/**`  
**What it tests**:
- Item/craft/requirement reference integrity
- Entity ID format validation (`type:profession:identifier`)
- Profession mapping validation
- Orphaned data detection
- Missing entity references

**Output**: GitHub markdown table with validation results

### 2. `unit-tests.yml`
**Purpose**: Tests component and library functionality  
**Triggers**: Changes to `components/**`, `lib/**`, or `tests/**`  
**What it tests**:
- Component loading and syntax validation
- Required function exports (especially `initialize()`)
- Architectural pattern compliance
- Event-driven communication usage
- DOM helper usage from common.js

**Output**: Unit test results with pass/fail status

### 3. `full-test-suite.yml`
**Purpose**: Comprehensive testing of entire codebase  
**Triggers**: Changes to `components/**`, `lib/**`, `data/**`, or `tests/**`  
**What it tests**:
- All unit tests (24 tests across 6 suites)
- Complete data validation
- Architecture compliance verification

**Output**: Combined test results with comprehensive summary

## 🎯 Workflow Trigger Logic

| File Changes | Workflows Triggered |
|-------------|-------------------|
| `data/**` | `data-validation.yml`, `full-test-suite.yml` |
| `components/**` | `unit-tests.yml`, `full-test-suite.yml` |
| `lib/**` | `unit-tests.yml`, `full-test-suite.yml` |
| `tests/**` | All three workflows |

## 🚀 Manual Triggering

All workflows can be manually triggered via:
- GitHub Actions tab → Select workflow → "Run workflow"
- Supports `workflow_dispatch` event

## ✅ Success Criteria

### Data Validation
- All entity references must be valid
- Entity IDs must follow proper format
- No missing or orphaned data
- Zero validation errors

### Unit Tests
- All 24 unit tests must pass
- Components must export `initialize()` function
- Must follow coding standards architecture
- Zero test failures

### Full Test Suite
- All 25 tests must pass (24 unit + 1 data validation)
- Complete architecture compliance
- Data integrity verification
- Zero failures across all test types

## 📊 GitHub Integration

### Pull Request Checks
- ✅ Required status checks prevent merging on failure
- 📋 Test summaries appear in PR conversation
- 🔍 Detailed logs available in Actions tab

### Step Summary Output
Each workflow generates markdown summaries with:
- Test result tables
- Pass/fail counts
- Error details (when applicable)
- Success confirmation messages

## 🛠️ Local Testing

Before pushing, you can run the same tests locally:

```bash
# Data validation only
npm run validate

# Unit tests only  
npm run test:unit

# Full test suite
npm test
```

## 🔧 Maintenance

### Adding New Tests
1. Add test files to appropriate `tests/` subdirectories
2. Follow existing patterns for test structure
3. Workflows will automatically include new tests

### Modifying Triggers
Edit the `paths:` sections in workflow files to change which file changes trigger each workflow.

### Updating Node.js Version
All workflows currently use Node.js 18. Update the `node-version:` field in all three files to upgrade.

## 📈 Workflow Performance

| Workflow | Typical Duration | Test Count |
|----------|-----------------|------------|
| Data Validation | ~15-30 seconds | 1 comprehensive validation |
| Unit Tests | ~20-40 seconds | 24 unit tests |
| Full Test Suite | ~30-60 seconds | 25 total tests |

Performance may vary based on GitHub Actions runner availability and repository size.

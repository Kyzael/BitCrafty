---
applyTo: '**'
---

# BitCrafty Coding Standards

This document outlines coding standards and best practices for the BitCrafty project. **AI agents and contributors must follow these guidelines** to ensure code quality, maintainability, and architectural consistency.

## 1. Architecture Principles (CRITICAL)
- **Modular Design:** ALWAYS use the established component-based architecture with clear separation of concerns
- **Event-Driven Communication:** Components MUST communicate via custom events (`window.addEventListener`, `window.dispatchEvent`), never direct function calls
- **Single Responsibility:** Each module/component MUST have one clear purpose
- **Readability First:** Code MUST be self-documenting with clear naming and minimal comments
- **State Management:** ALWAYS use Zustand store as the single source of truth for all application state

## 2. File Structure & Organization (MANDATORY)
```
├── main.js                    # Application entry point
├── lib/
│   ├── common.js             # Constants, utilities, DOM helpers
│   └── store-helpers.js      # Data access patterns
├── components/
│   ├── ui.js                 # Sidebar, search, item details
│   ├── graph.js              # Network visualization
│   ├── crafting.js           # Queue management, resource calculation
│   └── filters.js            # Profession and dependency filtering
└── test/
    ├── components/           # Component unit tests
    ├── lib/                  # Library unit tests
    └── data-validation.test.js
```

**REQUIREMENTS:**
- **Entry Point:** `main.js` MUST initialize all components in correct order
- **Common Libraries:** Shared constants, utilities, and data access patterns MUST go in `lib/`
- **Components:** Feature-focused modules MUST go in `components/` directory
- **Clean Imports:** MUST use ES6 imports/exports, import only what's needed
- **No New Directories:** Do NOT create new top-level directories without approval

## 3. JavaScript Standards (ENFORCED)
- **Modern ES6+:** MUST use const/let, arrow functions, destructuring, template literals
- **Module Pattern:** Each component MUST export only what's needed, imports specifically
- **Event-Driven:** MUST use `window.addEventListener()` and `window.dispatchEvent()` for component communication
- **DOM Utilities:** MUST use the `DOM` helpers from `lib/common.js` for consistent UI creation
- **Store Access:** MUST access all data through store helpers in `lib/store-helpers.js`
- **Error Handling:** MUST use try/catch blocks and provide user feedback for errors
- **No jQuery/External DOM libs:** Use vanilla JavaScript only

## 4. Component Guidelines (MANDATORY)
- **Initialization:** Each component MUST export an `initialize()` function called from `main.js`
- **Event Listeners:** MUST set up in component initialization, clean up if needed
- **State Updates:** MUST use Zustand store for all stateful operations
- **UI Updates:** MUST trigger via events, update DOM directly in response
- **Data Access:** MUST use helper objects (ItemHelpers, CraftHelpers, etc.) not direct store access
- **No Global Variables:** Everything must be properly scoped and imported

## 5. Testing Standards (CRITICAL)
- **Framework:** MUST use Node.js Native Test Runner (`node --test`)
- **Test Structure:** Tests MUST be in `test/` directory with subdirectories matching source structure
- **File Naming:** Test files MUST end with `.test.js`
- **Auto-Discovery:** Node.js automatically finds tests in `test/` directory (follows `**/test/**/*.js` pattern)
- **Test Types:**
  - **Unit Tests:** Test component architecture compliance, exports, and patterns
  - **Data Validation:** Test JSON data integrity and entity references
- **Required Tests:**
  - MUST test that components export `initialize()` function
  - MUST test that components load without syntax errors
  - MUST test architectural pattern compliance
  - MUST test data integrity for all JSON files

**Test Commands:**
```bash
npm test              # All tests (unit + data validation)
npm run test:unit     # Unit tests only
npm run validate      # Data validation only
```

**Test Philosophy:** Tests MUST focus on architectural compliance and data integrity, not implementation details.

## 6. Data Model (STRICT FORMAT)
- **Entity ID Format:** MUST use `TYPE:PROFESSION:IDENTIFIER` (e.g., `item:farming:embergrain`)
- **Profession-Based Organization:** Items and crafts MUST use profession names in their IDs
- **Data Files (DO NOT MODIFY STRUCTURE):**
  - `data/items.json` - All items with profession-based IDs
  - `data/crafts.json` - All crafting recipes with profession-based IDs
  - `data/requirements.json` - Profession, tool, building requirements
  - `data/metadata/professions.json` - Professions with color definitions
  - `data/metadata/` - Tools, buildings metadata
- **Base Items:** MUST use `BASE_CRAFT_ITEMS` constant for items treated as base resources
- **Validation:** ALL references between files MUST be valid (enforced by data validation tests)

## 7. UI/UX Standards (ENFORCED)
- **Monokai Theme:** MUST use the `COLORS` constant from `lib/common.js`
- **Colorblind-Safe:** MUST use approved profession colors only
- **Consistent Spacing:** MUST use standardized padding/margins throughout
- **Responsive:** Sidebar and main content MUST work at various screen sizes
- **No Inline Styles:** Use the DOM helper functions for consistent styling

## 8. Graph Visualization (SPECIFIC REQUIREMENTS)
- **Node Types:** Items (rounded boxes), Crafts (pill-shaped) - DO NOT CHANGE
- **Colors:** MUST use automatic profession-based coloring
- **Color Source:** Colors MUST come from `data/metadata/professions.json`
- **Selection:** Bold text only, no color fills on selection
- **Edges:** Cyan for inputs, pink for outputs - DO NOT CHANGE
- **Highlighting:** MUST show incoming edges to selected nodes

## 9. Resource & Crafting Logic (CRITICAL)
- **Circular Dependencies:** MUST ALWAYS use `visited` sets in recursive functions
- **Surplus Sharing:** MUST use single surplus object across entire queue
- **Base Resources:** MUST filter to show only true base materials
- **Store Integration:** ALL calculations MUST use Zustand store data

## 10. GitHub Actions & CI/CD (AUTOMATED)
- **Unit Tests:** Triggered on changes to `components/**`, `lib/**`, `tests/**`
- **Data Validation:** Triggered on changes to `data/**`, `tests/**`
- **Test Requirements:** ALL tests MUST pass before merging
- **No Manual Summaries:** GitHub natively displays Node.js test results

## 11. AI Agent Guidelines (IMPORTANT)
- **Read This Document First:** Always review these standards before making changes
- **Test After Changes:** ALWAYS run tests after making code changes
- **Follow Patterns:** Study existing code patterns and maintain consistency
- **Ask Before Breaking:** Don't break established patterns without discussion
- **Component Changes:** When modifying components, ensure they still export `initialize()`
- **Data Changes:** When modifying data, run validation tests immediately
- **Architecture Compliance:** Maintain event-driven architecture at all costs

## 12. Development Workflow (MANDATORY)
1. **Before Coding:** Review this document and existing code patterns
2. **During Development:** Follow established patterns, use provided utilities
3. **Testing:** Run appropriate tests for your changes (`npm test`, `npm run test:unit`, `npm run validate`)
4. **Code Review:** Ensure all guidelines are followed
5. **CI/CD:** All GitHub Actions must pass before merging

**Accessibility:** Keyboard navigation and colorblind-friendly design
**Error Handling:** Graceful degradation with user feedback
**Comments:** JSDoc for complex functions, inline for non-obvious logic
**Performance:** Optimize for fast loading and smooth interactions


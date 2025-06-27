---
applyTo: '**'
---

# BitCrafty Coding Standards

This document outlines the coding standards and best practices for the BitCrafty project. All contributors should follow these guidelines to ensure code quality, maintainability, and consistency.

## 1. Architecture Principles
- **Modular Design:** Use the established component-based architecture with clear separation of concerns
- **Event-Driven Communication:** Components communicate via custom events, avoiding tight coupling
- **Single Responsibility:** Each module/component should have one clear purpose
- **Readability First:** Code should be self-documenting with clear naming and minimal comments
- **State Management:** Use Zustand store as the single source of truth for all application state

## 2. File Structure & Organization
```
├── main.js                    # Application entry point
├── lib/
│   ├── common.js             # Constants, utilities, DOM helpers
│   └── store-helpers.js      # Data access patterns
└── components/
    ├── ui.js                 # Sidebar, search, item details
    ├── graph.js              # Network visualization
    ├── crafting.js           # Queue management, resource calculation
    └── filters.js            # Profession and dependency filtering
```

- **Entry Point:** `main.js` initializes all components in correct order
- **Common Libraries:** Shared constants, utilities, and data access patterns in `lib/`
- **Components:** Feature-focused modules in `components/` directory
- **Clean Imports:** Use ES6 imports/exports, import only what's needed

## 3. JavaScript Standards
- **Modern ES6+:** Use const/let, arrow functions, destructuring, template literals
- **Module Pattern:** Each component exports only what's needed, imports specifically
- **Event-Driven:** Use `window.addEventListener()` and `window.dispatchEvent()` for component communication
- **DOM Utilities:** Use the `DOM` helpers from `lib/common.js` for consistent UI creation
- **Store Access:** Access all data through store helpers in `lib/store-helpers.js`
- **Error Handling:** Use try/catch blocks and provide user feedback for errors

## 4. Component Guidelines
- **Initialization:** Each component exports an `initialize()` function called from `main.js`
- **Event Listeners:** Set up in component initialization, clean up if needed
- **State Updates:** Use Zustand store for all stateful operations
- **UI Updates:** Trigger via events, update DOM directly in response
- **Data Access:** Use helper objects (ItemHelpers, CraftHelpers, etc.) not direct store access

## 5. Data Model
- **Entity ID Format:** `TYPE:PROFESSION:IDENTIFIER` (e.g., `item:farming:embergrain`, `craft:cooking:berry-pie`)
- **Profession-Based Organization:** Items and crafts use profession names in their IDs for automatic color mapping
- **Data Files:**
  - `data/items.json` - All items with profession-based IDs
  - `data/crafts.json` - All crafting recipes with profession-based IDs
  - `data/requirements.json` - Profession, tool, building requirements
  - `data/metadata/professions.json` - Professions with color definitions
  - `data/metadata/` - Tools, buildings metadata
- **Base Items:** Use `BASE_CRAFT_ITEMS` constant for items treated as base resources
- **Color Mapping:** Use `getProfessionColorFromId()` to extract colors from entity IDs
- **Validation:** Ensure all references between files are valid

## 6. UI/UX Standards
- **Monokai Theme:** Use the `COLORS` constant from `lib/common.js`
- **Colorblind-Safe:** Use approved profession colors only
- **Consistent Spacing:** Use standardized padding/margins throughout
- **Responsive:** Sidebar and main content work at various screen sizes

## 7. Graph Visualization
- **Node Types:** Items (rounded boxes), Crafts (pill-shaped)
- **Colors:** Automatic profession-based coloring using `getProfessionColorFromId()`
- **Color Source:** Colors come from `data/metadata/professions.json`
- **Selection:** Bold text only, no color fills on selection
- **Edges:** Cyan for inputs, pink for outputs
- **Highlighting:** Show incoming edges to selected nodes

## 8. Resource & Crafting Logic
- **Circular Dependencies:** Always use `visited` sets in recursive functions
- **Surplus Sharing:** Single surplus object across entire queue
- **Base Resources:** Filter to show only true base materials
- **Store Integration:** All calculations use Zustand store data

## 9. Development Guidelines
- **Accessibility:** Keyboard navigation and colorblind-friendly design
- **Error Handling:** Graceful degradation with user feedback
- **Comments:** JSDoc for complex functions, inline for non-obvious logic
- **Testing:** Test components individually and as integrated system


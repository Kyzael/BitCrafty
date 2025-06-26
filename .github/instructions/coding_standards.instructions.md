---
applyTo: '**'
---

# BitCrafty Coding Standards

This document outlines the general coding standards and best practices for the BitCrafty project. All contributors should follow these guidelines to ensure code quality, maintainability, and a consistent user experience.

## 1. General Principles
- **Readability First:** Code should be easy to read and understand. Use clear variable and function names, and add comments where logic is non-obvious.
- **Consistency:** Follow the established patterns in the codebase. When in doubt, match the style and structure of existing code.
- **Single Source of Truth:** Avoid duplicating logic or data. Use helper functions and centralized data structures.
- **Accessibility:** All UI features must be accessible, including colorblind-friendly palettes and keyboard navigation where possible.
- **State Management:** Use Zustand as the single state management layer for all app state (items, crafts, professions, graph data, selection, filtering, and queue logic). Access state only through the Zustand store.

## 2. JavaScript/HTML/CSS
- **ES6+ Syntax:** Use modern JavaScript features (let/const, arrow functions, destructuring, etc.).
- **No Global Pollution:** Minimize global variables. Use closures, modules, or IIFEs where appropriate.
- **DOM Manipulation:** Use vanilla JS for DOM manipulation. Avoid jQuery or other libraries unless necessary.
- **Event Listeners:** Attach event listeners after DOM elements are created. Remove listeners if elements are removed.
- **Data Loading:** Always load and parse data asynchronously from multiple JSON files. Handle errors gracefully.
- **UI Updates:** Update the UI only after all data files are loaded and validated.
- **Separation of Concerns:** Keep data logic, UI rendering, and event handling as separate as possible.
- **Zustand Store:** All stateful logic (including queue, selection, filtering, and graph data) must use the Zustand store. Use `loadAllData()` method for loading normalized data files.

## 3. Data Model
- **Normalized Structure:** Use separate JSON files for different entity types in the `data/` directory.
- **Entity ID Format:** All entities use standardized IDs: `entity-type:category:identifier` (e.g., `item:grain:embergrain`, `craft:cooking:berry-pie`).
- **Data Files:**
  - `data/items.json` - All items with unique string IDs
  - `data/crafts.json` - All crafting recipes with material/output references
  - `data/requirements.json` - Profession, tool, and building requirements
  - `data/metadata/` - Additional metadata (professions, tools, buildings)
- **Validation:** Ensure all item and requirement references in crafts exist in their respective files.
- **Base Items:** Use the `BASE_CRAFT_ITEMS` set with proper item IDs for items that should be treated as base resources.

## 4. UI/UX
- **Monokai Theme:** All UI elements should use the Monokai-inspired color palette defined in the project.
- **Colorblind Accessibility:** Use only the approved, colorblind-friendly palette for professions.
- **Consistent Spacing:** Use consistent margins, padding, and font sizes for all UI elements.
- **Responsive Layout:** Sidebar and main content must remain usable at various window sizes.
- **Search/Dropdowns:** Style all search bars and dropdowns to match the Monokai theme.

## 5. Graph Visualization
- **Node Types:**
  - Item nodes: filled boxes with curved corners.
  - Craft nodes: filled roundRect with circular ends.
- **Node Colors:** Color nodes by profession using the palette. Never use red for professions.
- **Node Selection:** Only bold/enlarge node text on selection; never fill the node with a different color.
- **Edge Colors:**
  - Input edges: cyan.
  - Output edges: pink.
  - Highlight edges leading to selected nodes.
- **Graph Spacing:** Use increased spacing for readability.

## 6. Resource Calculation & Crafting Logic
- **Surplus Handling:** Share a single surplus object across the entire queue.
- **Batching:** Batch queue items that are outputs of the same craft to avoid double-counting.
- **Base Resource Calculation:** Only list true base resources in the summary.
- **Circular Logic:** Always handle circular crafting logic robustly. Use a `visited` set or similar mechanism in all recursive functions (e.g., `tracePath`, `processInput`) to prevent infinite recursion. Always check and respect `BASE_CRAFT_ITEMS` before recursing further.
- **Zustand State:** All resource and queue calculations must use data from the Zustand store, not from global or module-level variables.

## 7. Accessibility
- **Colorblind-Friendly:** All profession colors must be distinguishable for colorblind users.
- **Keyboard Navigation:** Ensure all interactive elements (search, dropdowns, buttons) are keyboard accessible.
- **Contrast:** Maintain high contrast for text and UI elements.

## 8. Comments & Documentation
- **Function Comments:** Add JSDoc-style comments for complex functions.
- **Inline Comments:** Use inline comments for non-obvious logic.
- **README:** Keep the `README.md` up to date with setup, usage, and contribution instructions.

## 9. Error Handling
- **Graceful Degradation:** Handle missing or malformed data gracefully.
- **User Feedback:** Provide clear feedback for errors in the UI.


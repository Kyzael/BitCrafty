---
applyTo: '**'
---

# BitCrafty Coding Standards (React + React Flow Architecture)

This document outlines coding standards and best practices for the BitCrafty project. **AI agents and contributors must follow these guidelines** to ensure code quality, maintainability, and architectural consistency.

## 1. Architecture Principles (CRITICAL)
- **React Component Architecture:** ALWAYS use functional components with hooks
- **Zustand State Management:** All application state MUST flow through Zustand store with memoized selectors
- **React Flow Integration:** Graph visualization MUST use React Flow with custom node components
- **TypeScript First:** All code MUST be written in TypeScript with strict type checking
- **Single Responsibility:** Each module/component MUST have one clear purpose
- **Readability First:** Code MUST be self-documenting with clear naming and minimal comments

## 2. File Structure & Organization (MANDATORY)
```
src/
├── App.tsx                   # Application entry point
├── main.tsx                  # React DOM root
├── types/
│   ├── index.ts              # Type exports
│   ├── data.ts               # Data entity types
│   ├── graph.ts              # React Flow types
│   └── store.ts              # State types
├── lib/
│   ├── constants.ts          # Application constants
│   ├── data-loader.ts        # JSON data loading
│   ├── graph-builder.ts      # React Flow graph generation
│   ├── store.ts              # Zustand store definition
│   └── utils.ts              # Utility functions
├── components/
│   ├── BitCraftyFlowProvider.tsx  # React Flow provider wrapper
│   ├── ui/
│   │   ├── Header.tsx        # Top navigation
│   │   ├── Sidebar.tsx       # Filters and controls
│   │   └── CraftingPanel.tsx # Queue management
│   └── graph/
│       ├── GraphContainer.tsx # Main React Flow wrapper
│       └── nodes/
│           ├── ItemNode.tsx  # Item node component
│           └── CraftNode.tsx # Craft node component
├── styles/
│   └── globals.css           # Global styles including React Flow overrides
└── data/                     # JSON data files (unchanged)
```

**REQUIREMENTS:**
- **Entry Point:** `App.tsx` MUST be the root component
- **TypeScript:** ALL files MUST use `.tsx` for components, `.ts` for utilities
- **Barrel Exports:** Use `index.ts` files for clean imports
- **React Flow:** Custom nodes MUST be in `components/graph/nodes/`
- **No Vanilla JS:** All code must use React patterns

## 3. React & TypeScript Standards (ENFORCED)
- **Functional Components:** MUST use functional components with hooks (no class components)
- **TypeScript Strict:** All code MUST pass TypeScript strict mode compilation
- **Hook Rules:** Follow React hooks rules (no conditional hooks, proper dependency arrays)
- **Memoization:** Use `useMemo`, `useCallback`, and `React.memo` for performance optimization
- **Props Interface:** All component props MUST have TypeScript interfaces
- **Error Boundaries:** Use try/catch in components and provide user feedback
- **No Any Types:** Avoid `any` type, use proper type definitions

## 4. React Flow Guidelines (MANDATORY)
- **Custom Node Types:** MUST register node types in `BitCraftyFlowProvider`
- **Node Components:** Custom nodes MUST be memoized with `React.memo`
- **Handle Positioning:** Handles MUST be hidden (`opacity: 0`) but positioned correctly
- **Style Override:** Use CSS classes to override React Flow default styling
- **Data Flow:** Node data MUST include `color` and `profession` properties
- **Layout:** Use Dagre for hierarchical layout calculation
- **Performance:** Batch node/edge updates using React Flow's state hooks

## 5. Zustand Store Standards (CRITICAL)
- **Memoized Selectors:** MUST use memoized selectors for React 18 compatibility
- **Store Structure:** Keep state flat, use helper functions for complex data access
- **Actions:** All mutations MUST go through store actions
- **Persistence:** Use `subscribeWithSelector` middleware for React integration
- **Type Safety:** Store MUST have complete TypeScript interfaces
- **Data Loading:** Async operations MUST update loading states

**Store Pattern:**
```typescript
export const useBitCraftyStore = create<BitCraftyStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    items: {},
    crafts: {},
    
    // Actions
    loadData: async () => {
      set({ isLoading: true })
      // Load data...
      set({ isLoading: false })
    }
  }))
)

// Memoized selectors
export const useIsLoading = () => useBitCraftyStore(state => state.isLoading)
export const useGraphData = () => useBitCraftyStore(state => state.graphData)
```

## 6. Testing Standards (CRITICAL)
- **Framework:** MUST use Node.js Native Test Runner (`node --test`)
- **Test Structure:** Tests MUST be in `test/` directory with subdirectories matching source structure
- **File Naming:** Test files MUST end with `.test.js`
- **Auto-Discovery:** Node.js automatically finds tests in `test/` directory (follows `**/test/**/*.js` pattern)
- **Test Types:**
  - **Unit Tests:** Test component architecture compliance, exports, and patterns
  - **Data Validation:** Test JSON data integrity and entity references
- **Required Tests:**
  - MUST test that React components render without errors
  - MUST test TypeScript compilation passes
  - MUST test data integrity for all JSON files
  - MUST test store actions and state updates

**Test Commands:**
```bash
npm test              # All tests (unit + data validation)
npm run test:unit     # Unit tests only
npm run validate      # Data validation only
```

**Test Philosophy:** Tests MUST focus on architectural compliance and data integrity, not implementation details.

## 7. Data Model (STRICT FORMAT)
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

## 8. UI/UX Standards (ENFORCED)
- **Clean Design:** Focus on clarity and usability over complex styling
- **Profession Colors:** MUST use colors from `data/metadata/professions.json`
- **Consistent Spacing:** MUST use standardized padding/margins throughout
- **Responsive:** Components MUST work at various screen sizes
- **CSS Organization:** Use `styles/globals.css` for React Flow overrides and global styles

## 9. Graph Visualization (SPECIFIC REQUIREMENTS)
- **Node Types:** Items (rounded boxes), Crafts (pill-shaped) - DO NOT CHANGE
- **Colors:** MUST use dynamic profession-based coloring from JSON data
- **Color Source:** Colors MUST come from `data/metadata/professions.json`
- **Styling:** Single box with profession-colored border, transparent background
- **Edges:** Cyan for inputs, pink for outputs - DO NOT CHANGE
- **No Labels:** Edge labels MUST be hidden for clean appearance
- **React Flow Overrides:** Use CSS to remove default React Flow node styling

## 10. Resource & Crafting Logic (CRITICAL)
- **Circular Dependencies:** MUST ALWAYS use `visited` sets in recursive functions
- **Surplus Sharing:** MUST use single surplus object across entire queue
- **Base Resources:** MUST filter to show only true base materials
- **Store Integration:** ALL calculations MUST use Zustand store data

## 11. GitHub Actions & CI/CD (AUTOMATED)
- **Unit Tests:** Triggered on changes to `src/**`, `tests/**`
- **Data Validation:** Triggered on changes to `data/**`, `tests/**`
- **TypeScript Check:** All TypeScript must compile without errors
- **Test Requirements:** ALL tests MUST pass before merging
- **No Manual Summaries:** GitHub natively displays Node.js test results

## 12. AI Agent Guidelines (IMPORTANT)
- **Read This Document First:** Always review these standards before making changes
- **Test After Changes:** ALWAYS run tests after making code changes
- **Follow Patterns:** Study existing React/TypeScript patterns and maintain consistency
- **Ask Before Breaking:** Don't break established patterns without discussion
- **Component Changes:** When modifying components, ensure TypeScript compliance
- **Data Changes:** When modifying data, run validation tests immediately
- **React Flow:** Maintain React Flow integration and styling requirements

## 13. Development Workflow (MANDATORY)
1. **Before Coding:** Review this document and existing code patterns
2. **During Development:** Follow React/TypeScript best practices, use provided utilities
3. **Testing:** Run appropriate tests for your changes (`npm test`, `npm run dev`)
4. **Type Checking:** Ensure TypeScript compilation passes
5. **Code Review:** Ensure all guidelines are followed
6. **CI/CD:** All GitHub Actions must pass before merging



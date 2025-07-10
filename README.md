# BitCrafty: BitCraft Online Crafting Visualizer

**Note:** This is a hobby project and I am not a professional front-end developer and leaned heavily on Agent assistance for implementation.

## Overview
BitCrafty is a React-based web application for visualizing and simplifying the large, complex crafting systems found in BitCraft Online. Built with modern web technologies, the app helps players understand, plan, and optimize crafting paths and resource requirements with professional-grade visualization and calculation tools.

[![Unit Tests](https://github.com/Kyzael/BitCrafty/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/Kyzael/BitCrafty/actions/workflows/unit-tests.yml)
[![Data Validation](https://github.com/Kyzael/BitCrafty/actions/workflows/data-validation.yml/badge.svg)](https://github.com/Kyzael/BitCrafty/actions/workflows/data-validation.yml)
[![Build and Deploy Pages](https://github.com/Kyzael/BitCrafty/actions/workflows/deploy.yml/badge.svg)](https://github.com/Kyzael/BitCrafty/actions/workflows/deploy.yml)

## Project Goals
- **Visualize and simplify** the intricate crafting and resource dependencies in BitCraft Online
- **Modern React Architecture:** Built with React 19, TypeScript, and React Flow for optimal performance and maintainability
- **No serverside dependencies:** 100% client-side, runs entirely in the browser with Vite development server
- **Fast and responsive:** Instant UI updates, smooth graph interactions, and efficient Zustand state management
- **Identify Base Resources:** Advanced resource calculator with dynamic base resource identification and crafting path analysis

## Technology Stack
- **React 19**: Modern functional components with hooks and strict TypeScript
- **TypeScript**: Complete type safety with strict mode compilation
- **React Flow**: Professional graph visualization with custom node components
- **Zustand**: Lightweight state management with memoized selectors for React 18+ compatibility
- **Vite**: Lightning-fast development server and optimized production builds
- **Dagre**: Hierarchical graph layout for optimal node positioning
- **Node.js Native Test Runner**: Zero-dependency testing with built-in assertions

## Getting Started

### Prerequisites
- **Node.js 18+** (for package management and development server)
- **Modern browser** (Chrome, Firefox, Safari, Edge with ES2020+ support)

### Quick Start
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kyzael/BitCrafty.git
   cd BitCrafty
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
4. **Open your browser to:** [http://localhost:3000](http://localhost:3000)

### Development Commands
```bash
npm run dev        # Start development server with hot reload
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run validate   # Run data validation tests
npm run test:unit  # Run unit tests for React components
```

### How It Works
All game data is loaded from normalized JSON files in the `data/` directory and processed entirely in the browser using React and TypeScript. The application features:

- **Dynamic Data Loading:** Efficient loading and parsing of items, crafts, and requirements
- **Real-time Graph Building:** React Flow graphs generated dynamically from data
- **Advanced Resource Calculation:** Smart base resource identification and surplus sharing
- **State Management:** Zustand store with memoized selectors for optimal React performance

No backend, database, or server-side processing required!

### Project Structure
```
src/
├── App.tsx                    # Main application component
├── main.tsx                   # React DOM entry point
├── components/
│   ├── ui/                    # UI components (Sidebar, Header, etc.)
│   └── graph/                 # React Flow graph components
├── lib/
│   ├── store.ts               # Zustand state management
│   ├── data-loader.ts         # JSON data loading and processing
│   ├── graph-builder.ts       # React Flow graph generation
│   └── resource-calculator.ts # Advanced resource calculation
└── types/                     # TypeScript type definitions
```

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

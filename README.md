# BitCrafty: BitCraft Online Crafting Visualizer

**Note:** This is a hobby project and I am not a professional front-end developer please be kind with feedback and suggestions!

## Overview
BitCrafty is a web-based tool for visualizing and simplifying the large, complex crafting systems found in BitCraft Online. The app is designed to help players understand, plan, and optimize crafting paths and resource requirements with ease.

## Project Goals
- **Visualize and simplify** the intricate crafting and resource dependencies in BitCraft Online.
- **No serverside dependencies:** 100% client-side, runs entirely in the browser. No backend or database required.
- **Fast and responsive:** Instant UI updates, smooth graph interactions, and efficient state management for large datasets.

## Features
- Interactive graph visualization of items, crafts, and professions
- Sidebar with searchable item list, profession filters, and crafting queue
- Resource calculation and crafting path tracing
- Colorblind-friendly Monokai-inspired palette

## Technology Stack
- **JavaScript (ES6+)**: Modern syntax and features
- **[Zustand](https://github.com/pmndrs/zustand)**: State management (browser CDN)
- **[vis-network](https://github.com/visjs/vis-network)**: Graph/network visualization (browser CDN)
- **HTML5/CSS3**: Responsive, accessible UI with Monokai-inspired theming
- **No server-side code**: All logic and data processing is client-side

## Getting Started

### Quick Start
1. Clone or download this repository
2. Install dependencies and start the development server:
   ```bash
   npm start
   ```
   This will start a Python web server on [http://localhost:8000](http://localhost:8000)

### Manual Setup
Alternatively, you can start a web server manually:
1. **You must use a local web server** to run the app, since browsers block file loading via `file://` for security reasons
2. Start any web server in the project directory. For example:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   # or
   php -S localhost:8000
   ```
3. Open [http://localhost:8000](http://localhost:8000) in your browser

### How It Works
All data is loaded from normalized JSON files in the `data/` directory and processed entirely in-browser. No backend or database required!

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

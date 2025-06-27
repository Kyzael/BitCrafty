// BitCrafty Main Application Entry Point
// Modular architecture using separated components

import { store } from './lib/store-helpers.js';
import { initializeUI } from './components/ui.js';
import { initializeGraph } from './components/graph.js';
import { initializeCrafting } from './components/crafting.js';
import { initializeFilters } from './components/filters.js';

/**
 * Main application initialization function
 */
async function initializeApp() {
  try {
    console.log('BitCrafty: Starting application initialization...');
    
    // Load all data using the store's loadAllData method
    console.log('BitCrafty: Loading data files...');
    await store.getState().loadAllData();
    console.log('BitCrafty: Data loaded successfully');
    
    // Initialize all components in the correct order
    console.log('BitCrafty: Initializing components...');
    
    // 1. Initialize the UI first (creates DOM structure)
    initializeUI();
    console.log('BitCrafty: UI initialized');
    
    // 2. Initialize the graph (depends on DOM structure from UI)
    initializeGraph();
    console.log('BitCrafty: Graph initialized');
    
    // 3. Initialize crafting functionality
    initializeCrafting();
    console.log('BitCrafty: Crafting initialized');
    
    // 4. Initialize filters (depends on graph being ready)
    initializeFilters();
    console.log('BitCrafty: Filters initialized');
    
    console.log('BitCrafty: Application initialization complete!');
    
  } catch (error) {
    console.error('BitCrafty: Failed to initialize app:', error);
    
    // Show error to user
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #272822;
      color: #f8f8f2;
      padding: 24px;
      border-radius: 8px;
      border: 2px solid #f92672;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      font-family: monospace;
      z-index: 1000;
      max-width: 500px;
      text-align: center;
    `;
    errorDiv.innerHTML = `
      <h3 style="color: #f92672; margin: 0 0 16px 0;">Application Error</h3>
      <p style="margin: 0 0 16px 0;">Failed to initialize BitCrafty. Please check the console for details.</p>
      <p style="margin: 0; font-size: 0.9em; color: #75715e;">Error: ${error.message}</p>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

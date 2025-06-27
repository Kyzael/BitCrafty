// BitCrafty Common Library
// Constants, DOM utilities, and shared functionality

// Set of items that are always treated as base crafting items (do not progress past these)
export const BASE_CRAFT_ITEMS = new Set([
  'item:farming:embergrain',
  'item:farming:starbulb',
  'item:farming:wispweave-filament'
]);

// Monokai color constants
export const COLORS = {
  BACKGROUND: '#272822',
  SIDEBAR_BG: '#23241f',
  TEXT_PRIMARY: '#f8f8f2',
  TEXT_SECONDARY: '#a6e22e',
  ACCENT_PINK: '#f92672',
  ACCENT_CYAN: '#66d9ef',
  ACCENT_ORANGE: '#fd971f',
  ACCENT_ORANGE_HIGHLIGHT: '#ffb347',
  ACCENT_YELLOW: '#e6db74',
  ACCENT_GREEN: '#a6e22e',
  NODE_TEXT: '#23241f',
  BORDER: '#444',
  SHADOW: 'rgba(0,0,0,0.25)'
};

// Edge colors for graph
export const EDGE_COLORS = {
  INPUT: '#66d9ef',
  INPUT_HIGHLIGHT: '#87ceeb',
  OUTPUT: '#f92672',
  OUTPUT_HIGHLIGHT: '#ff69b4',
  SELECTION: '#fd971f',
  SELECTION_HIGHLIGHT: '#ffb347'
};

// Common DOM utility functions
export const DOM = {
  /**
   * Create a styled div with common sidebar card styling
   * @param {string} content - HTML content for the card
   * @returns {HTMLElement} - Styled div element
   */
  createSidebarCard(content) {
    const div = document.createElement('div');
    div.style.cssText = `
      max-width: 600px;
      margin: 20px auto 0 auto;
      background: ${COLORS.BACKGROUND};
      color: ${COLORS.TEXT_PRIMARY};
      border-radius: 8px;
      box-shadow: 0 2px 8px ${COLORS.SHADOW};
      padding: 20px 28px;
      min-height: 120px;
    `;
    div.innerHTML = content;
    return div;
  },

  /**
   * Create a styled button with hover effects
   * @param {string} text - Button text
   * @param {string} color - Button color
   * @param {function} onClick - Click handler
   * @returns {HTMLElement} - Styled button element
   */
  createStyledButton(text, color, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      background: ${COLORS.BACKGROUND};
      color: ${color};
      border: 1.5px solid ${color};
      border-radius: 3px;
      padding: 6px 16px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: bold;
    `;
    
    // Add hover effects
    button.addEventListener('mouseenter', () => {
      button.style.background = color;
      button.style.color = COLORS.BACKGROUND;
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = COLORS.BACKGROUND;
      button.style.color = color;
    });
    
    if (onClick) {
      button.addEventListener('click', onClick);
    }
    
    return button;
  },

  /**
   * Find element by ID or create if not found
   * @param {string} id - Element ID
   * @param {string} tagName - Tag name if creating (default: 'div')
   * @returns {HTMLElement} - Found or created element
   */
  getOrCreateElement(id, tagName = 'div') {
    let element = document.getElementById(id);
    if (!element) {
      element = document.createElement(tagName);
      element.id = id;
    }
    return element;
  }
};

// Validation utilities
export const VALIDATION = {
  /**
   * Validate that required data is loaded
   * @param {Object} storeState - Current store state
   * @returns {boolean} - True if all required data is present
   */
  validateDataLoaded(storeState) {
    const required = ['items', 'crafts', 'requirements', 'professions', 'tools', 'buildings'];
    return required.every(key => storeState[key] && Object.keys(storeState[key]).length > 0);
  },

  /**
   * Validate entity ID format: entity-type:category:identifier
   * @param {string} id - Entity ID to validate
   * @returns {boolean} - True if valid format
   */
  validateEntityId(id) {
    if (typeof id !== 'string') return false;
    const parts = id.split(':');
    return parts.length >= 2 && parts.every(part => part.length > 0);
  },

  /**
   * Parse entity type from ID
   * @param {string} id - Entity ID
   * @returns {string|null} - Entity type or null if invalid
   */
  parseEntityType(id) {
    if (!this.validateEntityId(id)) return null;
    return id.split(':')[0];
  }
};

// Math utilities for graph calculations
export const MATH = {
  /**
   * Calculate line width based on quantity (for graph edges)
   * @param {number} qty - Quantity value
   * @param {number} min - Minimum width (default: 1)
   * @param {number} max - Maximum width (default: 8)
   * @returns {number} - Calculated line width
   */
  calculateLineWidth(qty, min = 1, max = 8) {
    return Math.min(Math.max(Math.log2(qty + 1) + 1, min), max);
  },

  /**
   * Parse quantity that might be a range (e.g., "1-3" or "5")
   * @param {string|number} qty - Quantity value
   * @param {boolean} useMin - If true, return minimum of range; if false, return maximum
   * @returns {number} - Parsed quantity
   */
  parseQuantity(qty, useMin = true) {
    if (typeof qty === 'number') return qty;
    if (typeof qty === 'string') {
      // Handle range like "8-20" or "0-4"
      const rangeMatch = qty.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        return parseInt(rangeMatch[useMin ? 1 : 2], 10);
      }
      // Handle single number as string
      const singleMatch = qty.match(/^(\d+)$/);
      if (singleMatch) {
        return parseInt(singleMatch[1], 10);
      }
    }
    return 1;
  }
};

// Error handling utilities
export const ERROR = {
  /**
   * Log error with context
   * @param {string} context - Context where error occurred
   * @param {Error|string} error - Error to log
   */
  log(context, error) {
    console.error(`[BitCrafty ${context}]:`, error);
  },

  /**
   * Handle and log application errors gracefully
   * @param {string} context - Context where error occurred
   * @param {Error} error - Error that occurred
   * @param {function} fallback - Optional fallback function
   */
  handle(context, error, fallback) {
    this.log(context, error);
    if (fallback && typeof fallback === 'function') {
      try {
        fallback();
      } catch (fallbackError) {
        this.log(`${context} fallback`, fallbackError);
      }
    }
  }
};

// BitCrafty Store Helpers
// Data access and lookup functions for working with the Zustand store

import useStore from '../state.js';

// Helper to access store outside React (for vanilla JS)
const store = useStore;

// Item helper functions
export const ItemHelpers = {
  /**
   * Get item by ID
   * @param {string} id - Item ID
   * @returns {Object|null} - Item object or null if not found
   */
  getById(id) {
    const items = store.getState().items;
    return items[id] || null;
  },

  /**
   * Get item ID by name (for legacy compatibility)
   * @param {string} name - Item name
   * @returns {string|null} - Item ID or null if not found
   */
  getIdByName(name) {
    const items = store.getState().items;
    const item = Object.values(items).find(i => i.name === name);
    return item ? item.id : null;
  },

  /**
   * Get all items as array
   * @returns {Array} - Array of all items
   */
  getAll() {
    const items = store.getState().items;
    return Object.values(items);
  },

  /**
   * Search items by name (case-insensitive)
   * @param {string} searchTerm - Search term
   * @returns {Array} - Array of matching items
   */
  search(searchTerm) {
    const items = this.getAll();
    const term = searchTerm.toLowerCase();
    return items.filter(item => item.name && item.name.toLowerCase().includes(term));
  }
};

// Craft helper functions
export const CraftHelpers = {
  /**
   * Get craft by ID
   * @param {string} id - Craft ID
   * @returns {Object|null} - Craft object or null if not found
   */
  getById(id) {
    const crafts = store.getState().crafts;
    return crafts[id] || null;
  },

  /**
   * Get all crafts as array
   * @returns {Array} - Array of all crafts
   */
  getAll() {
    const crafts = store.getState().crafts;
    return Object.values(crafts);
  },

  /**
   * Get all crafts that output a given item ID
   * @param {string} itemId - Item ID to search for
   * @returns {Array} - Array of crafts that output this item
   */
  getByOutputId(itemId) {
    const crafts = this.getAll();
    return crafts.filter(craft => (craft.outputs || []).some(out => out.item === itemId));
  },

  /**
   * Get crafts that use an item as input
   * @param {string} itemId - Item ID to search for
   * @returns {Array} - Array of crafts that use this item as input
   */
  getByInputId(itemId) {
    const crafts = this.getAll();
    return crafts.filter(craft => (craft.materials || []).some(mat => mat.item === itemId));
  },

  /**
   * Get output quantity for a craft and item ID
   * @param {Object} craft - Craft object
   * @param {string} itemId - Item ID
   * @returns {number} - Output quantity (minimum value if range)
   */
  getOutputQty(craft, itemId) {
    const out = (craft.outputs || []).find(o => o.item === itemId);
    if (!out) return 1;
    if (typeof out.qty === 'number') return out.qty;
    if (typeof out.qty === 'string') {
      // Handle range like "8-20" or "0-4"
      const match = out.qty.match(/^(\d+)-(\d+)$/);
      if (match) return parseInt(match[1], 10);
      // Handle single number as string
      const single = out.qty.match(/^(\d+)$/);
      if (single) return parseInt(single[1], 10);
    }
    return 1;
  }
};

// Profession helper functions
export const ProfessionHelpers = {
  /**
   * Get profession by ID
   * @param {string} id - Profession ID
   * @returns {Object|null} - Profession object or null if not found
   */
  getById(id) {
    const professions = store.getState().professions;
    return professions[id] || null;
  },

  /**
   * Get all professions as array
   * @returns {Array} - Array of all professions
   */
  getAll() {
    const professions = store.getState().professions;
    return Object.values(professions);
  },

  /**
   * Build profession color map
   * @returns {Object} - Map of profession name to color
   */
  getColorMap() {
    const professions = this.getAll();
    const colorMap = {};
    professions.forEach(prof => {
      colorMap[prof.name] = prof.color;
    });
    return colorMap;
  },

  /**
   * Get profession names sorted alphabetically
   * @returns {Array} - Sorted array of profession names
   */
  getSortedNames() {
    const professions = this.getAll();
    return professions.map(p => p.name).sort();
  }
};

// Requirement helper functions
export const RequirementHelpers = {
  /**
   * Get requirement by ID
   * @param {string} id - Requirement ID
   * @returns {Object|null} - Requirement object or null if not found
   */
  getById(id) {
    const requirements = store.getState().requirements;
    return requirements[id] || null;
  },

  /**
   * Get profession info from requirement
   * @param {string} requirementId - Requirement ID
   * @returns {Object|null} - Profession info with name and level
   */
  getProfessionInfo(requirementId) {
    const req = this.getById(requirementId);
    if (!req || !req.profession || !req.profession.name) return null;
    
    const profession = ProfessionHelpers.getById(req.profession.name);
    if (!profession) return null;
    
    return {
      name: profession.name,
      level: req.profession.level || 1,
      color: profession.color
    };
  },

  /**
   * Get tool info from requirement
   * @param {string} requirementId - Requirement ID
   * @returns {Object|null} - Tool info with name and level
   */
  getToolInfo(requirementId) {
    const req = this.getById(requirementId);
    if (!req || !req.tool || !req.tool.name) return null;
    
    const tools = store.getState().tools;
    const tool = Object.values(tools).find(t => t.id === req.tool.name);
    if (!tool) return null;
    
    return {
      name: tool.name,
      level: req.tool.level || 1
    };
  },

  /**
   * Get building info from requirement
   * @param {string} requirementId - Requirement ID
   * @returns {Object|null} - Building info with name and level
   */
  getBuildingInfo(requirementId) {
    const req = this.getById(requirementId);
    if (!req || !req.building || !req.building.name) return null;
    
    const buildings = store.getState().buildings;
    const building = Object.values(buildings).find(b => b.id === req.building.name);
    if (!building) return null;
    
    return {
      name: building.name,
      level: req.building.level || 1
    };
  }
};

// Graph data helper functions
export const GraphHelpers = {
  /**
   * Get current graph data from store
   * @returns {Object|null} - Graph data with nodes and edges, or null if not available
   */
  getData() {
    return store.getState().graphData;
  },

  /**
   * Set graph data in store
   * @param {Object} data - Graph data with nodes and edges
   */
  setData(data) {
    store.getState().setGraphData(data);
  },

  /**
   * Check if graph data is available
   * @returns {boolean} - True if graph data is loaded
   */
  isDataAvailable() {
    const data = this.getData();
    return data && data.nodes && data.edges;
  },

  /**
   * Get nodes dataset
   * @returns {vis.DataSet|null} - Nodes dataset or null if not available
   */
  getNodes() {
    const data = this.getData();
    return data ? data.nodes : null;
  },

  /**
   * Get edges dataset
   * @returns {vis.DataSet|null} - Edges dataset or null if not available
   */
  getEdges() {
    const data = this.getData();
    return data ? data.edges : null;
  }
};

// Queue helper functions
export const QueueHelpers = {
  /**
   * Get current queue from store
   * @returns {Array} - Current queue array
   */
  getAll() {
    return store.getState().queue;
  },

  /**
   * Add item to queue
   * @param {string} itemId - Item ID to add
   * @param {number} qty - Quantity to add (default: 1)
   */
  add(itemId, qty = 1) {
    store.getState().addToQueue(itemId, qty);
  },

  /**
   * Remove item from queue
   * @param {string} itemId - Item ID to remove
   */
  remove(itemId) {
    store.getState().removeFromQueue(itemId);
  },

  /**
   * Clear entire queue
   */
  clear() {
    store.getState().clearQueue();
  },

  /**
   * Get queue count by item ID
   * @returns {Object} - Map of item ID to total quantity
   */
  getCount() {
    const queue = this.getAll();
    const queueCount = {};
    queue.forEach(queueItem => {
      const id = queueItem.itemId;
      queueCount[id] = (queueCount[id] || 0) + queueItem.qty;
    });
    return queueCount;
  }
};

// Selected craft helper functions
export const SelectedCraftHelpers = {
  /**
   * Get selected craft index for an item
   * @param {string} itemId - Item ID
   * @returns {number} - Selected craft index (default: 0)
   */
  get(itemId) {
    return store.getState().getSelectedCraft(itemId);
  },

  /**
   * Set selected craft index for an item
   * @param {string} itemId - Item ID
   * @param {number} craftIndex - Craft index to set
   */
  set(itemId, craftIndex) {
    store.getState().setSelectedCraft(itemId, craftIndex);
  }
};

// Export the store reference for direct access when needed
export { store };

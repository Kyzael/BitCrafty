// Zustand store for BitCrafty app state management
// This file centralizes state for graph, filtering, selection, and queue logic.
// Usage: import useBitCraftyStore from './state.js';

import { create } from 'https://esm.sh/zustand';

const useBitCraftyStore = create((set, get) => ({
  // Data
  items: [],
  crafts: [],
  professions: [],
  graphData: { nodes: [], edges: [] },
  // UI State
  selectedNodeId: null,
  filterText: '',
  queue: [],
  surplus: {},
  // Actions
  setItems: (items) => set({ items }),
  setCrafts: (crafts) => set({ crafts }),
  setProfessions: (professions) => set({ professions }),
  setGraphData: (graphData) => set({ graphData }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setFilterText: (text) => set({ filterText: text }),
  setQueue: (queue) => set({ queue }),
  setSurplus: (surplus) => set({ surplus }),
  // Helpers
  getItemById: (id) => get().items.find(i => i.id === id),
  getCraftById: (id) => get().crafts.find(c => c.id === id),
  // Filtering
  filteredNodes: () => {
    const { graphData, filterText, items, crafts } = get();
    if (!filterText) return graphData.nodes;
    const lower = filterText.toLowerCase();
    return graphData.nodes.filter(node => {
      if (node.type === 'item') {
        const item = items.find(i => i.id === node.itemId);
        return item && item.name.toLowerCase().includes(lower);
      }
      if (node.type === 'craft') {
        const craft = crafts.find(c => c.id === node.craftId);
        return craft && craft.name.toLowerCase().includes(lower);
      }
      return false;
    });
  },
}));

export default useBitCraftyStore;

// Zustand store for BitCrafty
import { create } from 'https://esm.sh/zustand';


// Utility to convert array to Record by id
function arrayToRecord(arr) {
  const rec = arr.reduce((acc, obj) => {
    acc[obj.id] = obj;
    return acc;
  }, {});
  return rec;
}

async function loadData() {
  const [items, crafts, requirements, professions, tools, buildings] = await Promise.all([
    fetch('src/data/items.json').then(r => r.json()),
    fetch('src/data/crafts.json').then(r => r.json()),
    fetch('src/data/requirements.json').then(r => r.json()),
    fetch('src/data/metadata/professions.json').then(r => r.json()),
    fetch('src/data/metadata/tools.json').then(r => r.json()),
    fetch('src/data/metadata/buildings.json').then(r => r.json()),
  ]);
  return {
    items: arrayToRecord(items),
    crafts: arrayToRecord(crafts),
    requirements: arrayToRecord(requirements),
    professions, // already an object keyed by id
    tools,       // already an object keyed by id
    buildings    // already an object keyed by id
  };
}


const useStore = create((set, get) => ({
  items: {},
  crafts: {},
  requirements: {},
  professions: {},
  tools: {},
  buildings: {},
  selectedItem: null,
  queue: [], // [{itemId, qty}]
  setItems: items => set({ items }),
  setCrafts: crafts => set({ crafts }),
  setRequirements: requirements => set({ requirements }),
  setProfessions: professions => set({ professions }),
  setTools: tools => set({ tools }),
  setBuildings: buildings => set({ buildings }),
  setSelectedItem: selectedItem => set({ selectedItem }),
  addToQueue: (itemId, qty = 1) => set(state => {
    // If already in queue, increment qty
    const idx = state.queue.findIndex(q => q.itemId === itemId);
    if (idx >= 0) {
      const queue = [...state.queue];
      queue[idx] = { ...queue[idx], qty: queue[idx].qty + qty };
      return { queue };
    }
    return { queue: [...state.queue, { itemId, qty }] };
  }),
  removeFromQueue: itemId => set(state => ({ queue: state.queue.filter(q => q.itemId !== itemId) })),
  clearQueue: () => set({ queue: [] }),
  loadAllData: async () => {
    const data = await loadData();
    set(data);
  },
}));

export default useStore;

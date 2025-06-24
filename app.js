// Relational model: items and recipes
const items = [
  { id: 16, name: "Plain Ground Meat and Mashed Bulbs", profession: "Cooking", tier: 1, rank: "common", info: "Ground meat served with a side of potatoes with onions. Delicious and Filling." },
  { id: 17, name: "Plain Roasted Meat", profession: "Cooking", tier: 1, rank: "common", info: "Placeholder item." },
  { id: 18, name: "Plain Mashed Bulbs", profession: "Cooking", tier: 1, rank: "common", info: "Placeholder item." },
  { id: 1, name: "Young Oak Tree", profession: "Gathering", tier: 1, rank: "common", info: "A young oak tree in the world." },
  { id: 2, name: "Rough Wood Trunk", profession: "Gathering", tier: 1, rank: "common", info: "Trunk from young oak." },
  { id: 3, name: "Basic Amber Resin", profession: "Byproduct", tier: 1, rank: "rare", info: "Resin from young oak, obtained as a byproduct." },
  { id: 4, name: "Rough Tree Bark", profession: "Gathering", tier: 1, rank: "common", info: "Bark from young oak." },
  { id: 5, name: "Tree Sap", profession: "Gathering", tier: 1, rank: "common", info: "Sap from young oak." },
  { id: 6, name: "Rough Wood Log", profession: "Crafting", tier: 1, rank: "common", info: "Log from trunk." },
  { id: 7, name: "Rough Stripped Log", profession: "Crafting", tier: 1, rank: "common", info: "Stripped log." },
  { id: 8, name: "Rough Plank", profession: "Crafting", tier: 1, rank: "common", info: "Plank from stripped log." },
  // Example for multi-recipe item:
  { id: 9, name: "Basic Fertilizer", profession: "Crafting", tier: 1, rank: "common", info: "Fertilizer for crops." },
  { id: 10, name: "Breezy Fin Darter Fillet", profession: "Gathering", tier: 1, rank: "common", info: "Fish fillet." },
  { id: 11, name: "Basic Berries", profession: "Gathering", tier: 1, rank: "common", info: "Simple berries." },
  { id: 12, name: "Basic Flowers", profession: "Gathering", tier: 1, rank: "common", info: "Simple flowers." },
  { id: 13, name: "Basic Food Waste", profession: "Gathering", tier: 1, rank: "common", info: "Food waste." },
  { id: 14, name: "Basic Starbulb Seed", profession: "Gathering", tier: 1, rank: "common", info: "Seed for growing a starbulb plant." },
  { id: 15, name: "Basic Starbulb Plant", profession: "Crafting", tier: 1, rank: "common", info: "Can be husked into Starlight Oninons to eat or Starlight Onion Seeds to replant." },
];

// Each recipe: id, output (item id), outputQty, method, inputs: [{item, qty}], byproducts: [{item, qty, note}]
const recipes = [
  // Crafting Plain Ground Meat and Mashed Bulbs
  { id: 14, method: "craft", output: 16, outputQty: 1, inputs: [
    { item: 17, qty: 2 }, // 2 Plain Roasted Meat
    { item: 18, qty: 1 }  // 1 Plain Mashed Bulbs
  ] },
  // Gathering from Young Oak Tree
  { id: 1, method: "gather", output: 2, outputQty: 1, inputs: [{ item: 1, qty: 1 }] }, // Trunk
  { id: 2, method: "gather", output: 3, outputQty: 1, inputs: [{ item: 1, qty: 1 }] }, // Resin (keep as gatherable)
  { id: 3, method: "gather", output: 4, outputQty: 1, inputs: [{ item: 1, qty: 1 }] }, // Bark
  { id: 4, method: "gather", output: 5, outputQty: 1, inputs: [{ item: 1, qty: 1 }] }, // Sap
  // Crafting from Rough Wood Trunk
  { id: 5, method: "craft", output: 6, outputQty: 6, inputs: [{ item: 2, qty: 1 }], byproducts: [{ item: 3, qty: 1, note: "Basic Amber Resin (0-1)", method: "byproduct-crafting" }] }, // 6 logs from 1 trunk, Basic Amber Resin
  // Crafting stripped log from logs
  { id: 7, method: "craft", output: 7, outputQty: 1, inputs: [{ item: 6, qty: 3 }] }, // 1 stripped log from 3 logs
  // Crafting plank from stripped log
  { id: 8, method: "craft", output: 8, outputQty: 1, inputs: [{ item: 7, qty: 1 }] }, // 1 plank from 1 stripped log
  // Multi-recipe for Basic Fertilizer
  { id: 9, method: "craft", output: 9, outputQty: 1, inputs: [{ item: 10, qty: 2 }] }, // 2 fillets
  { id: 10, method: "craft", output: 9, outputQty: 1, inputs: [{ item: 11, qty: 2 }] }, // 2 berries
  { id: 11, method: "craft", output: 9, outputQty: 1, inputs: [{ item: 12, qty: 5 }] }, // 5 flowers
  { id: 12, method: "craft", output: 9, outputQty: 1, inputs: [{ item: 13, qty: 2 }] }, // 2 food waste
  // Crafting Basic Starbulb Plant from seed and fertilizer
  { id: 13, method: "craft", output: 15, outputQty: 1, inputs: [
    { item: 14, qty: 1 }, // 1 Basic Starbulb Seed
    { item: 9, qty: 1 }   // 1 Basic Fertilizer
  ] },
];

// Helper: id to item
const itemById = Object.fromEntries(items.map(i => [i.id, i]));
const recipesByOutput = {};
recipes.forEach(r => {
  if (!recipesByOutput[r.output]) recipesByOutput[r.output] = [];
  recipesByOutput[r.output].push(r);
});

// Build vis-network nodes and edges from new structure
const nodeList = items.map(item => ({
  id: item.id,
  label: item.name,
  shape: "box",
  color:
    item.profession === "Gathering" ? "#66d9ef" : // cyan
    item.profession === "Crafting" ? "#f92672" : // pink
    item.profession === "Byproduct" ? "#fd971f" : // orange
    "#a6e22e" // green
}));

const edgeList = [];
recipes.forEach(recipe => {
  recipe.inputs.forEach(input => {
    edgeList.push({
      from: input.item,
      to: recipe.output,
      label: `${input.qty} ${itemById[input.item].name}${recipe.method ? ' (' + recipe.method + ')' : ''}`,
      arrows: "to",
      color: recipe.method === "gather" ? { color: "#66d9ef" } : { color: "#f92672" }
    });
  });
  // Add byproduct edges
  if (recipe.byproducts && recipe.byproducts.length > 0) {
    recipe.byproducts.forEach(bp => {
      edgeList.push({
        from: recipe.output,
        to: bp.item,
        label: `byproduct${bp.note ? ' (' + bp.note + ')' : ''}`,
        arrows: "to",
        dashes: true,
        color: { color: "#fd971f" }
      });
    });
  }
});

const nodes = new vis.DataSet(nodeList);
const edges = new vis.DataSet(edgeList);

const container = document.getElementById("network");
const data = { nodes, edges };
const options = {
  layout: { hierarchical: { direction: "UD", sortMethod: "directed" } },
  edges: {
    smooth: true,
    font: {
      color: '#e6db74', // Monokai yellow
      strokeWidth: 0,   // No outline
      size: 15
    }
  },
  nodes: { font: { size: 16 } }
};
const network = new vis.Network(container, data, options);

// Craft queue and resource calculation
let craftQueue = [];

// Track selected recipe for each item in the path
let selectedRecipes = {};

// Trace the path to obtain an item recursively (choose first recipe by default)
function tracePath(itemId, qty = 1, depth = 0, surplus = {}) {
  const item = itemById[itemId];
  const recipesForItem = recipesByOutput[itemId] || [];
  if (recipesForItem.length === 0) {
    // Base resource
    return [{ depth, id: itemId, name: item.name, qty }];
  }
  // Use selected recipe or default to first
  let recipeIdx = selectedRecipes[itemId] || 0;
  if (recipeIdx >= recipesForItem.length) recipeIdx = 0;
  const recipe = recipesForItem[recipeIdx];
  // Use surplus if available
  let needed = qty;
  let available = surplus[itemId] || 0;
  if (available >= needed) {
    surplus[itemId] -= needed;
    return [];
  } else if (available > 0) {
    needed -= available;
    surplus[itemId] = 0;
  }
  // Calculate crafts needed and new surplus
  const craftsNeeded = Math.ceil(needed / recipe.outputQty);
  const totalProduced = craftsNeeded * recipe.outputQty;
  const newSurplus = { ...surplus };
  newSurplus[itemId] = (newSurplus[itemId] || 0) + (totalProduced - needed);
  let paths = [{ depth, id: itemId, name: item.name, qty: needed, method: recipe.method, recipe, recipeIdx, recipesForItem, craftsNeeded, totalProduced, used: needed }];
  recipe.inputs.forEach(input => {
    const inputQty = craftsNeeded * input.qty;
    paths = paths.concat(tracePath(input.item, inputQty, depth + 1, newSurplus));
  });
  return paths;
}

function updateCraftQueueUI() {
  const queueDiv = document.getElementById("craft-queue");
  if (!queueDiv) return;
  if (craftQueue.length === 0) {
    queueDiv.innerHTML = '<div class="sidebar-card"><h3>Craft Queue</h3><p>No items queued.</p></div>';
    document.getElementById("resource-summary").innerHTML = '';
    document.getElementById("craft-paths").innerHTML = '';
    return;
  }
  // Count each unique item in the queue
  const queueCount = {};
  craftQueue.forEach(id => {
    queueCount[id] = (queueCount[id] || 0) + 1;
  });
  queueDiv.innerHTML = '<div class="sidebar-card">' +
    '<h3>Craft Queue</h3>' +
    '<ul>' + Object.entries(queueCount).map(([id, qty]) => `<li>${itemById[id].name} x${qty}</li>`).join('') + '</ul>' +
    '<button id="clear-queue">Clear Queue</button>' +
    '</div>';
  document.getElementById("clear-queue").onclick = () => {
    craftQueue = [];
    updateCraftQueueUI();
  };
  // Calculate and show resources
  const resources = calculateResources(Object.entries(queueCount).map(([id, qty]) => Array(Number(qty)).fill(Number(id))).flat());
  document.getElementById("resource-summary").innerHTML =
    '<div class="sidebar-card">' +
    '<h3>Required Base Resources</h3>' +
    '<ul>' + Object.entries(resources).map(([id, qty]) => `<li>${itemById[id].name}: ${qty}</li>`).join('') + '</ul>' +
    '</div>';

  // Show crafting/gathering paths for combined quantities
  let pathsHtml = '<div class="sidebar-card"><h3>Crafting/Gathering Paths</h3>';
  Object.entries(queueCount).forEach(([id, qty]) => {
    const path = tracePath(Number(id), qty);
    pathsHtml += `<div><strong><a href="#" class="tree-item-link" data-itemid="${id}">${itemById[id].name}</a> x${qty}</strong><ul style="margin-left:1em;">`;
    path.forEach((step, idx) => {
      // Add a clickable link to each item in the tree view
      const itemLink = `<a href=\"#\" class=\"tree-item-link\" data-itemid=\"${step.id}\">${step.name}</a>`;
      if (step.method) {
        let recipeInputs = step.recipe.inputs.map(inp => `${inp.qty} ${itemById[inp.item].name}`).join(' + ');
        let byproductsHtml = '';
        if (step.recipe.byproducts && step.recipe.byproducts.length > 0) {
          byproductsHtml = '<div style="font-size:0.95em;color:#888;margin-left:1em;">Possible byproducts: ' +
            step.recipe.byproducts.map(bp => `${bp.qty} ${itemById[bp.item].name}${bp.note ? ' (' + bp.note + ')' : ''}`).join(', ') + '</div>';
        }
        // If multiple recipes, show a select dropdown
        if (step.recipesForItem && step.recipesForItem.length > 1) {
          const selectId = `recipe-select-${step.id}-${step.depth}-${idx}`;
          pathsHtml += `<li style="margin-left:${step.depth * 1.5}em;">
            <span>${step.method.toUpperCase()} ${itemLink} ← ${recipeInputs} (yields ${step.recipe.outputQty})</span>
            <select id="${selectId}" data-itemid="${step.id}" data-depth="${step.depth}">
              ${step.recipesForItem.map((r, i) => {
                let inputs = r.inputs.map(inp => `${inp.qty} ${itemById[inp.item].name}`).join(' + ');
                return `<option value="${i}" ${i === step.recipeIdx ? 'selected' : ''}>${r.method.toUpperCase()} ← ${inputs} (yields ${r.outputQty})</option>`;
              }).join('')}
            </select>
            ${byproductsHtml}
          </li>`;
        } else {
          pathsHtml += `<li style="margin-left:${step.depth * 1.5}em;">${step.method.toUpperCase()} ${itemLink} ← ${recipeInputs} (yields ${step.recipe.outputQty})${byproductsHtml}</li>`;
        }
      } else {
        pathsHtml += `<li style="margin-left:${step.depth * 1.5}em;">Gather/Obtain <strong>${itemLink}</strong></li>`;
      }
    });
    pathsHtml += '</ul></div>';
  });
  document.getElementById("craft-paths").innerHTML = pathsHtml + '</div>';

  // Add event listeners for recipe selects and tree item links
  Object.entries(queueCount).forEach(([id, qty]) => {
    const path = tracePath(Number(id), qty);
    path.forEach((step, idx) => {
      if (step.recipesForItem && step.recipesForItem.length > 1) {
        const selectId = `recipe-select-${step.id}-${step.depth}-${idx}`;
        const select = document.getElementById(selectId);
        if (select) {
          select.onchange = (e) => {
            selectedRecipes[step.id] = Number(e.target.value);
            // Update both the path and the resources
            updateCraftQueueUI();
          };
        }
      }
    });
  });
  // Add event listeners for tree item links
  document.querySelectorAll('.tree-item-link').forEach(link => {
    link.onclick = function(e) {
      e.preventDefault();
      const itemId = Number(this.getAttribute('data-itemid'));
      // Focus/select the node in the network
      network.selectNodes([itemId]);
      network.focus(itemId, { scale: 1.2, animation: true });
      showItemDetails(itemId);
    };
  });
}

function calculateResources(queue) {
  // Recursively calculate base resources for all items in the queue, using selected recipes and surplus
  const resourceCount = {};
  function helper(itemId, qty = 1, surplus = {}) {
    const recipesForItem = recipesByOutput[itemId] || [];
    if (recipesForItem.length === 0) {
      // Base resource
      resourceCount[itemId] = (resourceCount[itemId] || 0) + qty;
      return;
    }
    // Use the selected recipe for this item, or default to first
    let recipeIdx = selectedRecipes[itemId] || 0;
    if (recipeIdx >= recipesForItem.length) recipeIdx = 0;
    const recipe = recipesForItem[recipeIdx];
    // Use surplus if available
    let needed = qty;
    let available = surplus[itemId] || 0;
    if (available >= needed) {
      surplus[itemId] -= needed;
      return;
    } else if (available > 0) {
      needed -= available;
      surplus[itemId] = 0;
    }
    // Calculate crafts needed and new surplus
    const craftsNeeded = Math.ceil(needed / recipe.outputQty);
    const totalProduced = craftsNeeded * recipe.outputQty;
    const newSurplus = { ...surplus };
    newSurplus[itemId] = (newSurplus[itemId] || 0) + (totalProduced - needed);
    recipe.inputs.forEach(input => {
      const inputQty = craftsNeeded * input.qty;
      helper(input.item, inputQty, newSurplus);
    });
  }
  // Count each unique item in the queue
  const queueCount = {};
  queue.forEach(id => {
    queueCount[id] = (queueCount[id] || 0) + 1;
  });
  Object.entries(queueCount).forEach(([id, qty]) => helper(Number(id), qty, {}));
  return resourceCount;
}

// Add a "Queue Craft" button to item details
function showItemDetails(id) {
  const item = itemById[id];
  if (item) {
    const detailsDiv = document.getElementById("item-details");
    detailsDiv.innerHTML = `
      <div style="max-width:600px;margin:20px auto 0 auto;background:#272822;color:#f8f8f2;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);padding:20px 28px;">
        <h2 style="color:#a6e22e;margin-top:0;">${item.name}</h2>
        <p><strong style="color:#66d9ef;">Profession:</strong> <span style="color:#f8f8f2;">${item.profession}</span></p>
        <p><strong style="color:#fd971f;">Tier:</strong> <span style="color:#f8f8f2;">${item.tier}</span> <span style="margin-left:1em;"><strong style="color:#f92672;">Rank:</strong> <span style="color:#f8f8f2;">${item.rank}</span></span></p>
        <p><strong style="color:#e6db74;">Info:</strong> <span style="color:#f8f8f2;">${item.info}</span></p>
        <div style="margin-top:18px;">
          <button id="queue-craft" style="background:#a6e22e;color:#272822;border:none;border-radius:3px;padding:6px 16px;cursor:pointer;margin-right:8px;">Queue 1</button>
          <button id="queue-craft-5" style="background:#66d9ef;color:#272822;border:none;border-radius:3px;padding:6px 16px;cursor:pointer;margin-right:8px;">Queue 5</button>
          <button id="queue-craft-10" style="background:#fd971f;color:#272822;border:none;border-radius:3px;padding:6px 16px;cursor:pointer;">Queue 10</button>
        </div>
      </div>
    `;
    detailsDiv.classList.add("active");
    document.getElementById("queue-craft").onclick = () => {
      craftQueue.push(id);
      updateCraftQueueUI();
    };
    document.getElementById("queue-craft-5").onclick = () => {
      for (let i = 0; i < 5; i++) craftQueue.push(id);
      updateCraftQueueUI();
    };
    document.getElementById("queue-craft-10").onclick = () => {
      for (let i = 0; i < 10; i++) craftQueue.push(id);
      updateCraftQueueUI();
    };
  }
}

network.on("selectNode", function(params) {
  showItemDetails(params.nodes[0]);
});
network.on("deselectNode", function() {
  document.getElementById("item-details").classList.remove("active");
});

// Add craft queue, resource summary, and craft paths containers to the page
window.addEventListener('DOMContentLoaded', () => {
  // Create sidebar and main content containers
  const sidebar = document.createElement('div');
  sidebar.id = 'sidebar';
  sidebar.style.width = '420px';
  sidebar.style.minHeight = '100vh';
  sidebar.style.background = '#23241f';
  sidebar.style.display = 'flex';
  sidebar.style.flexDirection = 'column';
  sidebar.style.gap = '18px';
  sidebar.style.padding = '18px 0 18px 0';
  sidebar.style.position = 'fixed';
  sidebar.style.left = '0';
  sidebar.style.top = '0';
  sidebar.style.bottom = '0';
  sidebar.style.overflowY = 'auto';
  sidebar.style.zIndex = '10';

  // Legend
  const legendDiv = document.createElement('div');
  legendDiv.id = 'legend';
  legendDiv.style.background = '#272822';
  legendDiv.style.borderRadius = '8px';
  legendDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
  legendDiv.style.padding = '16px 20px 10px 20px';
  legendDiv.style.color = '#f8f8f2';
  legendDiv.innerHTML = `
    <h3 style="margin-top:0;color:#f8f8f2;">Legend & Filters</h3>
    <div style="margin-top:10px;display:flex;flex-wrap:wrap;align-items:center;gap:1.5em;">
      <label style="display:flex;align-items:center;gap:6px;">
        <input type="checkbox" class="prof-filter" value="Gathering" checked>
        <span style="display:inline-block;width:18px;height:18px;background:#66d9ef;border-radius:3px;"></span>
        Gathering
      </label>
      <label style="display:flex;align-items:center;gap:6px;">
        <input type="checkbox" class="prof-filter" value="Crafting" checked>
        <span style="display:inline-block;width:18px;height:18px;background:#f92672;border-radius:3px;"></span>
        Crafting
      </label>
      <label style="display:flex;align-items:center;gap:6px;">
        <input type="checkbox" class="prof-filter" value="Byproduct" checked>
        <span style="display:inline-block;width:18px;height:18px;background:#fd971f;border-radius:3px;"></span>
        Byproduct
      </label>
      <label style="display:flex;align-items:center;gap:6px;">
        <input type="checkbox" class="prof-filter" value="Cooking" checked>
        <span style="display:inline-block;width:18px;height:18px;background:#a6e22e;border-radius:3px;"></span>
        Cooking
      </label>
      <input type="text" id="item-search" placeholder="Search item name..." style="margin-left:1em;padding:10px 16px;min-width:180px;width:calc(100% - 32px);max-width:360px;background:#1e1f1c;color:#f8f8f2;border:1.5px solid #444;font-size:1.1em;border-radius:5px;box-sizing:border-box;">
    </div>
  `;
  sidebar.appendChild(legendDiv);

  // Item details
  const detailsDiv = document.getElementById('item-details') || document.createElement('div');
  detailsDiv.id = 'item-details';
  detailsDiv.classList.add('details');
  sidebar.appendChild(detailsDiv);

  // Craft queue
  const queueDiv = document.createElement('div');
  queueDiv.id = 'craft-queue';
  sidebar.appendChild(queueDiv);

  // Resource summary
  const resourceDiv = document.createElement('div');
  resourceDiv.id = 'resource-summary';
  sidebar.appendChild(resourceDiv);

  // Crafting/gathering paths
  const pathDiv = document.createElement('div');
  pathDiv.id = 'craft-paths';
  sidebar.appendChild(pathDiv);

  document.body.appendChild(sidebar);

  // Main content wrapper for network
  let mainContent = document.getElementById('main-content');
  if (!mainContent) {
    mainContent = document.createElement('div');
    mainContent.id = 'main-content';
    mainContent.style.marginLeft = '420px';
    mainContent.style.height = '100vh';
    mainContent.style.overflow = 'hidden';
    mainContent.style.position = 'relative';
    // Move #network into main-content
    const networkDiv = document.getElementById('network');
    if (networkDiv) mainContent.appendChild(networkDiv);
    document.body.appendChild(mainContent);
  }

  // Filtering logic with fading
  function applyFilters() {
    const checkedProfs = Array.from(document.querySelectorAll('.prof-filter:checked')).map(cb => cb.value);
    const search = document.getElementById('item-search').value.trim().toLowerCase();
    // Determine which nodes are filtered in
    const filteredIds = new Set(nodeList.filter(n => checkedProfs.includes(items.find(i => i.id === n.id).profession)
      && (!search || n.label.toLowerCase().includes(search))).map(n => n.id));
    // Fade out nodes/edges that are not filtered in
    nodes.forEach(function(node) {
      nodes.update({ id: node.id, opacity: filteredIds.has(node.id) ? 1 : 0.25 });
    });
    edges.forEach(function(edge) {
      const fromVisible = filteredIds.has(edge.from);
      const toVisible = filteredIds.has(edge.to);
      edges.update({ id: edge.id, opacity: (fromVisible && toVisible) ? 1 : 0.15 });
    });
  }
  document.querySelectorAll('.prof-filter').forEach(cb => cb.addEventListener('change', applyFilters));
  document.getElementById('item-search').addEventListener('input', applyFilters);

  // Free-text search dropdown for item navigation
  const searchInput = document.getElementById('item-search');
  const searchDropdown = document.createElement('div');
  searchDropdown.id = 'item-search-dropdown';
  searchDropdown.style.position = 'absolute';
  searchDropdown.style.background = '#272822';
  searchDropdown.style.border = '1px solid #444';
  searchDropdown.style.color = '#f8f8f2';
  searchDropdown.style.zIndex = 1000;
  searchDropdown.style.display = 'none';
  searchDropdown.style.maxHeight = '200px';
  searchDropdown.style.overflowY = 'auto';
  document.body.appendChild(searchDropdown);

  searchInput.addEventListener('input', function(e) {
    const val = searchInput.value.trim().toLowerCase();
    if (!val) {
      searchDropdown.style.display = 'none';
      applyFilters();
      return;
    }
    const matches = items.filter(i => i.name.toLowerCase().includes(val));
    if (matches.length === 0) {
      searchDropdown.style.display = 'none';
      applyFilters();
      return;
    }
    searchDropdown.innerHTML = matches.map(i => `<div class="search-result" data-id="${i.id}" style="padding:4px 10px;cursor:pointer;">${i.name}</div>`).join('');
    const rect = searchInput.getBoundingClientRect();
    searchDropdown.style.left = rect.left + 'px';
    searchDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    searchDropdown.style.width = rect.width + 'px';
    searchDropdown.style.display = 'block';
    applyFilters();
  });
  document.addEventListener('click', function(e) {
    if (!searchDropdown.contains(e.target) && e.target !== searchInput) {
      searchDropdown.style.display = 'none';
    }
  });
  searchDropdown.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('search-result')) {
      const id = Number(e.target.getAttribute('data-id'));
      searchInput.value = items.find(i => i.id === id).name;
      searchDropdown.style.display = 'none';
      // Focus/select the node in the network
      network.selectNodes([id]);
      network.focus(id, { scale: 1.2, animation: true });
      showItemDetails(id);
      applyFilters();
    }
  });

  updateCraftQueueUI();
  applyFilters();
});

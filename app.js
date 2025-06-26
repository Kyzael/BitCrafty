// Load data from bitcraft_flat.json
let items = [];
let crafts = [];
// Make nodeList, nodes, and edges accessible globally
let nodeList = [];
let nodes, edges;

fetch('bitcraft_flat.json')
  .then(response => response.json())
  .then(data => {
    items = data.items.map((item, idx) => ({
      ...item,
      id: idx + 1 // assign numeric id for vis.js
    }));
    crafts = data.crafts.map((craft, idx) => ({
      ...craft,
      id: 'craft-' + (idx + 1) // unique string id for craft nodes
    }));
    buildGraph();

    // --- Move sidebar/legend creation here so crafts is populated ---
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

    // Build dynamic profession list from crafts
    const professionSet = new Set();
    crafts.forEach(craft => {
      if (craft.Requirements && craft.Requirements.Profession) {
        const match = /([A-Za-z ]+)-\d+/.exec(craft.Requirements.Profession);
        if (match) professionSet.add(match[1]);
        else professionSet.add(craft.Requirements.Profession);
      }
    });
    const professions = Array.from(professionSet).sort();
    // Monokai-inspired palette, 15 distinct non-red colors for up to 10 professions
    const profColors = [
      "#a6e22e", // green
      "#66d9ef", // cyan
      "#fd971f", // orange
      "#e6db74", // yellow
      "#ae81ff", // purple
      "#75715e", // brown/gray
      "#f8f8f2", // white
      "#39dca0", // teal
      "#ffd866", // light yellow
      "#fc9867", // peach
      "#ab9df2", // lavender
      "#78dce8", // light blue
      "#ffcc66", // gold
      "#c678dd", // violet
      "#d19a66"  // tan
    ];
    const profColorMap = {};
    professions.forEach((prof, i) => { profColorMap[prof] = profColors[i % profColors.length]; });
    let legendHtml = `<h3 style="margin-top:0;color:#f8f8f2;">Legend & Filters</h3><div style="margin-top:10px;display:flex;flex-wrap:wrap;align-items:center;gap:1.5em;">`;
    professions.forEach(prof => {
      legendHtml += `<label style="display:flex;align-items:center;gap=6px;">
        <input type="checkbox" class="prof-filter" value="${prof}" checked>
        <span style="display:inline-block;width:18px;height:18px;background:${profColorMap[prof]};border-radius:3px;"></span>
        ${prof}
      </label>`;
    });
    legendHtml += `<input type="text" id="item-search" placeholder="Search item name..." style="margin-left:1em;padding:10px 16px;min-width:180px;width:calc(100% - 32px);max-width:360px;background:#1e1f1c;color:#f8f8f2;border:1.5px solid #444;font-size:1.1em;border-radius:5px;box-sizing:border-box;">`;
    legendHtml += `</div>`;
    const legendDiv = document.createElement('div');
    legendDiv.id = 'legend';
    legendDiv.style.background = '#272822';
    legendDiv.style.borderRadius = '8px';
    legendDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
    legendDiv.style.padding = '16px 20px 10px 20px';
    legendDiv.style.color = '#f8f8f2';
    legendDiv.innerHTML = legendHtml;
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
      if (!nodes || !edges) return;
      const checkedProfs = Array.from(document.querySelectorAll('.prof-filter:checked')).map(cb => cb.value);
      const search = document.getElementById('item-search').value.trim().toLowerCase();
      // Determine which nodes are filtered in
      const filteredIds = new Set(nodeList.filter(n => {
        // For item nodes, show if any craft uses a checked profession to make it
        if (typeof n.id === 'number') {
          // Find crafts that output this item
          const craftsForItem = crafts.filter(craft => (craft.Outputs || []).some(out => getItemIdByName(out.item) === n.id));
          // If no crafts produce this item, it is a base material: always show
          if (craftsForItem.length === 0) {
            return !search || n.label.toLowerCase().includes(search);
          }
          // If any craft for this item matches a checked profession, show it
          return craftsForItem.some(craft => {
            const req = craft.Requirements;
            if (!req || !req.Profession) return false;
            const match = /([A-Za-z ]+)-\d+/.exec(req.Profession);
            const prof = match ? match[1] : req.Profession;
            return checkedProfs.includes(prof);
          }) && (!search || n.label.toLowerCase().includes(search));
        } else if (typeof n.id === 'string' && n.id.startsWith('craft-')) {
          // For craft nodes, show if its profession is checked
          const craft = crafts.find(c => c.id === n.id);
          if (!craft || !craft.Requirements || !craft.Requirements.Profession) return false;
          const match = /([A-Za-z ]+)-\d+/.exec(craft.Requirements.Profession);
          const prof = match ? match[1] : craft.Requirements.Profession;
          return checkedProfs.includes(prof) && (!search || n.label.toLowerCase().includes(search));
        }
        return false;
      }).map(n => n.id));
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
      const matches = items.filter(i => i.name && i.name.toLowerCase().includes(val));
      if (matches.length === 0) {
        searchDropdown.style.display = 'none';
        applyFilters();
        return;
      }
      searchDropdown.innerHTML = matches.map(i => `<div class=\"search-result\" data-id=\"${i.id}\" style=\"padding:4px 10px;cursor:pointer;\">${i.name}</div>`).join('');
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

    // Ensure the queue and sidebar are visible and updated after sidebar is created
    updateCraftQueueUI();
    applyFilters();
    applyFilters();
  });

function buildGraph() {
  // Helper: name to item id
  const itemByName = Object.fromEntries(items.map(i => [i.Name, i.id]));

  // Build profession color map (Monokai palette)
  const professionSet = new Set();
  crafts.forEach(craft => {
    if (craft.Requirements && craft.Requirements.Profession) {
      const match = /([A-Za-z ]+)-\d+/.exec(craft.Requirements.Profession);
      if (match) professionSet.add(match[1]);
      else professionSet.add(craft.Requirements.Profession);
    }
  });
  const professions = Array.from(professionSet).sort();
  // Monokai-inspired palette, 15 distinct non-red colors for up to 10 professions
  const profColors = [
    "#a6e22e", // green
    "#66d9ef", // cyan
    "#fd971f", // orange
    "#e6db74", // yellow
    "#ae81ff", // purple
    "#75715e", // brown/gray
    "#f8f8f2", // white
    "#39dca0", // teal
    "#ffd866", // light yellow
    "#fc9867", // peach
    "#ab9df2", // lavender
    "#78dce8", // light blue
    "#ffcc66", // gold
    "#c678dd", // violet
    "#d19a66"  // tan
  ];
  const profColorMap = {};
  professions.forEach((prof, i) => { profColorMap[prof] = profColors[i % profColors.length]; });

  // Item nodes: fill with profession color, dark text for readability
  nodeList = items.map(item => {
    const craftsForItem = crafts.filter(craft => (craft.Outputs || []).some(out => out.item === item.Name));
    let prof = null;
    if (craftsForItem.length > 0) {
      const req = craftsForItem[0].Requirements;
      if (req && req.Profession) {
        const match = /([A-Za-z ]+)-\d+/.exec(req.Profession);
        prof = match ? match[1] : req.Profession;
      }
    }
    const color = prof && profColorMap[prof] ? profColorMap[prof] : '#a6e22e';
    return {
      id: item.id,
      label: item.Name,
      shape: "box",
      color: {
        background: color,
        border: color,
        highlight: {
          background: color,
          border: color
        },
        hover: {
          background: color,
          border: color
        }
      },
      font: {
        color: '#23241f',
        size: 18,
        face: 'monospace',
        bold: 'bold',
        strokeWidth: 0
      },
      borderWidth: 2,
      shapeProperties: { borderRadius: 16 }
    };
  });

  // Craft nodes: fill with profession color, dark text for readability
  crafts.forEach(craft => {
    let prof = null;
    if (craft.Requirements && craft.Requirements.Profession) {
      const match = /([A-Za-z ]+)-\d+/.exec(craft.Requirements.Profession);
      prof = match ? match[1] : craft.Requirements.Profession;
    }
    const color = prof && profColorMap[prof] ? profColorMap[prof] : '#f92672';
    nodeList.push({
      id: craft.id,
      label: craft.Name,
      shape: "roundRect",
      color: {
        background: color,
        border: color,
        highlight: {
          background: color,
          border: color
        },
        hover: {
          background: color,
          border: color
        }
      },
      font: {
        color: '#23241f',
        size: 18,
        face: 'monospace',
        bold: 'bold',
        strokeWidth: 0
      },
      borderWidth: 3,
      shapeProperties: { borderRadius: 32 }
    });
  });

  // Edges: item -> craft (inputs), craft -> item (outputs)
  const edgeList = [];
  crafts.forEach(craft => {
    // Input edges
    (craft.Materials || []).forEach(mat => {
      if (itemByName[mat.item]) {
        edgeList.push({
          from: itemByName[mat.item],
          to: craft.id,
          label: `${mat.qty}`,
          arrows: "to",
          color: { color: "#66d9ef" } // cyan for input
        });
      }
    });
    // Output edges
    (craft.Outputs || []).forEach(out => {
      if (itemByName[out.item]) {
        edgeList.push({
          from: craft.id,
          to: itemByName[out.item],
          label: `${out.qty}`,
          arrows: "to",
          color: { color: "#f92672" } // pink for output
        });
      }
    });
  });
  nodes = new vis.DataSet(nodeList);
  edges = new vis.DataSet(edgeList);
  const container = document.getElementById("network");
  const data = { nodes, edges };
  const options = {
    layout: {
      hierarchical: {
        direction: "UD",
        sortMethod: "directed",
        levelSeparation: 220, // default 150, increase for more vertical space
        nodeSpacing: 180,     // default 100, increase for more horizontal space
        treeSpacing: 320      // default 200, increase for more space between trees
      }
    },
    edges: {
      smooth: true,
      font: {
        color: '#e6db74',
        strokeWidth: 0,
        size: 15
      }
    },
    nodes: {
      font: {
        size: 18,
        face: 'monospace',
        bold: 'bold',
        color: '#23241f',
        strokeWidth: 0
      },
      borderWidthSelected: 3
    },
    interaction: {
      multiselect: true,
      selectConnectedEdges: false
    },
    physics: false,
    manipulation: false
  };
  // Make network globally accessible
  window.network = new vis.Network(container, data, options);
  const network = window.network;

  // Custom selection styling: only bold/enlarge, don't fill
  network.on("selectNode", function(params) {
    nodes.forEach(function(node) {
      if (params.nodes.includes(node.id)) {
        nodes.update({ id: node.id, font: { size: 24, bold: 'bold' } });
      } else {
        nodes.update({ id: node.id, font: { size: 18, bold: 'bold' } });
      }
    });
    showItemDetails(params.nodes[0]);
  });
  network.on("deselectNode", function() {
    nodes.forEach(function(node) {
      nodes.update({ id: node.id, font: { size: 18, bold: 'bold' } });
    });
    document.getElementById("item-details").classList.remove("active");
  });
}

// --- Craft queue and resource calculation for new data structure ---
let craftQueue = [];
let selectedCrafts = {};

// Helper: name to item id
function getItemIdByName(name) {
  const item = items.find(i => i.Name === name);
  return item ? item.id : null;
}

// Helper: item id to item
function getItemById(id) {
  return items.find(i => i.id === id);
}

// Helper: get all crafts that output a given item id
function getCraftsByOutputId(itemId) {
  const itemName = getItemById(itemId)?.Name;
  if (!itemName) return [];
  return crafts.filter(craft => (craft.Outputs || []).some(out => out.item === itemName));
}

// Set of items that are always treated as base crafting items (do not progress past these)
const BASE_CRAFT_ITEMS = new Set([
  'Basic Embergrain',
  'Basic Starbulb',
  'Rough Wispweave Filament'
]);

// Helper: get output quantity for a craft and item name (returns lowest value if range, as integer)
function getOutputQty(craft, itemName) {
  const out = (craft.Outputs || []).find(o => o.item.trim() === itemName.trim());
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

// Recursively trace the path to obtain an item (choose first craft by default, or selected)
function tracePath(itemId, qty = 1, depth = 0, surplus = {}) {
  const item = getItemById(itemId);
  // If this is a flagged base crafting item, treat as base
  if (BASE_CRAFT_ITEMS.has(item.Name)) {
    return [{ depth, id: itemId, name: item.Name, qty }];
  }
  const craftsForItem = getCraftsByOutputId(itemId);
  if (craftsForItem.length === 0) {
    // Base resource
    return [{ depth, id: itemId, name: item.Name, qty }];
  }
  // Use selected craft or default to first
  let craftIdx = selectedCrafts[itemId] || 0;
  if (craftIdx >= craftsForItem.length) craftIdx = 0;
  const craft = craftsForItem[craftIdx];
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
  const outputQty = getOutputQty(craft, item.Name);
  // If outputQty is 0, treat as base resource
  if (outputQty === 0) {
    return [{ depth, id: itemId, name: item.Name, qty: needed }];
  }
  const craftsNeeded = Math.ceil(needed / outputQty);
  const totalProduced = craftsNeeded * outputQty;
  const newSurplus = { ...surplus };
  newSurplus[itemId] = (newSurplus[itemId] || 0) + (totalProduced - needed);
  let paths = [{ depth, id: itemId, name: item.Name, qty: needed, craft, craftIdx, craftsForItem, craftsNeeded, totalProduced, used: needed }];
  (craft.Materials || []).forEach(input => {
    const inputId = getItemIdByName(input.item);
    if (inputId) {
      const inputQty = craftsNeeded * input.qty;
      paths = paths.concat(tracePath(inputId, inputQty, depth + 1, newSurplus));
    }
  });
  return paths;
}

function updateCraftQueueUI() {
  let queueDiv = document.getElementById("craft-queue");
  if (!queueDiv) {
    // Try to find the sidebar and append the queue div if missing
    const sidebar = document.getElementById('sidebar');
    queueDiv = document.createElement('div');
    queueDiv.id = 'craft-queue';
    if (sidebar) {
      // Insert after item-details if present, else at top
      const detailsDiv = document.getElementById('item-details');
      if (detailsDiv && detailsDiv.nextSibling) {
        sidebar.insertBefore(queueDiv, detailsDiv.nextSibling);
      } else {
        sidebar.appendChild(queueDiv);
      }
    } else {
      // If sidebar is missing, just append to body (should not happen)
      document.body.appendChild(queueDiv);
    }
  }
  if (craftQueue.length === 0) {
    queueDiv.innerHTML = '<div class="sidebar-card"><h3>Craft Queue</h3><p>No items queued.</p></div>';
    const resDiv = document.getElementById("resource-summary");
    if (resDiv) resDiv.innerHTML = '';
    const pathDiv = document.getElementById("craft-paths");
    if (pathDiv) pathDiv.innerHTML = '';
    return;
  }
  // Count each unique item in the queue
  const queueCount = {};
  craftQueue.forEach(id => {
    queueCount[id] = (queueCount[id] || 0) + 1;
  });
  queueDiv.innerHTML = '<div class="sidebar-card">' +
    '<h3>Craft Queue</h3>' +
    '<ul>' + Object.entries(queueCount).map(([id, qty]) => `<li>${getItemById(Number(id)).Name} x${qty}</li>`).join('') + '</ul>' +
    '<button id="clear-queue">Clear Queue</button>' +
    '</div>';
  document.getElementById("clear-queue").onclick = () => {
    craftQueue = [];
    updateCraftQueueUI();
  };
  // Calculate and show resources
  const resources = calculateResources(Object.entries(queueCount).map(([id, qty]) => Array(Number(qty)).fill(Number(id))).flat());
  const resDiv = document.getElementById("resource-summary");
  if (resDiv) {
    // Only show true base resources (not craftable, or in BASE_CRAFT_ITEMS)
    const baseResourceEntries = Object.entries(resources).filter(([id, qty]) => {
      const item = getItemById(Number(id));
      if (!item) return false;
      if (BASE_CRAFT_ITEMS.has(item.Name)) return true;
      // Not craftable if no crafts output this item
      return getCraftsByOutputId(Number(id)).length === 0;
    });
    resDiv.innerHTML =
      '<div class="sidebar-card">' +
      '<h3>Required Base Resources</h3>' +
      '<ul>' + baseResourceEntries.map(([id, qty]) => `<li>${getItemById(Number(id)).Name}: ${qty}</li>`).join('') + '</ul>' +
      '</div>';
  }

  // Show crafting paths for combined quantities
  let pathsHtml = '<div class="sidebar-card"><h3>Crafting Paths</h3>';
  Object.entries(queueCount).forEach(([id, qty]) => {
    const path = tracePath(Number(id), qty);
    pathsHtml += `<div><strong><a href="#" class="tree-item-link" data-itemid="${id}">${getItemById(Number(id)).Name}</a> x${qty}</strong><ul style="margin-left:1em;">`;
    path.forEach((step, idx) => {
      const itemLink = `<a href=\"#\" class=\"tree-item-link\" data-itemid=\"${step.id}\">${step.name}</a>`;
      if (step.craft) {
        let recipeInputs = (step.craft.Materials || []).map(inp => `${inp.qty} ${inp.item}`).join(' + ');
        // If multiple crafts, show a select dropdown
        if (step.craftsForItem && step.craftsForItem.length > 1) {
          const selectId = `craft-select-${step.id}-${step.depth}-${idx}`;
          pathsHtml += `<li style="margin-left:${step.depth * 1.5}em;">
            <span>CRAFT ${itemLink} ← ${recipeInputs} (yields ${getOutputQty(step.craft, step.name)})</span>
            <select id="${selectId}" data-itemid="${step.id}" data-depth="${step.depth}"
              style="background:#23241f;color:#f8f8f2;border:1.5px solid #a6e22e;border-radius:4px;padding:6px 12px;font-size:1em;margin-left:10px;box-shadow:0 2px 8px rgba(0,0,0,0.18);font-family:monospace;">
              ${step.craftsForItem.map((c, i) => {
                let inputs = (c.Materials || []).map(inp => `${inp.qty} ${inp.item}`).join(' + ');
                return `<option value="${i}" ${i === step.craftIdx ? 'selected' : ''}>CRAFT ← ${inputs} (yields ${getOutputQty(c, step.name)})</option>`;
              }).join('')}
            </select>
          </li>`;
        } else {
          pathsHtml += `<li style="margin-left:${step.depth * 1.5}em;">CRAFT ${itemLink} ← ${recipeInputs} (yields ${getOutputQty(step.craft, step.name)})</li>`;
        }
      } else {
        pathsHtml += `<li style="margin-left:${step.depth * 1.5}em;">Gather/Obtain <strong>${itemLink}</strong></li>`;
      }
    });
    pathsHtml += '</ul></div>';
  });
  const pathDiv = document.getElementById("craft-paths");
  if (pathDiv)
    pathDiv.innerHTML = pathsHtml + '</div>';

  // Add event listeners for craft selects and tree item links
  Object.entries(queueCount).forEach(([id, qty]) => {
    const path = tracePath(Number(id), qty);
    path.forEach((step, idx) => {
      if (step.craftsForItem && step.craftsForItem.length > 1) {
        const selectId = `craft-select-${step.id}-${step.depth}-${idx}`;
        const select = document.getElementById(selectId);
        if (select) {
          select.onchange = (e) => {
            selectedCrafts[step.id] = Number(e.target.value);
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
      const idAttr = this.getAttribute('data-itemid');
      let nodeId = idAttr;
      // If the id is a number string, use as number; if string (craft-...), use as is
      if (!isNaN(Number(nodeId))) nodeId = Number(nodeId);
      // Focus/select the node in the network
      if (typeof network !== 'undefined' && network && typeof network.selectNodes === 'function') {
        network.selectNodes([nodeId]);
        network.focus(nodeId, { scale: 1.2, animation: true });
      }
      showItemDetails(nodeId);
    };
  });
}

function calculateResources(queue) {
  // Improved: batch items that are outputs of the same craft, so we only craft the minimum needed to satisfy all outputs at once
  const resourceCount = {};
  const surplus = {};
  // Count each unique item in the queue
  const queueCount = {};
  queue.forEach(id => {
    queueCount[id] = (queueCount[id] || 0) + 1;
  });

  // Map: craftId -> { craft, outputNeeds: {itemId: qty, ...} }
  const craftNeeds = {};
  // Items that are not craftable (base resources)
  const baseNeeds = {};

  // First, group queue items by their selected craft (if any)
  Object.entries(queueCount).forEach(([id, qty]) => {
    const itemId = Number(id);
    const item = getItemById(itemId);
    if (BASE_CRAFT_ITEMS.has(item.Name)) {
      baseNeeds[itemId] = (baseNeeds[itemId] || 0) + qty;
      return;
    }
    const craftsForItem = getCraftsByOutputId(itemId);
    if (craftsForItem.length === 0) {
      baseNeeds[itemId] = (baseNeeds[itemId] || 0) + qty;
      return;
    }
    let craftIdx = selectedCrafts[itemId] || 0;
    if (craftIdx >= craftsForItem.length) craftIdx = 0;
    const craft = craftsForItem[craftIdx];
    if (!craftNeeds[craft.id]) {
      craftNeeds[craft.id] = { craft, outputNeeds: {} };
    }
    craftNeeds[craft.id].outputNeeds[itemId] = (craftNeeds[craft.id].outputNeeds[itemId] || 0) + qty;
  });

  // Now, for each craft, determine how many times to run it to satisfy all outputs at once
  Object.values(craftNeeds).forEach(({ craft, outputNeeds }) => {
    // For each output, determine how many are needed after surplus
    const outputQtys = {};
    Object.keys(outputNeeds).forEach(itemId => {
      outputQtys[itemId] = getOutputQty(craft, getItemById(Number(itemId)).Name);
    });
    // For each output, check surplus
    const needed = {};
    Object.entries(outputNeeds).forEach(([itemId, qty]) => {
      let avail = surplus[itemId] || 0;
      if (avail >= qty) {
        surplus[itemId] -= qty;
        needed[itemId] = 0;
      } else if (avail > 0) {
        needed[itemId] = qty - avail;
        surplus[itemId] = 0;
      } else {
        needed[itemId] = qty;
      }
    });
    // Find the minimum number of crafts needed to satisfy all outputs
    let craftsNeeded = 0;
    Object.entries(needed).forEach(([itemId, qty]) => {
      const outQty = outputQtys[itemId] || 1;
      if (outQty === 0) {
        // If output is 0, treat as base resource
        baseNeeds[itemId] = (baseNeeds[itemId] || 0) + qty;
      } else {
        craftsNeeded = Math.max(craftsNeeded, Math.ceil(qty / outQty));
      }
    });
    if (craftsNeeded === 0) return; // All needs satisfied by surplus
    // For each output, add surplus
    Object.entries(outputNeeds).forEach(([itemId, qty]) => {
      const outQty = outputQtys[itemId] || 1;
      const produced = craftsNeeded * outQty;
      const used = needed[itemId] || 0;
      if (produced > used) {
        surplus[itemId] = (surplus[itemId] || 0) + (produced - used);
      }
      // Add to resourceCount for reporting
      resourceCount[itemId] = (resourceCount[itemId] || 0) + used;
    });
    // Now, recurse for inputs
    (craft.Materials || []).forEach(input => {
      const inputId = getItemIdByName(input.item);
      if (inputId) {
        const inputQty = craftsNeeded * input.qty;
        // Recurse as if these are new queue items
        // Use a helper to process inputs (could be base or craftable)
        processInput(inputId, inputQty);
      }
    });
  });

  // Process base needs
  Object.entries(baseNeeds).forEach(([itemId, qty]) => {
    resourceCount[itemId] = (resourceCount[itemId] || 0) + qty;
  });

  // Helper for recursion
  function processInput(itemId, qty) {
    const item = getItemById(itemId);
    if (BASE_CRAFT_ITEMS.has(item.Name)) {
      resourceCount[itemId] = (resourceCount[itemId] || 0) + qty;
      return;
    }
    const craftsForItem = getCraftsByOutputId(itemId);
    if (craftsForItem.length === 0) {
      resourceCount[itemId] = (resourceCount[itemId] || 0) + qty;
      return;
    }
    let craftIdx = selectedCrafts[itemId] || 0;
    if (craftIdx >= craftsForItem.length) craftIdx = 0;
    const craft = craftsForItem[craftIdx];
    // Check surplus
    let avail = surplus[itemId] || 0;
    let needed = qty;
    if (avail >= needed) {
      surplus[itemId] -= needed;
      return;
    } else if (avail > 0) {
      needed -= avail;
      surplus[itemId] = 0;
    }
    const outQty = getOutputQty(craft, getItemById(itemId).Name);
    if (outQty === 0) {
      resourceCount[itemId] = (resourceCount[itemId] || 0) + needed;
      return;
    }
    const craftsNeeded = Math.ceil(needed / outQty);
    const produced = craftsNeeded * outQty;
    if (produced > needed) {
      surplus[itemId] = (surplus[itemId] || 0) + (produced - needed);
    }
    resourceCount[itemId] = (resourceCount[itemId] || 0) + needed;
    (craft.Materials || []).forEach(input => {
      const inputId = getItemIdByName(input.item);
      if (inputId) {
        const inputQty = craftsNeeded * input.qty;
        processInput(inputId, inputQty);
      }
    });
  }

  return resourceCount;
}

// Add a "Queue Craft" button to item details
function showItemDetails(id) {
  // Check if this is an item node (number id) or a craft node (string id like 'craft-1')
  const detailsDiv = document.getElementById("item-details");
  if (typeof id === 'number') {
    const item = getItemById(id);
    if (item) {
      // Count how many recipes (crafts) this item is used in as an input
      const usedInCount = crafts.filter(craft => (craft.Materials || []).some(mat => mat.item === item.Name)).length;
      detailsDiv.innerHTML = `
        <div style="max-width:600px;margin:20px auto 0 auto;background:#272822;color:#f8f8f2;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);padding:20px 28px;min-height:120px;">
          <h2 style="color:#a6e22e;margin-top:0;">${item.Name}</h2>
          <p><strong style=\"color:#fd971f;\">Tier:</strong> <span style=\"color:#f8f8f2;\">${item.Tier}</span> <span style=\"margin-left:1em;\"><strong style=\"color:#f92672;\">Rank:</strong> <span style=\"color:#f8f8f2;\">${item.Rank}</span></span></p>
          <p><strong style=\"color:#e6db74;\">Used in Recipes:</strong> <span style=\"color:#f8f8f2;\">${usedInCount}</span></p>
          <div style="margin-top:18px;">
            <button id="queue-craft" style="background:#a6e22e;color:#272822;border:none;border-radius:3px;padding:6px 16px;cursor:pointer;margin-right:8px;">Queue 1</button>
            <button id="queue-craft-5" style="background:#66d9ef;color:#272822;border:none;border-radius:3px;padding:6px 16px;cursor:pointer;margin-right:8px;">Queue 5</button>
            <button id="queue-craft-10" style="background:#fd971f;color:#272822;border:none;border-radius:3px;padding:6px 16px;cursor:pointer;">Queue 10</button>
          </div>
          <div style="margin-top:32px;text-align:right;">
            <button id="goto-node" style="background:#272822;color:#a6e22e;border:1.5px solid #a6e22e;border-radius:3px;padding:6px 16px;cursor:pointer;">Go to Node</button>
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
      document.getElementById("goto-node").onclick = () => {
        let nodeId = id;
        // Ensure correct type: number for items, string for crafts
        if (typeof id === 'string' && id.startsWith('craft-')) {
          nodeId = id;
        } else {
          nodeId = Number(id);
        }
        if (typeof window.network !== 'undefined' && window.network && typeof window.network.selectNodes === 'function') {
          window.network.selectNodes([nodeId]);
          window.network.focus(nodeId, {
            scale: 1.2,
            animation: { duration: 600, easingFunction: 'easeInOutQuad' },
            locked: true
          });
        }
      };
    }
  } else if (typeof id === 'string' && id.startsWith('craft-')) {
    // Craft node
    const craft = crafts.find(c => c.id === id);
    if (craft) {
      // Parse requirements and extract level
      const req = craft.Requirements || {};
      function parseLevel(val) {
        if (!val) return '';
        const match = /(.+)-(\d+)/.exec(val);
        if (match) return `${match[1]} (Level ${match[2]})`;
        return val;
      }
      detailsDiv.innerHTML = `
        <div style="max-width:600px;margin:20px auto 0 auto;background:#272822;color:#f8f8f2;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);padding:20px 28px;min-height:120px;">
          <h2 style="color:#f92672;margin-top:0;">${craft.Name}</h2>
          <p><strong style=\"color:#66d9ef;\">Profession:</strong> <span style=\"color:#f8f8f2;\">${parseLevel(req.Profession)}</span></p>
          <p><strong style=\"color:#a6e22e;\">Tool:</strong> <span style="color:#f8f8f2;">${parseLevel(req.Tool)}</span></p>
          <p><strong style=\"color:#fd971f;\">Building:</strong> <span style="color:#f8f8f2;">${parseLevel(req.Building)}</span></p>
          <div style="margin-top:32px;text-align:right;">
            <button id="goto-node" style="background:#272822;color:#f92672;border:1.5px solid #f92672;border-radius:3px;padding:6px 16px;cursor:pointer;">Go to Node</button>
          </div>
        </div>
      `;
      detailsDiv.classList.add("active");
      document.getElementById("goto-node").onclick = () => {
        let nodeId = id;
        // Ensure correct type: number for items, string for crafts
        if (typeof id === 'string' && id.startsWith('craft-')) {
          nodeId = id;
        } else {
          nodeId = Number(id);
        }
        if (typeof window.network !== 'undefined' && window.network && typeof window.network.selectNodes === 'function') {
          window.network.selectNodes([nodeId]);
          window.network.focus(nodeId, {
            scale: 1.2,
            animation: { duration: 600, easingFunction: 'easeInOutQuad' },
            locked: true
          });
        }
      };
    }
  }
}

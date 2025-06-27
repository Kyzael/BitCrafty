import useStore from './state.js';

// Helper to access store outside React (for vanilla JS)
const store = useStore;

// Main initialization function
async function initializeApp() {
  try {
    // Load all data using the store's loadAllData method
    await store.getState().loadAllData();
    
    // Build the graph with the loaded data
    buildGraph();

    // Setup UI components
    setupUI();
    
    // Initialize event handlers
    setupEventHandlers();
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

function setupUI() {
    // --- Sidebar, legend, and main content setup ---
    // Create sidebar and main content containers
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    sidebar.style.width = '420px';
    sidebar.style.minHeight = '100vh';
    sidebar.style.background = '#23241f';
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.gap = '18px';
    sidebar.style.padding = '0 0 18px 0';
    sidebar.style.position = 'fixed';
    sidebar.style.left = '0';
    sidebar.style.top = '0';
    sidebar.style.bottom = '0';
    sidebar.style.overflowY = 'auto';
    sidebar.style.zIndex = '10';

    // Title above legend
    const titleDiv = document.createElement('div');
    titleDiv.id = 'bitcrafty-title';
    titleDiv.textContent = 'BitCraft Crafting Tree';
    titleDiv.style.background = '#1e1f1c';
    titleDiv.style.color = '#f8f8f2';
    titleDiv.style.fontFamily = 'monospace, monospace';
    titleDiv.style.fontSize = '2.1em';
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.display = 'flex';
    titleDiv.style.alignItems = 'center';
    titleDiv.style.justifyContent = 'flex-start';
    titleDiv.style.padding = '24px 0 12px 32px';
    titleDiv.style.borderTopLeftRadius = '0';
    titleDiv.style.borderTopRightRadius = '12px';
    titleDiv.style.boxShadow = 'none';
    sidebar.appendChild(titleDiv);


    // Grab profession list from store professions
    const professionsObj = store.getState().professions;
    const professions = Object.values(professionsObj);
    
    // Create profession color map from the imported profession data
    const profColorMap = {};
    professions.forEach(prof => {
      profColorMap[prof.name] = prof.color;
    });
    
    // Sort profession names for consistent display
    const professionNames = professions.map(p => p.name).sort();
    
    let legendHtml = `<h3 style="margin-top:0;color:#f8f8f2;">Legend & Filters</h3>
    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(2, 1fr);gap:6px 16px;">`;
    
    professionNames.forEach(profName => {
      legendHtml += `<div class="prof-filter-toggle" data-profession="${profName}" data-active="true" style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:all 0.3s ease;user-select:none;white-space:nowrap;min-width:0;">
        <span style="display:inline-block;width:16px;height:16px;background:${profColorMap[profName]};border-radius:3px;transition:all 0.3s ease;flex-shrink:0;"></span>
        <span style="color:#f8f8f2;font-weight:500;transition:all 0.3s ease;font-size:0.9em;overflow:hidden;text-overflow:ellipsis;">${profName}</span>
      </div>`;
    });
    
    legendHtml += `</div>
    <div style="margin-top:12px;display:flex;flex-wrap:wrap;align-items:center;gap:10px;">
      <input type="text" id="item-search" placeholder="Search item name..." style="padding:10px 16px;min-width:180px;width:240px;background:#1e1f1c;color:#f8f8f2;border:1.5px solid #444;font-size:1.1em;border-radius:5px;box-sizing:border-box;">
    </div>`;
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
      if (networkDiv) {
        // Ensure network takes full available space
        networkDiv.style.width = '100%';
        networkDiv.style.height = '100%';
        networkDiv.style.border = '1px solid #444';
        networkDiv.style.background = '#1e1f1c';
        mainContent.appendChild(networkDiv);
      }
      document.body.appendChild(mainContent);
    }
    // Always use full height for graph
    mainContent.style.height = '100vh';

    // Simplified event handlers with efficient filtering logic
    document.querySelectorAll('.prof-filter-toggle').forEach(toggle => {
      toggle.addEventListener('click', function() {
        const profession = this.getAttribute('data-profession');
        const isActive = this.getAttribute('data-active') === 'true';
        const newState = !isActive;
        
        // Update the toggle state
        this.setAttribute('data-active', newState.toString());
        
        // Update visual appearance
        const colorBox = this.querySelector('span:first-child');
        const textSpan = this.querySelector('span:last-child');
        
        if (newState) {
          // Active state - normal colors
          this.style.opacity = '1';
          this.style.filter = 'none';
          colorBox.style.opacity = '1';
          textSpan.style.color = '#f8f8f2';
        } else {
          // Inactive state - greyed out
          this.style.opacity = '0.4';
          this.style.filter = 'grayscale(0.8)';
          colorBox.style.opacity = '0.6';
          textSpan.style.color = '#666';
        }
        
        console.log('Profession filter changed:', profession, newState);
        applyProfessionFilters();
      });
    });
    
    // Enhanced search functionality with auto-focus and keyboard navigation
    let selectedDropdownIndex = -1;
    
    document.getElementById('item-search').addEventListener('input', function() {
        const val = this.value.trim().toLowerCase();
        selectedDropdownIndex = -1; // Reset selection when typing
        if (!val) {
            searchDropdown.style.display = 'none';
            return;
        }
        // Handle search dropdown display only
        updateSearchDropdown(val);
    });

    // Auto-focus search when typing (except when already focused)
    document.addEventListener('keydown', function(e) {
        const searchInput = document.getElementById('item-search');
        const isSearchFocused = document.activeElement === searchInput;
        const isDropdownVisible = searchDropdown.style.display === 'block';
        
        // Handle arrow key navigation in dropdown
        if (isDropdownVisible && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            const results = searchDropdown.querySelectorAll('.search-result');
            
            // Remove previous highlight
            if (selectedDropdownIndex >= 0 && results[selectedDropdownIndex]) {
                results[selectedDropdownIndex].style.background = '#272822';
            }
            
            // Update selection
            if (e.key === 'ArrowDown') {
                selectedDropdownIndex = Math.min(selectedDropdownIndex + 1, results.length - 1);
            } else {
                selectedDropdownIndex = Math.max(selectedDropdownIndex - 1, -1);
            }
            
            // Highlight new selection
            if (selectedDropdownIndex >= 0 && results[selectedDropdownIndex]) {
                results[selectedDropdownIndex].style.background = '#49483e';
                // Scroll into view if needed
                results[selectedDropdownIndex].scrollIntoView({ block: 'nearest' });
            }
            return;
        }
        
        // Handle Enter key to select highlighted item
        if (isDropdownVisible && e.key === 'Enter' && selectedDropdownIndex >= 0) {
            e.preventDefault();
            const results = searchDropdown.querySelectorAll('.search-result');
            if (results[selectedDropdownIndex]) {
                const id = results[selectedDropdownIndex].getAttribute('data-id');
                selectSearchResult(id);
            }
            return;
        }
        
        // Handle Escape to close dropdown
        if (isDropdownVisible && e.key === 'Escape') {
            searchDropdown.style.display = 'none';
            selectedDropdownIndex = -1;
            searchInput.blur();
            return;
        }
        
        // Auto-focus search input when typing (alphanumeric keys)
        if (!isSearchFocused && 
            !e.ctrlKey && !e.altKey && !e.metaKey && 
            e.key.length === 1 && 
            /[a-zA-Z0-9\s]/.test(e.key)) {
            searchInput.focus();
            // Don't prevent default so the character gets typed
        }
    });

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

    function updateSearchDropdown(searchValue) {
      const matches = Object.values(store.getState().items).filter(i => i.name && i.name.toLowerCase().includes(searchValue));
      if (matches.length === 0) {
        searchDropdown.style.display = 'none';
        return;
      }
      searchDropdown.innerHTML = matches.map((i, index) => 
        `<div class="search-result" data-id="${i.id}" data-index="${index}" style="padding:4px 10px;cursor:pointer;">${i.name}</div>`
      ).join('');
      const rect = searchInput.getBoundingClientRect();
      searchDropdown.style.left = rect.left + 'px';
      searchDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
      searchDropdown.style.width = rect.width + 'px';
      searchDropdown.style.display = 'block';
      selectedDropdownIndex = -1; // Reset selection when dropdown updates
    }

    function selectSearchResult(id) {
      const searchInput = document.getElementById('item-search');
      searchInput.value = ''; // Clear the search box
      searchDropdown.style.display = 'none';
      selectedDropdownIndex = -1;
      // Focus/select the node in the network
      window.network.selectNodes([id]);
      window.network.focus(id, { scale: 1.2, animation: true });
      showItemDetails(id);
    }

    document.addEventListener('click', function(e) {
      if (!searchDropdown.contains(e.target) && e.target !== searchInput) {
        searchDropdown.style.display = 'none';
        selectedDropdownIndex = -1;
      }
    });
    
    // Enhanced dropdown interaction with hover support
    searchDropdown.addEventListener('mouseover', function(e) {
      if (e.target.classList.contains('search-result')) {
        // Remove previous highlight
        const results = searchDropdown.querySelectorAll('.search-result');
        results.forEach(result => result.style.background = '#272822');
        
        // Highlight hovered item and update index
        e.target.style.background = '#49483e';
        selectedDropdownIndex = parseInt(e.target.getAttribute('data-index'));
      }
    });
    
    searchDropdown.addEventListener('mousedown', function(e) {
      if (e.target.classList.contains('search-result')) {
        const id = e.target.getAttribute('data-id');
        selectSearchResult(id);
      }
    });

    // Ensure the queue and sidebar are visible and updated after sidebar is created
    updateCraftQueueUI();
}

function setupEventHandlers() {
    // Additional event handlers can be added here
}

function buildGraph() {
  // Get data from store as objects and convert to arrays
  const itemsObj = store.getState().items;
  const craftsObj = store.getState().crafts;
  const items = Object.values(itemsObj);
  const crafts = Object.values(craftsObj);
  
  // Helper: name to item id - update for new property names
  const itemByName = Object.fromEntries(items.map(i => [i.name, i.id]));

  // Build profession color map (Monokai palette)
  // Use the profession metadata with predefined colors
  const requirements = store.getState().requirements;
  const professions = store.getState().professions;
  
  const professionSet = new Set();
  const profColorMap = {};
  
  // Get profession names from crafts and build color map
  crafts.forEach(craft => {
    if (craft.requirement) {
      const req = Object.values(requirements).find(r => r.id === craft.requirement);
      if (req && req.profession && req.profession.name) {
        const profId = req.profession.name;
        const prof = Object.values(professions).find(p => p.id === profId);
        if (prof) {
          professionSet.add(prof.name);
          profColorMap[prof.name] = prof.color;
        }
      }
    }
  });

  // Item nodes: fill with profession color, dark text for readability
  const nodeList = items.map(item => {
    const craftsForItem = crafts.filter(craft => (craft.outputs || []).some(out => out.item === item.id));
    let prof = null;
    if (craftsForItem.length > 0) {
      const craft = craftsForItem[0];
      if (craft.requirement) {
        const req = Object.values(requirements).find(r => r.id === craft.requirement);
        if (req && req.profession && req.profession.name) {
          const profId = req.profession.name;
          const profObj = Object.values(professions).find(p => p.id === profId);
          if (profObj) prof = profObj.name;
        }
      }
    }
    const color = prof && profColorMap[prof] ? profColorMap[prof] : '#a6e22e';
    return {
      id: item.id,
      label: item.name,
      shape: "box",
      color: {
        background: color,
        border: color,
        highlight: { background: color, border: color },
        hover: { background: color, border: color }
      },
      font: {
        color: '#23241f',
        size: 14,
        face: 'monospace',
        bold: 'bold',
        strokeWidth: 0
      },
      borderWidth: 2,
      shadow: false, // Ensure shadow is initially disabled
      shapeProperties: { borderRadius: 16 }
    };
  });

  // Craft nodes: fill with profession color, dark text for readability
  crafts.forEach(craft => {
    let prof = null;
    if (craft.requirement) {
      const req = Object.values(requirements).find(r => r.id === craft.requirement);
      if (req && req.profession && req.profession.name) {
        const profId = req.profession.name;
        const profObj = Object.values(professions).find(p => p.id === profId);
        if (profObj) prof = profObj.name;
      }
    }
    const color = prof && profColorMap[prof] ? profColorMap[prof] : '#f92672';
    nodeList.push({
      id: craft.id,
      label: craft.name,
      shape: "roundRect",
      color: {
        background: color,
        border: color,
        highlight: { background: color, border: color },
        hover: { background: color, border: color }
      },
      font: {
        color: '#23241f',
        size: 14,
        face: 'monospace',
        bold: 'bold',
        strokeWidth: 0
      },
      borderWidth: 3,
      shadow: false, // Ensure shadow is initially disabled
      shapeProperties: { borderRadius: 32 }
    });
  });

  // Edges: item -> craft (inputs), craft -> item (outputs)
  const edgeList = [];
  crafts.forEach(craft => {
    (craft.materials || []).forEach(mat => {
      // mat.item is now an item ID directly
      if (items.find(item => item.id === mat.item)) {
        // Calculate line width based on quantity (min 1, max 8)
        const lineWidth = Math.min(Math.max(Math.log2(mat.qty + 1) + 1, 1), 8);
        edgeList.push({
          from: mat.item,
          to: craft.id,
          label: `${mat.qty}`,
          arrows: "to",
          color: { color: "#66d9ef", highlight: "#87ceeb", hover: "#87ceeb" },
          width: lineWidth,
          font: { color: '#66d9ef', size: 16, strokeWidth: 2, strokeColor: '#272822' }
        });
      }
    });
    (craft.outputs || []).forEach(out => {
      // out.item is now an item ID directly
      if (items.find(item => item.id === out.item)) {
        // Parse quantity for output (handle ranges like "1-3" or "5-10")
        let qty = 1;
        if (typeof out.qty === 'number') {
          qty = out.qty;
        } else if (typeof out.qty === 'string') {
          const match = out.qty.match(/^(\d+)(-(\d+))?$/);
          if (match) {
            qty = parseInt(match[1], 10); // Use the minimum value for line thickness
          }
        }
        // Calculate line width based on quantity (min 1, max 8)
        const lineWidth = Math.min(Math.max(Math.log2(qty + 1) + 1, 1), 8);
        edgeList.push({
          from: craft.id,
          to: out.item,
          label: `${out.qty}`,
          arrows: "to",
          color: { color: "#f92672", highlight: "#ff69b4", hover: "#ff69b4" },
          width: lineWidth,
          font: { color: '#f92672', size: 16, strokeWidth: 2, strokeColor: '#272822' }
        });
      }
    });
  });
  const nodes = new vis.DataSet(nodeList);
  const edges = new vis.DataSet(edgeList);
  // Store nodes/edges in Zustand for access elsewhere
  store.getState().setGraphData({ nodes, edges });
  const container = document.getElementById("network");
  const data = { nodes, edges };
  const options = {
    layout: {
      randomSeed: 2,
      improvedLayout: true,
      hierarchical: {
        enabled: true,
        direction: "UD",
        sortMethod: "directed",
        shakeTowards: "roots",
        levelSeparation: 300,
        nodeSpacing: 250,
        treeSpacing: 400,
        blockShifting: false,
        edgeMinimization: false,
        parentCentralization: false
      }
    },
    edges: {
      smooth: {
        enabled: true,
        type: 'curvedCW',
        roundness: 0.2
      },
      font: { 
        color: '#e6db74', 
        strokeWidth: 2, 
        strokeColor: '#272822',
        size: 16,
        align: 'middle'
      },
      width: 2,
      selectionWidth: function(width) { return width * 1.5; },
      arrows: {
        to: { 
          enabled: true, 
          scaleFactor: 1.2,
          type: 'arrow'
        }
      },
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.3)',
        size: 5,
        x: 2,
        y: 2
      }
    },
    nodes: {
      font: { size: 16, face: 'monospace', bold: 'bold', color: '#23241f', strokeWidth: 0 },
      borderWidthSelected: 3,
      margin: 15,
      widthConstraint: { minimum: 120, maximum: 250 },
      heightConstraint: { minimum: 40 },
      chosen: {
        node: function(values, id, selected, hovering) {
          values.borderWidth = 3;
        }
      }
    },
    interaction: { 
      multiselect: true, 
      selectConnectedEdges: false,
      tooltipDelay: 300,
      hideEdgesOnDrag: true,
      hideEdgesOnZoom: false,
      dragNodes: true,
      dragView: true,
      zoomView: true
    },
    physics: {
      enabled: true,
      solver: 'hierarchicalRepulsion',
      hierarchicalRepulsion: {
        centralGravity: 0.0,
        springLength: 200,
        springConstant: 0.01,
        nodeDistance: 180,
        damping: 0.09,
        avoidOverlap: 1
      },
      stabilization: {
        enabled: true,
        iterations: 200,
        updateInterval: 25,
        onlyDynamicEdges: false,
        fit: true
      }
    },
    manipulation: false
  };
  window.network = new vis.Network(container, data, options);
  const network = window.network;

  // Initialize filters after network is created
  network.on('stabilizationIterationsDone', function() {
    initializeFilters();
    // Fit the network to center it properly in the view
    network.fit({
      animation: {
        duration: 1000,
        easingFunction: 'easeInOutQuad'
      }
    });
  });

  // Track previously selected nodes and highlighted edges for efficient updates
  let previouslySelected = [];
  let previouslyHighlightedEdges = [];

  // Add double-click handler for subtree filtering
  network.on("doubleClick", function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      applySubtreeFilter(nodeId);
    } else {
      // Double-click on empty space - clear selection, item details, and subtree filter
      clearItemDetails();
      clearSubtreeFilter();
    }
  });

  network.on("selectNode", function(params) {
    // Reset previously selected nodes to normal appearance
    previouslySelected.forEach(nodeId => {
      const currentNode = nodes.get(nodeId);
      if (currentNode) {
        nodes.update({ 
          id: nodeId, 
          font: { size: 14, bold: 'bold' },
          borderWidth: currentNode.shape === 'box' ? 2 : 3, // Reset to original border width
          shadow: false // Remove selection outline
        });
      }
    });

    // Reset previously highlighted edges to normal appearance
    previouslyHighlightedEdges.forEach(edgeId => {
      const currentEdge = edges.get(edgeId);
      if (currentEdge) {
        // Determine original color based on edge direction
        const isInputEdge = currentEdge.color && currentEdge.color.color === "#66d9ef";
        const originalColor = isInputEdge ? "#66d9ef" : "#f92672";
        edges.update({
          id: edgeId,
          color: { 
            color: originalColor, 
            highlight: isInputEdge ? "#87ceeb" : "#ff69b4", 
            hover: isInputEdge ? "#87ceeb" : "#ff69b4" 
          },
          width: currentEdge.width || 2
        });
      }
    });

    // Apply selection styling to currently selected nodes
    params.nodes.forEach(nodeId => {
      const currentNode = nodes.get(nodeId);
      if (currentNode) {
        nodes.update({ 
          id: nodeId, 
          font: { size: 20, bold: 'bold' },
          borderWidth: 5, // Thicker border for selection outline
          shadow: {
            enabled: true,
            color: '#fd971f', // Orange outline for selection
            size: 8,
            x: 0,
            y: 0
          }
        });
      }
    });

    // Find and highlight incoming edges (edges that point TO the selected nodes)
    const incomingEdges = [];
    params.nodes.forEach(selectedNodeId => {
      edges.get().forEach(edge => {
        if (edge.to === selectedNodeId) {
          incomingEdges.push(edge.id);
        }
      });
    });

    // Highlight the incoming edges
    incomingEdges.forEach(edgeId => {
      const currentEdge = edges.get(edgeId);
      if (currentEdge) {
        edges.update({
          id: edgeId,
          color: { 
            color: '#fd971f', // Orange highlight for incoming edges
            highlight: '#ffb347', 
            hover: '#ffb347' 
          },
          width: Math.max(currentEdge.width || 2, 3) // Make highlighted edges slightly thicker
        });
      }
    });

    // Update tracking
    previouslySelected = [...params.nodes];
    previouslyHighlightedEdges = [...incomingEdges];
    showItemDetails(params.nodes[0]);
  });

  network.on("deselectNode", function(params) {
    // Reset only the previously selected nodes to normal appearance
    previouslySelected.forEach(nodeId => {
      const currentNode = nodes.get(nodeId);
      if (currentNode) {
        nodes.update({ 
          id: nodeId, 
          font: { size: 14, bold: 'bold' },
          borderWidth: currentNode.shape === 'box' ? 2 : 3, // Reset to original border width
          shadow: false // Remove selection outline
        });
      }
    });

    // Reset previously highlighted edges to normal appearance
    previouslyHighlightedEdges.forEach(edgeId => {
      const currentEdge = edges.get(edgeId);
      if (currentEdge) {
        // Determine original color based on edge direction
        const isInputEdge = currentEdge.color && currentEdge.color.color === "#66d9ef";
        const originalColor = isInputEdge ? "#66d9ef" : "#f92672";
        edges.update({
          id: edgeId,
          color: { 
            color: originalColor, 
            highlight: isInputEdge ? "#87ceeb" : "#ff69b4", 
            hover: isInputEdge ? "#87ceeb" : "#ff69b4" 
          },
          width: currentEdge.width || 2
        });
      }
    });

    // Clear tracking
    previouslySelected = [];
    previouslyHighlightedEdges = [];
    document.getElementById("item-details").classList.remove("active");
  });

  // Initialize filters after graph is built
  initializeFilters();
  
  // Ensure the network is properly centered after initial load
  // This provides a fallback if stabilization events don't fire
  setTimeout(() => {
    if (network && typeof network.fit === 'function') {
      network.fit({
        animation: {
          duration: 800,
          easingFunction: 'easeInOutQuad'
        }
      });
    }
  }, 500);
  
  // Add window resize handler to keep network properly sized and centered
  window.addEventListener('resize', () => {
    if (network && typeof network.redraw === 'function') {
      network.redraw();
      // Small delay to ensure redraw is complete before fitting
      setTimeout(() => {
        if (network && typeof network.fit === 'function') {
          network.fit();
        }
      }, 100);
    }
  });
}

// Initialize filters after graph is built
function initializeFilters() {
  // Apply initial filter state (all checked by default)
  applyProfessionFilters();
}

// --- Craft queue and resource calculation for new data structure ---
// Queue and selected crafts are now managed by the store

// Helper: name to item id
function getItemIdByName(name) {
  const items = store.getState().items;
  const item = Object.values(items).find(i => i.name === name);
  return item ? item.id : null;
}

// Helper: item id to item
function getItemById(id) {
  const items = store.getState().items;
  return items[id] || null;
}

// Helper: get all crafts that output a given item id
function getCraftsByOutputId(itemId) {
  const crafts = store.getState().crafts;
  const itemName = getItemById(itemId)?.name;
  if (!itemName) return [];
  return Object.values(crafts).filter(craft => (craft.outputs || []).some(out => out.item === itemId));
}

// Set of items that are always treated as base crafting items (do not progress past these)
const BASE_CRAFT_ITEMS = new Set([
  'item:grain:embergrain',
  'item:starbulb:basic', 
  'item:wispweave:filament-rough'
]);

// Helper: get output quantity for a craft and item ID (returns lowest value if range, as integer)
function getOutputQty(craft, itemId) {
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

// Recursively trace the path to obtain an item (choose first craft by default, or selected)
function tracePath(itemId, qty = 1, depth = 0, surplus = {}, visited = new Set()) {
  const item = getItemById(itemId);
  if (!item) return [];
  // Prevent infinite recursion by tracking visited itemIds
  const visitKey = `${itemId}`;
  if (visited.has(visitKey)) {
    // Circular dependency detected, stop recursion
    return [{ depth, id: itemId, name: item.name, qty, circular: true }];
  }
  visited.add(visitKey);
  // If this is a flagged base crafting item, treat as base
  if (BASE_CRAFT_ITEMS.has(itemId)) {
    visited.delete(visitKey);
    return [{ depth, id: itemId, name: item.name, qty }];
  }
  const craftsForItem = getCraftsByOutputId(itemId);
  if (craftsForItem.length === 0) {
    visited.delete(visitKey);
    // Base resource
    return [{ depth, id: itemId, name: item.name, qty }];
  }
  // Use selected craft or default to first
  let craftIdx = store.getState().getSelectedCraft(itemId);
  if (craftIdx >= craftsForItem.length) craftIdx = 0;
  const craft = craftsForItem[craftIdx];
  // Use surplus if available
  let needed = qty;
  let available = surplus[itemId] || 0;
  if (available >= needed) {
    surplus[itemId] -= needed;
    visited.delete(visitKey);
    return [];
  } else if (available > 0) {
    needed -= available;
    surplus[itemId] = 0;
  }
  // Calculate crafts needed and new surplus
  const outputQty = getOutputQty(craft, itemId);
  // If outputQty is 0, treat as base resource
  if (outputQty === 0) {
    visited.delete(visitKey);
    return [{ depth, id: itemId, name: item.name, qty: needed }];
  }
  const craftsNeeded = Math.ceil(needed / outputQty);
  const totalProduced = craftsNeeded * outputQty;
  const newSurplus = { ...surplus };
  newSurplus[itemId] = (newSurplus[itemId] || 0) + (totalProduced - needed);
  let paths = [{ depth, id: itemId, name: item.name, qty: needed, craft, craftIdx, craftsForItem, craftsNeeded, totalProduced, used: needed }];
  (craft.materials || []).forEach(input => {
    const inputId = input.item; // Now using item ID directly
    if (inputId) {
      const inputQty = craftsNeeded * input.qty;
      paths = paths.concat(tracePath(inputId, inputQty, depth + 1, newSurplus, visited));
    }
  });
  visited.delete(visitKey);
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
  // Get queue from store
  const queue = store.getState().queue;
  
  if (queue.length === 0) {
    queueDiv.innerHTML = '<div style="max-width:600px;margin:20px auto 0 auto;background:#272822;color:#f8f8f2;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);padding:20px 28px;min-height:120px;"><h3 style="color:#f92672;margin-top:0;">Craft Queue</h3><p>No items queued.</p></div>';
    const resDiv = document.getElementById("resource-summary");
    if (resDiv) resDiv.innerHTML = '';
    const pathDiv = document.getElementById("craft-paths");
    if (pathDiv) pathDiv.innerHTML = '';
    return;
  }
  
  // Count each unique item in the queue
  const queueCount = {};
  queue.forEach(queueItem => {
    const id = queueItem.itemId;
    queueCount[id] = (queueCount[id] || 0) + queueItem.qty;
  });
  
  queueDiv.innerHTML = '<div style="max-width:600px;margin:20px auto 0 auto;background:#272822;color:#f8f8f2;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);padding:20px 28px;min-height:120px;">' +
    '<h3 style="color:#f92672;margin-top:0;">Craft Queue</h3>' +
    '<ul style="list-style:none;padding:0;margin:8px 0;">' + Object.entries(queueCount).map(([id, qty]) => 
      `<li style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #444;">
        <span style="color:#f8f8f2;">${getItemById(id).name} x${qty}</span>
        <button class="remove-item-btn" data-itemid="${id}" 
          style="background:#f92672;color:#272822;border:none;border-radius:3px;padding:4px 8px;cursor:pointer;font-size:0.8em;font-weight:bold;transition:background 0.2s;"
          onmouseover="this.style.background='#ff6b9d'" 
          onmouseout="this.style.background='#f92672'">✕</button>
      </li>`
    ).join('') + '</ul>' +
    '<button id="clear-queue" style="background:#272822;color:#fd971f;border:1.5px solid #fd971f;border-radius:3px;padding:6px 16px;cursor:pointer;margin-top:8px;font-weight:bold;transition:all 0.2s;" onmouseover="this.style.background=\'#fd971f\'; this.style.color=\'#272822\'" onmouseout="this.style.background=\'#272822\'; this.style.color=\'#fd971f\'">Clear All</button>' +
    '</div>';
  document.getElementById("clear-queue").onclick = () => {
    store.getState().clearQueue();
    updateCraftQueueUI();
  };
  
  // Add event listeners for individual item remove buttons
  document.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation(); // Prevent any parent click handlers
      const itemId = e.target.getAttribute('data-itemid');
      store.getState().removeFromQueue(itemId);
      updateCraftQueueUI();
    };
  });
  // Calculate and show resources - convert queue format to array of item IDs
  const itemIds = [];
  Object.entries(queueCount).forEach(([id, qty]) => {
    for (let i = 0; i < qty; i++) {
      itemIds.push(id);
    }
  });
  const resources = calculateResources(itemIds);
  const resDiv = document.getElementById("resource-summary");
  if (resDiv) {
    // Only show true base resources (not craftable, or in BASE_CRAFT_ITEMS)
    const baseResourceEntries = Object.entries(resources).filter(([id, qty]) => {
      const item = getItemById(id);
      if (!item) return false;
      if (BASE_CRAFT_ITEMS.has(id)) return true;
      // Not craftable if no crafts output this item
      return getCraftsByOutputId(id).length === 0;
    });
    resDiv.innerHTML =
      '<div style="max-width:600px;margin:20px auto 0 auto;background:#272822;color:#f8f8f2;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);padding:20px 28px;min-height:120px;">' +
      '<h3 style="color:#f92672;margin-top:0;">Required Base Resources</h3>' +
      '<ul>' + baseResourceEntries.map(([id, qty]) => `<li>${getItemById(id).name}: ${qty}</li>`).join('') + '</ul>' +
      '</div>';
  }

  // Show crafting paths for combined quantities
  let pathsHtml = '<div style="max-width:600px;margin:20px auto 0 auto;background:#272822;color:#f8f8f2;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);padding:20px 28px;min-height:120px;"><h3 style="color:#f92672;margin-top:0;">Crafting Paths</h3>';
  Object.entries(queueCount).forEach(([id, qty]) => {
    const path = tracePath(id, qty);
    pathsHtml += `<div><strong><a href="#" class="tree-item-link" data-itemid="${id}">${getItemById(id).name}</a> x${qty}</strong><ul style="margin-left:1em;">`;
    path.forEach((step, idx) => {
      const itemLink = `<a href=\"#\" class=\"tree-item-link\" data-itemid=\"${step.id}\">${step.name}</a>`;
      if (step.craft) {
        let recipeInputs = (step.craft.materials || []).map(inp => `${inp.qty} ${getItemById(inp.item)?.name || inp.item}`).join(' + ');
        // If multiple crafts, show a select dropdown
        if (step.craftsForItem && step.craftsForItem.length > 1) {
          const selectId = `craft-select-${step.id}-${step.depth}-${idx}`;
          pathsHtml += `<li style="margin-left:${step.depth * 1.5}em;">
            <span>CRAFT ${itemLink} ← ${recipeInputs} (yields ${getOutputQty(step.craft, step.id)})</span>
            <select id="${selectId}" data-itemid="${step.id}" data-depth="${step.depth}"
              style="background:#272822;color:#f8f8f2;border:1.5px solid #a6e22e;border-radius:4px;padding:6px 12px;font-size:1em;margin-left:10px;box-shadow:0 2px 8px rgba(0,0,0,0.18);font-family:monospace;">
              ${step.craftsForItem.map((c, i) => {
                let inputs = (c.materials || []).map(inp => `${inp.qty} ${getItemById(inp.item)?.name || inp.item}`).join(' + ');
                return `<option value="${i}" ${i === step.craftIdx ? 'selected' : ''}>CRAFT ← ${inputs} (yields ${getOutputQty(c, step.id)})</option>`;
              }).join('')}
            </select>
          </li>`;
        } else {
          pathsHtml += `<li style="margin-left:${step.depth * 1.5}em;">CRAFT ${itemLink} ← ${recipeInputs} (yields ${getOutputQty(step.craft, step.id)})</li>`;
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
    const path = tracePath(id, qty);
    path.forEach((step, idx) => {
      if (step.craftsForItem && step.craftsForItem.length > 1) {
        const selectId = `craft-select-${step.id}-${step.depth}-${idx}`;
        const select = document.getElementById(selectId);
        if (select) {
          select.onchange = (e) => {
            store.getState().setSelectedCraft(step.id, Number(e.target.value));
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
      // IDs are now strings with entity type prefixes (e.g., item:material:wood, craft:carpenter:plank)
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
    const itemId = id;
    const item = getItemById(itemId);
    if (BASE_CRAFT_ITEMS.has(itemId)) {
      baseNeeds[itemId] = (baseNeeds[itemId] || 0) + qty;
      return;
    }
    const craftsForItem = getCraftsByOutputId(itemId);
    if (craftsForItem.length === 0) {
      baseNeeds[itemId] = (baseNeeds[itemId] || 0) + qty;
      return;
    }
    let craftIdx = store.getState().selectedCrafts[itemId] || 0;
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
      outputQtys[itemId] = getOutputQty(craft, itemId);
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
    (craft.materials || []).forEach(input => {
      const inputId = input.item; // Now using item ID directly
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
  function processInput(itemId, qty, visited = new Set()) {
    // Prevent infinite recursion by tracking visited itemIds
    const visitKey = `${itemId}`;
    if (visited.has(visitKey)) {
      // Circular dependency detected, stop recursion
      return;
    }
    visited.add(visitKey);
    const item = getItemById(itemId);
    if (BASE_CRAFT_ITEMS.has(itemId)) {
      resourceCount[itemId] = (resourceCount[itemId] || 0) + qty;
      visited.delete(visitKey);
      return;
    }
    const craftsForItem = getCraftsByOutputId(itemId);
    if (craftsForItem.length === 0) {
      resourceCount[itemId] = (resourceCount[itemId] || 0) + qty;
      visited.delete(visitKey);
      return;
    }
    let craftIdx = store.getState().selectedCrafts[itemId] || 0;
    if (craftIdx >= craftsForItem.length) craftIdx = 0;
    const craft = craftsForItem[craftIdx];
    // Check surplus
    let avail = surplus[itemId] || 0;
    let needed = qty;
    if (avail >= needed) {
      surplus[itemId] -= needed;
      visited.delete(visitKey);
      return;
    } else if (avail > 0) {
      needed -= avail;
      surplus[itemId] = 0;
    }
    const outQty = getOutputQty(craft, itemId);
    if (outQty === 0) {
      resourceCount[itemId] = (resourceCount[itemId] || 0) + needed;
      visited.delete(visitKey);
      return;
    }
    const craftsNeeded = Math.ceil(needed / outQty);
    const produced = craftsNeeded * outQty;
    if (produced > needed) {
      surplus[itemId] = (surplus[itemId] || 0) + (produced - needed);
    }
    resourceCount[itemId] = (resourceCount[itemId] || 0) + needed;
    (craft.materials || []).forEach(input => {
      const inputId = input.item; // Now using item ID directly
      if (inputId) {
        const inputQty = craftsNeeded * input.qty;
        processInput(inputId, inputQty, visited);
      }
    });
    visited.delete(visitKey);
  }

  return resourceCount;
}

// Clear item details function
function clearItemDetails() {
  const detailsDiv = document.getElementById("item-details");
  detailsDiv.innerHTML = '';
  detailsDiv.classList.remove("active");
  
  // Clear any selected nodes in the network
  if (typeof window.network !== 'undefined' && window.network && typeof window.network.unselectAll === 'function') {
    window.network.unselectAll();
  }
}

// Add clear button to item details
function addClearButton(container) {
  // Clear button functionality removed - now use double-click on empty space to clear
}

// Add a "Queue Craft" button to item details
function showItemDetails(id) {
  // Parse entity type from ID format: [entity-type]:[category/namespace]:[identifier]
  const detailsDiv = document.getElementById("item-details");
  const entityType = id.split(':')[0];
  
  // Check if it's a craft node
  if (entityType === 'craft') {
    // Craft node
    const craftsObj = store.getState().crafts;
    const craft = Object.values(craftsObj).find(c => c.id === id);
    if (craft) {
      // Get requirement details
      const requirements = store.getState().requirements;
      const professions = store.getState().professions;
      const tools = store.getState().tools;
      const buildings = store.getState().buildings;
      
      let professionInfo = 'Unknown';
      let toolInfo = 'Unknown';
      let buildingInfo = 'Unknown';
      
      if (craft.requirement) {
        const req = Object.values(requirements).find(r => r.id === craft.requirement);
        if (req) {
          // Get profession info
          if (req.profession && req.profession.name) {
            const prof = Object.values(professions).find(p => p.id === req.profession.name);
            if (prof) {
              professionInfo = `${prof.name} (Level ${req.profession.level})`;
            }
          }
          // Get tool info
          if (req.tool && req.tool.name) {
            const tool = Object.values(tools).find(t => t.id === req.tool.name);
            if (tool) {
              toolInfo = `${tool.name} (Level ${req.tool.level})`;
            }
          }
          // Get building info
          if (req.building && req.building.name) {
            const building = Object.values(buildings).find(b => b.id === req.building.name);
            if (building) {
              buildingInfo = `${building.name} (Level ${req.building.level})`;
            }
          }
        }
      }
      
      detailsDiv.innerHTML = `
        <div style="max-width:600px;margin:20px auto 0 auto;background:#272822;color:#f8f8f2;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);padding:20px 28px;min-height:120px;">
          <h2 style="color:#f92672;margin-top:0;">${craft.name}</h2>
          <p><strong style="color:#66d9ef;">Profession:</strong> <span style="color:#f8f8f2;">${professionInfo}</span></p>
          <p><strong style="color:#a6e22e;">Tool:</strong> <span style="color:#f8f8f2;">${toolInfo}</span></p>
          <p><strong style="color:#fd971f;">Building:</strong> <span style="color:#f8f8f2;">${buildingInfo}</span></p>
          <div style="margin-top:32px;text-align:right;">
            <button id="goto-node" style="background:#272822;color:#f92672;border:1.5px solid #f92672;border-radius:3px;padding:6px 16px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='#f92672'; this.style.color='#272822'" onmouseout="this.style.background='#272822'; this.style.color='#f92672'">Go to Node</button>
          </div>
        </div>
      `;
      detailsDiv.classList.add("active");
      document.getElementById("goto-node").onclick = () => {
        if (typeof window.network !== 'undefined' && window.network && typeof window.network.selectNodes === 'function') {
          window.network.selectNodes([id]);
          window.network.focus(id, {
            scale: 1.2,
            animation: { duration: 600, easingFunction: 'easeInOutQuad' },
            locked: true
          });
        }
      };
    }
  } else if (entityType === 'item') {
    // Item node
    const item = getItemById(id);
    const craftsObj = store.getState().crafts;
    const crafts = Object.values(craftsObj);
    if (item) {
      // Count how many recipes (crafts) this item is used in as an input
      const usedInCount = crafts.filter(craft => (craft.materials || []).some(mat => mat.item === item.id)).length;
      
      detailsDiv.innerHTML = `
        <div style="max-width:600px;margin:20px auto 0 auto;background:#272822;color:#f8f8f2;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);padding:20px 28px;min-height:120px;">
          <h2 style="color:#a6e22e;margin-top:0;">${item.name}</h2>
          <p><strong style="color:#fd971f;">Tier:</strong> <span style="color:#f8f8f2;">${item.tier}</span> <span style="margin-left:1em;"><strong style="color:#f92672;">Rank:</strong> <span style="color:#f8f8f2;">${item.rank}</span></span></p>
          <p><strong style="color:#e6db74;">Used in Recipes:</strong> <span style="color:#f8f8f2;">${usedInCount}</span></p>
          <div style="margin-top:18px;">
            <button id="queue-craft" style="background:#272822;color:#a6e22e;border:1.5px solid #a6e22e;border-radius:3px;padding:6px 16px;cursor:pointer;margin-right:8px;transition:all 0.2s;" onmouseover="this.style.background='#a6e22e'; this.style.color='#272822'" onmouseout="this.style.background='#272822'; this.style.color='#a6e22e'">Queue 1</button>
            <button id="queue-craft-5" style="background:#272822;color:#66d9ef;border:1.5px solid #66d9ef;border-radius:3px;padding:6px 16px;cursor:pointer;margin-right:8px;transition:all 0.2s;" onmouseover="this.style.background='#66d9ef'; this.style.color='#272822'" onmouseout="this.style.background='#272822'; this.style.color='#66d9ef'">Queue 5</button>
            <button id="queue-craft-10" style="background:#272822;color:#fd971f;border:1.5px solid #fd971f;border-radius:3px;padding:6px 16px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='#fd971f'; this.style.color='#272822'" onmouseout="this.style.background='#272822'; this.style.color='#fd971f'">Queue 10</button>
          </div>
          <div style="margin-top:32px;text-align:right;">
            <button id="goto-node" style="background:#272822;color:#a6e22e;border:1.5px solid #a6e22e;border-radius:3px;padding:6px 16px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='#a6e22e'; this.style.color='#272822'" onmouseout="this.style.background='#272822'; this.style.color='#a6e22e'">Go to Node</button>
          </div>
        </div>
      `;
      detailsDiv.classList.add("active");
      document.getElementById("queue-craft").onclick = () => {
        store.getState().addToQueue(id, 1);
        updateCraftQueueUI();
      };
      document.getElementById("queue-craft-5").onclick = () => {
        store.getState().addToQueue(id, 5);
        updateCraftQueueUI();
      };
      document.getElementById("queue-craft-10").onclick = () => {
        store.getState().addToQueue(id, 10);
        updateCraftQueueUI();
      };
      document.getElementById("goto-node").onclick = () => {
        if (typeof window.network !== 'undefined' && window.network && typeof window.network.selectNodes === 'function') {
          window.network.selectNodes([id]);
          window.network.focus(id, {
            scale: 1.2,
            animation: { duration: 600, easingFunction: 'easeInOutQuad' },
            locked: true
          });
        }
      };
    }
  } else {
    // Unknown entity type or malformed ID
    detailsDiv.innerHTML = `
      <div style="max-width:600px;margin:20px auto 0 auto;background:#272822;color:#f8f8f2;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);padding:20px 28px;min-height:120px;">
        <h2 style="color:#f92672;margin-top:0;">Unknown Entity</h2>
        <p><strong style="color:#e6db74;">ID:</strong> <span style="color:#f8f8f2;">${id}</span></p>
        <p style="color:#fd971f;">Unable to display details for this entity type.</p>
      </div>
    `;
    detailsDiv.classList.add("active");
  }
}

// Efficient profession filtering using Zustand store and fast operations
function applyProfessionFilters() {
  // Get active profession filters from toggle elements
  const checkedProfessions = new Set();
  document.querySelectorAll('.prof-filter-toggle').forEach(toggle => {
    const isActive = toggle.getAttribute('data-active') === 'true';
    if (isActive) {
      checkedProfessions.add(toggle.getAttribute('data-profession'));
    }
  });
  
  // Get graph data from store
  const graphData = store.getState().graphData;
  if (!graphData || !graphData.nodes || !graphData.edges) {
    console.warn('Graph data not available for filtering');
    return;
  }
  
  const { nodes, edges } = graphData;
  const requirements = store.getState().requirements;
  const professions = store.getState().professions;
  const crafts = store.getState().crafts;
  
  // Fast lookup: node ID to profession name
  const nodeToProfession = {};
  
  // Process items: get profession from first craft that outputs this item
  Object.values(store.getState().items).forEach(item => {
    const craftsForItem = Object.values(crafts).filter(craft => 
      (craft.outputs || []).some(out => out.item === item.id)
    );
    
    if (craftsForItem.length > 0) {
      const craft = craftsForItem[0];
      if (craft.requirement) {
        const req = Object.values(requirements).find(r => r.id === craft.requirement);
        if (req && req.profession && req.profession.name) {
          const profObj = Object.values(professions).find(p => p.id === req.profession.name);
          if (profObj) {
            nodeToProfession[item.id] = profObj.name;
          }
        }
      }
    }
  });
  
  // Process crafts: get profession directly
  Object.values(crafts).forEach(craft => {
    if (craft.requirement) {
      const req = Object.values(requirements).find(r => r.id === craft.requirement);
      if (req && req.profession && req.profession.name) {
        const profObj = Object.values(professions).find(p => p.id === req.profession.name);
        if (profObj) {
          nodeToProfession[craft.id] = profObj.name;
        }
      }
    }
  });
  
  // Batch update nodes visibility (fade instead of hide)
  const nodeUpdates = [];
  const fadedNodes = new Set();
  
  nodes.forEach(node => {
    const profession = nodeToProfession[node.id];
    let shouldShow = !profession || checkedProfessions.has(profession);
    
    // If subtree filter is active, also check if node is in visible subtree
    if (subtreeFilterActive) {
      shouldShow = shouldShow && subtreeVisibleNodes.has(node.id);
    }
    
    if (!shouldShow) {
      fadedNodes.add(node.id);
    }
    
    nodeUpdates.push({
      id: node.id,
      opacity: shouldShow ? 1.0 : 0.3,
      font: shouldShow ? undefined : { color: '#666666' }
    });
  });
  
  // Batch update edges visibility (fade edges connected to faded nodes)
  const edgeUpdates = [];
  edges.get().forEach(edge => {
    const shouldFade = fadedNodes.has(edge.from) || fadedNodes.has(edge.to);
    if (!shouldFade) {
      // Restore original edge colors and make fully visible
      const isInputEdge = edge.color && edge.color.color === "#66d9ef";
      const originalColor = isInputEdge ? "#66d9ef" : "#f92672";
      const originalHighlight = isInputEdge ? "#87ceeb" : "#ff69b4";
      edgeUpdates.push({
        id: edge.id,
        opacity: 1.0,
        color: { 
          color: originalColor, 
          highlight: originalHighlight, 
          hover: originalHighlight 
        }
      });
    } else {
      // Fade edges connected to faded nodes
      edgeUpdates.push({
        id: edge.id,
        opacity: 0.2,
        color: { color: '#444444' }
      });
    }
  });
  
  // Apply batch updates for performance
  nodes.update(nodeUpdates);
  edges.update(edgeUpdates);
  
  const filterType = subtreeFilterActive ? 'subtree + profession' : 'profession';
  console.log(`${filterType} filtered: ${fadedNodes.size} nodes faded, ${nodeUpdates.length - fadedNodes.size} nodes visible`);
}

// Subtree filtering functionality
let subtreeFilterActive = false;
let subtreeVisibleNodes = new Set();

function applySubtreeFilter(rootNodeId) {
  // Get graph data from store
  const graphData = store.getState().graphData;
  if (!graphData || !graphData.nodes || !graphData.edges) {
    console.warn('Graph data not available for subtree filtering');
    return;
  }
  
  const { nodes, edges } = graphData;
  
  // Find all nodes that lead INTO the selected node (complete dependency tree)
  const visibleNodes = new Set();
  const toVisit = [rootNodeId];
  
  // Add the root node
  visibleNodes.add(rootNodeId);
  
  // Traverse backwards through the complete dependency chain
  // This includes both direct material inputs and intermediate crafting steps
  while (toVisit.length > 0) {
    const currentNode = toVisit.pop();
    
    // Find all edges where current node is the target (inputs to current node)
    edges.get().forEach(edge => {
      if (edge.to === currentNode && !visibleNodes.has(edge.from)) {
        visibleNodes.add(edge.from);
        toVisit.push(edge.from);
      }
    });
  }
  
  // Store the visible nodes for clearing later
  subtreeVisibleNodes = visibleNodes;
  subtreeFilterActive = true;
  
  // Update node visibility (fade instead of hide)
  const nodeUpdates = [];
  nodes.forEach(node => {
    const shouldShow = visibleNodes.has(node.id);
    nodeUpdates.push({
      id: node.id,
      opacity: shouldShow ? 1.0 : 0.3,
      font: shouldShow ? undefined : { color: '#666666' }
    });
  });
  
  // Update edge visibility - show ALL edges between visible nodes (complete paths)
  const edgeUpdates = [];
  edges.get().forEach(edge => {
    // Show edge if both endpoints are in the visible set
    const shouldShow = visibleNodes.has(edge.from) && visibleNodes.has(edge.to);
    if (shouldShow) {
      // Restore original edge colors and make fully visible
      const isInputEdge = edge.color && edge.color.color === "#66d9ef";
      const originalColor = isInputEdge ? "#66d9ef" : "#f92672";
      const originalHighlight = isInputEdge ? "#87ceeb" : "#ff69b4";
      edgeUpdates.push({
        id: edge.id,
        opacity: 1.0,
        color: { 
          color: originalColor, 
          highlight: originalHighlight, 
          hover: originalHighlight 
        }
      });
    } else {
      // Fade non-visible edges
      edgeUpdates.push({
        id: edge.id,
        opacity: 0.2,
        color: { color: '#444444' }
      });
    }
  });
  
  // Apply batch updates
  nodes.update(nodeUpdates);
  edges.update(edgeUpdates);
  
  // Get the root node name for user feedback
  const rootNodeData = nodes.get(rootNodeId);
  const rootNodeName = rootNodeData ? rootNodeData.label : 'Unknown';
  
  console.log(`Dependency subtree filter applied for "${rootNodeName}": ${visibleNodes.size} nodes visible (showing complete crafting paths)`);
  
  // Focus on the root node that was double-clicked (pan without changing zoom)
  if (window.network) {
    window.network.focus(rootNodeId, {
      animation: { duration: 800, easingFunction: 'easeInOutQuad' }
    });
  }
}

function clearSubtreeFilter() {
  if (!subtreeFilterActive) return;
  
  // Get graph data from store
  const graphData = store.getState().graphData;
  if (!graphData || !graphData.nodes || !graphData.edges) {
    console.warn('Graph data not available for clearing subtree filter');
    return;
  }
  
  const { nodes, edges } = graphData;
  
  // Reset subtree filter state
  subtreeFilterActive = false;
  subtreeVisibleNodes.clear();
  
  // Reapply profession filters (which will show all nodes not filtered by profession)
  applyProfessionFilters();
  
  console.log('Dependency subtree filter cleared - returning to profession filter view');
  
  // Fit the network to show all visible nodes
  if (window.network) {
    window.network.fit({
      animation: { duration: 800, easingFunction: 'easeInOutQuad' }
    });
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

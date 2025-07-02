// BitCrafty Filter Components
// Profession filtering, subtree filtering, and graph visibility logic

import { EDGE_COLORS } from '../lib/common.js';
import { 
  ItemHelpers,
  CraftHelpers,
  ProfessionHelpers, 
  RequirementHelpers,
  GraphHelpers,
  extractProfessionFromId,
  store 
} from '../lib/store-helpers.js';

// Filter state
let subtreeFilterActive = false;
let subtreeVisibleNodes = new Set();

/**
 * Initialize filtering functionality
 */
export function initializeFilters() {
  setupFilterEventListeners();
  
  // Apply initial filter state after a short delay to ensure UI is ready
  setTimeout(() => {
    applyProfessionFilters();
  }, 100);
}

/**
 * Setup event listeners for filter functionality
 */
function setupFilterEventListeners() {
  // Listen for profession filter changes from UI
  window.addEventListener('professionFilterChanged', () => {
    applyProfessionFilters();
  });
  
  // Listen for subtree filter requests
  window.addEventListener('applySubtreeFilter', (event) => {
    if (event.detail && event.detail.nodeId) {
      applySubtreeFilter(event.detail.nodeId);
    }
  });
  
  // Listen for clear subtree filter requests
  window.addEventListener('clearSubtreeFilter', () => {
    clearSubtreeFilter();
  });
}

function getActiveProfessions() {
  const checkedProfessions = new Set();
  document.querySelectorAll('.prof-filter-toggle').forEach(toggle => {
    const isActive = toggle.getAttribute('data-active') === 'true';
    if (isActive) {
      checkedProfessions.add(toggle.getAttribute('data-profession'));
    }
  });
  return checkedProfessions;
}

/**
 * Build mapping from node ID to profession name using new profession-based IDs
 */
function buildNodeToProfessionMap() {
  const nodeToProfession = {};
  const items = ItemHelpers.getAll();
  const crafts = CraftHelpers.getAll();
  
  // Get profession name mapping (lowercase ID → capitalized name)
  const professions = ProfessionHelpers.getAll();
  const professionNameMap = {};
  professions.forEach(prof => {
    const lowercaseName = prof.id.split(':')[1]; // Extract lowercase from "profession:foraging"
    professionNameMap[lowercaseName] = prof.name; // Map "foraging" → "Foraging"
  });
  
  // Process items: extract profession directly from ID and map to capitalized name
  items.forEach(item => {
    const profession = extractProfessionFromId(item.id); // Returns lowercase like "foraging"
    if (profession && professionNameMap[profession]) {
      nodeToProfession[item.id] = professionNameMap[profession]; // Store capitalized like "Foraging"
    }
  });
  
  // Process crafts: extract profession directly from ID and map to capitalized name
  crafts.forEach(craft => {
    const profession = extractProfessionFromId(craft.id); // Returns lowercase like "foraging"
    if (profession && professionNameMap[profession]) {
      nodeToProfession[craft.id] = professionNameMap[profession]; // Store capitalized like "Foraging"
    }
  });
  
  return nodeToProfession;
}

/**
 * Apply profession-based filtering to nodes and edges
 */
export function applyProfessionFilters() {
  const checkedProfessions = getActiveProfessions();
  const graphData = GraphHelpers.getData();
  
  if (!graphData || !graphData.nodes || !graphData.edges) {
    console.warn('Graph data not available for filtering');
    return;
  }
  
  const { nodes, edges } = graphData;
  const nodeToProfession = buildNodeToProfessionMap();
  
  // Batch update nodes visibility (fade instead of hide)
  const nodeUpdates = [];
  const fadedNodes = new Set();
  
  nodes.forEach(node => {
    const profession = nodeToProfession[node.id];
    
    // Check if the profession should be shown (case-insensitive comparison)
    let shouldShow = !profession; // Always show nodes without a profession
    
    if (profession) {
      // Check if the profession is in the checked professions set (case-insensitive)
      shouldShow = Array.from(checkedProfessions).some(
        checkedProf => checkedProf.toLowerCase() === profession.toLowerCase()
      );
    }
    
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
      const isInputEdge = edge.color && edge.color.color === EDGE_COLORS.INPUT;
      const originalColor = isInputEdge ? EDGE_COLORS.INPUT : EDGE_COLORS.OUTPUT;
      const originalHighlight = isInputEdge ? EDGE_COLORS.INPUT_HIGHLIGHT : EDGE_COLORS.OUTPUT_HIGHLIGHT;
      
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

/**
 * Apply subtree filter to show only nodes leading to the selected node
 */
export function applySubtreeFilter(rootNodeId) {
  const graphData = GraphHelpers.getData();
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
  
  // Store the visible nodes and activate subtree filter
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
      const isInputEdge = edge.color && edge.color.color === EDGE_COLORS.INPUT;
      const originalColor = isInputEdge ? EDGE_COLORS.INPUT : EDGE_COLORS.OUTPUT;
      const originalHighlight = isInputEdge ? EDGE_COLORS.INPUT_HIGHLIGHT : EDGE_COLORS.OUTPUT_HIGHLIGHT;
      
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
  
  // Focus on the root node that was double-clicked
  if (window.network) {
    window.network.focus(rootNodeId, {
      animation: { duration: 800, easingFunction: 'easeInOutQuad' }
    });
  }
}

/**
 * Clear subtree filter and return to profession filtering
 */
export function clearSubtreeFilter() {
  if (!subtreeFilterActive) return;
  
  const graphData = GraphHelpers.getData();
  if (!graphData || !graphData.nodes || !graphData.edges) {
    console.warn('Graph data not available for clearing subtree filter');
    return;
  }
  
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

/**
 * Check if subtree filter is currently active
 */
export function isSubtreeFilterActive() {
  return subtreeFilterActive;
}

/**
 * Get the set of visible nodes in subtree filter
 */
export function getSubtreeVisibleNodes() {
  return new Set(subtreeVisibleNodes);
}

/**
 * Reset all filters to default state
 */
export function resetAllFilters() {
  // Clear subtree filter if active
  if (subtreeFilterActive) {
    clearSubtreeFilter();
  }
  
  // Reset all profession toggles to active
  document.querySelectorAll('.prof-filter-toggle').forEach(toggle => {
    toggle.setAttribute('data-active', 'true');
    
    // Update visual appearance to active state
    const colorBox = toggle.querySelector('span:first-child');
    const textSpan = toggle.querySelector('span:last-child');
    
    toggle.style.opacity = '1';
    toggle.style.filter = 'none';
    if (colorBox) colorBox.style.opacity = '1';
    if (textSpan) textSpan.style.color = '#f8f8f2';
  });
  
  // Reapply filters
  applyProfessionFilters();
  
  console.log('All filters reset to default state');
}

/**
 * Get current filter state for debugging/persistence
 */
export function getFilterState() {
  const activeProfessions = Array.from(getActiveProfessions());
  return {
    activeProfessions,
    subtreeFilterActive,
    subtreeVisibleNodesCount: subtreeVisibleNodes.size
  };
}

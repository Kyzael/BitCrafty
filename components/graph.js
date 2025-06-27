// BitCrafty Graph Components
// Network visualization, node creation, edge setup, and graph events

import { COLORS, EDGE_COLORS } from '../lib/common.js';
import { 
  ItemHelpers, 
  CraftHelpers,
  ProfessionHelpers, 
  RequirementHelpers,
  GraphHelpers,
  store 
} from '../lib/store-helpers.js';
import { applySubtreeFilter, clearSubtreeFilter } from './filters.js';

// Graph state
let previouslySelected = [];
let previouslyHighlightedEdges = [];

/**
 * Initialize the graph with vis.js network
 */
export function initializeGraph() {
  buildGraph();
  setupGraphEventHandlers();
  setupWindowHandlers();
}

/**
 * Build the complete network graph from items and crafts data
 */
function buildGraph() {
  const items = ItemHelpers.getAll();
  const crafts = CraftHelpers.getAll();
  
  // Create nodes for items and crafts
  const nodeList = [];
  
  // Item nodes: fill with profession color, dark text for readability
  items.forEach(item => {
    const craftsForItem = CraftHelpers.getByOutputId(item.id);
    let profession = null;
    
    if (craftsForItem.length > 0) {
      const craft = craftsForItem[0];
      if (craft.requirement) {
        const profInfo = RequirementHelpers.getProfessionInfo(craft.requirement);
        if (profInfo) profession = profInfo.name;
      }
    }
    
    const profColorMap = ProfessionHelpers.getColorMap();
    const color = profession && profColorMap[profession] ? profColorMap[profession] : COLORS.ACCENT_GREEN;
    
    nodeList.push({
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
        color: COLORS.NODE_TEXT,
        size: 14,
        face: 'monospace',
        bold: 'bold',
        strokeWidth: 0
      },
      borderWidth: 2,
      shadow: false,
      shapeProperties: { borderRadius: 16 }
    });
  });

  // Craft nodes: fill with profession color, dark text for readability
  crafts.forEach(craft => {
    let profession = null;
    if (craft.requirement) {
      const profInfo = RequirementHelpers.getProfessionInfo(craft.requirement);
      if (profInfo) profession = profInfo.name;
    }
    
    const profColorMap = ProfessionHelpers.getColorMap();
    const color = profession && profColorMap[profession] ? profColorMap[profession] : COLORS.ACCENT_PINK;
    
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
        color: COLORS.NODE_TEXT,
        size: 14,
        face: 'monospace',
        bold: 'bold',
        strokeWidth: 0
      },
      borderWidth: 3,
      shadow: false,
      shapeProperties: { borderRadius: 32 }
    });
  });

  // Create edges for material inputs and craft outputs
  const edgeList = [];
  
  crafts.forEach(craft => {
    // Material inputs: item -> craft
    (craft.materials || []).forEach(mat => {
      if (ItemHelpers.getById(mat.item)) {
        const lineWidth = Math.min(Math.max(Math.log2(mat.qty + 1) + 1, 1), 8);
        edgeList.push({
          from: mat.item,
          to: craft.id,
          label: `${mat.qty}`,
          arrows: "to",
          color: { 
            color: EDGE_COLORS.INPUT, 
            highlight: EDGE_COLORS.INPUT_HIGHLIGHT, 
            hover: EDGE_COLORS.INPUT_HIGHLIGHT 
          },
          width: lineWidth,
          font: { 
            color: EDGE_COLORS.INPUT, 
            size: 16, 
            strokeWidth: 2, 
            strokeColor: COLORS.BACKGROUND 
          }
        });
      }
    });
    
    // Craft outputs: craft -> item
    (craft.outputs || []).forEach(out => {
      if (ItemHelpers.getById(out.item)) {
        let qty = 1;
        if (typeof out.qty === 'number') {
          qty = out.qty;
        } else if (typeof out.qty === 'string') {
          const match = out.qty.match(/^(\d+)(-(\d+))?$/);
          if (match) {
            qty = parseInt(match[1], 10);
          }
        }
        
        const lineWidth = Math.min(Math.max(Math.log2(qty + 1) + 1, 1), 8);
        edgeList.push({
          from: craft.id,
          to: out.item,
          label: `${out.qty}`,
          arrows: "to",
          color: { 
            color: EDGE_COLORS.OUTPUT, 
            highlight: EDGE_COLORS.OUTPUT_HIGHLIGHT, 
            hover: EDGE_COLORS.OUTPUT_HIGHLIGHT 
          },
          width: lineWidth,
          font: { 
            color: EDGE_COLORS.OUTPUT, 
            size: 16, 
            strokeWidth: 2, 
            strokeColor: COLORS.BACKGROUND 
          }
        });
      }
    });
  });

  // Create vis.js DataSets
  const nodes = new vis.DataSet(nodeList);
  const edges = new vis.DataSet(edgeList);
  
  // Store in Zustand for access elsewhere
  GraphHelpers.setData({ nodes, edges });
  
  // Create the network
  const container = document.getElementById("network");
  const data = { nodes, edges };
  const options = getNetworkOptions();
  
  window.network = new vis.Network(container, data, options);
  const network = window.network;

  // Setup stabilization handler
  network.on('stabilizationIterationsDone', function() {
    initializeFilters();
    network.fit({
      animation: {
        duration: 1000,
        easingFunction: 'easeInOutQuad'
      }
    });
  });

  // Ensure network is properly centered as fallback
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
}

/**
 * Get vis.js network configuration options
 */
function getNetworkOptions() {
  return {
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
        color: COLORS.ACCENT_YELLOW, 
        strokeWidth: 2, 
        strokeColor: COLORS.BACKGROUND,
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
      font: { 
        size: 16, 
        face: 'monospace', 
        bold: 'bold', 
        color: COLORS.NODE_TEXT, 
        strokeWidth: 0 
      },
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
}

/**
 * Setup all graph event handlers
 */
function setupGraphEventHandlers() {
  const network = window.network;
  if (!network) return;

  // Double-click handler for subtree filtering
  network.on("doubleClick", function(params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      applySubtreeFilter(nodeId);
    } else {
      // Double-click on empty space - clear selection and filters
      window.dispatchEvent(new CustomEvent('clearItemDetails'));
      clearSubtreeFilter();
    }
  });

  // Node selection handler
  network.on("selectNode", function(params) {
    handleNodeSelection(params);
  });

  // Node deselection handler
  network.on("deselectNode", function(params) {
    handleNodeDeselection(params);
  });
}

/**
 * Handle node selection events
 */
function handleNodeSelection(params) {
  const graphData = GraphHelpers.getData();
  if (!graphData) return;
  
  const { nodes, edges } = graphData;

  // Reset previously selected nodes to normal appearance
  previouslySelected.forEach(nodeId => {
    const currentNode = nodes.get(nodeId);
    if (currentNode) {
      nodes.update({ 
        id: nodeId, 
        font: { size: 14, bold: 'bold' },
        borderWidth: currentNode.shape === 'box' ? 2 : 3,
        shadow: false
      });
    }
  });

  // Reset previously highlighted edges
  previouslyHighlightedEdges.forEach(edgeId => {
    const currentEdge = edges.get(edgeId);
    if (currentEdge) {
      const isInputEdge = currentEdge.color && currentEdge.color.color === EDGE_COLORS.INPUT;
      const originalColor = isInputEdge ? EDGE_COLORS.INPUT : EDGE_COLORS.OUTPUT;
      const originalHighlight = isInputEdge ? EDGE_COLORS.INPUT_HIGHLIGHT : EDGE_COLORS.OUTPUT_HIGHLIGHT;
      
      edges.update({
        id: edgeId,
        color: { 
          color: originalColor, 
          highlight: originalHighlight, 
          hover: originalHighlight 
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
        borderWidth: 5,
        shadow: {
          enabled: true,
          color: COLORS.ACCENT_ORANGE,
          size: 8,
          x: 0,
          y: 0
        }
      });
    }
  });

  // Find and highlight incoming edges
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
          color: COLORS.ACCENT_ORANGE,
          highlight: COLORS.ACCENT_ORANGE_HIGHLIGHT, 
          hover: COLORS.ACCENT_ORANGE_HIGHLIGHT 
        },
        width: Math.max(currentEdge.width || 2, 3)
      });
    }
  });

  // Update tracking
  previouslySelected = [...params.nodes];
  previouslyHighlightedEdges = [...incomingEdges];
  
  // Trigger item details display
  window.dispatchEvent(new CustomEvent('showItemDetails', { 
    detail: { id: params.nodes[0] } 
  }));
}

/**
 * Handle node deselection events
 */
function handleNodeDeselection(params) {
  const graphData = GraphHelpers.getData();
  if (!graphData) return;
  
  const { nodes, edges } = graphData;

  // Reset previously selected nodes to normal appearance
  previouslySelected.forEach(nodeId => {
    const currentNode = nodes.get(nodeId);
    if (currentNode) {
      nodes.update({ 
        id: nodeId, 
        font: { size: 14, bold: 'bold' },
        borderWidth: currentNode.shape === 'box' ? 2 : 3,
        shadow: false
      });
    }
  });

  // Reset previously highlighted edges
  previouslyHighlightedEdges.forEach(edgeId => {
    const currentEdge = edges.get(edgeId);
    if (currentEdge) {
      const isInputEdge = currentEdge.color && currentEdge.color.color === EDGE_COLORS.INPUT;
      const originalColor = isInputEdge ? EDGE_COLORS.INPUT : EDGE_COLORS.OUTPUT;
      const originalHighlight = isInputEdge ? EDGE_COLORS.INPUT_HIGHLIGHT : EDGE_COLORS.OUTPUT_HIGHLIGHT;
      
      edges.update({
        id: edgeId,
        color: { 
          color: originalColor, 
          highlight: originalHighlight, 
          hover: originalHighlight 
        },
        width: currentEdge.width || 2
      });
    }
  });

  // Clear tracking
  previouslySelected = [];
  previouslyHighlightedEdges = [];
  
  // Clear item details
  const detailsDiv = document.getElementById("item-details");
  if (detailsDiv) {
    detailsDiv.classList.remove("active");
  }
}

/**
 * Setup window-level handlers for graph
 */
function setupWindowHandlers() {
  // Window resize handler to keep network properly sized
  window.addEventListener('resize', () => {
    const network = window.network;
    if (network && typeof network.redraw === 'function') {
      network.redraw();
      setTimeout(() => {
        if (network && typeof network.fit === 'function') {
          network.fit();
        }
      }, 100);
    }
  });
}

/**
 * Clear all node selections
 */
export function clearSelection() {
  if (window.network && typeof window.network.unselectAll === 'function') {
    window.network.unselectAll();
  }
}

/**
 * Focus on a specific node in the graph
 */
export function focusNode(nodeId, options = {}) {
  if (!window.network) return;
  
  const { scale = 1.0, animation = true } = options;
  
  try {
    // Select the node
    window.network.selectNodes([nodeId]);
    
    // Focus on the node
    const focusOptions = {
      scale: scale,
      locked: false
    };
    
    if (animation) {
      focusOptions.animation = {
        duration: 800,
        easingFunction: 'easeInOutQuad'
      };
    }
    
    window.network.focus(nodeId, focusOptions);
    
    // Trigger node selection events
    const node = window.network.getPositions([nodeId])[nodeId];
    if (node) {
      // Trigger the same selection logic as clicking
      onNodeSelect({ nodes: [nodeId], edges: [] });
    }
  } catch (error) {
    console.warn('Failed to focus on node:', nodeId, error);
  }
}

// BitCrafty Crafting Components
// Queue management, resource calculation, and crafting path logic

import { BASE_CRAFT_ITEMS, COLORS, DOM, MATH } from '../lib/common.js';
import { 
  ItemHelpers, 
  CraftHelpers,
  QueueHelpers,
  SelectedCraftHelpers,
  store 
} from '../lib/store-helpers.js';
import { focusNode } from './graph.js';

/**
 * Initialize crafting functionality
 */
export function initializeCrafting() {
  setupCraftingEventListeners();
}

/**
 * Setup event listeners for crafting functionality
 */
function setupCraftingEventListeners() {
  // Listen for queue update requests
  window.addEventListener('updateCraftQueue', () => {
    updateCraftQueueUI();
  });
}

/**
 * Get output quantity for a craft and item ID (returns lowest value if range, as integer)
 */
function getOutputQty(craft, itemId) {
  const out = (craft.outputs || []).find(o => o.item === itemId);
  if (!out) return 1;
  
  if (typeof out.qty === 'number') return out.qty;
  if (typeof out.qty === 'string') {
    return MATH.parseQuantity(out.qty, true); // Use minimum of range
  }
  return 1;
}

/**
 * Recursively trace the path to obtain an item (choose first craft by default, or selected)
 */
export function tracePath(itemId, qty = 1, depth = 0, surplus = {}, visited = new Set()) {
  const item = ItemHelpers.getById(itemId);
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
  
  const craftsForItem = CraftHelpers.getByOutputId(itemId);
  if (craftsForItem.length === 0) {
    visited.delete(visitKey);
    // Base resource
    return [{ depth, id: itemId, name: item.name, qty }];
  }
  
  // Use selected craft or default to first
  let craftIdx = SelectedCraftHelpers.get(itemId);
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
  
  let paths = [{ 
    depth, 
    id: itemId, 
    name: item.name, 
    qty: needed, 
    craft, 
    craftIdx, 
    craftsForItem, 
    craftsNeeded, 
    totalProduced, 
    used: needed 
  }];
  
  (craft.materials || []).forEach(input => {
    const inputId = input.item;
    if (inputId) {
      const inputQty = craftsNeeded * input.qty;
      paths = paths.concat(tracePath(inputId, inputQty, depth + 1, newSurplus, visited));
    }
  });
  
  visited.delete(visitKey);
  return paths;
}

/**
 * Calculate base resources needed for a queue of items
 */
export function calculateResources(queue) {
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
    const item = ItemHelpers.getById(itemId);
    
    if (BASE_CRAFT_ITEMS.has(itemId)) {
      baseNeeds[itemId] = (baseNeeds[itemId] || 0) + qty;
      return;
    }
    
    const craftsForItem = CraftHelpers.getByOutputId(itemId);
    if (craftsForItem.length === 0) {
      baseNeeds[itemId] = (baseNeeds[itemId] || 0) + qty;
      return;
    }
    
    let craftIdx = SelectedCraftHelpers.get(itemId);
    if (craftIdx >= craftsForItem.length) craftIdx = 0;
    const craft = craftsForItem[craftIdx];
    
    if (!craftNeeds[craft.id]) {
      craftNeeds[craft.id] = { craft, outputNeeds: {} };
    }
    craftNeeds[craft.id].outputNeeds[itemId] = (craftNeeds[craft.id].outputNeeds[itemId] || 0) + qty;
  });

  // For each craft, determine how many times to run it to satisfy all outputs at once
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
      const inputId = input.item;
      if (inputId) {
        const inputQty = craftsNeeded * input.qty;
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
    
    const item = ItemHelpers.getById(itemId);
    if (BASE_CRAFT_ITEMS.has(itemId)) {
      resourceCount[itemId] = (resourceCount[itemId] || 0) + qty;
      visited.delete(visitKey);
      return;
    }
    
    const craftsForItem = CraftHelpers.getByOutputId(itemId);
    if (craftsForItem.length === 0) {
      resourceCount[itemId] = (resourceCount[itemId] || 0) + qty;
      visited.delete(visitKey);
      return;
    }
    
    let craftIdx = SelectedCraftHelpers.get(itemId);
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
      const inputId = input.item;
      if (inputId) {
        const inputQty = craftsNeeded * input.qty;
        processInput(inputId, inputQty, visited);
      }
    });
    visited.delete(visitKey);
  }

  return resourceCount;
}

/**
 * Update the craft queue UI with current queue state
 */
export function updateCraftQueueUI() {
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
  const queue = QueueHelpers.getAll();
  
  if (queue.length === 0) {
    queueDiv.innerHTML = DOM.createSidebarCard(`
      <h3 style="color:${COLORS.ACCENT_PINK};margin-top:0;">Craft Queue</h3>
      <p>No items queued.</p>
    `).outerHTML;
    
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
  
  // Build queue UI
  const queueContent = `
    <h3 style="color:${COLORS.ACCENT_PINK};margin-top:0;">Craft Queue</h3>
    <ul style="list-style:none;padding:0;margin:8px 0;">
      ${Object.entries(queueCount).map(([id, qty]) => 
        `<li style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid ${COLORS.BORDER};">
          <span style="color:${COLORS.TEXT_PRIMARY};">${ItemHelpers.getById(id).name} x${qty}</span>
          <button class="remove-item-btn" data-itemid="${id}" 
            style="background:${COLORS.ACCENT_PINK};color:${COLORS.BACKGROUND};border:none;border-radius:3px;padding:4px 8px;cursor:pointer;font-size:0.8em;font-weight:bold;transition:background 0.2s;"
            onmouseover="this.style.background='#ff6b9d'" 
            onmouseout="this.style.background='${COLORS.ACCENT_PINK}'">✕</button>
        </li>`
      ).join('')}
    </ul>
    <button id="clear-queue" style="background:${COLORS.BACKGROUND};color:${COLORS.ACCENT_ORANGE};border:1.5px solid ${COLORS.ACCENT_ORANGE};border-radius:3px;padding:6px 16px;cursor:pointer;margin-top:8px;font-weight:bold;transition:all 0.2s;" onmouseover="this.style.background='${COLORS.ACCENT_ORANGE}'; this.style.color='${COLORS.BACKGROUND}'" onmouseout="this.style.background='${COLORS.BACKGROUND}'; this.style.color='${COLORS.ACCENT_ORANGE}'">Clear All</button>
  `;
  
  queueDiv.innerHTML = DOM.createSidebarCard(queueContent).outerHTML;
  
  // Add event listeners
  document.getElementById("clear-queue").onclick = () => {
    QueueHelpers.clear();
    updateCraftQueueUI();
  };
  
  // Add event listeners for individual item remove buttons
  document.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const itemId = e.target.getAttribute('data-itemid');
      QueueHelpers.remove(itemId);
      updateCraftQueueUI();
    };
  });
  
  // Calculate and show resources
  const itemIds = [];
  Object.entries(queueCount).forEach(([id, qty]) => {
    for (let i = 0; i < qty; i++) {
      itemIds.push(id);
    }
  });
  
  updateResourceSummary(itemIds);
  updateCraftingPaths(queueCount);
}

/**
 * Update the resource summary display
 */
function updateResourceSummary(itemIds) {
  const resources = calculateResources(itemIds);
  const resDiv = document.getElementById("resource-summary");
  if (!resDiv) return;
  
  // Only show true base resources (not craftable, or in BASE_CRAFT_ITEMS)
  const baseResourceEntries = Object.entries(resources).filter(([id, qty]) => {
    const item = ItemHelpers.getById(id);
    if (!item) return false;
    if (BASE_CRAFT_ITEMS.has(id)) return true;
    // Not craftable if no crafts output this item
    return CraftHelpers.getByOutputId(id).length === 0;
  });
  
  const resourceContent = `
    <h3 style="color:${COLORS.ACCENT_PINK};margin-top:0;">Required Base Resources</h3>
    <ul style="list-style:none;padding:0;margin:8px 0;">
      ${baseResourceEntries.map(([id, qty]) => 
        `<li style="padding:2px 0;color:${COLORS.TEXT_PRIMARY};">${ItemHelpers.getById(id).name}: ${qty}</li>`
      ).join('')}
    </ul>
  `;
  
  resDiv.innerHTML = DOM.createSidebarCard(resourceContent).outerHTML;
}

/**
 * Update the crafting paths display
 */
function updateCraftingPaths(queueCount) {
  const pathDiv = document.getElementById("craft-paths");
  if (!pathDiv) return;
  
  let pathsContent = `<h3 style="color:${COLORS.ACCENT_PINK};margin-top:0;">Crafting Paths</h3>`;
  
  Object.entries(queueCount).forEach(([id, qty]) => {
    const path = tracePath(id, qty);
    const itemName = ItemHelpers.getById(id).name;
    
    pathsContent += `
      <div style="margin-bottom:16px;">
        <strong>
          <a href="#" class="tree-item-link" data-itemid="${id}" style="color:${COLORS.ACCENT_CYAN};text-decoration:none;">${itemName}</a> x${qty}
        </strong>
        <ul style="margin-left:1em;list-style:none;padding:0;">
    `;
    
    path.forEach((step, idx) => {
      const itemLink = `<a href="#" class="tree-item-link" data-itemid="${step.id}" style="color:${COLORS.ACCENT_CYAN};text-decoration:none;">${step.name}</a>`;
      
      if (step.craft) {
        let recipeInputs = (step.craft.materials || []).map(inp => 
          `${inp.qty} ${ItemHelpers.getById(inp.item)?.name || inp.item}`
        ).join(' + ');
        
        // If multiple crafts, show a select dropdown
        if (step.craftsForItem && step.craftsForItem.length > 1) {
          const selectId = `craft-select-${step.id}-${step.depth}-${idx}`;
          pathsContent += `
            <li style="margin-left:${step.depth * 1.5}em;color:${COLORS.TEXT_PRIMARY};padding:2px 0;">
              <span>CRAFT ${itemLink} ← ${recipeInputs} (yields ${getOutputQty(step.craft, step.id)})</span>
              <select id="${selectId}" data-itemid="${step.id}" data-depth="${step.depth}"
                style="background:${COLORS.BACKGROUND};color:${COLORS.TEXT_PRIMARY};border:1.5px solid ${COLORS.ACCENT_GREEN};border-radius:4px;padding:6px 12px;font-size:1em;margin-left:10px;box-shadow:0 2px 8px ${COLORS.SHADOW};font-family:monospace;">
                ${step.craftsForItem.map((c, i) => {
                  let inputs = (c.materials || []).map(inp => 
                    `${inp.qty} ${ItemHelpers.getById(inp.item)?.name || inp.item}`
                  ).join(' + ');
                  return `<option value="${i}" ${i === step.craftIdx ? 'selected' : ''}>CRAFT ← ${inputs} (yields ${getOutputQty(c, step.id)})</option>`;
                }).join('')}
              </select>
            </li>
          `;
        } else {
          pathsContent += `
            <li style="margin-left:${step.depth * 1.5}em;color:${COLORS.TEXT_PRIMARY};padding:2px 0;">
              CRAFT ${itemLink} ← ${recipeInputs} (yields ${getOutputQty(step.craft, step.id)})
            </li>
          `;
        }
      } else {
        pathsContent += `
          <li style="margin-left:${step.depth * 1.5}em;color:${COLORS.TEXT_PRIMARY};padding:2px 0;">
            Gather/Obtain <strong>${itemLink}</strong>
          </li>
        `;
      }
    });
    
    pathsContent += '</ul></div>';
  });
  
  pathDiv.innerHTML = DOM.createSidebarCard(pathsContent).outerHTML;
  
  // Add event listeners for craft selects and tree item links
  Object.entries(queueCount).forEach(([id, qty]) => {
    const path = tracePath(id, qty);
    path.forEach((step, idx) => {
      if (step.craftsForItem && step.craftsForItem.length > 1) {
        const selectId = `craft-select-${step.id}-${step.depth}-${idx}`;
        const select = document.getElementById(selectId);
        if (select) {
          select.onchange = (e) => {
            SelectedCraftHelpers.set(step.id, Number(e.target.value));
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
      const itemId = this.getAttribute('data-itemid');
      
      // Focus on the node in the graph
      focusNode(itemId, { scale: 1.2, animation: true });
      
      // Show item details
      window.dispatchEvent(new CustomEvent('showItemDetails', { 
        detail: { id: itemId } 
      }));
    };
  });
}

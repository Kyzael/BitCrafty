// BitCrafty UI Components
// Sidebar, search, legend, item details, and GitHub link functionality

import { COLORS, DOM, VALIDATION } from '../lib/common.js';
import { 
  ItemHelpers, 
  ProfessionHelpers, 
  RequirementHelpers,
  QueueHelpers,
  store 
} from '../lib/store-helpers.js';
import { focusNode, clearSelection } from './graph.js';
import { updateCraftQueueUI as updateCraftingUI } from './crafting.js';
import { applyProfessionFilters } from './filters.js';

// Search functionality state
let selectedDropdownIndex = -1;
let searchDropdown = null;

/**
 * Initialize all UI components
 */
export function initializeUI() {
  createSidebar();
  createMainContent();
  setupSearchFunctionality();
  setupEventListeners();
  // Initial queue update
  updateCraftQueueUI();
}

/**
 * Setup event listeners for UI communication
 */
function setupEventListeners() {
  // Listen for item details requests from graph
  window.addEventListener('showItemDetails', (event) => {
    if (event.detail && event.detail.id) {
      showItemDetails(event.detail.id);
    }
  });
  
  // Listen for clear item details requests
  window.addEventListener('clearItemDetails', () => {
    clearItemDetails();
  });
}

/**
 * Create the main sidebar with all components
 */
function createSidebar() {
  const sidebar = document.createElement('div');
  sidebar.id = 'sidebar';
  
  // Get stored width or use default
  const storedWidth = localStorage.getItem('bitcrafty-sidebar-width');
  const sidebarWidth = storedWidth ? Math.max(parseInt(storedWidth), 320) : 420; // 320px minimum for search functionality
  
  // Check if sidebar should be collapsed
  const isCollapsed = localStorage.getItem('bitcrafty-sidebar-collapsed') === 'true';
  
  sidebar.style.cssText = `
    width: ${sidebarWidth}px;
    min-height: 100vh;
    background: ${COLORS.SIDEBAR_BG};
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 0 0 18px 0;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    overflow-y: auto;
    z-index: 10;
    transform: ${isCollapsed ? 'translateX(-100%)' : 'translateX(0)'};
    transition: transform 0.3s ease;
  `;

  // Add all sidebar components
  sidebar.appendChild(createTitle());
  sidebar.appendChild(createLegend());
  sidebar.appendChild(createItemDetailsContainer());
  sidebar.appendChild(createQueueContainer());
  sidebar.appendChild(createResourceContainer());
  sidebar.appendChild(createPathsContainer());
  sidebar.appendChild(createGitHubLink());
  
  // Add resize handle only (collapse button will be separate)
  sidebar.appendChild(createResizeHandle());

  document.body.appendChild(sidebar);
  
  // Create collapse button 
  const collapseButton = createCollapseButton(isCollapsed, sidebarWidth);
  
  // Attach button to sidebar or body based on collapse state
  if (isCollapsed) {
    document.body.appendChild(collapseButton);
  } else {
    sidebar.appendChild(collapseButton);
  }
  
  // Update main content margin based on sidebar width and collapse state
  const finalWidth = isCollapsed ? 0 : sidebarWidth;
  updateMainContentMargin(finalWidth);
}

/**
 * Create the title section
 */
function createTitle() {
  const titleDiv = document.createElement('div');
  titleDiv.id = 'bitcrafty-title';
  titleDiv.textContent = 'BitCraft Crafting Tree';
  titleDiv.style.cssText = `
    background: #1e1f1c;
    color: ${COLORS.TEXT_PRIMARY};
    font-family: monospace, monospace;
    font-size: 2.1em;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 24px 0 12px 32px;
    border-top-left-radius: 0;
    border-top-right-radius: 12px;
    box-shadow: none;
  `;
  return titleDiv;
}

/**
 * Create the legend and filters section
 */
function createLegend() {
  const professions = ProfessionHelpers.getAll();
  const profColorMap = ProfessionHelpers.getColorMap();
  const professionNames = ProfessionHelpers.getSortedNames();
  
  let legendHtml = `<h3 style="margin-top:0;color:${COLORS.TEXT_PRIMARY};">Legend & Filters</h3>
    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(2, 1fr);gap:6px 16px;">`;
  
  professionNames.forEach(profName => {
    legendHtml += `<div class="prof-filter-toggle" data-profession="${profName}" data-active="true" style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:all 0.3s ease;user-select:none;white-space:nowrap;min-width:0;">
      <span style="display:inline-block;width:16px;height:16px;background:${profColorMap[profName]};border-radius:3px;transition:all 0.3s ease;flex-shrink:0;"></span>
      <span style="color:${COLORS.TEXT_PRIMARY};font-weight:500;transition:all 0.3s ease;font-size:0.9em;overflow:hidden;text-overflow:ellipsis;">${profName}</span>
    </div>`;
  });
  
  legendHtml += `</div>
    <div style="margin-top:12px;display:flex;flex-wrap:wrap;align-items:center;gap:10px;">
      <input type="text" id="item-search" placeholder="Search item name..." style="padding:10px 16px;min-width:180px;width:240px;background:#1e1f1c;color:${COLORS.TEXT_PRIMARY};border:1.5px solid ${COLORS.BORDER};font-size:1.1em;border-radius:5px;box-sizing:border-box;">
    </div>`;

  const legendDiv = document.createElement('div');
  legendDiv.id = 'legend';
  legendDiv.style.cssText = `
    background: ${COLORS.BACKGROUND};
    border-radius: 8px;
    box-shadow: 0 2px 8px ${COLORS.SHADOW};
    padding: 16px 20px 10px 20px;
    color: ${COLORS.TEXT_PRIMARY};
  `;
  legendDiv.innerHTML = legendHtml;

  // Add profession filter event listeners
  setupProfessionFilters(legendDiv);

  return legendDiv;
}

/**
 * Setup profession filter toggle functionality
 */
function setupProfessionFilters(legendDiv) {
  legendDiv.querySelectorAll('.prof-filter-toggle').forEach(toggle => {
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
        textSpan.style.color = COLORS.TEXT_PRIMARY;
      } else {
        // Inactive state - greyed out
        this.style.opacity = '0.4';
        this.style.filter = 'grayscale(0.8)';
        colorBox.style.opacity = '0.6';
        textSpan.style.color = '#666';
      }
      
      console.log('Profession filter changed:', profession, newState);
      // Trigger profession filter update using graph component
      applyProfessionFilters();
    });
  });
}

/**
 * Create container for item details
 */
function createItemDetailsContainer() {
  const detailsDiv = DOM.getOrCreateElement('item-details');
  detailsDiv.classList.add('details');
  return detailsDiv;
}

/**
 * Create container for craft queue
 */
function createQueueContainer() {
  return DOM.getOrCreateElement('craft-queue');
}

/**
 * Create container for resource summary
 */
function createResourceContainer() {
  return DOM.getOrCreateElement('resource-summary');
}

/**
 * Create container for craft paths
 */
function createPathsContainer() {
  return DOM.getOrCreateElement('craft-paths');
}

/**
 * Create GitHub link and Buy me a coffee button at bottom of sidebar
 */
function createGitHubLink() {
  const linksDiv = document.createElement('div');
  linksDiv.style.cssText = `
    margin-top: auto;
    padding: 12px 18px;
    border-top: 1px solid #3e3d32;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  `;
  
  // GitHub link
  const githubLink = document.createElement('a');
  githubLink.href = 'https://github.com/Kyzael/BitCrafty';
  githubLink.target = '_blank';
  githubLink.rel = 'noopener noreferrer';
  githubLink.style.cssText = `
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${COLORS.TEXT_SECONDARY};
    text-decoration: none;
    font-size: 13px;
    transition: color 0.2s ease;
    flex: 1;
    min-width: 0;
  `;
  
  // GitHub SVG icon
  const githubIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  githubIcon.setAttribute('width', '18');
  githubIcon.setAttribute('height', '18');
  githubIcon.setAttribute('viewBox', '0 0 24 24');
  githubIcon.setAttribute('fill', 'currentColor');
  githubIcon.style.flexShrink = '0';
  githubIcon.innerHTML = '<path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>';
  
  const githubText = document.createElement('span');
  githubText.textContent = 'View on GitHub';
  githubText.style.cssText = `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `;
  
  githubLink.appendChild(githubIcon);
  githubLink.appendChild(githubText);
  
  // Add hover effects for GitHub link
  githubLink.addEventListener('mouseenter', () => {
    githubLink.style.color = COLORS.ACCENT_PINK;
  });
  githubLink.addEventListener('mouseleave', () => {
    githubLink.style.color = COLORS.TEXT_SECONDARY;
  });
  
  // Create Buy Me A Coffee button with same styling as GitHub link
  const coffeeButton = document.createElement('a');
  coffeeButton.href = 'https://coff.ee/kyzael';
  coffeeButton.target = '_blank';
  coffeeButton.rel = 'noopener noreferrer';
  coffeeButton.style.cssText = `
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${COLORS.TEXT_SECONDARY};
    text-decoration: none;
    font-size: 13px;
    transition: color 0.2s ease;
    flex: 1;
    min-width: 0;
  `;
  
  // Coffee emoji/icon
  const coffeeIcon = document.createElement('span');
  coffeeIcon.textContent = '☕';
  coffeeIcon.style.cssText = `
    font-size: 16px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  `;
  
  const coffeeText = document.createElement('span');
  coffeeText.textContent = 'Buy me a coffee';
  coffeeText.style.cssText = `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `;
  
  coffeeButton.appendChild(coffeeIcon);
  coffeeButton.appendChild(coffeeText);
  
  // Add hover effects for coffee button (same as GitHub)
  coffeeButton.addEventListener('mouseenter', () => {
    coffeeButton.style.color = COLORS.ACCENT_PINK;
  });
  coffeeButton.addEventListener('mouseleave', () => {
    coffeeButton.style.color = COLORS.TEXT_SECONDARY;
  });
  
  linksDiv.appendChild(githubLink);
  linksDiv.appendChild(coffeeButton);
  return linksDiv;
}

/**
 * Create resize handle for sidebar
 */
function createResizeHandle() {
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'sidebar-resize-handle';
  resizeHandle.style.cssText = `
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    background: transparent;
    cursor: col-resize;
    z-index: 1000;
    transition: background 0.2s ease;
  `;
  
  // Visual indicator on hover
  resizeHandle.addEventListener('mouseenter', () => {
    resizeHandle.style.background = 'rgba(116, 185, 255, 0.3)';
  });
  
  resizeHandle.addEventListener('mouseleave', () => {
    resizeHandle.style.background = 'transparent';
  });
  
  // Resize functionality
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    const sidebar = document.getElementById('sidebar');
    startWidth = parseInt(window.getComputedStyle(sidebar).width, 10);
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const width = startWidth + (e.clientX - startX);
    const minWidth = 320; // Minimum width for search functionality
    const maxWidth = Math.min(800, window.innerWidth * 0.6); // Max 60% of viewport or 800px
    
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, width));
    
    const sidebar = document.getElementById('sidebar');
    sidebar.style.width = `${constrainedWidth}px`;
    
    // Update main content margin
    updateMainContentMargin(constrainedWidth);
    
    // No need to update collapse button position - it moves with sidebar automatically
    
    e.preventDefault();
  });
  
  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      // Save the current width to localStorage
      const sidebar = document.getElementById('sidebar');
      const currentWidth = parseInt(window.getComputedStyle(sidebar).width, 10);
      localStorage.setItem('bitcrafty-sidebar-width', currentWidth.toString());
    }
  });
  
  return resizeHandle;
}

/**
 * Create collapse button for sidebar (independent of sidebar)
 */
function createCollapseButton(isCollapsed, sidebarWidth) {
  const collapseButton = document.createElement('div');
  collapseButton.id = 'sidebar-collapse-button';
  
  // Position based on initial state
  let initialPosition, initialLeft, initialRight;
  
  if (isCollapsed) {
    // When collapsed, position at left edge of screen
    initialPosition = 'fixed';
    initialLeft = '0px';
    initialRight = 'auto';
  } else {
    // When expanded, position relative to sidebar (attached to its right edge)
    initialPosition = 'absolute';
    initialLeft = 'auto';
    initialRight = '-15px';
  }
  
  collapseButton.style.cssText = `
    position: ${initialPosition};
    top: 50%;
    left: ${initialLeft};
    right: ${initialRight};
    width: 30px;
    height: 60px;
    background: ${COLORS.BACKGROUND};
    border: 1px solid ${COLORS.BORDER};
    border-left: ${isCollapsed ? 'none' : '1px solid ' + COLORS.BORDER};
    border-radius: 0 8px 8px 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
    transform: translateY(-50%);
    transition: all 0.3s ease;
    box-shadow: 2px 0 8px ${COLORS.SHADOW};
  `;
  
  // Arrow icon
  const arrow = document.createElement('span');
  arrow.textContent = isCollapsed ? '>' : '<';
  arrow.style.cssText = `
    color: ${COLORS.TEXT_SECONDARY};
    font-size: 16px;
    font-weight: bold;
    transition: all 0.2s ease;
    user-select: none;
  `;
  
  collapseButton.appendChild(arrow);
  
  // Hover effects
  collapseButton.addEventListener('mouseenter', () => {
    collapseButton.style.background = COLORS.SIDEBAR_BG;
    arrow.style.color = COLORS.ACCENT_CYAN;
  });
  
  collapseButton.addEventListener('mouseleave', () => {
    collapseButton.style.background = COLORS.BACKGROUND;
    arrow.style.color = COLORS.TEXT_SECONDARY;
  });
  
  // Click handler for collapse/expand
  collapseButton.addEventListener('click', () => {
    toggleSidebarCollapse();
  });
  
  // If not collapsed, append to sidebar so it moves with it
  if (!isCollapsed) {
    // We'll append this to the sidebar after it's created
    collapseButton.dataset.attachToSidebar = 'true';
  }
  
  return collapseButton;
}

/**
 * Toggle sidebar collapse/expand
 */
function toggleSidebarCollapse() {
  const sidebar = document.getElementById('sidebar');
  const collapseButton = document.getElementById('sidebar-collapse-button');
  const arrow = collapseButton.querySelector('span');
  
  const isCollapsed = sidebar.style.transform === 'translateX(-100%)';
  
  if (isCollapsed) {
    // Expand sidebar
    sidebar.style.transform = 'translateX(0)';
    arrow.textContent = '<';
    
    // Move button from body to sidebar (so it moves with sidebar)
    collapseButton.style.position = 'absolute';
    collapseButton.style.left = 'auto';
    collapseButton.style.right = '-15px';
    collapseButton.style.borderLeft = `1px solid ${COLORS.BORDER}`;
    
    // Move button to be child of sidebar
    sidebar.appendChild(collapseButton);
    
    // Restore main content margin
    const storedWidth = localStorage.getItem('bitcrafty-sidebar-width');
    const sidebarWidth = storedWidth ? Math.max(parseInt(storedWidth), 320) : 420;
    updateMainContentMargin(sidebarWidth);
    
    // Save collapse state
    localStorage.setItem('bitcrafty-sidebar-collapsed', 'false');
  } else {
    // Collapse sidebar
    sidebar.style.transform = 'translateX(-100%)';
    arrow.textContent = '>';
    
    // Move button from sidebar to body (so it stays visible)
    collapseButton.style.position = 'fixed';
    collapseButton.style.left = '0px';
    collapseButton.style.right = 'auto';
    collapseButton.style.borderLeft = 'none';
    
    // Move button to be child of body
    document.body.appendChild(collapseButton);
    
    // Remove main content margin
    updateMainContentMargin(0);
    
    // Save collapse state
    localStorage.setItem('bitcrafty-sidebar-collapsed', 'true');
  }
}

/**
 * Update main content margin based on sidebar width
 */
function updateMainContentMargin(sidebarWidth) {
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.style.marginLeft = `${sidebarWidth}px`;
  }
}

/**
 * Create main content wrapper for the network graph
 */
function createMainContent() {
  let mainContent = document.getElementById('main-content');
  if (!mainContent) {
    mainContent = document.createElement('div');
    mainContent.id = 'main-content';
    
    // Get current sidebar width for initial margin
    const storedWidth = localStorage.getItem('bitcrafty-sidebar-width');
    const sidebarWidth = storedWidth ? Math.max(parseInt(storedWidth), 320) : 420;
    const isCollapsed = localStorage.getItem('bitcrafty-sidebar-collapsed') === 'true';
    const initialMargin = isCollapsed ? 0 : sidebarWidth;
    
    mainContent.style.cssText = `
      margin-left: ${initialMargin}px;
      height: 100vh;
      overflow: hidden;
      position: relative;
      transition: margin-left 0.3s ease;
    `;
    
    // Move existing #network into main-content
    const networkDiv = document.getElementById('network');
    if (networkDiv) {
      networkDiv.style.cssText = `
        width: 100%;
        height: 100%;
        border: 1px solid ${COLORS.BORDER};
        background: #1e1f1c;
      `;
      mainContent.appendChild(networkDiv);
    }
    document.body.appendChild(mainContent);
  }
}

/**
 * Setup search functionality with dropdown and keyboard navigation
 */
function setupSearchFunctionality() {
  const searchInput = document.getElementById('item-search');
  if (!searchInput) return;

  // Create search dropdown
  searchDropdown = document.createElement('div');
  searchDropdown.id = 'item-search-dropdown';
  searchDropdown.style.cssText = `
    position: absolute;
    background: ${COLORS.BACKGROUND};
    border: 1px solid ${COLORS.BORDER};
    color: ${COLORS.TEXT_PRIMARY};
    z-index: 1000;
    display: none;
    max-height: 200px;
    overflow-y: auto;
  `;
  document.body.appendChild(searchDropdown);

  // Search input handler
  searchInput.addEventListener('input', function() {
    const val = this.value.trim().toLowerCase();
    selectedDropdownIndex = -1;
    if (!val) {
      searchDropdown.style.display = 'none';
      return;
    }
    updateSearchDropdown(val);
  });

  // Global keyboard navigation
  setupSearchKeyboardHandlers(searchInput);
  
  // Dropdown interaction handlers
  setupSearchDropdownHandlers(searchInput);
}

/**
 * Setup global keyboard handlers for search
 */
function setupSearchKeyboardHandlers(searchInput) {
  document.addEventListener('keydown', function(e) {
    const isSearchFocused = document.activeElement === searchInput;
    const isDropdownVisible = searchDropdown.style.display === 'block';
    
    // Handle arrow key navigation in dropdown
    if (isDropdownVisible && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      handleDropdownNavigation(e.key === 'ArrowDown');
      return;
    }
    
    // Handle Enter key to select highlighted item
    if (isDropdownVisible && e.key === 'Enter' && selectedDropdownIndex >= 0) {
      e.preventDefault();
      selectHighlightedItem();
      return;
    }
    
    // Handle Escape to close dropdown
    if (isDropdownVisible && e.key === 'Escape') {
      closeSearchDropdown();
      return;
    }
    
    // Auto-focus search input when typing
    if (!isSearchFocused && 
        !e.ctrlKey && !e.altKey && !e.metaKey && 
        e.key.length === 1 && 
        /[a-zA-Z0-9\s]/.test(e.key)) {
      searchInput.focus();
    }
  });
}

/**
 * Handle dropdown navigation (up/down arrows)
 */
function handleDropdownNavigation(isDown) {
  const results = searchDropdown.querySelectorAll('.search-result');
  
  // Remove previous highlight
  if (selectedDropdownIndex >= 0 && results[selectedDropdownIndex]) {
    results[selectedDropdownIndex].style.background = COLORS.BACKGROUND;
  }
  
  // Update selection
  if (isDown) {
    selectedDropdownIndex = Math.min(selectedDropdownIndex + 1, results.length - 1);
  } else {
    selectedDropdownIndex = Math.max(selectedDropdownIndex - 1, -1);
  }
  
  // Highlight new selection
  if (selectedDropdownIndex >= 0 && results[selectedDropdownIndex]) {
    results[selectedDropdownIndex].style.background = '#49483e';
    results[selectedDropdownIndex].scrollIntoView({ block: 'nearest' });
  }
}

/**
 * Select the currently highlighted item
 */
function selectHighlightedItem() {
  const results = searchDropdown.querySelectorAll('.search-result');
  if (results[selectedDropdownIndex]) {
    const id = results[selectedDropdownIndex].getAttribute('data-id');
    selectSearchResult(id);
  }
}

/**
 * Setup dropdown interaction handlers
 */
function setupSearchDropdownHandlers(searchInput) {
  // Click outside to close
  document.addEventListener('click', function(e) {
    if (!searchDropdown.contains(e.target) && e.target !== searchInput) {
      closeSearchDropdown();
    }
  });
  
  // Mouse interaction
  searchDropdown.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('search-result')) {
      // Remove previous highlight
      const results = searchDropdown.querySelectorAll('.search-result');
      results.forEach(result => result.style.background = COLORS.BACKGROUND);
      
      // Highlight hovered item
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
}

/**
 * Update search dropdown with matching items
 */
function updateSearchDropdown(searchValue) {
  const matches = ItemHelpers.search(searchValue);
  if (matches.length === 0) {
    searchDropdown.style.display = 'none';
    return;
  }
  
  searchDropdown.innerHTML = matches.map((item, index) => 
    `<div class="search-result" data-id="${item.id}" data-index="${index}" style="padding:4px 10px;cursor:pointer;">${item.name}</div>`
  ).join('');
  
  // Position dropdown
  const searchInput = document.getElementById('item-search');
  const rect = searchInput.getBoundingClientRect();
  searchDropdown.style.left = rect.left + 'px';
  searchDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
  searchDropdown.style.width = rect.width + 'px';
  searchDropdown.style.display = 'block';
  selectedDropdownIndex = -1;
}

/**
 * Select a search result and focus on it in the graph
 */
function selectSearchResult(id) {
  const searchInput = document.getElementById('item-search');
  searchInput.value = '';
  closeSearchDropdown();
  
  // Focus on the selected node using graph component
  focusNode(id, { scale: 1.2, animation: true });
  
  // Show item details
  showItemDetails(id);
}

/**
 * Close search dropdown and reset state
 */
function closeSearchDropdown() {
  searchDropdown.style.display = 'none';
  selectedDropdownIndex = -1;
  document.getElementById('item-search').blur();
}

/**
 * Show item details in the sidebar
 */
export function showItemDetails(id) {
  const detailsDiv = document.getElementById("item-details");
  const entityType = VALIDATION.parseEntityType(id);
  
  if (entityType === 'craft') {
    showCraftDetails(detailsDiv, id);
  } else if (entityType === 'item') {
    showItemDetailsContent(detailsDiv, id);
  } else {
    showUnknownEntityDetails(detailsDiv, id);
  }
  
  detailsDiv.classList.add("active");
}

/**
 * Show craft details
 */
function showCraftDetails(detailsDiv, id) {
  const crafts = store.getState().crafts;
  const craft = Object.values(crafts).find(c => c.id === id);
  if (!craft) return;
  
  let professionInfo = 'Unknown';
  let toolInfo = 'Unknown';
  let buildingInfo = 'Unknown';
  
  if (craft.requirement) {
    const profInfo = RequirementHelpers.getProfessionInfo(craft.requirement);
    if (profInfo) {
      professionInfo = `${profInfo.name} (Level ${profInfo.level})`;
    }
    
    const toolInfo_data = RequirementHelpers.getToolInfo(craft.requirement);
    if (toolInfo_data) {
      toolInfo = `${toolInfo_data.name} (Level ${toolInfo_data.level})`;
    }
    
    const buildingInfo_data = RequirementHelpers.getBuildingInfo(craft.requirement);
    if (buildingInfo_data) {
      buildingInfo = `${buildingInfo_data.name} (Level ${buildingInfo_data.level})`;
    }
  }
  
  const content = `
    <h2 style="color:${COLORS.ACCENT_PINK};margin-top:0;">${craft.name}</h2>
    <p><strong style="color:${COLORS.ACCENT_CYAN};">Profession:</strong> <span style="color:${COLORS.TEXT_PRIMARY};">${professionInfo}</span></p>
    <p><strong style="color:${COLORS.TEXT_SECONDARY};">Tool:</strong> <span style="color:${COLORS.TEXT_PRIMARY};">${toolInfo}</span></p>
    <p><strong style="color:${COLORS.ACCENT_ORANGE};">Building:</strong> <span style="color:${COLORS.TEXT_PRIMARY};">${buildingInfo}</span></p>
    <div style="margin-top:32px;text-align:right;">
      <button id="goto-node" style="background:${COLORS.BACKGROUND};color:${COLORS.ACCENT_PINK};border:1.5px solid ${COLORS.ACCENT_PINK};border-radius:3px;padding:6px 16px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='${COLORS.ACCENT_PINK}'; this.style.color='${COLORS.BACKGROUND}'" onmouseout="this.style.background='${COLORS.BACKGROUND}'; this.style.color='${COLORS.ACCENT_PINK}'">Go to Node</button>
    </div>
  `;
  
  detailsDiv.innerHTML = DOM.createSidebarCard(content).outerHTML;
  
  document.getElementById("goto-node").onclick = () => {
    focusNode(id, {
      scale: 1.2,
      animation: { duration: 600, easingFunction: 'easeInOutQuad' }
    });
  };
}

/**
 * Show item details content
 */
function showItemDetailsContent(detailsDiv, id) {
  const item = ItemHelpers.getById(id);
  if (!item) return;
  
  const crafts = store.getState().crafts;
  const allCrafts = Object.values(crafts);
  const usedInCount = allCrafts.filter(craft => (craft.materials || []).some(mat => mat.item === item.id)).length;
  
  const content = `
    <h2 style="color:${COLORS.TEXT_SECONDARY};margin-top:0;">${item.name}</h2>
    <p><strong style="color:${COLORS.ACCENT_ORANGE};">Tier:</strong> <span style="color:${COLORS.TEXT_PRIMARY};">${item.tier}</span> <span style="margin-left:1em;"><strong style="color:${COLORS.ACCENT_PINK};">Rank:</strong> <span style="color:${COLORS.TEXT_PRIMARY};">${item.rank}</span></span></p>
    <p><strong style="color:${COLORS.ACCENT_YELLOW};">Used in Recipes:</strong> <span style="color:${COLORS.TEXT_PRIMARY};">${usedInCount}</span></p>
    <div style="margin-top:18px;">
      <button id="queue-craft" style="background:${COLORS.BACKGROUND};color:${COLORS.TEXT_SECONDARY};border:1.5px solid ${COLORS.TEXT_SECONDARY};border-radius:3px;padding:6px 16px;cursor:pointer;margin-right:8px;transition:all 0.2s;" onmouseover="this.style.background='${COLORS.TEXT_SECONDARY}'; this.style.color='${COLORS.BACKGROUND}'" onmouseout="this.style.background='${COLORS.BACKGROUND}'; this.style.color='${COLORS.TEXT_SECONDARY}'">Queue 1</button>
      <button id="queue-craft-5" style="background:${COLORS.BACKGROUND};color:${COLORS.ACCENT_CYAN};border:1.5px solid ${COLORS.ACCENT_CYAN};border-radius:3px;padding:6px 16px;cursor:pointer;margin-right:8px;transition:all 0.2s;" onmouseover="this.style.background='${COLORS.ACCENT_CYAN}'; this.style.color='${COLORS.BACKGROUND}'" onmouseout="this.style.background='${COLORS.BACKGROUND}'; this.style.color='${COLORS.ACCENT_CYAN}'">Queue 5</button>
      <button id="queue-craft-10" style="background:${COLORS.BACKGROUND};color:${COLORS.ACCENT_ORANGE};border:1.5px solid ${COLORS.ACCENT_ORANGE};border-radius:3px;padding:6px 16px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='${COLORS.ACCENT_ORANGE}'; this.style.color='${COLORS.BACKGROUND}'" onmouseout="this.style.background='${COLORS.BACKGROUND}'; this.style.color='${COLORS.ACCENT_ORANGE}'">Queue 10</button>
    </div>
    <div style="margin-top:32px;text-align:right;">
      <button id="goto-node" style="background:${COLORS.BACKGROUND};color:${COLORS.TEXT_SECONDARY};border:1.5px solid ${COLORS.TEXT_SECONDARY};border-radius:3px;padding:6px 16px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='${COLORS.TEXT_SECONDARY}'; this.style.color='${COLORS.BACKGROUND}'" onmouseout="this.style.background='${COLORS.BACKGROUND}'; this.style.color='${COLORS.TEXT_SECONDARY}'">Go to Node</button>
    </div>
  `;
  
  detailsDiv.innerHTML = DOM.createSidebarCard(content).outerHTML;
  
  // Add queue button handlers
  document.getElementById("queue-craft").onclick = () => {
    QueueHelpers.add(id, 1);
    updateCraftQueueUI();
  };
  document.getElementById("queue-craft-5").onclick = () => {
    QueueHelpers.add(id, 5);
    updateCraftQueueUI();
  };
  document.getElementById("queue-craft-10").onclick = () => {
    QueueHelpers.add(id, 10);
    updateCraftQueueUI();
  };
  document.getElementById("goto-node").onclick = () => {
    focusNode(id, {
      scale: 1.2,
      animation: { duration: 600, easingFunction: 'easeInOutQuad' }
    });
  };
}

/**
 * Show unknown entity details
 */
function showUnknownEntityDetails(detailsDiv, id) {
  const content = `
    <h2 style="color:${COLORS.ACCENT_PINK};margin-top:0;">Unknown Entity</h2>
    <p><strong style="color:${COLORS.ACCENT_YELLOW};">ID:</strong> <span style="color:${COLORS.TEXT_PRIMARY};">${id}</span></p>
    <p style="color:${COLORS.ACCENT_ORANGE};">Unable to display details for this entity type.</p>
  `;
  
  detailsDiv.innerHTML = DOM.createSidebarCard(content).outerHTML;
}

/**
 * Clear item details
 */
export function clearItemDetails() {
  const detailsDiv = document.getElementById("item-details");
  detailsDiv.innerHTML = '';
  detailsDiv.classList.remove("active");
  
  // Clear any selected nodes using graph component
  clearSelection();
}

/**
 * Update craft queue UI
 */
export function updateCraftQueueUI() {
  // Delegate to crafting component
  updateCraftingUI();
}

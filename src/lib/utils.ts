import dagre from 'dagre'
import { GraphNode, GraphEdge, LayoutOptions, GraphData } from '../types'
import { DEFAULT_LAYOUT_OPTIONS, NODE_STYLES, BASE_CRAFT_ITEMS } from './constants'

// Search types
export type SearchMode = 'name' | 'profession' | 'all'

/**
 * Search functionality for finding nodes based on query and mode
 */
export function searchNodes(
  nodes: GraphNode[],
  query: string,
  mode: SearchMode = 'all',
  limit: number = 10
): string[] {
  if (!query.trim()) {
    return []
  }
  
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)
  
  return nodes
    .filter(node => {
      const searchableText = getSearchableText(node, mode)
      return searchTerms.every(term => 
        searchableText.includes(term)
      )
    })
    .slice(0, limit)
    .map(node => node.id)
}

function getSearchableText(node: GraphNode, mode: SearchMode): string {
  switch (mode) {
    case 'name':
      return node.data.name.toLowerCase()
    case 'profession':
      return node.data.profession?.toLowerCase() || ''
    case 'all':
      return `${node.data.name} ${node.data.profession || ''}`.toLowerCase()
  }
}

/**
 * Extract profession name from entity ID
 * Handles format: TYPE:PROFESSION:IDENTIFIER
 * Returns profession name matching the format in professions.json
 * Special case: "any" remains lowercase, others get capitalized
 */
export function extractProfessionFromId(id: string): string {
  const parts = id.split(':')
  if (parts.length >= 2) {
    const professionId = parts[1]
    // Special case: "any" stays lowercase, others get capitalized
    return professionId === 'any' ? 'any' : professionId.charAt(0).toUpperCase() + professionId.slice(1)
  }
  return 'Unknown'
}

/**
 * Calculate layout positions for nodes using various algorithms
 */
export function calculateLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS
): GraphNode[] {
  const { direction, nodeSpacing, rankSpacing, layoutType, align, ranker } = { ...DEFAULT_LAYOUT_OPTIONS, ...options }
  
  // Choose layout algorithm based on type
  switch (layoutType) {
    case 'radial':
      return calculateRadialLayout(nodes, edges, nodeSpacing || 140)
    case 'subway':
      return calculateSubwayLayout(nodes, edges, direction, nodeSpacing || 80, rankSpacing || 300, align, ranker)
    case 'hierarchical':
    default:
      return calculateHierarchicalLayout(nodes, edges, direction, nodeSpacing || 160, rankSpacing || 220, align, ranker)
  }
}

/**
 * Calculate hierarchical layout using Dagre with enhanced configuration
 */
function calculateHierarchicalLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  direction: string,
  nodeSpacing: number,
  rankSpacing: number,
  align?: string,
  ranker?: string
): GraphNode[] {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  
  // Enhanced Dagre configuration
  const graphConfig: any = {
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing
  }
  
  // Add optional configuration parameters
  if (align) graphConfig.align = align
  if (ranker) graphConfig.ranker = ranker
  
  dagreGraph.setGraph(graphConfig)

  // Add nodes to dagre graph
  nodes.forEach(node => {
    const nodeStyle = node.data.type === 'item' ? NODE_STYLES.item : NODE_STYLES.craft
    dagreGraph.setNode(node.id, {
      width: nodeStyle.width,
      height: nodeStyle.height
    })
  })

  // Add edges to dagre graph
  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Calculate layout
  dagre.layout(dagreGraph)

  // Apply positions to nodes
  return nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const nodeStyle = node.data.type === 'item' ? NODE_STYLES.item : NODE_STYLES.craft
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeStyle.width / 2,
        y: nodeWithPosition.y - nodeStyle.height / 2
      }
    }
  })
}

/**
 * Calculate radial layout - creates a spider web pattern flowing outward from center
 */
function calculateRadialLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  nodeSpacing: number
): GraphNode[] {
  // Calculate base resources (nodes with no incoming edges)
  const hasIncomingEdges = new Set<string>()
  edges.forEach(edge => hasIncomingEdges.add(edge.target))
  
  const itemNodes = nodes.filter(n => n.data.type === 'item')
  const baseResources = itemNodes.filter(node => !hasIncomingEdges.has(node.id))
  
  // Build dependency tree structure
  const nodeChildren = new Map<string, string[]>()
  const nodeParents = new Map<string, string[]>()
  
  edges.forEach(edge => {
    if (!nodeChildren.has(edge.source)) {
      nodeChildren.set(edge.source, [])
    }
    nodeChildren.get(edge.source)!.push(edge.target)
    
    if (!nodeParents.has(edge.target)) {
      nodeParents.set(edge.target, [])
    }
    nodeParents.get(edge.target)!.push(edge.source)
  })
  
  // Calculate levels using BFS from base resources
  const nodeLevels = new Map<string, number>()
  const queue: { nodeId: string; level: number }[] = []
  
  baseResources.forEach(node => {
    nodeLevels.set(node.id, 0)
    queue.push({ nodeId: node.id, level: 0 })
  })
  
  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!
    const children = nodeChildren.get(nodeId) || []
    
    children.forEach(childId => {
      if (!nodeLevels.has(childId)) {
        nodeLevels.set(childId, level + 1)
        queue.push({ nodeId: childId, level: level + 1 })
      }
    })
  }
  
  // Position nodes in spider web pattern
  const centerX = 600
  const centerY = 500
  const baseRadius = 200
  const layoutedNodes: GraphNode[] = []
  const nodePositions = new Map<string, { x: number; y: number }>()
  
  // Step 1: Place base resources at center or in inner circle
  if (baseResources.length === 1) {
    const baseNode = baseResources[0]
    const pos = { x: centerX, y: centerY }
    nodePositions.set(baseNode.id, pos)
    layoutedNodes.push({
      ...baseNode,
      position: pos
    })
  } else {
    baseResources.forEach((node, index) => {
      const angle = (index / baseResources.length) * 2 * Math.PI
      const pos = {
        x: centerX + Math.cos(angle) * baseRadius,
        y: centerY + Math.sin(angle) * baseRadius
      }
      nodePositions.set(node.id, pos)
      layoutedNodes.push({
        ...node,
        position: pos
      })
    })
  }
  
  // Step 2: Position children in sectors radiating from their parents
  const processedNodes = new Set(baseResources.map(n => n.id))
  const maxLevel = Math.max(...Array.from(nodeLevels.values()))
  
  for (let level = 1; level <= maxLevel; level++) {
    const currentLevelNodes = nodes.filter(n => nodeLevels.get(n.id) === level)
    
    currentLevelNodes.forEach(node => {
      if (processedNodes.has(node.id)) return
      
      const parents = nodeParents.get(node.id) || []
      const processedParents = parents.filter(p => processedNodes.has(p))
      
      if (processedParents.length === 0) return
      
      // Calculate average parent position for positioning
      let avgParentX = 0
      let avgParentY = 0
      processedParents.forEach(parentId => {
        const parentPos = nodePositions.get(parentId)!
        avgParentX += parentPos.x
        avgParentY += parentPos.y
      })
      avgParentX /= processedParents.length
      avgParentY /= processedParents.length
      
      // Calculate angle from center to average parent position
      const parentAngle = Math.atan2(avgParentY - centerY, avgParentX - centerX)
      
      // Count siblings at this level with same parent
      const siblings = currentLevelNodes.filter(sibling => {
        const siblingParents = nodeParents.get(sibling.id) || []
        return siblingParents.some(p => processedParents.includes(p))
      })
      
      const siblingIndex = siblings.indexOf(node)
      const siblingCount = siblings.length
      
      // Calculate position in sector
      const radius = baseRadius + (level * nodeSpacing * 1.8)
      let nodeAngle = parentAngle
      
      // Spread siblings in an arc around the parent direction
      if (siblingCount > 1) {
        const arcSpan = Math.min(Math.PI / 3, (siblingCount - 1) * 0.3) // Max 60 degree spread
        const angleOffset = (siblingIndex - (siblingCount - 1) / 2) * (arcSpan / Math.max(1, siblingCount - 1))
        nodeAngle += angleOffset
      }
      
      const pos = {
        x: centerX + Math.cos(nodeAngle) * radius,
        y: centerY + Math.sin(nodeAngle) * radius
      }
      
      nodePositions.set(node.id, pos)
      layoutedNodes.push({
        ...node,
        position: pos
      })
      
      processedNodes.add(node.id)
    })
  }
  
  // Add any remaining nodes that weren't processed (shouldn't happen in a connected graph)
  nodes.forEach(node => {
    if (!layoutedNodes.find(n => n.id === node.id)) {
      const level = nodeLevels.get(node.id) || 0
      const radius = baseRadius + (level * nodeSpacing * 1.8)
      const angle = Math.random() * 2 * Math.PI
      
      layoutedNodes.push({
        ...node,
        position: {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        }
      })
    }
  })

  return layoutedNodes
}

/**
 * Calculate subway-style layout - uses longest-path ranking for parallel tracks
 */
function calculateSubwayLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  direction: string,
  nodeSpacing: number,
  rankSpacing: number,
  align?: string,
  ranker?: string
): GraphNode[] {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  
  // Subway-specific configuration
  const graphConfig: any = {
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    ranker: ranker || 'longest-path', // Use longest-path for subway effect
    align: align || 'UL', // Upper-left alignment for clean tracks
    acyclicer: 'greedy' // Handle cycles efficiently
  }
  
  dagreGraph.setGraph(graphConfig)

  // Add nodes with subway-specific sizing
  nodes.forEach(node => {
    const nodeStyle = node.data.type === 'item' ? NODE_STYLES.item : NODE_STYLES.craft
    dagreGraph.setNode(node.id, {
      width: nodeStyle.width,
      height: nodeStyle.height * 0.8 // Slightly smaller for subway aesthetic
    })
  })

  // Add edges with weight based on connection importance
  edges.forEach(edge => {
    // Give higher weight to edges involving base resources
    const sourceNode = nodes.find(n => n.id === edge.source)
    
    let weight = 1
    if (sourceNode?.data.type === 'item' && BASE_CRAFT_ITEMS.has(sourceNode.id)) {
      weight = 3 // High weight for base resource connections
    }
    
    dagreGraph.setEdge(edge.source, edge.target, { weight })
  })

  // Calculate layout
  dagre.layout(dagreGraph)

  // Apply positions to nodes
  return nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const nodeStyle = node.data.type === 'item' ? NODE_STYLES.item : NODE_STYLES.craft
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeStyle.width / 2,
        y: nodeWithPosition.y - (nodeStyle.height * 0.8) / 2
      }
    }
  })
}

/**
 * Apply visibility filtering to nodes and edges
 * Instead of hiding nodes, they are faded out for better graph structure visibility
 */
export function filterGraphData(
  allNodes: GraphNode[],
  allEdges: GraphEdge[],
  visibleProfessions: Set<string>
): GraphData {
  
  // Add visibility state to all nodes based on profession filtering
  const nodesWithVisibility = allNodes.map(node => {
    // Check profession visibility
    const professionId = node.data.id.split(':')[1] // Extract profession from ID format (e.g., "foraging")
    
    // Convert profession ID to the correct name format for comparison
    // Capitalize the first letter for all professions (including "any" -> "Any")
    const professionName = professionId.charAt(0).toUpperCase() + professionId.slice(1)
    
    const isVisible = visibleProfessions.has(professionName)
    
    return {
      ...node,
      data: {
        ...node.data,
        isVisible
      }
    }
  })
  
  // Add visibility state to edges based on connected nodes
  const edgesWithVisibility = allEdges.map(edge => {
    const sourceNode = nodesWithVisibility.find(n => n.id === edge.source)
    const targetNode = nodesWithVisibility.find(n => n.id === edge.target)
    
    // Edge is visible if both connected nodes are visible
    const isVisible = sourceNode?.data.isVisible && targetNode?.data.isVisible
    
    return {
      ...edge,
      data: {
        ...edge.data,
        isVisible
      }
    }
  })
  
  return {
    nodes: nodesWithVisibility,
    edges: edgesWithVisibility
  }
}

/**
 * Get connected nodes for highlighting
 */
export function getConnectedNodes(
  nodeId: string,
  edges: GraphEdge[],
  direction: 'incoming' | 'outgoing' | 'both' = 'both'
): Set<string> {
  const connected = new Set<string>()
  
  edges.forEach(edge => {
    if (direction === 'incoming' || direction === 'both') {
      if (edge.target === nodeId) {
        connected.add(edge.source)
      }
    }
    
    if (direction === 'outgoing' || direction === 'both') {
      if (edge.source === nodeId) {
        connected.add(edge.target)
      }
    }
  })
  
  return connected
}

/**
 * Detect circular dependencies in graph
 */
export function detectCircularDependencies(edges: GraphEdge[]): string[][] {
  const graph = new Map<string, string[]>()
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const cycles: string[][] = []
  
  // Build adjacency list
  edges.forEach(edge => {
    if (!graph.has(edge.source)) {
      graph.set(edge.source, [])
    }
    graph.get(edge.source)!.push(edge.target)
  })
  
  function dfs(node: string, path: string[]): void {
    if (recursionStack.has(node)) {
      // Found cycle - extract it from current path
      const cycleStart = path.indexOf(node)
      cycles.push(path.slice(cycleStart).concat(node))
      return
    }
    
    if (visited.has(node)) {
      return
    }
    
    visited.add(node)
    recursionStack.add(node)
    path.push(node)
    
    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      dfs(neighbor, [...path])
    }
    
    recursionStack.delete(node)
  }
  
  // Check all nodes
  for (const [node] of graph) {
    if (!visited.has(node)) {
      dfs(node, [])
    }
  }
  
  return cycles
}

/**
 * Calculate node bounds for viewport fitting
 */
export function calculateNodeBounds(nodes: GraphNode[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  
  nodes.forEach(node => {
    const nodeStyle = node.data.type === 'item' ? NODE_STYLES.item : NODE_STYLES.craft
    const x = node.position?.x || 0
    const y = node.position?.y || 0
    
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + nodeStyle.width)
    maxY = Math.max(maxY, y + nodeStyle.height)
  })
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

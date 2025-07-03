import dagre from 'dagre'
import { GraphNode, GraphEdge, LayoutOptions, GraphData } from '../types'
import { DEFAULT_LAYOUT_OPTIONS, NODE_STYLES } from './constants'

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
 * Calculate layout positions for nodes using Dagre
 */
export function calculateLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS
): GraphNode[] {
  const { direction, nodeSpacing, rankSpacing } = { ...DEFAULT_LAYOUT_OPTIONS, ...options }
  
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing
  })

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

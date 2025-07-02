import dagre from 'dagre'
import { GraphNode, GraphEdge, LayoutOptions, GraphData } from '../types'
import { DEFAULT_LAYOUT_OPTIONS, NODE_STYLES } from './constants'

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
 * Filter nodes and edges based on visible professions and search query
 */
export function filterGraphData(
  allNodes: GraphNode[],
  allEdges: GraphEdge[],
  visibleProfessions: Set<string>,
  searchQuery: string = ''
): GraphData {
  const query = searchQuery.toLowerCase().trim()
  
  // Filter nodes
  const visibleNodes = allNodes.filter(node => {
    // Check profession visibility
    const professionId = node.data.id.split(':')[1] // Extract profession from ID format (e.g., "foraging")
    
    // Convert profession ID to the correct name format for comparison
    // Special case: "any" stays lowercase, others get capitalized
    const professionName = professionId === 'any' ? 'any' : professionId.charAt(0).toUpperCase() + professionId.slice(1)
    
    if (!visibleProfessions.has(professionName)) {
      return false
    }
    
    // Check search query
    if (query) {
      const name = node.data.name.toLowerCase()
      const description = 'description' in node.data && typeof node.data.description === 'string' 
        ? node.data.description.toLowerCase() 
        : ''
      return name.includes(query) || description.includes(query)
    }
    
    return true
  })
  
  const visibleNodeIds = new Set(visibleNodes.map(node => node.id))
  
  // Filter edges to only include connections between visible nodes
  const visibleEdges = allEdges.filter(edge => 
    visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  )
  
  return {
    nodes: visibleNodes,
    edges: visibleEdges
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

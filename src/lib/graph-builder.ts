import { ItemData, CraftData, ProfessionData, GraphNode, GraphEdge, GraphData } from '../types'
import { calculateLayout, extractProfessionFromId } from './utils'
import { PROFESSION_COLORS } from './constants'

/**
 * Build React Flow graph data from BitCrafty JSON data
 */
export function buildGraphData(
  items: ItemData[],
  crafts: CraftData[],
  professions: ProfessionData[]
): GraphData {
  console.log('Building graph data from:', {
    items: items.length,
    crafts: crafts.length,
    professions: professions.length
  })
  
  // Create profession color lookup
  const professionColors = professions.reduce((acc, profession) => {
    acc[profession.name] = profession.color
    return acc
  }, {} as Record<string, string>)

  // Generate item nodes
  const itemNodes: GraphNode[] = items.map(item => createItemNode(item, professionColors))
  console.log('Created item nodes:', itemNodes.length)
  
  // Generate craft nodes
  const craftNodes: GraphNode[] = crafts.map(craft => createCraftNode(craft, professionColors))
  console.log('Created craft nodes:', craftNodes.length)
  
  // Generate edges
  const edges: GraphEdge[] = []
  
  crafts.forEach(craft => {
    // Input edges: item → craft (using materials array)
    if (craft.materials) {
      craft.materials.forEach((material, index) => {
        const qty = typeof material.qty === 'number' ? material.qty : 1
        edges.push({
          id: `input-${craft.id}-${material.item}-${index}`,
          source: material.item,
          target: craft.id,
          type: 'default',
          style: { stroke: '#89dceb', strokeWidth: 2 }, // cyan for inputs
          label: qty > 1 ? `${qty}` : undefined,
          labelStyle: { fill: '#fcfcfa', fontSize: '10px' }
        })
      })
    }
    
    // Output edges: craft → item
    if (craft.outputs) {
      craft.outputs.forEach((output, index) => {
        const qty = typeof output.qty === 'number' ? output.qty : 1
        edges.push({
          id: `output-${craft.id}-${output.item}-${index}`,
          source: craft.id,
          target: output.item,
          type: 'default',
          style: { stroke: '#f5c2e7', strokeWidth: 2 }, // pink for outputs
          label: qty > 1 ? `${qty}` : undefined,
          labelStyle: { fill: '#fcfcfa', fontSize: '10px' }
        })
      })
    }
  })
  
  console.log('Created edges:', edges.length)
  
  // Combine all nodes
  const allNodes = [...itemNodes, ...craftNodes]
  console.log('Total nodes before layout:', allNodes.length)
  
  // Apply hierarchical layout using Dagre - but make it safe
  let layoutedNodes: GraphNode[]
  try {
    layoutedNodes = calculateLayout(allNodes, edges)
    console.log('Layout calculation successful')
  } catch (error) {
    console.error('Layout calculation failed, using basic positioning:', error)
    // Fallback to simple grid layout
    layoutedNodes = allNodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 10) * 150,
        y: Math.floor(index / 10) * 100
      }
    }))
  }
  
  const result = {
    nodes: layoutedNodes,
    edges
  }
  
  console.log('Graph data build complete:', result)
  return result
}

/**
 * Create an item node for React Flow
 */
function createItemNode(item: ItemData, professionColors: Record<string, string>): GraphNode {
  const profession = extractProfessionFromId(item.id)
  const color = professionColors[profession] || 
    (PROFESSION_COLORS as any)[profession] || 
    '#727072'
  
  return {
    id: item.id,
    type: 'item',
    position: { x: 0, y: 0 }, // Will be calculated by layout
    data: {
      ...item,
      type: 'item',
      selected: false,
      visible: true
    },
    style: {
      background: '#1e1e2e',
      border: `2px solid ${color}`,
      borderRadius: '8px',
      padding: '8px 12px',
      color: '#fcfcfa',
      fontSize: '12px',
      minWidth: '120px',
      textAlign: 'center',
      fontWeight: 'normal'
    }
  }
}

/**
 * Create a craft node for React Flow
 */
function createCraftNode(craft: CraftData, professionColors: Record<string, string>): GraphNode {
  const profession = extractProfessionFromId(craft.id)
  const color = professionColors[profession] || 
    (PROFESSION_COLORS as any)[profession] || 
    '#727072'
  
  return {
    id: craft.id,
    type: 'craft',
    position: { x: 0, y: 0 }, // Will be calculated by layout
    data: {
      ...craft,
      type: 'craft',
      selected: false,
      visible: true
    },
    style: {
      background: '#1e1e2e',
      border: `2px solid ${color}`,
      borderRadius: '20px',
      padding: '6px 16px',
      color: '#fcfcfa',
      fontSize: '11px',
      minWidth: '100px',
      textAlign: 'center',
      fontWeight: 'normal'
    }
  }
}

/**
 * Filter nodes by profession
 */
export function filterNodesByProfessions(
  nodes: GraphNode[],
  visibleProfessions: Set<string>
): GraphNode[] {
  return nodes.filter(node => {
    const profession = extractProfessionFromId(node.id)
    return visibleProfessions.has(profession)
  })
}

/**
 * Filter edges to only show connections between visible nodes
 */
export function filterEdgesByVisibleNodes(
  edges: GraphEdge[],
  visibleNodeIds: Set<string>
): GraphEdge[] {
  return edges.filter(edge => 
    visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  )
}

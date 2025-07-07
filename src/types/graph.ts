// React Flow and graph-related types
import { Node, Edge } from 'reactflow'
import { ItemData, CraftData } from './data'

// Custom node data types
export interface ItemNodeData extends ItemData {
  type: 'item'
  selected?: boolean
  visible?: boolean
  isVisible?: boolean // Visibility state based on profession filtering
  color?: string // Profession color for styling
  profession?: string // Extracted profession name
  isSelected?: boolean // Selection state from store
  isHovered?: boolean // Hover state from store
  isSearchHighlighted?: boolean // Search highlighting state
  isSubtreeFaded?: boolean // Subtree mode fading state
}

export interface CraftNodeData extends CraftData {
  type: 'craft'
  selected?: boolean
  visible?: boolean
  isVisible?: boolean // Visibility state based on profession filtering
  color?: string // Profession color for styling
  profession?: string // Extracted profession name
  isSelected?: boolean // Selection state from store
  isHovered?: boolean // Hover state from store
  isSearchHighlighted?: boolean // Search highlighting state
  isSubtreeFaded?: boolean // Subtree mode fading state
}

export type NodeData = ItemNodeData | CraftNodeData

// React Flow node and edge types
export type GraphNode = Node<NodeData>
export type GraphEdge = Edge

// Graph data container
export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// Layout options
export interface LayoutOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL'
  nodeSpacing?: number
  rankSpacing?: number
}

// Focus options for node selection
export interface FocusOptions {
  scale?: number
  duration?: number
  padding?: number
}

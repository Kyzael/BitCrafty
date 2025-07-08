import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { CraftNodeData } from '../../../types'
import { useLayoutPreset } from '../../../lib/store'

interface CraftNodeProps extends NodeProps<CraftNodeData> {
  isSelected?: boolean
  isHovered?: boolean
  isSearchHighlighted?: boolean
}

// Calculate handle positions for radial layout
function calculateRadialHandlePositions(nodePosition: { x: number; y: number }) {
  const centerX = 600 // Match the center from radial layout
  const centerY = 500
  
  // Calculate angle from center to node
  const dx = nodePosition.x - centerX
  const dy = nodePosition.y - centerY
  const angle = Math.atan2(dy, dx)
  
  // Calculate positions for input (toward center) and output (away from center) handles
  const handleOffset = 25 // Distance from node center to handle (smaller for craft nodes)
  
  const inputHandle = {
    x: -Math.cos(angle) * handleOffset,
    y: -Math.sin(angle) * handleOffset,
  }
  
  const outputHandle = {
    x: Math.cos(angle) * handleOffset,
    y: Math.sin(angle) * handleOffset,
  }
  
  return { inputHandle, outputHandle }
}

export const CraftNode = memo<CraftNodeProps>(({ data, isSelected = false, isHovered = false, isSearchHighlighted = false, ...nodeProps }) => {
  const layoutPreset = useLayoutPreset()
  const isRadialLayout = layoutPreset === 'radial'
  
  // Use the color stored in the data by graph-builder
  const color = data.color || '#727072'
  
  // Check if node is visible based on profession filtering
  const isVisible = data.isVisible !== false // Default to visible if not specified
  
  // Enhanced styling based on interaction state
  const getBorderStyle = () => {
    if (isSelected) {
      return `3px solid ${color}`
    } else if (isHovered) {
      return `2px solid ${color}`
    } else if (isSearchHighlighted) {
      return `2px solid #78dce8` // Search highlight color
    } else {
      return `2px solid ${color}`
    }
  }
  
  const getBoxShadow = () => {
    if (isSelected) {
      return `0 0 12px ${color}80` // 50% opacity
    } else if (isHovered) {
      return `0 0 8px ${color}40` // 25% opacity
    } else if (isSearchHighlighted) {
      return `0 0 8px #78dce840` // Search highlight glow
    } else {
      return 'none'
    }
  }
  
  const getBackgroundColor = () => {
    if (isSearchHighlighted) {
      return '#78dce820' // Light search highlight background
    } else {
      return 'transparent'
    }
  }
  
  const getOpacity = () => {
    // Fade out invisible nodes but keep them visible in the graph
    if (!isVisible) {
      return 0.2
    }
    
    // Also fade out nodes marked as subtree faded
    if (data.isSubtreeFaded) {
      return 0.15
    }
    
    return 1
  }
  
  // Calculate handle positions for radial layout
  let inputHandleStyle: React.CSSProperties = { opacity: 0, pointerEvents: 'none' }
  let outputHandleStyle: React.CSSProperties = { opacity: 0, pointerEvents: 'none' }
  let inputPosition = Position.Top
  let outputPosition = Position.Bottom
  
  if (isRadialLayout && nodeProps.xPos !== undefined && nodeProps.yPos !== undefined) {
    const positions = calculateRadialHandlePositions({ x: nodeProps.xPos, y: nodeProps.yPos })
    
    inputHandleStyle = {
      opacity: 0,
      pointerEvents: 'none',
      left: `calc(50% + ${positions.inputHandle.x}px)`,
      top: `calc(50% + ${positions.inputHandle.y}px)`,
      position: 'absolute'
    }
    
    outputHandleStyle = {
      opacity: 0,
      pointerEvents: 'none',
      left: `calc(50% + ${positions.outputHandle.x}px)`,
      top: `calc(50% + ${positions.outputHandle.y}px)`,
      position: 'absolute'
    }
    
    // Use Left position with custom positioning for radial layout
    inputPosition = Position.Left
    outputPosition = Position.Left
  }
  
  return (
    <div 
      style={{
        background: getBackgroundColor(),
        border: getBorderStyle(),
        borderRadius: '20px',
        padding: '6px 16px',
        color: '#fcfcfa',
        fontSize: '13px',
        fontWeight: 'bold',
        minWidth: '100px',
        textAlign: 'center',
        boxShadow: getBoxShadow(),
        cursor: 'pointer',
        textShadow: '0 1px 2px #000',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s ease-in-out',
        opacity: getOpacity(),
        pointerEvents: isVisible ? 'auto' : 'none' // Prevent interactions with faded nodes
      }}
    >
      <Handle 
        type="target" 
        position={inputPosition}
        style={inputHandleStyle}
      />
      {data.name}
      <Handle 
        type="source" 
        position={outputPosition}
        style={outputHandleStyle}
      />
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.id === nextProps.id &&
    prevProps.data.name === nextProps.data.name &&
    prevProps.data.color === nextProps.data.color &&
    prevProps.data.isVisible === nextProps.data.isVisible &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.isSearchHighlighted === nextProps.isSearchHighlighted &&
    prevProps.xPos === nextProps.xPos &&
    prevProps.yPos === nextProps.yPos
  )
})

CraftNode.displayName = 'CraftNode'

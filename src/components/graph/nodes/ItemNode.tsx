import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ItemNodeData } from '../../../types'

interface ItemNodeProps extends NodeProps<ItemNodeData> {
  isSelected?: boolean
  isHovered?: boolean
}

export const ItemNode = memo<ItemNodeProps>(({ data, isSelected = false, isHovered = false }) => {
  // Use the color stored in the data by graph-builder
  const color = data.color || '#727072'
  
  // Enhanced styling based on interaction state
  const getBorderStyle = () => {
    if (isSelected) {
      return `3px solid ${color}`
    } else if (isHovered) {
      return `2px solid ${color}`
    } else {
      return `2px solid ${color}`
    }
  }
  
  const getBoxShadow = () => {
    if (isSelected) {
      return `0 0 12px ${color}80` // 50% opacity
    } else if (isHovered) {
      return `0 0 8px ${color}40` // 25% opacity
    } else {
      return 'none'
    }
  }
  
  return (
    <div 
      style={{
        background: 'transparent',
        border: getBorderStyle(),
        borderRadius: '8px',
        padding: '8px 12px',
        color: '#fcfcfa',
        fontSize: '13px',
        fontWeight: 'bold',
        minWidth: '120px',
        textAlign: 'center',
        boxShadow: getBoxShadow(),
        cursor: 'pointer',
        textShadow: '0 1px 2px #000',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ opacity: 0, pointerEvents: 'none' }} 
      />
      {data.name}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ opacity: 0, pointerEvents: 'none' }} 
      />
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.id === nextProps.id &&
    prevProps.data.name === nextProps.data.name &&
    prevProps.data.color === nextProps.data.color &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHovered === nextProps.isHovered
  )
})

ItemNode.displayName = 'ItemNode'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { CraftNodeData } from '../../../types'

export const CraftNode = memo<NodeProps<CraftNodeData>>(({ data, selected }) => {
  // Use the color stored in the data by graph-builder
  const color = data.color || '#727072'
  
  return (
    <div 
      style={{
        background: 'transparent', // Remove background
        border: `2px solid ${color}`,
        borderRadius: '20px',
        padding: '6px 16px',
        color: '#fcfcfa', // Very light text color
        fontSize: '13px', // Slightly larger font
        fontWeight: 'bold', // Always bold for better visibility
        minWidth: '100px',
        textAlign: 'center',
        boxShadow: selected ? `0 0 8px ${color}` : 'none',
        cursor: 'pointer'
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ opacity: 0, pointerEvents: 'none' }} 
      />
      <div style={{ 
        textShadow: '0 1px 2px #000', // Text shadow for better readability
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {data.name}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ opacity: 0, pointerEvents: 'none' }} 
      />
    </div>
  )
})

CraftNode.displayName = 'CraftNode'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ItemNodeData } from '../../../types'
import { extractProfessionFromId } from '../../../lib/utils'
import { PROFESSION_COLORS } from '../../../lib/constants'

export const ItemNode = memo<NodeProps<ItemNodeData>>(({ data, selected }) => {
  const profession = extractProfessionFromId(data.id)
  const color = profession in PROFESSION_COLORS 
    ? PROFESSION_COLORS[profession as keyof typeof PROFESSION_COLORS] 
    : '#727072'
  
  return (
    <div 
      style={{
        background: '#2d2a2e', // Darker background for better contrast
        border: `2px solid ${color}`,
        borderRadius: '8px',
        padding: '8px 12px',
        color: '#fcfcfa', // Very light text color
        fontSize: '13px', // Slightly larger font
        fontWeight: 'bold', // Always bold for better visibility
        minWidth: '120px',
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

ItemNode.displayName = 'ItemNode'

import { NodeProps } from 'reactflow'
import { ItemNode } from './ItemNode'
import { CraftNode } from './CraftNode'
import { ItemNodeData, CraftNodeData } from '../../../types'

// Wrapper for ItemNode that handles the extra props
export const ItemNodeWrapper = (props: NodeProps<ItemNodeData>) => {
  const { data } = props
  return (
    <ItemNode
      {...props}
      isSelected={data.isSelected}
      isHovered={data.isHovered}
      isSearchHighlighted={data.isSearchHighlighted}
    />
  )
}

// Wrapper for CraftNode that handles the extra props
export const CraftNodeWrapper = (props: NodeProps<CraftNodeData>) => {
  const { data } = props
  return (
    <CraftNode
      {...props}
      isSelected={data.isSelected}
      isHovered={data.isHovered}
      isSearchHighlighted={data.isSearchHighlighted}
    />
  )
}

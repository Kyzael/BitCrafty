import React from 'react'
import { useSelectedNode, useGraphData, useSelectNode } from '../../lib/store'

/**
 * NodeDetailsPanel displays comprehensive information about the selected node
 * Shows different content based on whether it's an item or craft node
 */
export const NodeDetailsPanel: React.FC = () => {
  const selectedNode = useSelectedNode()
  const graphData = useGraphData()

  if (!selectedNode) {
    return (
      <div className="details-panel sidebar-details">
        <div className="details-panel-empty">
          <p>Select a node to view details</p>
        </div>
      </div>
    )
  }

  // Find the selected node in the graph data
  const node = graphData.nodes.find(n => n.id === selectedNode)
  if (!node) {
    return (
      <div className="details-panel sidebar-details">
        <div className="details-panel-error">
          <p>Selected node not found</p>
        </div>
      </div>
    )
  }

  const isItem = node.type === 'item'
  const profession = node.data.profession || 'Unknown'
  const color = node.data.color || '#727072'

  return (
    <div className="details-panel sidebar-details">
      <div className="details-header">
        <h3>{node.data.name}</h3>
        <span 
          className="profession-badge"
          style={{ 
            backgroundColor: color,
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {profession}
        </span>
      </div>

      <div className="details-content">
        {isItem ? (
          <ItemDetails nodeId={selectedNode} nodeData={node.data} />
        ) : (
          <CraftDetails nodeId={selectedNode} nodeData={node.data} />
        )}
      </div>
    </div>
  )
}

/**
 * ItemDetails component shows item-specific information
 */
interface ItemDetailsProps {
  nodeId: string
  nodeData: any
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ nodeId, nodeData }) => {
  const graphData = useGraphData()
  const selectNode = useSelectNode()
  
  // Find crafts that use this item as input
  const usedInCrafts = graphData.edges
    .filter(edge => edge.source === nodeId)
    .map(edge => graphData.nodes.find(n => n.id === edge.target))
    .filter(node => node && node.type === 'craft')

  // Find crafts that produce this item as output
  const producedByCrafts = graphData.edges
    .filter(edge => edge.target === nodeId)
    .map(edge => graphData.nodes.find(n => n.id === edge.source))
    .filter(node => node && node.type === 'craft')

  const handleCraftClick = (craftId: string) => {
    selectNode(craftId)
  }

  return (
    <div className="item-details">
      <div className="details-section">
        <h4>Item Information</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Type:</span>
            <span className="value">Item</span>
          </div>
          {nodeData.tier && (
            <div className="info-item">
              <span className="label">Tier:</span>
              <span className="value">{nodeData.tier}</span>
            </div>
          )}
          {nodeData.rank && (
            <div className="info-item">
              <span className="label">Rank:</span>
              <span className="value">{nodeData.rank}</span>
            </div>
          )}
        </div>
      </div>

      {producedByCrafts.length > 0 && (
        <div className="details-section">
          <h4>Produced By ({producedByCrafts.length})</h4>
          <div className="craft-list">
            {producedByCrafts.map(craft => (
              <div 
                key={craft!.id} 
                className="craft-item clickable"
                onClick={() => handleCraftClick(craft!.id)}
              >
                <span className="craft-name">{craft!.data.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {usedInCrafts.length > 0 && (
        <div className="details-section">
          <h4>Used In ({usedInCrafts.length})</h4>
          <div className="craft-list">
            {usedInCrafts.map(craft => (
              <div 
                key={craft!.id} 
                className="craft-item clickable"
                onClick={() => handleCraftClick(craft!.id)}
              >
                <span className="craft-name">{craft!.data.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {producedByCrafts.length === 0 && usedInCrafts.length === 0 && (
        <div className="details-section">
          <p className="no-connections">No crafting connections found</p>
        </div>
      )}
    </div>
  )
}

/**
 * CraftDetails component shows craft-specific information
 */
interface CraftDetailsProps {
  nodeId: string
  nodeData: any
}

const CraftDetails: React.FC<CraftDetailsProps> = ({ nodeId }) => {
  const graphData = useGraphData()
  const selectNode = useSelectNode()
  
  // Find items that are inputs to this craft
  const inputItems = graphData.edges
    .filter(edge => edge.target === nodeId)
    .map(edge => graphData.nodes.find(n => n.id === edge.source))
    .filter(node => node && node.type === 'item')

  // Find items that are outputs from this craft
  const outputItems = graphData.edges
    .filter(edge => edge.source === nodeId)
    .map(edge => graphData.nodes.find(n => n.id === edge.target))
    .filter(node => node && node.type === 'item')

  const handleItemClick = (itemId: string) => {
    selectNode(itemId)
  }

  return (
    <div className="craft-details">
      <div className="details-section">
        <h4>Craft Information</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Type:</span>
            <span className="value">Craft</span>
          </div>
        </div>
      </div>

      {inputItems.length > 0 && (
        <div className="details-section">
          <h4>Required Materials ({inputItems.length})</h4>
          <div className="item-list">
            {inputItems.map(item => (
              <div 
                key={item!.id} 
                className="item-entry clickable"
                onClick={() => handleItemClick(item!.id)}
              >
                <span 
                  className="item-color-dot"
                  style={{ backgroundColor: item!.data.color }}
                />
                <span className="item-name">{item!.data.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {outputItems.length > 0 && (
        <div className="details-section">
          <h4>Produces ({outputItems.length})</h4>
          <div className="item-list">
            {outputItems.map(item => (
              <div 
                key={item!.id} 
                className="item-entry clickable"
                onClick={() => handleItemClick(item!.id)}
              >
                <span 
                  className="item-color-dot"
                  style={{ backgroundColor: item!.data.color }}
                />
                <span className="item-name">{item!.data.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {inputItems.length === 0 && outputItems.length === 0 && (
        <div className="details-section">
          <p className="no-connections">No material connections found</p>
        </div>
      )}
    </div>
  )
}

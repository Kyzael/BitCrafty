import React, { useRef, useEffect, useState } from 'react'
import { useSelectedNode, useGraphData, useSelectNode, useAddToEnhancedQueue, useCrafts, useRequirements, useThemeColors } from '../../lib/store'

/**
 * Simple error boundary component for NodeDetailsPanel
 */
class NodeDetailsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NodeDetailsPanel error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '12px',
          textAlign: 'center',
          color: '#ff6188', // Using a fallback error color since we can't access theme here
          fontSize: '14px'
        }}>
          <p>Error loading node details</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              background: '#ff6188',
              border: 'none',
              borderRadius: '3px',
              color: '#1e1e2e',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * NodeDetailsPanel displays comprehensive information about the selected node
 * Features:
 * - Tab/Shift+Tab navigation through clickable elements
 * - Enter key to activate focused buttons
 * - Keyboard accessibility for all interactive elements
 */
const NodeDetailsPanelInner: React.FC = () => {
  const selectedNode = useSelectedNode()
  const graphData = useGraphData()
  const themeColors = useThemeColors()
  const panelRef = useRef<HTMLDivElement>(null)

  // Set up keyboard navigation for the details panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedNode || !panelRef.current) return

      // Only handle if focus is within the details panel
      const isWithinPanel = panelRef.current.contains(document.activeElement)
      if (!isWithinPanel) return

      switch (e.key) {
        case 'Tab':
          // Let browser handle normal tab navigation
          break
        case 'Enter':
        case ' ': // Space bar
          e.preventDefault()
          const focusedElement = document.activeElement as HTMLElement
          if (focusedElement && focusedElement.click) {
            focusedElement.click()
          }
          break
        case 'Escape':
          // Move focus back to main graph area
          e.preventDefault()
          panelRef.current?.blur()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode])

  if (!selectedNode) {
    return (
      <div style={{ 
        padding: '12px',
        background: themeColors.surface,
        border: `1px solid ${themeColors.overlay}`,
        borderRadius: '4px'
      }} ref={panelRef}>
        <div style={{
          textAlign: 'center',
          color: themeColors.muted,
          fontSize: '14px'
        }}>
          <p>Select a node to view details</p>
        </div>
      </div>
    )
  }

  // Find the selected node in the graph data
  const node = graphData.nodes.find(n => n.id === selectedNode)
  if (!node) {
    return (
      <div style={{ 
        padding: '12px',
        background: themeColors.surface,
        border: `1px solid ${themeColors.overlay}`,
        borderRadius: '4px'
      }} ref={panelRef}>
        <div style={{
          textAlign: 'center',
          color: themeColors.love,
          fontSize: '14px'
        }}>
          <p>Selected node not found</p>
        </div>
      </div>
    )
  }

  const isItem = node.type === 'item'
  const profession = node.data.profession || 'Unknown'
  const color = node.data.color || '#727072'

  return (
    <div style={{ 
      padding: '12px',
      background: themeColors.surface,
      border: `1px solid ${themeColors.overlay}`,
      borderRadius: '4px'
    }} ref={panelRef} tabIndex={-1}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 
          style={{
            fontSize: '12px',
            margin: 0,
            fontWeight: 'bold',
            color: themeColors.text,
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {node.data.name}
        </h3>
        <span 
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

      <div style={{ 
        background: themeColors.background,
        border: `1px solid ${themeColors.overlay}`,
        borderRadius: '4px',
        padding: '8px'
      }}>
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
  const addToEnhancedQueue = useAddToEnhancedQueue()
  const [queueQuantity, setQueueQuantity] = useState<number>(1)
  
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

  const handleAddToEnhancedQueue = () => {
    addToEnhancedQueue(nodeId, queueQuantity, `Added from item details: ${nodeData.name}`)
  }

  return (
    <div className="item-details">
      <div className="details-section">
        <div className="info-line" style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div className="info-item" style={{ display: 'flex', gap: '4px' }}>
            <span className="label">Type:</span>
            <span className="value">Item</span>
          </div>
          {nodeData.tier && (
            <div className="info-item" style={{ display: 'flex', gap: '4px' }}>
              <span className="label">Tier:</span>
              <span className="value">{nodeData.tier}</span>
            </div>
          )}
          {nodeData.rank && (
            <div className="info-item" style={{ display: 'flex', gap: '4px' }}>
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
              <button
                key={craft!.id} 
                className="craft-item clickable navigation-button"
                onClick={() => handleCraftClick(craft!.id)}
                tabIndex={0}
                style={{
                  background: 'transparent',
                  border: '1px solid #5c5c5c',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  color: '#fcfcfa',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#78dce8'
                  e.currentTarget.style.backgroundColor = '#78dce822'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#5c5c5c'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#78dce8'
                  e.currentTarget.style.backgroundColor = '#78dce822'
                  e.currentTarget.style.outline = '2px solid #78dce8'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#5c5c5c'
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.outline = 'none'
                }}
              >
                <span 
                  className="craft-color-dot"
                  style={{ 
                    backgroundColor: craft!.data.color,
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    flexShrink: 0
                  }}
                />
                <span className="craft-name">{craft!.data.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {usedInCrafts.length > 0 && (
        <div className="details-section">
          <h4>Used In ({usedInCrafts.length})</h4>
          <div className="craft-list">
            {usedInCrafts.map(craft => (
              <button
                key={craft!.id} 
                className="craft-item clickable navigation-button"
                onClick={() => handleCraftClick(craft!.id)}
                tabIndex={0}
                style={{
                  background: 'transparent',
                  border: '1px solid #5c5c5c',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  color: '#fcfcfa',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#78dce8'
                  e.currentTarget.style.backgroundColor = '#78dce822'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#5c5c5c'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#78dce8'
                  e.currentTarget.style.backgroundColor = '#78dce822'
                  e.currentTarget.style.outline = '2px solid #78dce8'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#5c5c5c'
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.outline = 'none'
                }}
              >
                <span 
                  className="craft-color-dot"
                  style={{ 
                    backgroundColor: craft!.data.color,
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    flexShrink: 0
                  }}
                />
                <span className="craft-name">{craft!.data.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {producedByCrafts.length === 0 && usedInCrafts.length === 0 && (
        <div className="details-section">
          <p className="no-connections">No crafting connections found</p>
        </div>
      )}

      {/* Streamlined Queue Controls */}
      <div className="details-section">
        <div className="inline-queue-controls">
          <input
            type="number"
            min="1"
            max="999"
            value={queueQuantity}
            onChange={(e) => setQueueQuantity(parseInt(e.target.value) || 1)}
            className="inline-qty-input"
            title="Quantity to add to queue"
          />
          <button
            onClick={handleAddToEnhancedQueue}
            className="inline-queue-btn"
            title="Add to crafting queue"
          >
            Queue
          </button>
        </div>
      </div>
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
  const crafts = useCrafts()
  const requirements = useRequirements()
  
  // Get the actual craft data
  const craftData = crafts[nodeId]
  
  // Get the requirement data if it exists
  const requirementData = craftData?.requirement ? requirements[craftData.requirement] : null
  
  // Find items that are inputs to this craft with quantities
  const inputItems = craftData?.materials?.map(material => {
    const node = graphData.nodes.find(n => n.id === material.item)
    return node ? { node, quantity: material.qty } : null
  }).filter(Boolean) || []

  // Find items that are outputs from this craft with quantities
  const outputItems = craftData?.outputs?.map(output => {
    const node = graphData.nodes.find(n => n.id === output.item)
    return node ? { 
      node, 
      quantity: output.qty
    } : null
  }).filter(Boolean) || []

  const handleItemClick = (itemId: string) => {
    selectNode(itemId)
  }

  return (
    <div className="craft-details">
      <div className="details-section">
        <div className="info-line" style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div className="info-item" style={{ display: 'flex', gap: '4px' }}>
            <span className="label">Type:</span>
            <span className="value">Craft</span>
          </div>
        </div>
      </div>

      {requirementData && (
        <div className="details-section">
          <h4>Requires:</h4>
          <div className="requirement-details" style={{ fontSize: '12px', color: '#a6a6a6' }}>
            {requirementData.tool && (
              <div>Tool: {requirementData.tool.name.replace('tool:', '')} (Level {requirementData.tool.level})</div>
            )}
            {requirementData.building && (
              <div>Building: {requirementData.building.name.replace('building:', '').replace(/:/g, ' - ')} (Level {requirementData.building.level})</div>
            )}
          </div>
        </div>
      )}

      {craftData?.requirement && !requirementData && (
        <div className="details-section">
          <div className="info-line" style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div className="info-item" style={{ display: 'flex', gap: '4px' }}>
              <span className="label">Requires:</span>
              <span className="value" style={{ fontSize: '11px' }}>
                {craftData.requirement.replace('requirement:', '').replace(/:/g, ' - ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {inputItems.length > 0 && (
        <div className="details-section">
          <h4>Required Materials ({inputItems.length})</h4>
          <div className="item-list">
            {inputItems.map(item => (
              <button
                key={item!.node.id} 
                className="item-entry clickable navigation-button"
                onClick={() => handleItemClick(item!.node.id)}
                tabIndex={0}
                style={{
                  background: 'transparent',
                  border: '1px solid #5c5c5c',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  color: '#fcfcfa',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#78dce8'
                  e.currentTarget.style.backgroundColor = '#78dce822'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#5c5c5c'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#78dce8'
                  e.currentTarget.style.backgroundColor = '#78dce822'
                  e.currentTarget.style.outline = '2px solid #78dce8'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#5c5c5c'
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.outline = 'none'
                }}
              >
                <span 
                  className="item-color-dot"
                  style={{ 
                    backgroundColor: item!.node.data.color,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    flexShrink: 0
                  }}
                />
                <span className="item-name" style={{ fontSize: '13px' }}>
                  {item!.node.data.name} x{item!.quantity}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {outputItems.length > 0 && (
        <div className="details-section">
          <h4>Produces ({outputItems.length})</h4>
          <div className="item-list">
            {outputItems.map(item => (
              <button
                key={item!.node.id} 
                className="item-entry clickable navigation-button"
                onClick={() => handleItemClick(item!.node.id)}
                tabIndex={0}
                style={{
                  background: 'transparent',
                  border: '1px solid #5c5c5c',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  color: '#fcfcfa',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#78dce8'
                  e.currentTarget.style.backgroundColor = '#78dce822'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#5c5c5c'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#78dce8'
                  e.currentTarget.style.backgroundColor = '#78dce822'
                  e.currentTarget.style.outline = '2px solid #78dce8'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#5c5c5c'
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.outline = 'none'
                }}
              >
                <span 
                  className="item-color-dot"
                  style={{ 
                    backgroundColor: item!.node.data.color,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    flexShrink: 0
                  }}
                />
                <span className="item-name" style={{ fontSize: '13px' }}>
                  {item!.node.data.name} x{item!.quantity}
                </span>
              </button>
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

/**
 * Main export with error boundary
 */
export const NodeDetailsPanel: React.FC = () => {
  return (
    <NodeDetailsErrorBoundary>
      <NodeDetailsPanelInner />
    </NodeDetailsErrorBoundary>
  )
}

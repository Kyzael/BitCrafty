import React, { useRef, useEffect, useState } from 'react'
import { useSelectedNode, useGraphData, useSelectNode, useAddToEnhancedQueue } from '../../lib/store'

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
        <div className="details-panel-error">
          <p>Error loading node details</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              background: '#89b4fa',
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
  const panelRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [titleFontSize, setTitleFontSize] = useState(18)

  // Auto-scale title text to fit
  useEffect(() => {
    if (!titleRef.current || !selectedNode) return

    const adjustFontSize = () => {
      const element = titleRef.current!
      const container = element.parentElement!
      
      // Reset to max size
      let fontSize = 18
      element.style.fontSize = `${fontSize}px`
      
      // Get available width (container minus padding and badge space)
      const containerWidth = container.clientWidth - 100 // Reserve space for profession badge
      
      // Reduce font size until text fits
      while (fontSize > 10 && element.scrollWidth > containerWidth) {
        fontSize -= 0.5
        element.style.fontSize = `${fontSize}px`
      }
      
      setTitleFontSize(fontSize)
    }

    // Adjust on mount and when selected node changes
    const timeoutId = setTimeout(adjustFontSize, 0)
    return () => clearTimeout(timeoutId)
  }, [selectedNode])

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
      <div className="details-panel sidebar-details" ref={panelRef}>
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
      <div className="details-panel sidebar-details" ref={panelRef}>
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
    <div className="details-panel sidebar-details" ref={panelRef} tabIndex={-1}>
      <div className="details-header">
        <h3 
          ref={titleRef}
          style={{
            fontSize: `${titleFontSize}px`,
            margin: 0,
            fontWeight: 'bold',
            color: '#fcfcfa',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {node.data.name}
        </h3>
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
              <button
                key={item!.id} 
                className="item-entry clickable navigation-button"
                onClick={() => handleItemClick(item!.id)}
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
                  className="item-color-dot"
                  style={{ 
                    backgroundColor: item!.data.color,
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    flexShrink: 0
                  }}
                />
                <span className="item-name">{item!.data.name}</span>
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
                key={item!.id} 
                className="item-entry clickable navigation-button"
                onClick={() => handleItemClick(item!.id)}
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
                  className="item-color-dot"
                  style={{ 
                    backgroundColor: item!.data.color,
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    flexShrink: 0
                  }}
                />
                <span className="item-name">{item!.data.name}</span>
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

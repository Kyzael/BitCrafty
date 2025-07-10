import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import ReactFlow, { useNodesState, useEdgesState, Panel, Node } from 'reactflow'
import { filterGraphData } from '../../lib/utils'
import { useIsLoading, useGraphData, useVisibleProfessions, useSearchResults, useSelectedNode, useHoveredNode, useHighlightedEdges, useSelectNode, useSetHoveredNode, useSubtreeMode, useSubtreeNodes, useEnableSubtreeMode, useDisableSubtreeMode, useThemeColors } from '../../lib/store'
import { useFlowContext } from '../BitCraftyFlowProvider'
import { ItemNodeWrapper, CraftNodeWrapper } from './nodes/NodeWrappers'

// Define nodeTypes outside component to ensure stable reference
// Note: React Flow still shows warning due to wrapper components, but functionality works correctly
const nodeTypes = {
  item: ItemNodeWrapper,
  craft: CraftNodeWrapper
};

// Use React.memo to prevent unnecessary re-renders
function GraphContainerInner() {
  // Use memoized selectors for React 18 compatibility
  const isLoading = useIsLoading()
  const graphData = useGraphData()
  const visibleProfessions = useVisibleProfessions()
  const searchResults = useSearchResults()
  const selectedNode = useSelectedNode()
  const hoveredNode = useHoveredNode()
  const highlightedEdges = useHighlightedEdges()
  const selectNode = useSelectNode()
  const setHoveredNode = useSetHoveredNode()
  const themeColors = useThemeColors()
  
  // Subtree mode state and actions
  const subtreeMode = useSubtreeMode()
  const subtreeNodes = useSubtreeNodes()
  const enableSubtreeMode = useEnableSubtreeMode()
  const disableSubtreeMode = useDisableSubtreeMode()
  
  const { setRfInstance, rfInstance } = useFlowContext()
  
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Use a callback to store the ReactFlow instance
  const onInit = useCallback((instance: any) => {
    setRfInstance(instance)
  }, [setRfInstance])

  // Handle node clicks for selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation()
    const nodeId = node.id
    const isCurrentlySelected = selectedNode === nodeId
    
    // Toggle selection: if already selected, deselect; otherwise select
    selectNode(isCurrentlySelected ? null : nodeId)
  }, [selectedNode, selectNode])

  // Handle node hover for hover state
  const onNodeMouseEnter = useCallback((_event: React.MouseEvent, node: Node) => {
    setHoveredNode(node.id)
  }, [setHoveredNode])

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null)
  }, [setHoveredNode])

  // Handle double-click for subtree selection
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation()
    event.preventDefault()
    
    const nodeId = node.id
    
    // Enable subtree mode for this node
    enableSubtreeMode(nodeId)
    
    // Pan to the node without zooming when entering subtree mode
    if (rfInstance) {
      const reactFlowNode = rfInstance.getNode(nodeId)
      if (reactFlowNode) {
        const currentViewport = rfInstance.getViewport()
        const x = reactFlowNode.position.x + (reactFlowNode.width || 120) / 2
        const y = reactFlowNode.position.y + (reactFlowNode.height || 40) / 2
        
        // Calculate new viewport position to center the node while preserving zoom
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (containerRect) {
          const newX = containerRect.width / 2 - x * currentViewport.zoom
          const newY = containerRect.height / 2 - y * currentViewport.zoom
          
          rfInstance.setViewport({
            x: newX,
            y: newY,
            zoom: currentViewport.zoom // Preserve current zoom level
          }, {
            duration: 800
          })
        }
      }
    }
  }, [enableSubtreeMode, rfInstance])

  // Navigate to node when selectedNode changes (for search selection)
  useEffect(() => {
    if (selectedNode && rfInstance) {
      const reactFlowNode = rfInstance.getNode(selectedNode)
      if (reactFlowNode) {
        const currentViewport = rfInstance.getViewport()
        const x = reactFlowNode.position.x + (reactFlowNode.width || 120) / 2
        const y = reactFlowNode.position.y + (reactFlowNode.height || 40) / 2
        
        // Calculate new viewport position to center the node while preserving zoom
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (containerRect) {
          const newX = containerRect.width / 2 - x * currentViewport.zoom
          const newY = containerRect.height / 2 - y * currentViewport.zoom
          
          rfInstance.setViewport({
            x: newX,
            y: newY,
            zoom: currentViewport.zoom // Preserve current zoom level
          }, {
            duration: 800
          })
        }
        
      }
    }
  }, [selectedNode, rfInstance])

  // Handle background clicks to deselect or exit subtree mode
  const onPaneClick = useCallback(() => {
    if (subtreeMode) {
      // If in subtree mode, exit subtree mode on background click
      disableSubtreeMode()
    } else if (selectedNode) {
      // Otherwise, just deselect the node
      selectNode(null)
    }
  }, [selectedNode, subtreeMode, selectNode, disableSubtreeMode])

  // Handle keyboard events for subtree mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && subtreeMode) {
        disableSubtreeMode()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [subtreeMode, disableSubtreeMode])

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return
    
    const updateDimensions = () => {
      const { width, height } = containerRef.current?.getBoundingClientRect() || { width: 0, height: 0 }
      setDimensions({ width, height })
    }
    
    // Initial measurement
    updateDimensions()
    
    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current)
      }
    }
  }, [])

  // Apply visibility filtering based on visible professions and subtree mode
  const filteredData = useMemo(() => {
    if (isLoading || !graphData?.nodes?.length) {
      return { nodes: [], edges: [] }
    }
    
    // DEBUG: Check what professions are in the data vs what's in the visible set
    const uniqueProfessions = new Set<string>();
    graphData.nodes.forEach(node => {
      const professionId = node.data.id.split(':')[1]; // e.g., "foraging" or "any"
      // Capitalize the first letter for all professions (including "any" -> "Any")
      const professionName = professionId.charAt(0).toUpperCase() + professionId.slice(1);
      uniqueProfessions.add(professionName);
    });
    
    // First apply profession-based filtering
    const filtered = filterGraphData(
      graphData.nodes,
      graphData.edges,
      visibleProfessions
    )
    
    // Then apply subtree filtering if in subtree mode
    let finalNodes = filtered.nodes
    let finalEdges = filtered.edges
    
    if (subtreeMode && subtreeNodes.size > 0) {
      // In subtree mode, show all subtree nodes regardless of profession filtering
      finalNodes = filtered.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isVisible: subtreeNodes.has(node.id), // Show if in subtree, regardless of profession
          isSubtreeFaded: !subtreeNodes.has(node.id) // Mark nodes outside subtree as faded
        }
      }))
      
      // Filter edges to only show edges between subtree nodes
      finalEdges = filtered.edges.filter(edge => 
        subtreeNodes.has(edge.source) && subtreeNodes.has(edge.target)
      )
    }
    
    return { nodes: finalNodes, edges: finalEdges }
  }, [graphData, visibleProfessions, subtreeMode, subtreeNodes, isLoading])

  // Update nodes and edges when filtered data changes
  useEffect(() => {
    // Enhance nodes with selection, hover, search, and visibility state
    const enhancedNodes = filteredData.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isSelected: selectedNode === node.id,
        isHovered: hoveredNode === node.id,
        isSearchHighlighted: searchResults.has(node.id)
        // Keep the isVisible property from filterGraphData
      }
    }))
    
    // Enhance edges with highlighting and visibility state
    const enhancedEdges = filteredData.edges.map(edge => ({
      ...edge,
      style: {
        ...edge.style,
        strokeWidth: highlightedEdges.has(edge.id) ? 3 : 1,
        stroke: highlightedEdges.has(edge.id) ? '#ffd700' : edge.style?.stroke,
        opacity: edge.data?.isVisible ? (highlightedEdges.has(edge.id) ? 1 : 0.6) : 0.1,
      },
      animated: highlightedEdges.has(edge.id) && edge.data?.isVisible
    }))
    
    setNodes(enhancedNodes)
    setEdges(enhancedEdges)
  }, [filteredData, selectedNode, hoveredNode, highlightedEdges, searchResults, setNodes, setEdges])

  if (isLoading) {
    return (
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: themeColors.background,
        color: themeColors.text 
      }}>
        Loading graph...
      </div>
    )
  }

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: themeColors.background,
        color: themeColors.love 
      }}>
        No graph data available
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="react-flow-wrapper"
      style={{ 
        flex: 1, 
        height: '100%',
        width: '100%',
        position: 'relative',
        minHeight: '500px' // Provide a minimum height to ensure visibility
      }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          onInit={onInit}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          zoomOnDoubleClick={false}
          style={{ 
            background: themeColors.background,
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`
          }}
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Panel position="top-left" style={{ background: `${themeColors.surface}cc`, padding: '5px', borderRadius: '4px', color: themeColors.text, fontSize: '12px' }}>
            {nodes.length} nodes · {edges.length} connections
            {visibleProfessions.size < 11 && (
              <div style={{ fontSize: '10px', color: themeColors.love }}>
                {nodes.filter(n => n.data.isVisible).length} visible · {nodes.filter(n => !n.data.isVisible).length} faded
              </div>
            )}
            {subtreeMode && (
              <div style={{ fontSize: '10px', color: themeColors.foam, marginTop: '2px' }}>
                🌳 Subtree Mode · ESC or click background to exit
              </div>
            )}
          </Panel>
        </ReactFlow>
      )}
    </div>
  )
}

// Export a memoized version of the component
export const GraphContainer = React.memo(GraphContainerInner);

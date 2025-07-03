import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import ReactFlow, { useNodesState, useEdgesState, Panel, Node } from 'reactflow'
import { filterGraphData } from '../../lib/utils'
import { useIsLoading, useGraphData, useVisibleProfessions, useSearchResults, useSelectedNode, useHoveredNode, useHighlightedEdges, useSelectNode, useSetHoveredNode } from '../../lib/store'
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
    
    console.log('Node clicked:', nodeId, 'Selected:', !isCurrentlySelected)
  }, [selectedNode, selectNode])

  // Handle node hover for hover state
  const onNodeMouseEnter = useCallback((_event: React.MouseEvent, node: Node) => {
    setHoveredNode(node.id)
  }, [setHoveredNode])

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null)
  }, [setHoveredNode])

  // Handle double-click for smooth navigation and zoom
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation()
    event.preventDefault()
    
    const nodeId = node.id
    console.log('Node double-clicked:', nodeId)
    
    // Select the node if not already selected
    if (selectedNode !== nodeId) {
      selectNode(nodeId)
    }
    
    // Focus and zoom to the node using React Flow instance
    if (rfInstance) {
      const reactFlowNode = rfInstance.getNode(nodeId)
      if (reactFlowNode) {
        const x = reactFlowNode.position.x + (reactFlowNode.width || 120) / 2
        const y = reactFlowNode.position.y + (reactFlowNode.height || 40) / 2
        
        rfInstance.setCenter(x, y, {
          zoom: 1.2,
          duration: 800
        })
      }
    }
  }, [selectedNode, selectNode, rfInstance])

  // Navigate to node when selectedNode changes (for search selection)
  useEffect(() => {
    if (selectedNode && rfInstance) {
      const reactFlowNode = rfInstance.getNode(selectedNode)
      if (reactFlowNode) {
        const x = reactFlowNode.position.x + (reactFlowNode.width || 120) / 2
        const y = reactFlowNode.position.y + (reactFlowNode.height || 40) / 2
        
        rfInstance.setCenter(x, y, {
          zoom: 1.2,
          duration: 800
        })
        
        console.log('Navigated to selected node:', selectedNode)
      }
    }
  }, [selectedNode, rfInstance])

  // Handle background clicks to deselect
  const onPaneClick = useCallback(() => {
    if (selectedNode) {
      selectNode(null)
      console.log('Background clicked, deselecting node')
    }
  }, [selectedNode, selectNode])

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return
    
    const updateDimensions = () => {
      const { width, height } = containerRef.current?.getBoundingClientRect() || { width: 0, height: 0 }
      setDimensions({ width, height })
      console.log('ReactFlow container dimensions:', { width, height })
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

  // Apply visibility filtering based on visible professions
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
    
    const filtered = filterGraphData(
      graphData.nodes,
      graphData.edges,
      visibleProfessions
    )
    
    console.log('DEBUG - Visibility filtering:', { 
      uniqueProfessions: Array.from(uniqueProfessions).sort(),
      visibleProfessions: Array.from(visibleProfessions).sort(),
      totalNodes: graphData.nodes.length,
      visibleNodes: filtered.nodes.filter(n => n.data.isVisible).length,
      fadedNodes: filtered.nodes.filter(n => !n.data.isVisible).length
    });
    
    return filtered
  }, [graphData, visibleProfessions, isLoading])

  // Update nodes and edges when filtered data changes
  useEffect(() => {
    console.log('GraphContainer: Setting filtered data with', filteredData.nodes.length, 'nodes and', filteredData.edges.length, 'edges')
    
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
        background: '#2d2a2e',
        color: '#fcfcfa' 
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
        background: '#2d2a2e',
        color: '#f38ba8' 
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
          style={{ 
            background: '#2d2a2e',
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`
          }}
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Panel position="top-left" style={{ background: 'rgba(45, 42, 46, 0.8)', padding: '5px', borderRadius: '4px', color: '#fcfcfa', fontSize: '12px' }}>
            {nodes.length} nodes · {edges.length} connections
            {visibleProfessions.size < 11 && (
              <div style={{ fontSize: '10px', color: '#f38ba8' }}>
                {nodes.filter(n => n.data.isVisible).length} visible · {nodes.filter(n => !n.data.isVisible).length} faded
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

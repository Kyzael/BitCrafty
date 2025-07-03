import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import ReactFlow, { useNodesState, useEdgesState, Panel, Node } from 'reactflow'
import { filterGraphData } from '../../lib/utils'
import { useIsLoading, useGraphData, useVisibleProfessions, useSearchQuery, useSelectedNode, useHoveredNode, useSelectNode, useSetHoveredNode } from '../../lib/store'
import { useFlowContext, getGlobalNodeTypes } from '../BitCraftyFlowProvider'

// Get the global nodeTypes directly - do not import from another module
// This ensures we're using the exact same reference that our provider uses
const globalNodeTypes = getGlobalNodeTypes();

// Use React.memo to prevent unnecessary re-renders
function GraphContainerInner() {
  // Use memoized selectors for React 18 compatibility
  const isLoading = useIsLoading()
  const graphData = useGraphData()
  const visibleProfessions = useVisibleProfessions()
  const searchQuery = useSearchQuery()
  const selectedNode = useSelectedNode()
  const hoveredNode = useHoveredNode()
  const selectNode = useSelectNode()
  const setHoveredNode = useSetHoveredNode()
  const { setRfInstance } = useFlowContext()
  
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

  // Filter graph data based on visible professions and search
  const filteredData = useMemo(() => {
    if (isLoading || !graphData?.nodes?.length) {
      return { nodes: [], edges: [] }
    }
    
    // DEBUG: Check what professions are in the data vs what's in the visible set
    const uniqueProfessions = new Set<string>();
    graphData.nodes.forEach(node => {
      const professionId = node.data.id.split(':')[1]; // e.g., "foraging" or "any"
      // Apply same logic as filtering: "any" stays lowercase, others get capitalized
      const professionName = professionId === 'any' ? 'any' : professionId.charAt(0).toUpperCase() + professionId.slice(1);
      uniqueProfessions.add(professionName);
    });
    
    const filtered = filterGraphData(
      graphData.nodes,
      graphData.edges,
      visibleProfessions,
      searchQuery
    )
    
    console.log('DEBUG - Filtering:', { 
      uniqueProfessions: Array.from(uniqueProfessions).sort(),
      visibleProfessions: Array.from(visibleProfessions).sort(),
      totalNodes: graphData.nodes.length,
      filteredNodes: filtered.nodes.length,
      filteredEdges: filtered.edges.length
    });
    
    return filtered
  }, [graphData, visibleProfessions, searchQuery, isLoading])

  // Update nodes and edges when filtered data changes
  useEffect(() => {
    console.log('GraphContainer: Setting filtered data with', filteredData.nodes.length, 'nodes and', filteredData.edges.length, 'edges')
    
    // Enhance nodes with selection and hover state
    const enhancedNodes = filteredData.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isSelected: selectedNode === node.id,
        isHovered: hoveredNode === node.id
      }
    }))
    
    setNodes(enhancedNodes)
    setEdges(filteredData.edges)
  }, [filteredData, selectedNode, hoveredNode, setNodes, setEdges])

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
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onPaneClick={onPaneClick}
          nodeTypes={globalNodeTypes}
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
                Filtered: {visibleProfessions.size}/11 professions
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

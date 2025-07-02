import { ReactFlow, Node, Edge } from 'reactflow'

export function GraphContainer() {
  // Placeholder nodes and edges
  const nodes: Node[] = []
  const edges: Edge[] = []

  return (
    <div style={{ flex: 1, height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
      />
    </div>
  )
}

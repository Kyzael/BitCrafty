import React, { createContext, useContext, useMemo } from 'react';
import { 
  ReactFlowProvider,
  NodeTypes,
  ReactFlowInstance
} from 'reactflow';
import { ItemNodeWrapper, CraftNodeWrapper } from './graph/nodes/NodeWrappers';

// Create a global, static nodeTypes object that won't change across renders
// This ensures React Flow always sees the same reference
const GLOBAL_NODE_TYPES: NodeTypes = {
  item: ItemNodeWrapper,
  craft: CraftNodeWrapper
};

// Context to provide the constant nodeTypes throughout the app
const FlowContext = createContext<{
  nodeTypes: NodeTypes;
  rfInstance: ReactFlowInstance | null;
  setRfInstance: (instance: ReactFlowInstance) => void;
}>({
  nodeTypes: GLOBAL_NODE_TYPES,
  rfInstance: null,
  setRfInstance: () => {}
});

// Create a custom provider that will wrap the ReactFlowProvider
export function BitCraftyFlowProvider({ children }: { children: React.ReactNode }) {
  const [rfInstance, setRfInstance] = React.useState<ReactFlowInstance | null>(null);
  
  // Create a memoized value object that won't change across renders
  const contextValue = useMemo(() => ({
    nodeTypes: GLOBAL_NODE_TYPES,
    rfInstance,
    setRfInstance: (instance: ReactFlowInstance) => setRfInstance(instance)
  }), [rfInstance]);
  
  return (
    <FlowContext.Provider value={contextValue}>
      <ReactFlowProvider>
        {children}
      </ReactFlowProvider>
    </FlowContext.Provider>
  );
}

// Custom hook to access the Flow context
export function useFlowContext() {
  return useContext(FlowContext);
}

// Helper to get the global nodeTypes without using context
export function getGlobalNodeTypes() {
  return GLOBAL_NODE_TYPES;
}

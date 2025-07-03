import React, { createContext, useContext, useMemo } from 'react';
import { 
  ReactFlowProvider,
  ReactFlowInstance
} from 'reactflow';

// Context to provide React Flow instance throughout the app
const FlowContext = createContext<{
  rfInstance: ReactFlowInstance | null;
  setRfInstance: (instance: ReactFlowInstance) => void;
}>({
  rfInstance: null,
  setRfInstance: () => {}
});

// Create a custom provider that will wrap the ReactFlowProvider
export function BitCraftyFlowProvider({ children }: { children: React.ReactNode }) {
  const [rfInstance, setRfInstance] = React.useState<ReactFlowInstance | null>(null);
  
  // Create stable memoized callback
  const setRfInstanceCallback = useMemo(() => 
    (instance: ReactFlowInstance) => setRfInstance(instance), []
  );
  
  // Create context value - only changes when rfInstance changes
  const contextValue = useMemo(() => ({
    rfInstance,
    setRfInstance: setRfInstanceCallback
  }), [rfInstance, setRfInstanceCallback]);
  
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

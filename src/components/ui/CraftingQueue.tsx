import { useCraftingQueue, useItemsArray } from '../../lib/store'
import { useBitCraftyStore } from '../../lib'

export function CraftingQueue() {
  const craftingQueue = useCraftingQueue()
  const items = useItemsArray()
  
  const removeFromQueue = (index: number) => {
    useBitCraftyStore.getState().removeFromQueue(index)
  }
  
  const clearQueue = () => {
    useBitCraftyStore.getState().clearQueue()
  }
  
  // Helper to get item name from ID
  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    return item?.name || itemId
  }
  
  return (
    <div style={{ 
      background: '#2d2a2e', 
      borderRadius: '4px',
      border: '1px solid #444',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        padding: '12px',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ 
          color: '#fcfcfa', 
          fontSize: '14px',
          margin: 0
        }}>
          Crafting Queue ({craftingQueue.length})
        </h3>
        {craftingQueue.length > 0 && (
          <button
            onClick={clearQueue}
            style={{
              padding: '4px 8px',
              background: '#f38ba8',
              border: 'none',
              borderRadius: '3px',
              color: '#1e1e2e',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>
      
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: craftingQueue.length > 0 ? '8px' : '12px'
      }}>
        {craftingQueue.length === 0 ? (
          <div style={{ 
            color: '#727072', 
            fontSize: '12px',
            textAlign: 'center',
            paddingTop: '20px'
          }}>
            No items in queue
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {craftingQueue.map((item, index) => (
              <div
                key={index}
                style={{
                  background: '#1e1e2e',
                  border: '1px solid #5c5c5c',
                  borderRadius: '4px',
                  padding: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    color: '#fcfcfa', 
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getItemName(item.itemId)}
                  </div>
                  <div style={{ 
                    color: '#89b4fa', 
                    fontSize: '11px'
                  }}>
                    Quantity: {item.qty}
                  </div>
                </div>
                <button
                  onClick={() => removeFromQueue(index)}
                  style={{
                    width: '20px',
                    height: '20px',
                    background: '#f38ba8',
                    border: 'none',
                    borderRadius: '3px',
                    color: '#1e1e2e',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

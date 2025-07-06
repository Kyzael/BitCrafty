import React, { useState } from 'react'
import { 
  useEnhancedQueue, 
  useRemoveFromEnhancedQueue, 
  useClearEnhancedQueue, 
  useReorderEnhancedQueue,
  useUpdateEnhancedQueueItem,
  useDragState,
  useSetDragState,
  useResetDragState,
  useItemsArray 
} from '../../lib/store'
import type { EnhancedQueueItem } from '../../types'

const EnhancedCraftingQueue: React.FC = () => {
  const queue = useEnhancedQueue()
  const dragState = useDragState()
  const items = useItemsArray()
  
  const removeFromQueue = useRemoveFromEnhancedQueue()
  const clearQueue = useClearEnhancedQueue()
  const reorderQueue = useReorderEnhancedQueue()
  const updateQueueItem = useUpdateEnhancedQueueItem()
  const setDragState = useSetDragState()
  const resetDragState = useResetDragState()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingQty, setEditingQty] = useState<number>(1)

  // Get item name by ID
  const getItemName = (itemId: string): string => {
    const item = items.find(i => i.id === itemId)
    return item?.name || `Unknown Item (${itemId})`
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, item: EnhancedQueueItem) => {
    setDragState({
      isDragging: true,
      draggedItemId: item.id,
      dropTargetIndex: null
    })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (dragState.dropTargetIndex !== index) {
      setDragState({ dropTargetIndex: index })
    }
  }

  // Handle drag end
  const handleDragEnd = () => {
    resetDragState()
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (!dragState.draggedItemId) return
    
    const draggedIndex = queue.findIndex(item => item.id === dragState.draggedItemId)
    if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
      reorderQueue(draggedIndex, dropIndex)
    }
    
    resetDragState()
  }

  // Handle quantity edit
  const startEdit = (item: EnhancedQueueItem) => {
    setEditingId(item.id)
    setEditingQty(item.qty)
  }

  const saveEdit = () => {
    if (editingId && editingQty > 0) {
      updateQueueItem(editingId, { qty: editingQty })
    }
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  if (queue.length === 0) {
    return (
      <div style={{
        backgroundColor: '#2d2a2e',
        borderRadius: '6px',
        border: '1px solid #5c5c5c',
        padding: '1rem',
        height: '100%'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#fcfcfa',
          marginBottom: '0.5rem'
        }}>
          Crafting Queue
        </h3>
        <p style={{
          color: '#a6a6a6',
          fontSize: '11px'
        }}>
          No items in queue. Add items to see your crafting queue.
        </p>
      </div>
    )
  }

  return (
    <div className="enhanced-crafting-queue">
      <div className="queue-header">
        <h4 className="queue-title">
          Crafting Queue ({queue.length})
        </h4>
        <button 
          onClick={clearQueue}
          className="clear-queue-btn"
          title="Clear entire queue"
        >
          Clear All
        </button>
      </div>

      {/* Queue Items */}
      <div className="queue-items">
        {queue.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              queue-item-compact 
              ${dragState.isDragging && dragState.draggedItemId === item.id ? 'dragging' : ''}
              ${dragState.dropTargetIndex === index ? 'drop-target' : ''}
            `}
          >
            {/* Drag Handle */}
            <div className="drag-handle-compact" title="Drag to reorder">
              ⋮⋮
            </div>

            {/* Quantity */}
            <div className="quantity-compact">
              {editingId === item.id ? (
                <input
                  type="number"
                  value={editingQty}
                  onChange={(e) => setEditingQty(parseInt(e.target.value) || 1)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyPress}
                  className="qty-input-compact"
                  min="1"
                  autoFocus
                />
              ) : (
                <span 
                  className="qty-display-compact"
                  onClick={() => startEdit(item)}
                  title="Click to edit quantity"
                >
                  {item.qty}
                </span>
              )}
            </div>

            {/* Item Name */}
            <div className="item-name-compact" title={`Item ID: ${item.itemId}`}>
              {getItemName(item.itemId)}
            </div>

            {/* Remove Button */}
            <button 
              onClick={() => removeFromQueue(item.id)}
              className="remove-btn-compact"
              title="Remove from queue"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Drag Preview */}
      {dragState.isDragging && (
        <div className="drag-preview">
          Reordering queue items...
        </div>
      )}
    </div>
  )
}

export default EnhancedCraftingQueue

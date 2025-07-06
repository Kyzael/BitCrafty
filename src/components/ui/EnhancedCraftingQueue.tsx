import React, { useState } from 'react'
import { 
  useEnhancedQueue, 
  useRemoveFromEnhancedQueue, 
  useClearEnhancedQueue, 
  useReorderEnhancedQueue,
  useUpdateEnhancedQueueItem,
  useQueueSummary,
  useDragState,
  useSetDragState,
  useResetDragState,
  useItemsArray 
} from '../../lib/store'
import type { EnhancedQueueItem } from '../../types'

const EnhancedCraftingQueue: React.FC = () => {
  const queue = useEnhancedQueue()
  const queueSummary = useQueueSummary()
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
  const handleDragStart = (e: React.DragEvent, item: EnhancedQueueItem, index: number) => {
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

  // Get status color
  const getStatusColor = (status: EnhancedQueueItem['status']) => {
    switch (status) {
      case 'ready': return 'text-green-600'
      case 'blocked': return 'text-red-600'
      case 'complete': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  // Get status icon
  const getStatusIcon = (status: EnhancedQueueItem['status']) => {
    switch (status) {
      case 'ready': return '✓'
      case 'blocked': return '⚠'
      case 'complete': return '✅'
      default: return '⏳'
    }
  }

  if (queue.length === 0) {
    return (
      <div className="crafting-queue-empty">
        <div className="empty-message">
          <p>Crafting queue is empty</p>
          <p className="text-sm text-gray-500">
            Select an item and press <kbd>+</kbd> to add to queue quickly!
          </p>
        </div>
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

      {/* Queue Summary */}
      {queueSummary && (
        <div className="queue-summary">
          <div className="summary-item">
            <span className="summary-label">Total Items:</span>
            <span className="summary-value">{queueSummary.totalItems}</span>
          </div>
          {queueSummary.estimatedTime && (
            <div className="summary-item">
              <span className="summary-label">Est. Time:</span>
              <span className="summary-value">{queueSummary.estimatedTime}min</span>
            </div>
          )}
        </div>
      )}

      {/* Queue Items */}
      <div className="queue-items">
        {queue.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              queue-item 
              ${dragState.isDragging && dragState.draggedItemId === item.id ? 'dragging' : ''}
              ${dragState.dropTargetIndex === index ? 'drop-target' : ''}
            `}
          >
            {/* Drag Handle */}
            <div className="drag-handle" title="Drag to reorder">
              ⋮⋮
            </div>

            {/* Priority Badge */}
            <div className="priority-badge">
              #{item.priority + 1}
            </div>

            {/* Item Details */}
            <div className="item-details">
              <div className="item-name" title={`Item ID: ${item.itemId}`}>
                {getItemName(item.itemId)}
              </div>
              
              {/* Quantity */}
              <div className="item-quantity">
                {editingId === item.id ? (
                  <input
                    type="number"
                    value={editingQty}
                    onChange={(e) => setEditingQty(parseInt(e.target.value) || 1)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyPress}
                    className="qty-input"
                    min="1"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="qty-display"
                    onClick={() => startEdit(item)}
                    title="Click to edit quantity"
                  >
                    {item.qty}x
                  </span>
                )}
              </div>

              {/* Status */}
              <div className={`item-status ${getStatusColor(item.status)}`}>
                <span className="status-icon">{getStatusIcon(item.status)}</span>
                <span className="status-text">{item.status}</span>
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="item-notes" title={item.notes}>
                  📝 {item.notes.length > 20 ? `${item.notes.slice(0, 20)}...` : item.notes}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="item-actions">
              <button 
                onClick={() => removeFromQueue(item.id)}
                className="remove-btn"
                title="Remove from queue"
              >
                ✕
              </button>
            </div>
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

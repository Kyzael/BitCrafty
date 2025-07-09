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
  useItemsArray,
  useThemeColors
} from '../../lib/store'
import type { EnhancedQueueItem } from '../../types'

const EnhancedCraftingQueue: React.FC = () => {
  const queue = useEnhancedQueue()
  const dragState = useDragState()
  const items = useItemsArray()
  const themeColors = useThemeColors()
  
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
        backgroundColor: themeColors.surface,
        borderRadius: '6px',
        border: `1px solid ${themeColors.overlay}`,
        padding: '1rem',
        height: '100%'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: themeColors.text,
          marginBottom: '0.5rem'
        }}>
          Crafting Queue
        </h3>
        <p style={{
          color: themeColors.muted,
          fontSize: '11px'
        }}>
          No items in queue. Add items to see your crafting queue.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: themeColors.surface,
      borderRadius: '6px',
      border: `1px solid ${themeColors.overlay}`,
      padding: '1rem',
      height: '100%'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: themeColors.text,
          margin: 0
        }}>
          Crafting Queue ({queue.length})
        </h4>
        <button 
          onClick={clearQueue}
          style={{
            padding: '4px 8px',
            background: themeColors.love,
            border: 'none',
            borderRadius: '3px',
            color: themeColors.background,
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          title="Clear entire queue"
        >
          Clear All
        </button>
      </div>

      {/* Queue Items */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {queue.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              background: dragState.isDragging && dragState.draggedItemId === item.id 
                ? `${themeColors.accent}20` 
                : themeColors.background,
              border: `1px solid ${
                dragState.dropTargetIndex === index 
                  ? themeColors.accent 
                  : themeColors.overlay
              }`,
              borderRadius: '3px',
              cursor: 'move',
              transition: 'all 0.2s ease',
              opacity: dragState.isDragging && dragState.draggedItemId === item.id ? 0.5 : 1
            }}
          >
            {/* Drag Handle */}
            <div style={{
              color: themeColors.muted,
              fontSize: '12px',
              cursor: 'move',
              userSelect: 'none'
            }} title="Drag to reorder">
              ⋮⋮
            </div>

            {/* Quantity */}
            <div style={{
              minWidth: '40px',
              textAlign: 'center'
            }}>
              {editingId === item.id ? (
                <input
                  type="number"
                  value={editingQty}
                  onChange={(e) => setEditingQty(parseInt(e.target.value) || 1)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyPress}
                  style={{
                    width: '35px',
                    padding: '2px 4px',
                    background: themeColors.surface,
                    border: `1px solid ${themeColors.overlay}`,
                    borderRadius: '2px',
                    color: themeColors.text,
                    fontSize: '11px',
                    textAlign: 'center'
                  }}
                  min="1"
                  autoFocus
                />
              ) : (
                <span 
                  onClick={() => startEdit(item)}
                  style={{
                    color: themeColors.accent,
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: '2px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${themeColors.overlay}33`}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="Click to edit quantity"
                >
                  {item.qty}
                </span>
              )}
            </div>

            {/* Item Name */}
            <div style={{
              flex: 1,
              color: themeColors.text,
              fontSize: '11px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }} title={`Item ID: ${item.itemId}`}>
              {getItemName(item.itemId)}
            </div>

            {/* Remove Button */}
            <button 
              onClick={() => removeFromQueue(item.id)}
              style={{
                background: 'none',
                border: 'none',
                color: themeColors.love,
                fontSize: '12px',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '2px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${themeColors.love}20`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Remove from queue"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Drag Preview */}
      {dragState.isDragging && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: themeColors.accent,
          color: themeColors.background,
          padding: '4px 8px',
          borderRadius: '3px',
          fontSize: '10px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          Reordering queue items...
        </div>
      )}
    </div>
  )
}

export default EnhancedCraftingQueue

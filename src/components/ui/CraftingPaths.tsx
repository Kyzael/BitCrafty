/**
 * CraftingPaths Component - Phase 4 Task 4.2
 * Displays crafting dependency trees for queue items
 */

import React, { useState } from 'react'
import { useEnhancedQueue, useGetCraftingPaths, useItems, useCrafts } from '../../lib/store'
import type { CraftingPath } from '../../types/crafting'

interface CraftingPathsProps {
  // No props needed currently
}

export const CraftingPaths: React.FC<CraftingPathsProps> = () => {
  const enhancedQueue = useEnhancedQueue()
  const getCraftingPaths = useGetCraftingPaths()
  const items = useItems()
  const crafts = useCrafts()
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  if (enhancedQueue.length === 0) {
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
          Crafting Paths
        </h3>
        <p style={{
          color: '#a6a6a6',
          fontSize: '11px'
        }}>
          Add items to queue to see crafting dependencies.
        </p>
      </div>
    )
  }

  const craftingPaths = getCraftingPaths()

  const togglePathExpanded = (pathId: string) => {
    const newExpanded = new Set(expandedPaths)
    if (newExpanded.has(pathId)) {
      newExpanded.delete(pathId)
    } else {
      newExpanded.add(pathId)
    }
    setExpandedPaths(newExpanded)
  }

  const renderCraftingPath = (path: CraftingPath, depth: number = 0, pathId: string = path.itemId): React.ReactNode => {
    const item = items[path.itemId]
    const craft = path.craftId ? crafts[path.craftId] : null
    const isExpanded = expandedPaths.has(pathId)
    const hasChildren = path.dependencies.length > 0

    return (
      <div key={pathId} style={{ width: '100%' }}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: '#3e3e3e',
            border: '1px solid #5c5c5c',
            borderRadius: '3px',
            cursor: hasChildren ? 'pointer' : 'default',
            transition: 'background-color 0.2s ease',
            marginLeft: `${depth * 16}px`
          }}
          onClick={() => hasChildren && togglePathExpanded(pathId)}
          onMouseEnter={(e) => {
            if (hasChildren) {
              e.currentTarget.style.backgroundColor = '#4a4a4a'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3e3e3e'
          }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <div style={{
              width: '12px',
              height: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a6a6a6',
              fontSize: '10px'
            }}>
              {isExpanded ? '▼' : '▶'}
            </div>
          )}
          {!hasChildren && <div style={{ width: '12px' }} />}

          {/* Resource Type Indicator */}
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: path.isBaseResource ? '#89b4fa' : '#fab387'
          }} />

          {/* Item Info */}
          <div style={{
            flex: 1,
            minWidth: 0
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                color: '#fcfcfa',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '11px'
              }}>
                {item?.name || path.itemName}
              </span>
              <span style={{
                color: '#a6a6a6',
                fontSize: '10px'
              }}>
                × {path.requiredQty}
              </span>
            </div>
            {craft && (
              <div style={{
                fontSize: '10px',
                color: '#a6a6a6',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                via {craft.name}
              </div>
            )}
          </div>

          {/* Base Resource Badge */}
          {path.isBaseResource && (
            <div style={{
              fontSize: '10px',
              backgroundColor: '#89b4fa',
              color: '#1e1e2e',
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 'bold'
            }}>
              Base
            </div>
          )}
        </div>

        {/* Dependencies */}
        {hasChildren && isExpanded && (
          <div style={{
            marginTop: '0.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            {path.dependencies.map((dependency, index) => 
              renderCraftingPath(dependency, depth + 1, `${pathId}-${index}`)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#2d2a2e',
      borderRadius: '6px',
      border: '1px solid #5c5c5c',
      padding: '1rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#fcfcfa'
        }}>
          Crafting Paths
        </h3>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          fontSize: '10px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#89b4fa'
            }} />
            <span style={{ color: '#a6a6a6' }}>Base</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#fab387'
            }} />
            <span style={{ color: '#a6a6a6' }}>Crafted</span>
          </div>
        </div>
      </div>

      {craftingPaths.length === 0 ? (
        <p style={{
          color: '#a6a6a6',
          fontSize: '11px'
        }}>
          No crafting paths found for queue items.
        </p>
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {craftingPaths.map((path, index) => (
            <div key={`${path.itemId}-${index}`} style={{
              borderBottom: index < craftingPaths.length - 1 ? '1px solid #5c5c5c' : 'none',
              paddingBottom: index < craftingPaths.length - 1 ? '0.5rem' : '0'
            }}>
              <div style={{
                fontSize: '11px',
                color: '#a6a6a6',
                marginBottom: '0.5rem',
                fontWeight: 'bold'
              }}>
                Queue Item #{index + 1}: {enhancedQueue[index]?.qty || 0} × {path.itemName}
              </div>
              {renderCraftingPath(path, 0, `main-${index}`)}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '1rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #5c5c5c'
      }}>
        <p style={{
          fontSize: '10px',
          color: '#a6a6a6'
        }}>
          Click on items with arrows to expand/collapse their crafting dependencies.
        </p>
      </div>
    </div>
  )
}

export default CraftingPaths

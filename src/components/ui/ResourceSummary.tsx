/**
 * ResourceSummary Component - Phase 4 Task 4.2
 * Displays calculated base resources and summary for the enhanced queue
 */

import React from 'react'
import { useQueueSummary, useItems, useThemeColors } from '../../lib/store'

interface ResourceSummaryProps {
  // No props needed currently
}

export const ResourceSummary: React.FC<ResourceSummaryProps> = () => {
  const queueSummary = useQueueSummary()
  const items = useItems()
  const themeColors = useThemeColors()

  if (!queueSummary || Object.keys(queueSummary.baseResources).length === 0) {
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
          Resource Summary
        </h3>
        <p style={{
          color: themeColors.muted,
          fontSize: '11px'
        }}>
          No resources calculated. Add items to queue to see requirements.
        </p>
      </div>
    )
  }

  const resourceSummary = {
    baseResources: queueSummary.baseResources,
    intermediateItems: {},
    surplus: queueSummary.surplus,
    totalItemsNeeded: Object.values(queueSummary.baseResources).reduce((total, qty) => total + qty, 0),
    queueComplexity: (Object.keys(queueSummary.baseResources).length > 10 ? 'complex' : 
                     Object.keys(queueSummary.baseResources).length > 5 ? 'moderate' : 'simple') as 'simple' | 'moderate' | 'complex'
  }

  const baseResourceCount = Object.keys(queueSummary.baseResources).length

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
        marginBottom: '0.75rem'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#fcfcfa'
        }}>
          Resource Summary
        </h3>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          backgroundColor: '#3e3e3e',
          border: '1px solid #5c5c5c',
          borderRadius: '3px',
          padding: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#89b4fa',
            fontWeight: 'bold',
            fontSize: '12px'
          }}>
            {baseResourceCount}
          </div>
          <div style={{
            color: '#a6a6a6',
            fontSize: '10px'
          }}>
            Base Resources
          </div>
        </div>
        <div style={{
          backgroundColor: '#3e3e3e',
          border: '1px solid #5c5c5c',
          borderRadius: '3px',
          padding: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#a6e3a1',
            fontWeight: 'bold',
            fontSize: '12px'
          }}>
            {resourceSummary.totalItemsNeeded}
          </div>
          <div style={{
            color: '#a6a6a6',
            fontSize: '10px'
          }}>
            Total Items
          </div>
        </div>
        <div style={{
          backgroundColor: '#3e3e3e',
          border: '1px solid #5c5c5c',
          borderRadius: '3px',
          padding: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#b4befe',
            fontWeight: 'bold',
            fontSize: '12px'
          }}>
            {queueSummary.totalItems}
          </div>
          <div style={{
            color: '#a6a6a6',
            fontSize: '10px'
          }}>
            Queue Items
          </div>
        </div>
      </div>

      {/* Base Resources List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#a6a6a6',
          borderBottom: '1px solid #5c5c5c',
          paddingBottom: '0.25rem',
          marginBottom: '0.5rem'
        }}>
          Base Resources Required
        </h4>
        <div style={{
          flex: 1,
          maxHeight: '200px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          {Object.entries(queueSummary.baseResources)
            .sort(([, a], [, b]) => b - a) // Sort by quantity descending
            .map(([itemId, qty]) => {
              const item = items[itemId]
              return (
                <div key={itemId} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#3e3e3e',
                  border: '1px solid #5c5c5c',
                  borderRadius: '3px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '11px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#89b4fa'
                    }} />
                    <span style={{ color: '#fcfcfa' }}>
                      {item?.name || itemId.split(':').pop()}
                    </span>
                  </div>
                  <div style={{
                    color: '#89b4fa',
                    fontWeight: 'bold'
                  }}>
                    {qty}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Help Text */}
      <div style={{
        marginTop: '1rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #5c5c5c'
      }}>
        <p style={{
          fontSize: '10px',
          color: '#a6a6a6'
        }}>
          Base resources are materials you need to gather or farm to complete your queue.
        </p>
      </div>
    </div>
  )
}

export default ResourceSummary

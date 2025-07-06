/**
 * ResourceSummary Component - Phase 4 Task 4.2
 * Displays calculated base resources and summary for the enhanced queue
 */

import React from 'react'
import { useQueueSummary, useItems } from '../../lib/store'
import { formatResourceSummary } from '../../lib/resource-calculator'

interface ResourceSummaryProps {
  className?: string
}

export const ResourceSummary: React.FC<ResourceSummaryProps> = ({ className = '' }) => {
  const queueSummary = useQueueSummary()
  const items = useItems()

  if (!queueSummary || Object.keys(queueSummary.baseResources).length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-medium text-white mb-2">Resource Summary</h3>
        <p className="text-gray-400 text-sm">No resources calculated. Add items to queue to see requirements.</p>
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

  const formatted = formatResourceSummary(resourceSummary)

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-white">Resource Summary</h3>
        <div className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
          {formatted.complexityDescription}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className="text-blue-400 font-medium">{formatted.baseResourceCount}</div>
          <div className="text-gray-400 text-xs">Base Resources</div>
        </div>
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className="text-green-400 font-medium">{resourceSummary.totalItemsNeeded}</div>
          <div className="text-gray-400 text-xs">Total Items</div>
        </div>
        <div className="bg-gray-700 rounded p-2 text-center">
          <div className="text-purple-400 font-medium">{queueSummary.totalItems}</div>
          <div className="text-gray-400 text-xs">Queue Items</div>
        </div>
      </div>

      {/* Base Resources List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 border-b border-gray-600 pb-1">
          Base Resources Required
        </h4>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {Object.entries(queueSummary.baseResources)
            .sort(([, a], [, b]) => b - a) // Sort by quantity descending
            .map(([itemId, qty]) => {
              const item = items[itemId]
              return (
                <div key={itemId} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-white">
                      {item?.name || itemId.split(':').pop()}
                    </span>
                  </div>
                  <div className="text-blue-400 font-medium">
                    {qty}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Surplus Resources (if any) */}
      {Object.keys(queueSummary.surplus).length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-medium text-gray-300 border-b border-gray-600 pb-1">
            Surplus Resources
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {Object.entries(queueSummary.surplus)
              .sort(([, a], [, b]) => b - a)
              .map(([itemId, qty]) => {
                const item = items[itemId]
                return (
                  <div key={itemId} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-white">
                        {item?.name || itemId.split(':').pop()}
                      </span>
                    </div>
                    <div className="text-green-400 font-medium">
                      +{qty}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 pt-3 border-t border-gray-600">
        <p className="text-xs text-gray-400">
          Base resources are materials you need to gather or farm. 
          Surplus shows extra items produced by crafting.
        </p>
      </div>
    </div>
  )
}

export default ResourceSummary

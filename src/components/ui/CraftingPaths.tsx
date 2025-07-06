/**
 * CraftingPaths Component - Phase 4 Task 4.2
 * Displays crafting dependency trees for queue items
 */

import React, { useState } from 'react'
import { useEnhancedQueue, useGetCraftingPaths, useItems, useCrafts } from '../../lib/store'
import type { CraftingPath } from '../../types/crafting'

interface CraftingPathsProps {
  className?: string
}

export const CraftingPaths: React.FC<CraftingPathsProps> = ({ className = '' }) => {
  const enhancedQueue = useEnhancedQueue()
  const getCraftingPaths = useGetCraftingPaths()
  const items = useItems()
  const crafts = useCrafts()
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  if (enhancedQueue.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-medium text-white mb-2">Crafting Paths</h3>
        <p className="text-gray-400 text-sm">Add items to queue to see crafting dependencies.</p>
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
      <div key={pathId} className="w-full">
        <div 
          className="flex items-center gap-2 py-2 px-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition-colors"
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => hasChildren && togglePathExpanded(pathId)}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <div className="w-4 h-4 flex items-center justify-center text-gray-400">
              {isExpanded ? '▼' : '▶'}
            </div>
          )}
          {!hasChildren && <div className="w-4" />}

          {/* Resource Type Indicator */}
          <div className={`w-3 h-3 rounded-full ${
            path.isBaseResource ? 'bg-blue-400' : 'bg-orange-400'
          }`} />

          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium truncate">
                {item?.name || path.itemName}
              </span>
              <span className="text-gray-400 text-sm">
                × {path.requiredQty}
              </span>
            </div>
            {craft && (
              <div className="text-xs text-gray-400 truncate">
                via {craft.name}
              </div>
            )}
          </div>

          {/* Base Resource Badge */}
          {path.isBaseResource && (
            <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
              Base
            </div>
          )}
        </div>

        {/* Dependencies */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {path.dependencies.map((dependency, index) => 
              renderCraftingPath(dependency, depth + 1, `${pathId}-${index}`)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-white">Crafting Paths</h3>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-gray-400">Base</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <span className="text-gray-400">Crafted</span>
          </div>
        </div>
      </div>

      {craftingPaths.length === 0 ? (
        <p className="text-gray-400 text-sm">No crafting paths found for queue items.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {craftingPaths.map((path, index) => (
            <div key={`${path.itemId}-${index}`} className="border-b border-gray-600 last:border-b-0 pb-2 last:pb-0">
              <div className="text-sm text-gray-300 mb-2 font-medium">
                Queue Item #{index + 1}: {enhancedQueue[index]?.qty || 0} × {path.itemName}
              </div>
              {renderCraftingPath(path, 0, `main-${index}`)}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 pt-3 border-t border-gray-600">
        <p className="text-xs text-gray-400">
          Click on items with arrows to expand/collapse their crafting dependencies.
          Base resources are gathered/farmed, crafted items require materials.
        </p>
      </div>
    </div>
  )
}

export default CraftingPaths

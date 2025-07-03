import React, { useState, useCallback, useMemo } from 'react'
import { useSearchQuery, useSetSearchQuery, useSetSearchResults, useSelectNode } from '../../lib/store'
import { useGraphData } from '../../lib/store'

/**
 * SearchInput component provides fuzzy search functionality for items
 * Shows dropdown of matching items for selection
 */
export const SearchInput: React.FC = () => {
  const searchQuery = useSearchQuery()
  const setSearchQuery = useSetSearchQuery()
  const setSearchResults = useSetSearchResults()
  const selectNode = useSelectNode()
  const graphData = useGraphData()

  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [showDropdown, setShowDropdown] = useState(false)

  // Filter to only include item nodes for search
  const itemNodes = useMemo(() => {
    return graphData.nodes.filter(node => node.type === 'item')
  }, [graphData.nodes])

  // Fuzzy search implementation
  const fuzzySearch = useCallback((items: typeof itemNodes, query: string) => {
    if (!query.trim()) return []
    
    const lowerQuery = query.toLowerCase()
    
    return items
      .map(item => {
        const name = item.data.name.toLowerCase()
        
        // Calculate fuzzy match score
        let score = 0
        let queryIndex = 0
        
        for (let i = 0; i < name.length && queryIndex < lowerQuery.length; i++) {
          if (name[i] === lowerQuery[queryIndex]) {
            score += 1
            queryIndex++
          }
        }
        
        // Only include if all query characters were found
        if (queryIndex === lowerQuery.length) {
          // Bonus points for exact matches and matches at start
          if (name.includes(lowerQuery)) score += 10
          if (name.startsWith(lowerQuery)) score += 20
          
          return { item, score }
        }
        
        return null
      })
      .filter(result => result !== null)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, 10)
      .map(result => result!.item)
  }, [])

  // Get search results with fuzzy matching
  const searchResults = useMemo(() => {
    if (!localQuery.trim()) return []
    
    const results = fuzzySearch(itemNodes, localQuery)
    
    // Update store with search results for highlighting
    const resultIds = results.map(item => item.id)
    setSearchResults(new Set(resultIds))
    
    return results.map(item => ({
      id: item.id,
      name: item.data.name
    }))
  }, [localQuery, itemNodes, fuzzySearch, setSearchResults])

  // Handle search query changes
  const handleSearchChange = useCallback((query: string) => {
    setLocalQuery(query)
    setSearchQuery(query)
    setShowDropdown(query.trim().length > 0)
    
    // Clear search results if query is empty
    if (!query.trim()) {
      setSearchResults(new Set())
    }
  }, [setSearchQuery, setSearchResults])

  // Handle item selection from dropdown
  const handleItemSelect = useCallback((itemId: string) => {
    selectNode(itemId)
    setShowDropdown(false)
    setLocalQuery('')
    setSearchQuery('')
    setSearchResults(new Set())
  }, [selectNode, setSearchQuery, setSearchResults])

  // Handle input blur with delay for dropdown clicks
  const handleInputBlur = useCallback(() => {
    setTimeout(() => setShowDropdown(false), 200)
  }, [])

  return (
    <div className="search-container">
      <div className="search-input-group">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => localQuery.trim() && setShowDropdown(true)}
            onBlur={handleInputBlur}
            placeholder="Search items..."
            className="search-input"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map(result => (
                <div
                  key={result.id}
                  className="search-dropdown-item"
                  onClick={() => handleItemSelect(result.id)}
                >
                  <div className="search-dropdown-item-name">{result.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {localQuery && searchResults.length === 0 && (
        <div className="search-no-results">
          No items found for "{localQuery}"
        </div>
      )}
    </div>
  )
}

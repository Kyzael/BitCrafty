import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useSearchQuery, useSetSearchQuery, useSetSearchResults, useSelectNode, useThemeColors } from '../../lib/store'
import { useGraphData } from '../../lib/store'

/**
 * SearchInput component provides fuzzy search functionality for items
 * Features:
 * - Global keyboard typing to auto-focus and search
 * - Arrow key navigation in dropdown
 * - Enter to select, Escape to cancel
 */
export const SearchInput: React.FC = () => {
  const searchQuery = useSearchQuery()
  const setSearchQuery = useSetSearchQuery()
  const setSearchResults = useSetSearchResults()
  const selectNode = useSelectNode()
  const graphData = useGraphData()
  const themeColors = useThemeColors()

  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

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
    setSelectedIndex(-1) // Reset selection when query changes
    
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

  // Handle keyboard navigation in dropdown
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, searchResults.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleItemSelect(searchResults[selectedIndex].id)
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowDropdown(false)
        setSelectedIndex(-1)
        setLocalQuery('')
        setSearchQuery('')
        setSearchResults(new Set())
        inputRef.current?.blur()
        break
    }
  }, [showDropdown, searchResults, selectedIndex, handleItemSelect, setSearchQuery, setSearchResults])

  // Handle input blur with delay for dropdown clicks
  const handleInputBlur = useCallback(() => {
    setTimeout(() => setShowDropdown(false), 200)
  }, [])

  // Global keyboard listener for auto-focus typing
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only auto-focus if not already focused and typing alphanumeric
      if (
        document.activeElement !== inputRef.current &&
        !e.ctrlKey && !e.altKey && !e.metaKey &&
        e.key.length === 1 &&
        /[a-zA-Z0-9\s]/.test(e.key) &&
        // Don't interfere with other inputs or text areas
        !(document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA' ||
          (document.activeElement as HTMLElement)?.contentEditable === 'true')
      ) {
        e.preventDefault()
        inputRef.current?.focus()
        // Set the typed character as the search query
        handleSearchChange(e.key)
      }
    }
    
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleSearchChange])

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = themeColors.iris
              localQuery.trim() && setShowDropdown(true)
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = themeColors.overlay
              handleInputBlur()
            }}
            placeholder="Search items..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `2px solid ${themeColors.overlay}`,
              borderRadius: '4px',
              backgroundColor: themeColors.surface,
              color: themeColors.text,
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          {showDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: themeColors.surface,
              border: `2px solid ${themeColors.overlay}`,
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}>
              {searchResults.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleItemSelect(result.id)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    borderBottom: index < searchResults.length - 1 ? `1px solid ${themeColors.overlay}` : 'none',
                    backgroundColor: index === selectedIndex ? themeColors.overlay : 'transparent',
                    color: themeColors.text
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeColors.overlay
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index === selectedIndex ? themeColors.overlay : 'transparent'
                  }}
                >
                  <div>{result.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {localQuery && searchResults.length === 0 && (
        <div style={{ 
          color: themeColors.muted,
          fontSize: '14px',
          marginTop: '8px'
        }}>
          No items found for "{localQuery}"
        </div>
      )}
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useLayoutPreset, useSetLayoutPreset, useThemeColors } from '../../lib/store'
import { LayoutPreset } from '../../types'

const LAYOUT_OPTIONS: { value: LayoutPreset; label: string; description: string; icon: string }[] = [
  { value: 'spacious', label: 'Spacious', description: 'Clear hierarchical view with generous spacing (default)', icon: '🌳' },
  { value: 'radial', label: 'Radial', description: 'Spider web pattern - dependencies flow outward from center', icon: '🎯' },
  { value: 'workflow', label: 'Workflow', description: 'Left-to-right process flow', icon: '➡️' },
  { value: 'subway', label: 'Subway', description: 'Metro-style parallel tracks with longest path ranking', icon: '🚇' }
]

export function LayoutToggle() {
  const currentPreset = useLayoutPreset()
  const setLayoutPreset = useSetLayoutPreset()
  const themeColors = useThemeColors()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentOption = LAYOUT_OPTIONS.find(option => option.value === currentPreset)

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          background: themeColors.surface,
          border: `1px solid ${themeColors.overlay}`,
          borderRadius: '4px',
          color: themeColors.text,
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = themeColors.overlay
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = themeColors.surface
        }}
        title={`Layout: ${currentOption?.description || 'Unknown'}`}
      >
        <span>{currentOption?.icon || '📐'}</span>
        <span>{currentOption?.label || 'Layout'}</span>
        <span style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '4px',
          background: themeColors.surface,
          border: `1px solid ${themeColors.overlay}`,
          borderRadius: '4px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '200px'
        }}>
          {LAYOUT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setLayoutPreset(option.value)
                setIsOpen(false)
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                background: currentPreset === option.value ? `${themeColors.accent}33` : 'transparent',
                border: 'none',
                borderBottom: `1px solid ${themeColors.overlay}`,
                color: themeColors.text,
                fontSize: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (currentPreset !== option.value) {
                  e.currentTarget.style.background = `${themeColors.overlay}33`
                }
              }}
              onMouseLeave={(e) => {
                if (currentPreset !== option.value) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div style={{ 
                fontWeight: currentPreset === option.value ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{option.icon}</span>
                <span>{option.label}</span>
                {currentPreset === option.value && (
                  <span style={{ marginLeft: 'auto', color: themeColors.accent }}>✓</span>
                )}
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: themeColors.muted, 
                marginTop: '2px' 
              }}>
                {option.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

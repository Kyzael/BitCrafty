import { useState, useRef, useEffect } from 'react'
import { useThemePreset, useThemeColors, useSetThemePreset } from '../../lib/store'
import { THEME_PRESETS } from '../../lib/constants'
import { ThemePreset } from '../../types'

const THEME_OPTIONS: { value: ThemePreset; label: string; description: string; icon: string }[] = [
  { value: 'rose-pine', label: 'Rosé Pine', description: 'Soho vibes', icon: '🌸' },
  { value: 'rose-pine-moon', label: 'Pine Moon', description: 'For night owls', icon: '🌙' },
  { value: 'monokai', label: 'Monokai', description: 'Classic coding', icon: '⚡' }
]

export function ThemeSelector() {
  const currentPreset = useThemePreset()
  const themeColors = useThemeColors()
  const setThemePreset = useSetThemePreset()
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

  const currentOption = THEME_OPTIONS.find(option => option.value === currentPreset)

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
        title={`Theme: ${currentOption?.description || 'Unknown'}`}
      >
        <span>{currentOption?.icon || '🎨'}</span>
        <span>{currentOption?.label || 'Theme'}</span>
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
          {THEME_OPTIONS.map((option) => {
            const optionTheme = THEME_PRESETS[option.value]
            const isSelected = currentPreset === option.value
            
            return (
              <button
                key={option.value}
                onClick={() => {
                  setThemePreset(option.value)
                  setIsOpen(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  background: isSelected ? `${themeColors.accent}33` : 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${themeColors.overlay}`,
                  color: themeColors.text,
                  fontSize: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = `${themeColors.overlay}33`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <div style={{ 
                  fontWeight: isSelected ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                  {isSelected && (
                    <span style={{ marginLeft: 'auto', color: themeColors.accent }}>✓</span>
                  )}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: themeColors.muted, 
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{option.description}</span>
                  {/* Mini color palette preview */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '2px', 
                    marginLeft: 'auto'
                  }}>
                    <div 
                      className="w-2 h-2 rounded-sm"
                      style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '1px',
                        backgroundColor: optionTheme.colors.love 
                      }}
                    />
                    <div 
                      className="w-2 h-2 rounded-sm"
                      style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '1px',
                        backgroundColor: optionTheme.colors.gold 
                      }}
                    />
                    <div 
                      className="w-2 h-2 rounded-sm"
                      style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '1px',
                        backgroundColor: optionTheme.colors.pine 
                      }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

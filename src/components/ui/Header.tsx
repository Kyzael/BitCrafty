import { SearchInput } from './SearchInput'
import { LayoutToggle } from './LayoutToggle'
import { ThemeSelector } from './ThemeSelector'
import { 
  useIsLoading, 
  useItemsArray, 
  useCraftsArray, 
  useProfessionsArray,
  useThemeColors
} from '../../lib/store'

export function Header() {
  // Data from store for the summary
  const items = useItemsArray()
  const crafts = useCraftsArray()
  const professions = useProfessionsArray()
  const isLoading = useIsLoading()
  const themeColors = useThemeColors()

  return (
    <header style={{ 
      height: '60px', 
      background: themeColors.surface, 
      borderBottom: `1px solid ${themeColors.overlay}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 1rem',
      gap: '1rem'
    }}>
      <h1 style={{ color: themeColors.text, margin: 0 }}>BitCrafty</h1>
      
      {/* Search and shortcuts section */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '400px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{ width: '100%' }}>
            <SearchInput />
          </div>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        <div style={{
          fontSize: '12px',
          color: themeColors.muted,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>Quick Keys:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <kbd style={{
              background: themeColors.overlay,
              color: themeColors.iris,
              padding: '2px 6px',
              borderRadius: '3px',
              border: `1px solid ${themeColors.muted}`,
              fontSize: '11px',
              fontWeight: 'bold'
            }}>+</kbd>
            <span style={{ fontSize: '10px' }}>Add</span>
            <kbd style={{
              background: themeColors.overlay,
              color: themeColors.love,
              padding: '2px 6px',
              borderRadius: '3px',
              border: `1px solid ${themeColors.muted}`,
              fontSize: '11px',
              fontWeight: 'bold'
            }}>−</kbd>
            <span style={{ fontSize: '10px' }}>Remove</span>
          </div>
        </div>
        
        {/* Layout Toggle */}
        <LayoutToggle />
        
        {/* Theme Selector */}
        <ThemeSelector />
      </div>
      
      {/* Data Summary on the right */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
      }}>
        {isLoading ? (
          <div style={{ 
            color: themeColors.love, 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: `2px solid ${themeColors.love}`,
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Loading...
          </div>
        ) : (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '14px'
          }}>
            <div style={{ 
              color: themeColors.iris,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span style={{ fontWeight: 'bold' }}>{items.length}</span>
              <span style={{ color: themeColors.muted }}>items</span>
            </div>
            <div style={{ color: themeColors.muted }}>•</div>
            <div style={{ 
              color: themeColors.pine,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span style={{ fontWeight: 'bold' }}>{crafts.length}</span>
              <span style={{ color: themeColors.muted }}>crafts</span>
            </div>
            <div style={{ color: themeColors.muted }}>•</div>
            <div style={{ 
              color: themeColors.gold,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span style={{ fontWeight: 'bold' }}>{professions.length}</span>
              <span style={{ color: themeColors.muted }}>professions</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

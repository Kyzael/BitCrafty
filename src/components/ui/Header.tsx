import { SearchInput } from './SearchInput'
import { 
  useIsLoading, 
  useItemsArray, 
  useCraftsArray, 
  useProfessionsArray 
} from '../../lib/store'

export function Header() {
  // Data from store for the summary
  const items = useItemsArray()
  const crafts = useCraftsArray()
  const professions = useProfessionsArray()
  const isLoading = useIsLoading()

  return (
    <header style={{ 
      height: '60px', 
      background: '#1e1e2e', 
      borderBottom: '1px solid #727072',
      display: 'flex',
      alignItems: 'center',
      padding: '0 1rem',
      gap: '1rem'
    }}>
      <h1 style={{ color: '#fcfcfa', margin: 0 }}>BitCrafty</h1>
      
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
          color: '#727072',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>Quick Keys:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <kbd style={{
              background: '#403e41',
              color: '#a9dc76',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '1px solid #5a5a5a',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>+</kbd>
            <span style={{ fontSize: '10px' }}>Add</span>
            <kbd style={{
              background: '#403e41',
              color: '#ff6188',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '1px solid #5a5a5a',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>−</kbd>
            <span style={{ fontSize: '10px' }}>Remove</span>
          </div>
        </div>
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
            color: '#f38ba8', 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #f38ba8',
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
              color: '#a6e3a1',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span style={{ fontWeight: 'bold' }}>{items.length}</span>
              <span style={{ color: '#727072' }}>items</span>
            </div>
            <div style={{ color: '#727072' }}>•</div>
            <div style={{ 
              color: '#89b4fa',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span style={{ fontWeight: 'bold' }}>{crafts.length}</span>
              <span style={{ color: '#727072' }}>crafts</span>
            </div>
            <div style={{ color: '#727072' }}>•</div>
            <div style={{ 
              color: '#f9e2af',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span style={{ fontWeight: 'bold' }}>{professions.length}</span>
              <span style={{ color: '#727072' }}>professions</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

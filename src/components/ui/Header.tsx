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
      gap: '2rem'
    }}>
      <h1 style={{ color: '#fcfcfa', margin: 0 }}>BitCrafty</h1>
      <div style={{ 
        flex: 1, 
        maxWidth: '400px',
        minWidth: '200px'
      }}>
        <SearchInput />
      </div>
      
      {/* Data Summary on the right */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginLeft: 'auto'
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

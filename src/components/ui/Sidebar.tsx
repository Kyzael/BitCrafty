import { useCallback } from 'react'
import { 
  useIsLoading, 
  useItemsArray, 
  useCraftsArray, 
  useProfessionsArray, 
  useVisibleProfessions,
  useSelectedNode 
} from '../../lib/store'
import { useBitCraftyStore } from '../../lib'
import { SearchInput } from './SearchInput'
import { NodeDetailsPanel } from './NodeDetailsPanel'

export function Sidebar() {
  // Data from store using memoized selectors
  const items = useItemsArray()
  const crafts = useCraftsArray()
  const professions = useProfessionsArray()
  const visibleProfessions = useVisibleProfessions()
  const isLoading = useIsLoading()
  const selectedNode = useSelectedNode()
  
  // Safe access to store actions
  const toggleProfession = useCallback((professionName: string) => {
    console.log('Toggling profession:', professionName)
    useBitCraftyStore.getState().toggleProfession(professionName)
  }, [])
  
  const showAllProfessions = useCallback(() => {
    console.log('Show All button clicked')
    // Get profession names directly from the store to avoid the dependency
    const allProfessionNames = useBitCraftyStore.getState().professions
    const professionNames = Object.values(allProfessionNames).map(p => p.name)
    console.log('Setting visible professions to:', professionNames)
    useBitCraftyStore.getState().setVisibleProfessions(new Set(professionNames))
  }, [])
  
  return (
    <aside style={{ 
      width: '280px', 
      background: '#1e1e2e', 
      borderRight: '1px solid #727072',
      padding: '1rem',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <h2 style={{ color: '#fcfcfa', marginBottom: '1rem', fontSize: '18px' }}>
        BitCrafty
      </h2>
      
      {/* Search Component */}
      <SearchInput />
      
      {/* Data Summary */}
      <div style={{ marginBottom: '1.5rem', padding: '10px', background: '#2d2a2e', borderRadius: '4px' }}>
        <div style={{ color: '#fcfcfa', fontSize: '14px', marginBottom: '8px' }}>
          <strong>Data Loaded:</strong>
        </div>
        {isLoading ? (
          <div style={{ color: '#f38ba8', fontSize: '12px' }}>Loading...</div>
        ) : (
          <>
            <div style={{ color: '#a6e3a1', fontSize: '12px' }}>
              {items.length} items • {crafts.length} crafts
            </div>
            <div style={{ color: '#89b4fa', fontSize: '12px' }}>
              {professions.length} professions
            </div>
          </>
        )}
      </div>
      
      {/* Profession Filters */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ 
          color: '#fcfcfa', 
          fontSize: '14px', 
          marginBottom: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Professions
          <span style={{ fontSize: '12px', color: '#727072' }}>
            {visibleProfessions.size}/{professions.length}
          </span>
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '6px'
        }}>
          {professions.map(profession => (
            <button
              key={profession.name}
              onClick={() => toggleProfession(profession.name)}
              tabIndex={-1}
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: '6px 8px',
                borderRadius: '4px',
                backgroundColor: visibleProfessions.has(profession.name) 
                  ? profession.color + '33' 
                  : 'transparent',
                border: `2px solid ${visibleProfessions.has(profession.name) 
                  ? profession.color 
                  : '#5c5c5c'}`,
                transition: 'all 0.2s ease',
                color: '#fcfcfa',
                fontSize: '11px',
                fontWeight: visibleProfessions.has(profession.name) ? 'bold' : 'normal',
                opacity: visibleProfessions.has(profession.name) ? 1 : 0.7
              }}
            >
              <div 
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: profession.color,
                  borderRadius: '2px',
                  opacity: visibleProfessions.has(profession.name) ? 1 : 0.5
                }}
              />
              <span style={{ 
                flex: 1,
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {profession.name}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Clear Filters */}
      <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        <button
          onClick={showAllProfessions}
          tabIndex={-1}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#89b4fa',
            border: 'none',
            borderRadius: '4px',
            color: '#1e1e2e',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#a1c5ff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#89b4fa'
          }}
        >
          Show All Professions
        </button>
      </div>

      {/* Node Details Section */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0 // Allow flex child to shrink
      }}>
        <h3 style={{ 
          color: '#fcfcfa', 
          fontSize: '14px', 
          marginBottom: '0.5rem'
        }}>
          Node Details
        </h3>
        <div style={{
          flex: 1,
          minHeight: 0,
          border: '1px solid #444',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <NodeDetailsPanel />
        </div>
      </div>
    </aside>
  )
}

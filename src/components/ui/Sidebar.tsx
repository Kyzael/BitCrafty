import { useCallback } from 'react'
import { 
  useIsLoading, 
  useItemsArray, 
  useCraftsArray, 
  useProfessionsArray, 
  useVisibleProfessions 
} from '../../lib/store'
import { useBitCraftyStore } from '../../lib'

export function Sidebar() {
  // Data from store using memoized selectors
  const items = useItemsArray()
  const crafts = useCraftsArray()
  const professions = useProfessionsArray()
  const visibleProfessions = useVisibleProfessions()
  const isLoading = useIsLoading()
  
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
  
  const hideAllProfessions = useCallback(() => {
    console.log('Hide All button clicked')
    useBitCraftyStore.getState().setVisibleProfessions(new Set())
  }, [])
  
  return (
    <aside style={{ 
      width: '250px', 
      background: '#1e1e2e', 
      borderRight: '1px solid #727072',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <h2 style={{ color: '#fcfcfa', marginBottom: '1rem', fontSize: '18px' }}>
        BitCrafty
      </h2>
      
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
        <div style={{ display: 'grid', gap: '4px' }}>
          {professions.map(profession => (
            <label 
              key={profession.name}
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '6px 8px',
                borderRadius: '4px',
                backgroundColor: visibleProfessions.has(profession.name) 
                  ? profession.color + '22' 
                  : 'transparent',
                border: `1px solid ${visibleProfessions.has(profession.name) 
                  ? profession.color + '44' 
                  : 'transparent'}`,
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                checked={visibleProfessions.has(profession.name)}
                onChange={() => toggleProfession(profession.name)}
                style={{ margin: 0, accentColor: profession.color }}
              />
              <div 
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: profession.color,
                  borderRadius: '2px',
                  opacity: visibleProfessions.has(profession.name) ? 1 : 0.5
                }}
              />
              <span style={{ 
                color: '#fcfcfa', 
                fontSize: '12px',
                opacity: visibleProfessions.has(profession.name) ? 1 : 0.7
              }}>
                {profession.name}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div style={{ marginTop: '1.5rem', padding: '10px', background: '#2d2a2e', borderRadius: '4px' }}>
        <div style={{ color: '#fcfcfa', fontSize: '12px', marginBottom: '8px' }}>
          <strong>Quick Actions:</strong>
        </div>
        <button
          onClick={showAllProfessions}
          style={{
            width: '100%',
            padding: '6px 12px',
            marginBottom: '4px',
            background: '#89b4fa',
            border: 'none',
            borderRadius: '4px',
            color: '#1e1e2e',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Show All
        </button>
        <button
          onClick={hideAllProfessions}
          style={{
            width: '100%',
            padding: '6px 12px',
            background: '#f38ba8',
            border: 'none',
            borderRadius: '4px',
            color: '#1e1e2e',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Hide All
        </button>
      </div>
    </aside>
  )
}

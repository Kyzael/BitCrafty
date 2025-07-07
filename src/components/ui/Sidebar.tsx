import { useCallback, useRef, useState, useEffect } from 'react'
import { 
  useProfessionsArray, 
  useVisibleProfessions,
  useSidebarCollapsed,
  useSidebarWidth
} from '../../lib/store'
import { useBitCraftyStore } from '../../lib'
import { NodeDetailsPanel } from './NodeDetailsPanel'
import EnhancedCraftingQueue from './EnhancedCraftingQueue'
import ResourceSummary from './ResourceSummary'
import CraftingPaths from './CraftingPaths'

export function Sidebar() {
  // Data from store using memoized selectors
  const professions = useProfessionsArray()
  const visibleProfessions = useVisibleProfessions()
  const sidebarCollapsed = useSidebarCollapsed()
  const sidebarWidth = useSidebarWidth()
  
  // State for resizing and tabs
  const [isResizing, setIsResizing] = useState(false)
  const [activeTab, setActiveTab] = useState<'queue' | 'resources' | 'paths'>('queue')
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  // Safe access to store actions
  const toggleProfession = useCallback((professionName: string) => {
    useBitCraftyStore.getState().toggleProfession(professionName)
  }, [])
  
  const showAllProfessions = useCallback(() => {
    // Get profession names directly from the store to avoid the dependency
    const allProfessionNames = useBitCraftyStore.getState().professions
    const professionNames = Object.values(allProfessionNames).map(p => p.name)
    useBitCraftyStore.getState().setVisibleProfessions(new Set(professionNames))
  }, [])
  
  const toggleSidebar = useCallback(() => {
    useBitCraftyStore.getState().setSidebarCollapsed(!sidebarCollapsed)
  }, [sidebarCollapsed])
  
  // Handle mouse events for resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (sidebarCollapsed) return
    e.preventDefault()
    setIsResizing(true)
  }, [sidebarCollapsed])
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const newWidth = e.clientX
      if (newWidth >= 200 && newWidth <= 600) {
        useBitCraftyStore.getState().setSidebarWidth(newWidth)
      }
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
    }
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])
  
  // Render collapsed sidebar (no floating search needed)
  if (sidebarCollapsed) {
    return (
      <div style={{
        position: 'relative',
        width: '40px',
        background: '#1e1e2e',
        borderRight: '1px solid #727072',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Expand button positioned on the border */}
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            right: '-12px',
            width: '24px',
            height: '24px',
            background: '#89b4fa',
            border: 'none',
            borderRadius: '50%',
            color: '#1e1e2e',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
          title="Expand sidebar"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
            e.currentTarget.style.background = '#a1c5ff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            e.currentTarget.style.background = '#89b4fa'
          }}
        >
          →
        </button>
      </div>
    )
  }
  
  return (
    <aside 
      ref={sidebarRef}
      style={{ 
        width: `${sidebarWidth}px`, 
        background: '#1e1e2e', 
        borderRight: '1px solid #727072',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        minWidth: '200px',
        maxWidth: '600px'
      }}
    >
      {/* Scrollable content - now starts from top */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem'
      }}>
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
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '4px'
          }}>
            {professions.map(profession => (
              <button
                key={profession.name}
                onClick={() => toggleProfession(profession.name)}
                tabIndex={-1}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '3px',
                  backgroundColor: visibleProfessions.has(profession.name) 
                    ? profession.color + '33' 
                    : 'transparent',
                  border: `1px solid ${visibleProfessions.has(profession.name) 
                    ? profession.color 
                    : '#5c5c5c'}`,
                  transition: 'all 0.2s ease',
                  color: '#fcfcfa',
                  fontSize: '10px',
                  fontWeight: visibleProfessions.has(profession.name) ? 'bold' : 'normal',
                  opacity: visibleProfessions.has(profession.name) ? 1 : 0.7,
                  minWidth: 0 // Allow flex items to shrink below content size
                }}
              >
                <div 
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: profession.color,
                    borderRadius: '2px',
                    opacity: visibleProfessions.has(profession.name) ? 1 : 0.5,
                    flexShrink: 0 // Prevent color dot from shrinking
                  }}
                />
                <span style={{ 
                  flex: 1,
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0 // Allow text to shrink and show ellipsis
                }}>
                  {profession.name}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Clear Filters */}
        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={showAllProfessions}
            tabIndex={-1}
            style={{
              width: '100%',
              padding: '6px 10px',
              background: '#89b4fa',
              border: 'none',
              borderRadius: '3px',
              color: '#1e1e2e',
              fontSize: '11px',
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
            Clear Filters
          </button>
        </div>

        {/* Node Details Section */}
        <div style={{ 
          marginBottom: '1rem'
        }}>
          <h3 style={{ 
            color: '#fcfcfa', 
            fontSize: '14px', 
            marginBottom: '0.5rem'
          }}>
            Node Details
          </h3>
          <div style={{
            minHeight: '100px',
            maxHeight: '400px',
            border: '1px solid #444',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            <NodeDetailsPanel />
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '4px',
          marginBottom: '1rem',
          padding: '4px',
          backgroundColor: '#2d2a2e',
          borderRadius: '6px',
          border: '1px solid #5c5c5c'
        }}>
          <button
            onClick={() => setActiveTab('queue')}
            tabIndex={-1}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: activeTab === 'queue' ? '#89b4fa' : 'transparent',
              border: `1px solid ${activeTab === 'queue' ? '#89b4fa' : '#5c5c5c'}`,
              borderRadius: '3px',
              color: activeTab === 'queue' ? '#1e1e2e' : '#fcfcfa',
              fontSize: '11px',
              fontWeight: activeTab === 'queue' ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: activeTab === 'queue' ? 1 : 0.7
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'queue') {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.backgroundColor = '#5c5c5c33'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'queue') {
                e.currentTarget.style.opacity = '0.7'
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            Queue
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            tabIndex={-1}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: activeTab === 'resources' ? '#89b4fa' : 'transparent',
              border: `1px solid ${activeTab === 'resources' ? '#89b4fa' : '#5c5c5c'}`,
              borderRadius: '3px',
              color: activeTab === 'resources' ? '#1e1e2e' : '#fcfcfa',
              fontSize: '11px',
              fontWeight: activeTab === 'resources' ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: activeTab === 'resources' ? 1 : 0.7
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'resources') {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.backgroundColor = '#5c5c5c33'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'resources') {
                e.currentTarget.style.opacity = '0.7'
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab('paths')}
            tabIndex={-1}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: activeTab === 'paths' ? '#89b4fa' : 'transparent',
              border: `1px solid ${activeTab === 'paths' ? '#89b4fa' : '#5c5c5c'}`,
              borderRadius: '3px',
              color: activeTab === 'paths' ? '#1e1e2e' : '#fcfcfa',
              fontSize: '11px',
              fontWeight: activeTab === 'paths' ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: activeTab === 'paths' ? 1 : 0.7
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'paths') {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.backgroundColor = '#5c5c5c33'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'paths') {
                e.currentTarget.style.opacity = '0.7'
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            Paths
          </button>
        </div>
        
        {/* Tab Content */}
        <div style={{ 
          flex: 1,
          minHeight: '150px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {activeTab === 'queue' && <EnhancedCraftingQueue />}
          {activeTab === 'resources' && <ResourceSummary />}
          {activeTab === 'paths' && <CraftingPaths />}
        </div>
      </div>
      
      {/* Collapse button positioned on the border */}
      <button
        onClick={toggleSidebar}
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          right: '-12px',
          width: '24px',
          height: '24px',
          background: '#89b4fa',
          border: 'none',
          borderRadius: '50%',
          color: '#1e1e2e',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 10,
          transition: 'all 0.2s ease'
        }}
        title="Collapse sidebar"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
          e.currentTarget.style.background = '#a1c5ff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
          e.currentTarget.style.background = '#89b4fa'
        }}
      >
        ←
      </button>
      
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          right: -2,
          width: '4px',
          height: '100%',
          cursor: 'col-resize',
          background: isResizing ? '#89b4fa' : 'transparent',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isResizing) {
            e.currentTarget.style.background = '#89b4fa55'
          }
        }}
        onMouseLeave={(e) => {
          if (!isResizing) {
            e.currentTarget.style.background = 'transparent'
          }
        }}
      />
    </aside>
  )
}

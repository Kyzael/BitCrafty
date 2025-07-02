import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BitCraftyFlowProvider } from './components/BitCraftyFlowProvider'
import './styles/globals.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BitCraftyFlowProvider>
      <App />
    </BitCraftyFlowProvider>
  </React.StrictMode>
)

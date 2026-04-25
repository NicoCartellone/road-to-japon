import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './style.css'

// Guardamos el updater para poder aplicarlo desde la UI.
let updateSW: ReturnType<typeof registerSW>

updateSW = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(
      new CustomEvent('pwa:need-refresh', {
        detail: {
          updateSW
        }
      })
    )
  }
})

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

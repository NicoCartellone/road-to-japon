import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './style.css'

registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new Event('pwa:need-refresh'))
  }
})

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

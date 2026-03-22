import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Sync dark class with system preference
const mq = window.matchMedia('(prefers-color-scheme: dark)')
const sync = () => document.documentElement.classList.toggle('dark', mq.matches)
sync()
mq.addEventListener('change', sync)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

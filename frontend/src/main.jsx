import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeTheme } from './utils/themeUtils'
import { fixSupabaseReferer } from './utils/fixSupabaseReferer'

// Initialize theme and custom colors
initializeTheme();

// Fix Supabase referer issue
fixSupabaseReferer();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

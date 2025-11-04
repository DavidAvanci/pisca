import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'sonner'

// Initialize theme before rendering to prevent flash
const initializeTheme = () => {
  const stored = localStorage.getItem('theme-storage')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed?.state?.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch {
      // Fallback to light theme if parsing fails
      document.documentElement.classList.remove('dark')
    }
  } else {
    // Check system preference if no stored theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = prefersDark ? 'dark' : 'light'
    
    // Save initial theme to localStorage to sync with store
    localStorage.setItem('theme-storage', JSON.stringify({
      state: { theme: initialTheme },
      version: 0
    }))
    
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

initializeTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster position='top-center' className='squircle' icons={{success: null, error: null}}/>
    <App />
  </React.StrictMode>,
)


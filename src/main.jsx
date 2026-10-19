import React from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './extra.css'
import {RESTAURANT_CONFIG} from '../shared/restaurant.config.js'

// Automatically apply brand identity & theme color from restaurant.config.js
if (typeof document !== 'undefined') {
  if (RESTAURANT_CONFIG?.theme?.primaryColor) {
    document.documentElement.style.setProperty('--red', RESTAURANT_CONFIG.theme.primaryColor)
  }
  if (RESTAURANT_CONFIG?.theme?.primaryHover) {
    document.documentElement.style.setProperty('--red2', RESTAURANT_CONFIG.theme.primaryHover)
  }
  if (RESTAURANT_CONFIG?.theme?.fontFamily) {
    document.documentElement.style.setProperty('--d', RESTAURANT_CONFIG.theme.fontFamily)
  }
  if (RESTAURANT_CONFIG?.brand?.name) {
    document.title = `${RESTAURANT_CONFIG.brand.name} — ${RESTAURANT_CONFIG.brand.tagline || ''}`
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc && RESTAURANT_CONFIG.brand.metaDescription) {
      metaDesc.setAttribute('content', RESTAURANT_CONFIG.brand.metaDescription)
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme && RESTAURANT_CONFIG.theme.primaryColor) {
      metaTheme.setAttribute('content', RESTAURANT_CONFIG.theme.primaryColor)
    }
  }
}

createRoot(document.getElementById('root')).render(<App/>)

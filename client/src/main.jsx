/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: main.jsx
 * PATH: client/src/main.jsx
 * PURPOSE: React client entry point rendering Root DOM with BrowserRouter, AuthProvider,
 *          Tailwind stylesheet imports, and GSAP smooth scroll initializations.
 * LAST UPDATED: October 2026
 * ==============================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { initSmoothScroll } from './animations/gsap';

document.documentElement.dataset.theme = 'light';
document.documentElement.style.colorScheme = 'light';

// Initialize smooth scrolling
try {
  initSmoothScroll();
} catch (e) {
  console.warn('Smooth scroll initialization fallback', e);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

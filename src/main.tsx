import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safeguard for fetch assignment error
try {
  const originalFetch = window.fetch;
  if (originalFetch) {
    // If fetch is already defined, we ensure it's not reassigned by libraries that might try to polyfill it
    // This is a common issue with node-fetch being bundled for the browser
    Object.defineProperty(window, 'fetch', {
      value: originalFetch,
      writable: false,
      configurable: true
    });
  }
} catch (e) {
  console.warn('Could not lock window.fetch:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

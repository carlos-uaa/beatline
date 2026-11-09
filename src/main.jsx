import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Interceptar token de retorno de Spotify OAuth si viene en el hash
if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
  try {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get('access_token');
    if (token) {
      localStorage.setItem('beatline_spotify_user_token', token);
      if (window.opener) {
        window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS', token }, '*');
        window.close();
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  } catch (e) {
    console.warn('Error procesando callback de Spotify:', e);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

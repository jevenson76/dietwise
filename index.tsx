import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary'; // New Import

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

if (
  'serviceWorker' in navigator &&
  window.isSecureContext && // Service workers require secure context (HTTPS or localhost)
  !/\.usercontent\.goog$/.test(window.location.hostname) // Avoid registration on problematic Google preview domains
) {
  window.addEventListener('load', () => {
    // Explicitly check document.readyState for robustness
    if (document.readyState === 'complete') {
      const swUrl = new URL('/sw.js', window.location.origin).href;
      navigator.serviceWorker.register(swUrl, { scope: '/' }) // Explicitly set scope
        .then(registration => {
          console.log('Service Worker registered: ', registration.scope, 'Full URL:', swUrl);
        })
        .catch(registrationError => {
          console.error('Service Worker registration failed: ', registrationError, 'Attempted URL:', swUrl);
        });
    } else {
      console.warn('Service Worker registration skipped: document.readyState was not "complete" even on window load. Current state:', document.readyState);
    }
  });
} else {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported in this browser.');
  }
  if (!window.isSecureContext) {
    console.log('Service Worker registration skipped: not a secure context.');
  }
  if (/\.usercontent\.goog$/.test(window.location.hostname)) {
    console.log('Service Worker registration skipped on usercontent.goog domain.');
  }
}
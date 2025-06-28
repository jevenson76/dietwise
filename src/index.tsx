import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initSentry } from './utils/sentry';

// Initialize Sentry before rendering
initSentry();

// Register service worker for offline support (only in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.error('ServiceWorker registration failed: ', err);
      });
  });
} else if (import.meta.env.DEV) {
  // Unregister any existing service workers in development
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
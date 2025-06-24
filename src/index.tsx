import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initSentry } from './utils/sentry';

// Initialize Sentry before rendering
initSentry();

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('ServiceWorker registration successful');
        }
      })
      .catch(err => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('ServiceWorker registration failed: ', err);
        }
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
const CACHE_NAME = 'dietwise-v1.5.0';
const urlsToCache = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache install failed:', error);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests except for specific domains
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && 
      !url.hostname.includes('cdnjs.cloudflare.com') &&
      !url.hostname.includes('fonts.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // For HTML files, always fetch fresh to avoid stale content
        if (event.request.mode === 'navigate' || event.request.url.endsWith('.html')) {
          return fetch(event.request);
        }
        
        // Return cached version if available for other resources
        if (response) {
          return response;
        }

        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a stream
          const responseToCache = response.clone();

          // Cache successful responses
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Only cache GET requests for same origin or allowed domains
              // Also check content type to avoid caching HTML error pages as JS
              const contentType = response.headers.get('content-type');
              const isJavaScript = event.request.url.endsWith('.js') || event.request.url.includes('/assets/');
              const isValidJS = !isJavaScript || (contentType && contentType.includes('javascript'));
              
              if (event.request.method === 'GET' && isValidJS) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch(() => {
          // Return offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Background sync for offline food logging
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-food-sync') {
    event.waitUntil(syncOfflineFoodLogs());
  }
});

async function syncOfflineFoodLogs() {
  try {
    // This would integrate with your offline food logging system
    console.log('Syncing offline food logs...');
    
    // Send message to client to trigger sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_OFFLINE_FOOD_LOGS'
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications for meal reminders
self.addEventListener('push', (event) => {
  const options = {
    body: 'Time to log your meal!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'log-meal',
        title: 'Log Meal',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'DietWise Reminder';
  
  event.waitUntil(
    self.registration.showNotification(title, {
      ...options,
      body: data.body || options.body
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'log-meal') {
    // Open app to food log tab
    event.waitUntil(
      clients.openWindow('/#Log')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
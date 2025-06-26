
const CACHE_NAME = 'dietwise-cache-v1.3'; 
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/index.tsx', 
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {

        const cachePromises = APP_SHELL_FILES.map(fileUrl => {
          return cache.add(fileUrl).catch(error => {
            if (process.env.NODE_ENV !== 'production') {
            console.error(`[Service Worker] Failed to cache during install: ${fileUrl}`, error);
            }
          });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {

        return self.skipWaiting(); 
      })
      .catch(error => {
        if (process.env.NODE_ENV !== 'production') {
        console.error('[Service Worker] Installation phase failed:', error);
        }
      })
  );
});

self.addEventListener('activate', (event) => {

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {

            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {

      return self.clients.claim(); 
    }).catch(error => {
      if (process.env.NODE_ENV !== 'production') {
      console.error('[Service Worker] Activation phase failed:', error);
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return; 
  }

  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate' && url.origin === self.location.origin && event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/index.html'); 
            });
        })
    );
  }
  else if (APP_SHELL_FILES.includes(url.pathname) || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            return networkResponse;
          }).catch(error => {
            if (process.env.NODE_ENV !== 'production') {
            console.error('[Service Worker] Fetch failed for app shell resource (cache-first):', event.request.url, error);
            }
            return new Response("Network error. Resource not available.", { status: 503, statusText: "Service Unavailable", headers: { 'Content-Type': 'text/plain' } });
          });
        })
    );
  } 
  else if (url.origin === self.location.origin && !url.pathname.includes('/api/')) { 
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response; 
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || new Response("Content not available offline.", { status: 404, statusText: "Not Found", headers: { 'Content-Type': 'text/plain' } });
          });
        })
    );
  }
  // Handle Google AdSense requests with Cloudflare optimization
  else if (url.hostname.includes('googlesyndication.com') || url.hostname.includes('doubleclick.net')) {
    event.respondWith(
      fetch(event.request, {
        // Add cache headers for Cloudflare optimization
        headers: {
          ...event.request.headers,
          'Cache-Control': 'public, max-age=300', // 5 minutes cache
        }
      }).catch(error => {
        // Fail gracefully if ads can't load
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[Service Worker] Ad request failed:', event.request.url, error.message);
        }
        // Return empty response to prevent breaking the page
        return new Response('', { 
          status: 204, 
          statusText: 'No Content'
        });
      })
    );
  }
  else {
    event.respondWith(fetch(event.request).catch(error => {
        if (process.env.NODE_ENV !== 'production') {
        console.warn('[Service Worker] Network request failed (cross-origin or API):', event.request.url, error.message);
        }
        return new Response(JSON.stringify({ error: "Network error: Could not fetch resource." }), { 
            status: 503, 
            statusText: "Service Unavailable", 
            headers: { 'Content-Type': 'application/json' } 
        });
    }));
  }
});

self.addEventListener('push', (event) => {

  
  let payload;
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { body: event.data.text() }; 
    }
  } else {
    payload = { body: 'You have a new notification from DietWise.' };
  }

  const title = payload.title || 'DietWise Reminder';
  const options = {
    body: payload.body || 'Check your DietWise app!',
    icon: payload.icon || '/icons/icon-192x192.png', 
    badge: payload.badge || '/icons/icon-96x96.png', 
    vibrate: payload.vibrate || [200, 100, 200], 
    tag: payload.tag || 'dietwise-general-reminder', 
    renotify: payload.renotify !== undefined ? payload.renotify : true, 
    data: payload.data || { url: '/', type: 'general' }, // Added default type
    actions: payload.actions || [ 
      { action: 'open_app', title: 'Open DietWise' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {

  event.notification.close(); 

  const notificationData = event.notification.data || {};
  const notificationType = notificationData.type || 'general';
  let urlToOpen = notificationData.url && typeof notificationData.url === 'string' ? notificationData.url : '/';

  // Customize behavior based on notification type
  if (notificationType === 'weigh_in') {
    urlToOpen = '/#Progress'; // Ensure this hash matches how your app handles routing to tabs
  } else if (notificationType === 'meal_reminder') {
    urlToOpen = '/#Log'; // Or specific meal logging section
  }
  // Add more types as needed

  if (event.action === 'open_app' || !event.action) { 
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        const targetFullUrl = new URL(urlToOpen, self.location.origin).href;
        
        for (let client of clientList) {
          // If a window with the target URL already exists, focus it.
          // Note: client.url might not have the hash, so this check might need refinement
          // depending on how PWA routing updates the client URL.
          // A more robust check might involve messaging existing clients.
          if (client.url.startsWith(new URL('/', self.location.origin).href) && 'focus' in client) { // Check if it's our app
            // For now, just focus any existing client of our app.
            // A more sophisticated solution would be to message the client and ask it to navigate.
            return client.focus().then(focusedClient => {
                if(focusedClient && 'navigate' in focusedClient && typeof focusedClient.navigate === 'function') {
                    // This is ideal if supported and client is controlled
                    // focusedClient.navigate(urlToOpen); // This might not work for hash URLs in all cases
                }
            });
          }
        }
        // If no existing client is found or focused, open a new window.
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
  // Handle other actions if defined
  // else if (event.action === 'some_other_action') { ... }
});

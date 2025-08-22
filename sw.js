// Time Jump Game - Service Worker
// Handles offline functionality and caching for PWA features

const CACHE_NAME = 'time-jump-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/game.js',
  '/app.js',
  '/manifest.json',
  '/icons/game16.png',
  '/icons/game32.png',
  '/icons/game512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Time Jump: Caching game resources');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Time Jump: Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Time Jump: Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request for network fetch
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response for caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Return offline page or fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// Message event - handle updates and skip waiting
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline game data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync game data when connection is restored
      syncGameData()
    );
  }
});

// Function to sync game data
async function syncGameData() {
  try {
    // Get offline game data from IndexedDB or localStorage
    const offlineData = await getOfflineGameData();
    
    if (offlineData && offlineData.length > 0) {
      // Sync with server when online
      await syncWithServer(offlineData);
      
      // Clear offline data after successful sync
      await clearOfflineGameData();
      
      console.log('Time Jump: Game data synced successfully');
    }
  } catch (error) {
    console.error('Time Jump: Sync failed:', error);
  }
}

// Placeholder functions for data sync
async function getOfflineGameData() {
  // Implementation would depend on your data storage strategy
  return [];
}

async function syncWithServer(data) {
  // Implementation would depend on your backend API
  return Promise.resolve();
}

async function clearOfflineGameData() {
  // Implementation would depend on your data storage strategy
  return Promise.resolve();
}

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Time Jump: New challenge awaits!',
      icon: '/icons/game512.png',
      badge: '/icons/game32.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'play',
          title: 'Play Now',
          icon: '/icons/game32.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/game32.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('Time Jump', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'play') {
    // Open the game
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Time Jump: Service Worker loaded successfully');

// Service Worker for Offline Support
const CACHE_NAME = 'calculator-offline-v5';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'app.js',
  'manifest.json',
  'icons/calc192.png',
  'icons/calc512.png'
  'icons/calc16.png'
  'icons/calc32.png'
  'icons/apple-touch-icon.png'
  'icons/favicon.ico'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
                  .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch handling
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
      .then((response) => {
        return response || caches.match('index.html');
      })
  );
});

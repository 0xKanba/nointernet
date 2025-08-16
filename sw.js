const CACHE_NAME = 'calculator-v8';
const FILES_TO_CACHE = [
  './',
  'index.html',
  'style.css',
  'script.js',
  'app.js',
  'manifest.json',
  'icons/calc192.png',
  'icons/calc512.png',
  'icons/calc16.png',
  'icons/calc32.png',
  'icons/apple-touch-icon.png',
  'icons/favicon.ico'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const CACHE_NAME = 'calculator-offline-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/calc192.png',
  '/icons/calc512.png',
  '/icons/calc32.png',
  '/icons/calc16.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  // تثبيت: حفظ جميع الملفات في الكاش
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  // تفعيل: حذف الكاش القديم إذا تغير الاسم
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
                  .map((name) => caches.delete(name))
      );
    })
  );

  // جعل السيرفس ووركر يتحكم في كل الصفحات فورًا
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // جلب الملفات من الإنترنت أولًا، وإذا فشل، من الكاش
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
      .then((response) => {
        return response || caches.match('/index.html');
      })
  );
});

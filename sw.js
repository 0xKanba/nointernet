const CACHE_NAME = 'sphere-calculator-v3';
const FILES_TO_CACHE = [
  './',
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

// تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(FILES_TO_CACHE)
          .catch(err => {
            console.error('فشل في تخزين الملفات:', err);
            throw err;
          });
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker وإزالة المخازن القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// معالجة طلبات الشبكة
self.addEventListener('fetch', (event) => {
  // تجاهل الطلبات غير الضرورية
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجدت في المخزن، استخدمه
        if (response) {
          return response;
        }
        
        // إذا لم تكن في المخزن، اطلبها من الشبكة
        return fetch(event.request)
          .then(response => {
            // لا نخزن الاستجابات غير الناجحة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // نسخ الاستجابة لأنها يمكن استخدامها مرة واحدة فقط
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
      .catch(() => {
        // إذا فشل الاتصال، حاول العثور على إصدار مخزّن
        return caches.match('./');
      })
  );
});

// معالجة رسائل التحديث
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

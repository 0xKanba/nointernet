const CACHE_NAME = 'sports-gallery-v5';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1554080351-a76ca4bcf599?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595435934249-5c1ca5a0690c?auto=format&fit=crop&w=800&q=80'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('فتح التخزين المؤقت');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// استراتيجية التخزين المؤقت: Cache First
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // إذا وجد في التخزين المؤقت، أرجعه
                if (response) {
                    return response;
                }
                
                // خلاف ذلك، جلب من الشبكة
                return fetch(event.request)
                    .then(response => {
                        // التحقق من صحة الاستجابة
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        
                        // نسخ الاستجابة وتخزينها
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // في حالة فشل الشبكة، إرجاع الصفحة الرئيسية للتنقل
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// تحديث الإصدار
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => self.clients.claim())
    );
});

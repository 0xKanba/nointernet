const CACHE_NAME = 'sports-gallery-v2';
const urlsToCache = [
    '/z/',
    '/z/index.html',
    '/z/style.css',
    '/z/app.js',
    '/z/manifest.json',
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

// استراتيجية التخزين المؤقت المتقدمة
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // إذا وجدنا الرد في التخزين المؤقت، نعيده
                if (response) {
                    return response;
                }
                
                // خلاف ذلك، نحاول جلبه من الشبكة
                return fetch(event.request)
                    .then(response => {
                        // التحقق من أن الرد صالح
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // نسخ الرد لأنه يمكن استخدامه مرة واحدة فقط
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // في حالة فشل الشبكة، نحاول إرجاع صفحة الخطأ
                        if (event.request.mode === 'navigate') {
                            return caches.match('/z/index.html');
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
                        console.log('حذف التخزين المؤقت القديم:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => self.clients.claim())
    );
});

// معالجة الرسائل من التطبيق
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// تسجيل Service Worker مع المسار الجديد
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/z/sw.js')
            .then(registration => {
                console.log('Service Worker مسجل بنجاح:', registration);
                
                // التحقق من التحديثات
                registration.addEventListener('updatefound', () => {
                    const installingWorker = registration.installing;
                    installingWorker.addEventListener('statechange', () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('يوجد تحديث جديد متاح');
                            // يمكن إضافة إشعار للمستخدم هنا
                        }
                    });
                });
            })
            .catch(error => {
                console.error('فشل تسجيل Service Worker:', error);
            });
    });
}

// معالجة زر التثبيت
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('تم قبول تثبيت التطبيق');
            } else {
                console.log('تم رفض تثبيت التطبيق');
            }
            deferredPrompt = null;
        });
    }
});

// إخفاء زر التثبيت إذا كان التطبيق مثبتًا
window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    console.log('التطبيق مثبت بنجاح');
});

// التحقق من حالة الاتصال
function updateOnlineStatus() {
    const status = navigator.onLine ? 'متصل' : 'غير متصل';
    console.log(`حالة الاتصال: ${status}`);
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

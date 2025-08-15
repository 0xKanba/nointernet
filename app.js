// إدارة تثبيت التطبيق
let deferredPrompt;

const installBtn = document.getElementById('install-btn');

// قبل تثبيت التطبيق
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'flex';
    
    setTimeout(() => {
        if (installBtn.style.display === 'flex') {
            installBtn.style.display = 'none';
        }
    }, 5000);
});

// نقر زر التثبيت
installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        installBtn.style.display = 'none';
    }
    
    deferredPrompt = null;
});

// بعد التثبيت
window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    deferredPrompt = null;
    console.log('تم تثبيت التطبيق');
});

// تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker مسجل:', registration.scope);
                
                setInterval(() => {
                    registration.update();
                }, 12 * 60 * 60 * 1000);
            })
            .catch(error => {
                console.error('فشل التسجيل:', error);
            });
    });
    
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });
}

// تحديث التطبيق
function updateApp() {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('skipWaiting');
    }
}

// زر التحديث
const refreshBtn = document.getElementById('refresh-btn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        updateApp();
        
        refreshBtn.textContent = '✓';
        setTimeout(() => {
            refreshBtn.textContent = '↻';
        }, 1500);
    });
}

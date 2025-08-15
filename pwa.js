// إدارة تثبيت التطبيق
let deferredPrompt;

// زر التثبيت
const installBtn = document.getElementById('install-btn');

// عرض زر التثبيت عندما يكون التثبيت ممكناً
window.addEventListener('beforeinstallprompt', (e) => {
    // منع عرض مطالبة التثبيت الافتراضية
    e.preventDefault();
    deferredPrompt = e;
    
    // عرض زر التثبيت
    installBtn.style.display = 'flex';
    
    // إخفاء الزر بعد 5 ثوانٍ إذا لم يقم المستخدم بالتثبيت
    setTimeout(() => {
        if (installBtn.style.display === 'flex') {
            installBtn.style.display = 'none';
        }
    }, 5000);
});

// معالجة نقر زر التثبيت
installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    // إظهار مطالبة التثبيت
    deferredPrompt.prompt();
    
    // الانتظار للاستجابة من المستخدم
    const { outcome } = await deferredPrompt.userChoice;
    
    // إخفاء الزر إذا تم التثبيت
    if (outcome === 'accepted') {
        installBtn.style.display = 'none';
    }
    
    deferredPrompt = null;
});

// إخفاء زر التثبيت بعد تثبيت التطبيق
window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    deferredPrompt = null;
    console.log('تطبيق الحاسبة تم تثبيته بنجاح');
});

// التحقق من تحديثات الخدمة ووركر
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker مسجل بنجاح:', registration.scope);
                
                // التحقق من التحديثات كل 12 ساعة
                setInterval(() => {
                    registration.update();
                }, 12 * 60 * 60 * 1000);
            })
            .catch(error => {
                console.error('فشل في تسجيل ServiceWorker:', error);
            });
    });
    
    // معالجة التحديثات
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });
}

// دالة لتحديث التطبيق
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
        
        // تأثير مرئي
        refreshBtn.textContent = '✓';
        setTimeout(() => {
            refreshBtn.textContent = '↻';
        }, 1500);
    });
}

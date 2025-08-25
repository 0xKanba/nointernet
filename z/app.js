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

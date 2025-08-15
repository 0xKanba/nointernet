let deferredPrompt;

const installBtn = document.getElementById('install-btn');
const refreshBtn = document.getElementById('refresh-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'flex';
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        installBtn.style.display = 'none';
    }
    deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                console.log('Service Worker registered');
                reg.update();
            })
            .catch(err => console.error('Service Worker failed:', err));
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        refreshBtn.style.display = 'flex';
    });
}

refreshBtn?.addEventListener('click', () => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('skipWaiting');
    }
    refreshBtn.style.display = 'none';
});

// PWA Installation Handler
let deferredPrompt;
const installButton = document.getElementById('install-btn');

// Show install button when app can be installed
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';
});

// Install button click handler
installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    // Show installation prompt
    deferredPrompt.prompt();
    
    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    
    // Hide button regardless of choice
    installButton.style.display = 'none';
    deferredPrompt = null;
});

// Hide install button after app is installed
window.addEventListener('appinstalled', () => {
    installButton.style.display = 'none';
    deferredPrompt = null;
});

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service worker registered'))
            .catch(err => console.error('Service worker failed', err));
    });
}

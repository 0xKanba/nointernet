let deferredPrompt;

const installBtn = document.getElementById('install-btn');
const refreshBtn = document.getElementById('refresh-btn');

// Install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
  refreshBtn.style.display = 'block';
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
  console.log('App installed');
});

// Refresh on update
refreshBtn?.addEventListener('click', () => {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage('skipWaiting');
  }
  location.reload();
});

// Detect update
navigator.serviceWorker.addEventListener('controllerchange', () => {
  refreshBtn.style.display = 'block';
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      console.log('SW registered');
    }).catch(err => console.error('SW failed:', err));
  });
}

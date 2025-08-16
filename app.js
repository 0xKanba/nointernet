window.addEventListener('load', () => {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateButton();
            }
          });
        });

        // Check for updates every 30 seconds
        setInterval(() => reg.update(), 30 * 1000);
      });
  }

  // Show install button
  if ('BeforeInstallPromptEvent' in window) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      showInstallButton(e);
    });
  }
});

function showUpdateButton() {
  const btn = document.createElement('button');
  btn.innerHTML = '🔄 Update App';
  btn.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    padding: 12px 20px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 30px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    cursor: pointer;
  `;

  btn.onclick = () => {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg?.waiting) {
        reg.waiting.postMessage({type: 'SKIP_WAITING'});
        setTimeout(() => window.location.reload(), 300);
      }
    });
  };

  document.body.appendChild(btn);
}

function showInstallButton(event) {
  const btn = document.createElement('button');
  btn.innerHTML = '📱 Install App';
  btn.style.cssText = `
    position: fixed;
    top: 70px;
    left: 20px;
    padding: 12px 20px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 30px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    cursor: pointer;
  `;

  btn.onclick = () => {
    event.prompt();
    btn.remove();
  };

  document.body.appendChild(btn);
}

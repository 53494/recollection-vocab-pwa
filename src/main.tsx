import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import {
  getChunkErrorUrl,
  shouldReloadForChunkError,
} from './utils/chunkRecovery';
import './index.css';

let serviceWorkerReloading = false;
let updateServiceWorker: (reloadPage?: boolean) => Promise<void>;

window.addEventListener('vite:preloadError', (event) => {
  const failedUrl = getChunkErrorUrl(event.payload);
  if (!shouldReloadForChunkError(window.sessionStorage, failedUrl)) return;
  event.preventDefault();
  window.location.reload();
});

updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    void updateServiceWorker(true);
  },
  onRegisteredSW(_swUrl, registration) {
    void registration?.update();
  },
  onRegisterError(error) {
    console.error('Service Worker 注册失败', error);
  },
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (serviceWorkerReloading) return;
    serviceWorkerReloading = true;
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

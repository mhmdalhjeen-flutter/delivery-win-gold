import { registerSW } from 'virtual:pwa-register';

const PWA_UPDATE_READY = 'delivery-pwa-update-ready';
const PWA_OFFLINE_READY = 'delivery-pwa-offline-ready';

let refreshHandler = null;

export function activatePwaUpdate() {
  if (typeof refreshHandler === 'function') {
    refreshHandler(true);
  } else {
    window.location.reload();
  }
}

export function initPwaServiceWorker() {
  if (typeof window === 'undefined') return;

  refreshHandler = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent(PWA_UPDATE_READY));
    },
    onOfflineReady() {
      window.dispatchEvent(new CustomEvent(PWA_OFFLINE_READY));
    },
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        registration.update().catch(() => {});
        window.setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
  });
}

export { PWA_UPDATE_READY, PWA_OFFLINE_READY };

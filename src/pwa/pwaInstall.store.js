/** Global PWA install capture — must load once at app bootstrap, before route navigation. */

let deferredPrompt = null;
let isInstalled = false;
let installing = false;
let initialized = false;
const listeners = new Set();

function logPwaInstall(event, detail) {
  if (import.meta.env.DEV) {
    console.debug('[delivery-pwa-install]', event, detail ?? '');
  }
}

export function isPwaStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function buildSnapshot() {
  const canInstall = Boolean(deferredPrompt) && !isInstalled;
  const installStatus = isInstalled
    ? 'installed'
    : canInstall
      ? 'installable'
      : 'unavailable';

  return {
    canInstall,
    isInstalled,
    installing,
    installStatus,
    isStandalone: isInstalled,
  };
}

let snapshot = buildSnapshot();

function refreshSnapshot() {
  snapshot = buildSnapshot();
  logPwaInstall('state', snapshot);
  notify();
}

export function initPwaInstallCapture() {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;

  isInstalled = isPwaStandalone();
  logPwaInstall('init', { isStandalone: isInstalled });

  if (isInstalled) {
    refreshSnapshot();
    return;
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    logPwaInstall('beforeinstallprompt', { captured: true });
    refreshSnapshot();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    isInstalled = true;
    logPwaInstall('appinstalled');
    refreshSnapshot();
  });

  refreshSnapshot();
}

export function subscribePwaInstall(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPwaInstallSnapshot() {
  return snapshot;
}

export async function promptPwaInstall() {
  logPwaInstall('promptInstall()', {
    hasDeferredPrompt: Boolean(deferredPrompt),
    isInstalled,
  });

  if (!deferredPrompt || isInstalled) {
    return { outcome: 'unavailable' };
  }

  installing = true;
  refreshSnapshot();

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === 'accepted') {
      isInstalled = true;
    }
    logPwaInstall('promptInstall result', { outcome });
    return { outcome };
  } catch (err) {
    logPwaInstall('promptInstall error', err?.message || err);
    return { outcome: 'dismissed' };
  } finally {
    installing = false;
    refreshSnapshot();
  }
}

if (typeof window !== 'undefined') {
  initPwaInstallCapture();
}

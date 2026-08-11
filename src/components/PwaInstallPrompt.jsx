import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const DISMISS_KEY = 'delivery-pwa-install-dismissed-v1';

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    /* ignore */
  }
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasDismissed()) return undefined;

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setVisible(true);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setVisible(false);
      markDismissed();
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    markDismissed();
    setVisible(false);
    setDeferredPrompt(null);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        markDismissed();
        setVisible(false);
      }
      setDeferredPrompt(null);
    } catch {
      /* ignore */
    } finally {
      setInstalling(false);
    }
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="pwa-install-banner" dir="rtl">
      <img src="/brand/logo-192.png" alt="" className="pwa-install-banner__logo" />
      <div className="pwa-install-banner__body">
        <strong>ثبّت تطبيق Win Gold للتوصيل</strong>
        <p>وصول أسرع للطلبات والإشعارات حتى عند إغلاق المتصفح.</p>
      </div>
      <div className="pwa-install-banner__actions">
        <button type="button" className="pwa-install-banner__install" onClick={install} disabled={installing}>
          <Download size={16} />
          {installing ? 'جاري...' : 'تثبيت'}
        </button>
        <button type="button" className="icon-btn" onClick={dismiss} aria-label="إغلاق">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

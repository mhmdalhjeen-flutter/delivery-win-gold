import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

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

export default function PwaInstallPrompt() {
  const { canInstall, isInstalled, installing, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(wasDismissed);
  const visible = canInstall && !dismissed && !isInstalled;

  useEffect(() => {
    if (isInstalled) {
      markDismissed();
      setDismissed(true);
    }
  }, [isInstalled]);

  const dismiss = () => {
    markDismissed();
    setDismissed(true);
  };

  const install = async () => {
    const { outcome } = await promptInstall();
    if (outcome === 'accepted') {
      markDismissed();
      setDismissed(true);
    }
  };

  if (!visible) return null;

  return (
    <div className="pwa-install-banner" dir="rtl">
      <img src="/brand/win-goldenstore-logo-deleviry.png" alt="" className="pwa-install-banner__logo" />
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

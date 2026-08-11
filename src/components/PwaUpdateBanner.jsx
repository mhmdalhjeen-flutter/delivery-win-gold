import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { activatePwaUpdate, PWA_UPDATE_READY } from '../pwa/registerServiceWorker';

export default function PwaUpdateBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onUpdate = () => setVisible(true);
    window.addEventListener(PWA_UPDATE_READY, onUpdate);
    return () => window.removeEventListener(PWA_UPDATE_READY, onUpdate);
  }, []);

  if (!visible) return null;

  return (
    <div className="pwa-update-banner" dir="rtl">
      <span>يتوفر تحديث جديد للتطبيق</span>
      <button type="button" className="pwa-update-banner__btn" onClick={() => activatePwaUpdate()}>
        <RefreshCw size={16} />
        تحديث الآن
      </button>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';

export function isPwaStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => isPwaStandalone());
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isPwaStandalone()) return undefined;

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const canInstall = Boolean(deferredPrompt) && !isInstalled;

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt || isInstalled) {
      return { outcome: 'unavailable' };
    }

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      return { outcome };
    } catch {
      return { outcome: 'dismissed' };
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt, isInstalled]);

  return {
    canInstall,
    isInstalled,
    installing,
    promptInstall,
  };
}

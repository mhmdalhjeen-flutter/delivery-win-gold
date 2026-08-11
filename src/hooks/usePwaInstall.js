import { useSyncExternalStore } from 'react';
import {
  getPwaInstallSnapshot,
  isPwaStandalone,
  promptPwaInstall,
  subscribePwaInstall,
} from '../pwa/pwaInstall.store';

export { isPwaStandalone };

export function usePwaInstall() {
  const state = useSyncExternalStore(
    subscribePwaInstall,
    getPwaInstallSnapshot,
    getPwaInstallSnapshot,
  );

  return {
    ...state,
    promptInstall: promptPwaInstall,
  };
}

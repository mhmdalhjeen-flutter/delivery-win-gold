import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  isPushSupported,
  ensurePushSubscriptionSynced,
  logPushDiagnostic,
} from '../pwa/pushNotifications';

const RETRYABLE_REASONS = new Set([
  'vapid_unavailable',
  'service_worker_not_ready',
  'backend_subscribe_failed',
  'subscribe_failed',
  'not_authenticated',
]);

export default function PushSubscriptionHost() {
  const { isAuth } = useAuth();
  const lastSyncedTokenRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('deliveryToken');
    if (!isAuth || !token) {
      lastSyncedTokenRef.current = null;
      return undefined;
    }
    if (!isPushSupported()) return undefined;
    if (Notification.permission === 'denied') {
      logPushDiagnostic('host_skipped_denied', { ok: false, level: 'error' });
      return undefined;
    }

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;

      const result = await ensurePushSubscriptionSynced();
      if (cancelled) return;

      if (result.ok) {
        lastSyncedTokenRef.current = token;
        return;
      }

      logPushDiagnostic('host_sync_incomplete', {
        ok: false,
        level: 'error',
        reason: result.reason,
      });

      if (!RETRYABLE_REASONS.has(result.reason)) {
        lastSyncedTokenRef.current = token;
      }
    };

    const timeoutId = window.setTimeout(run, 0);
    const onOnline = () => {
      run();
    };

    window.addEventListener('online', onOnline);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener('online', onOnline);
    };
  }, [isAuth]);

  return null;
}

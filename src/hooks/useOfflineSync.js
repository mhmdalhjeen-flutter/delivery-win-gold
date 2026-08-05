import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import {
  getQueuedDeliveries,
  removeQueuedDelivery,
} from '../lib/offlineDeliveryQueue';

export default function useOfflineSync(enabled = true) {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(() => {
    setPendingCount(getQueuedDeliveries().length);
  }, []);

  const syncQueue = useCallback(async () => {
    if (!enabled || !navigator.onLine) return;
    const queue = getQueuedDeliveries();
    if (!queue.length) {
      refreshCount();
      return;
    }

    setSyncing(true);
    try {
      const { data } = await api.post('/delivery/driver/assignments/sync', {
        items: queue.map((item) => ({
          sessionId: item.sessionId,
          clientSyncId: item.clientSyncId,
          deliveryNote: item.deliveryNote || '',
          deliveryProof: item.deliveryProof || '',
        })),
      });

      (data.results || []).forEach((result) => {
        if (result.success && result.clientSyncId) {
          removeQueuedDelivery(result.clientSyncId);
        }
      });
    } catch (_) {
      /* keep queue for retry */
    } finally {
      setSyncing(false);
      refreshCount();
    }
  }, [enabled, refreshCount]);

  useEffect(() => {
    refreshCount();
    if (!enabled) return undefined;

    const onOnline = () => syncQueue();
    window.addEventListener('online', onOnline);
    syncQueue();

    return () => window.removeEventListener('online', onOnline);
  }, [enabled, refreshCount, syncQueue]);

  return { pendingCount, syncing, syncQueue, refreshCount };
}

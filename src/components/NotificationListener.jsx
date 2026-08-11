import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import { isDeliveryNotificationType } from '../utils/deliveryPushConfig';

const STORAGE_KEY = 'deliverySeenNotifIds';
const ONLINE_POLL_MS = 20_000;
const OFFLINE_POLL_MS = 60_000;
const TOAST_MS = 4500;

function loadSeenIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveSeenIds(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set].slice(-60)));
  } catch {
    /* ignore */
  }
}

function toNotificationRecord(raw) {
  if (!raw) return null;
  if (raw._id) return raw;
  return {
    _id: raw.id || `push-${Date.now()}`,
    type: raw.type || raw.data?.type || 'info',
    title: raw.title || '',
    body: raw.body || '',
    data: raw.data || {},
  };
}

export default function NotificationListener() {
  const { isAuth, user } = useAuth();
  const queryClient = useQueryClient();
  const seenRef = useRef(loadSeenIds());
  const pollingRef = useRef(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((title, body) => {
    const message = title || body;
    if (!message) return;
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const processNotifications = useCallback((list) => {
    const role = user?.role;
    let hasImportant = false;
    let hasChat = false;
    let hasDelivery = false;

    for (const n of list) {
      if (seenRef.current.has(n._id)) continue;
      if (!isDeliveryNotificationType(n.type, role)) continue;

      seenRef.current.add(n._id);
      hasImportant = true;
      showToast(n.title, n.body);

      if (n.type === 'chat_message') hasChat = true;
      if (n.type?.startsWith('delivery_')) hasDelivery = true;
    }

    if (hasImportant) {
      saveSeenIds(seenRef.current);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationCount });
    }

    if (hasChat) {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatUnreadCount });
    }

    if (hasDelivery) {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      queryClient.invalidateQueries({ queryKey: ['delivery', 'company', 'requests'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.driverAssignments });
    }
  }, [queryClient, showToast, user?.role]);

  const poll = useCallback(async () => {
    if (!isAuth) return;
    try {
      const { data } = await api.get('/notifications', {
        params: { unread: 'true', limit: 15 },
      });
      const list = data.notifications || [];
      processNotifications(list);
    } catch {
      /* تجاهل أخطاء الشبكة */
    }
  }, [isAuth, processNotifications]);

  const handlePushPayload = useCallback((payload) => {
    const notification = toNotificationRecord(payload);
    if (!notification) return;
    processNotifications([notification]);
  }, [processNotifications]);

  useEffect(() => () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isAuth) return undefined;

    const schedulePoll = () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      const interval = navigator.onLine ? ONLINE_POLL_MS : OFFLINE_POLL_MS;
      pollingRef.current = window.setInterval(poll, interval);
    };

    const onOnline = () => {
      poll();
      schedulePoll();
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') poll();
    };

    const onServiceWorkerMessage = (event) => {
      if (event.data?.type === 'PUSH_NOTIFICATION') {
        handlePushPayload(event.data.notification);
      }
    };

    poll();
    schedulePoll();

    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    navigator.serviceWorker?.addEventListener('message', onServiceWorkerMessage);

    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
      navigator.serviceWorker?.removeEventListener('message', onServiceWorkerMessage);
    };
  }, [isAuth, poll, handlePushPayload]);

  if (!toast) return null;

  return (
    <div className="delivery-toast" role="status" aria-live="polite">
      {toast}
    </div>
  );
}

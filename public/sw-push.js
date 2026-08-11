/* eslint-disable no-restricted-globals */
/**
 * Web Push handlers for the delivery PWA (company + driver roles).
 */

const DEFAULT_ICON = '/brand/win-goldenstore-logo-deleviry.png';
const DEFAULT_TITLE = 'Win Gold Delivery';
const DEFAULT_URL = '/notifications';

function parsePushPayload(event) {
  if (!event.data) {
    return { title: DEFAULT_TITLE, body: '', icon: DEFAULT_ICON, url: DEFAULT_URL, data: {} };
  }

  try {
    const payload = event.data.json();
    const data = payload.data && typeof payload.data === 'object' ? payload.data : {};
    const type = payload.type || data.type || '';
    return {
      title: payload.title || DEFAULT_TITLE,
      body: payload.body || '',
      icon: payload.icon || DEFAULT_ICON,
      url: payload.url || data.url || DEFAULT_URL,
      type,
      notificationId: payload.notificationId || data.notificationId || '',
      data: { ...data, type: type || data.type || '' },
    };
  } catch {
    const text = event.data.text ? event.data.text() : '';
    return {
      title: DEFAULT_TITLE,
      body: text || '',
      icon: DEFAULT_ICON,
      url: DEFAULT_URL,
      data: {},
    };
  }
}

function resolveAppUrl(path) {
  try {
    return new URL(path || DEFAULT_URL, self.location.origin).href;
  } catch {
    return new URL(DEFAULT_URL, self.location.origin).href;
  }
}

function resolveDeliveryDeepLink(data = {}) {
  if (typeof data.url === 'string' && data.url.startsWith('/')) {
    return data.url;
  }

  const { type, deliverySessionId } = data;

  switch (type) {
    case 'delivery_assigned_to_you':
    case 'delivery_out_for_delivery':
      if (deliverySessionId) return `/driver/delivery/${deliverySessionId}`;
      return '/driver';
    case 'delivery_new_request':
    case 'delivery_waiting_stores':
    case 'delivery_completed':
    case 'delivery_cancelled':
    case 'delivery_rejected':
      if (deliverySessionId) return `/requests/${deliverySessionId}`;
      return '/requests';
    case 'push_test':
      return '/notifications';
    case 'chat_message': {
      const senderId = data.senderId != null ? String(data.senderId) : '';
      const recipientRole = data.recipientRole != null ? String(data.recipientRole) : '';
      if (recipientRole === 'delivery_driver') {
        if (senderId) return `/driver/chat/${senderId}`;
        return '/driver';
      }
      if (senderId) return `/chat/${senderId}`;
      return '/chats';
    }
    default:
      if (deliverySessionId) return `/requests/${deliverySessionId}`;
      break;
  }

  return DEFAULT_URL;
}

self.addEventListener('push', (event) => {
  const payload = parsePushPayload(event);
  const deepLink = resolveDeliveryDeepLink({
    ...payload.data,
    url: payload.url || payload.data?.url,
  });
  const targetUrl = resolveAppUrl(deepLink);

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || DEFAULT_ICON,
        dir: 'rtl',
        lang: 'ar',
        tag: payload.notificationId || payload.data?.notificationId || payload.type || 'wingold-delivery',
        renotify: true,
        data: {
          ...payload.data,
          type: payload.type || payload.data?.type || '',
          notificationId: payload.notificationId || payload.data?.notificationId || '',
          url: targetUrl,
        },
      });

      try {
        const clientList = await clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });
        clientList.forEach((client) => {
          client.postMessage({
            type: 'PUSH_NOTIFICATION',
            notification: {
              id: payload.notificationId || payload.data?.notificationId || `push-${Date.now()}`,
              type: payload.type || payload.data?.type || 'info',
              title: payload.title,
              body: payload.body,
              data: payload.data || {},
            },
          });
        });
      } catch {
        /* non-fatal */
      }
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = resolveAppUrl(
    resolveDeliveryDeepLink(event.notification.data || {}),
  );

  event.waitUntil(
    (async () => {
      const windowClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if (!client.url.startsWith(self.location.origin)) continue;
        if ('focus' in client) {
          await client.focus();
        }
        if ('navigate' in client) {
          try {
            await client.navigate(targetUrl);
            return;
          } catch {
            /* fall through */
          }
        }
        return;
      }

      if (clients.openWindow) {
        await clients.openWindow(targetUrl);
      }
    })(),
  );
});

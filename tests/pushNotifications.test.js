/**
 * Delivery push subscription sync control-flow tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

function installLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

installLocalStorage();
globalThis.Notification = { permission: 'granted' };
globalThis.PushManager = function PushManager() {};
globalThis.navigator = {
  serviceWorker: { ready: Promise.resolve({ pushManager: {} }) },
};
globalThis.window = globalThis;

import {
  ensurePushSubscriptionSynced,
  SUBSCRIPTION_STATUS_KEY,
  PUSH_APP,
} from '../src/pwa/pushNotifications.js';

const MOCK_SUBSCRIPTION = {
  endpoint: 'https://push.example.test/subscriber/delivery-abc',
  toJSON() {
    return {
      endpoint: this.endpoint,
      expirationTime: null,
      keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
    };
  },
};

function createDeps(overrides = {}) {
  const postCalls = [];
  const syncWithBackend = overrides.syncWithBackend
    ?? (async (sub) => {
      postCalls.push({
        app: PUSH_APP,
        platform: 'web',
        subscription: sub.toJSON(),
      });
      localStorage.setItem(SUBSCRIPTION_STATUS_KEY, '1');
    });

  return {
    deps: {
      getToken: overrides.getToken ?? (() => localStorage.getItem('deliveryToken')),
      getRegistration: async () => ({ pushManager: {} }),
      getSubscription: async () => overrides.initialSubscription ?? MOCK_SUBSCRIPTION,
      createSubscription: async () => {
        throw new Error('createSubscription should not run');
      },
      syncWithBackend,
      fetchPublicKey: async () => {
        throw new Error('fetchPublicKey should not run');
      },
      getPermission: () => 'granted',
      requestPermission: async () => 'granted',
    },
    postCalls,
  };
}

test('delivery: existing PushSubscription syncs with app delivery', async () => {
  installLocalStorage({ deliveryToken: 'delivery-jwt' });
  const { deps, postCalls } = createDeps();

  const result = await ensurePushSubscriptionSynced(deps);

  assert.equal(result.ok, true);
  assert.equal(postCalls[0].app, 'delivery');
  assert.equal(postCalls[0].platform, 'web');
});

test('delivery: failed sync allows retry (localStorage cleared)', async () => {
  installLocalStorage({ deliveryToken: 'delivery-jwt', [SUBSCRIPTION_STATUS_KEY]: '1' });
  const { deps } = createDeps({
    syncWithBackend: async () => {
      throw new Error('network error');
    },
  });

  const result = await ensurePushSubscriptionSynced(deps);

  assert.equal(result.ok, false);
  assert.equal(localStorage.getItem(SUBSCRIPTION_STATUS_KEY), null);
});

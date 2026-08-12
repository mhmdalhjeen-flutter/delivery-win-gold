/** Persisted React Query cache for delivery settings offline reads. */

export const CACHE_STORAGE_KEY = 'delivery-settings-rq-cache-v1';

export const PERSIST_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const SETTINGS_QUERY_SEGMENTS = new Set([
  'profile',
  'payment-settings',
  'pricing',
  'regions',
  'driver-registration-password',
]);

export function shouldPersistQuery(query) {
  const key = query.queryKey;
  if (!Array.isArray(key) || key.length < 3) return false;
  return key[0] === 'delivery' && key[1] === 'company' && SETTINGS_QUERY_SEGMENTS.has(key[2]);
}

export function trimDehydratedState(dehydratedState) {
  return dehydratedState;
}

import { useQuery } from '@tanstack/react-query';

const SETTINGS_STALE_MS = 5 * 60 * 1000;

/** Settings queries: show cached data immediately, refresh in background when online. */
export function useSettingsQuery(options) {
  return useQuery({
    staleTime: SETTINGS_STALE_MS,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'offlineFirst',
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function isSettingsLoading(isLoading, data) {
  return Boolean(isLoading && data == null);
}

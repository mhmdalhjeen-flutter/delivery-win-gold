import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import {
  CACHE_STORAGE_KEY,
  PERSIST_MAX_AGE_MS,
  shouldPersistQuery,
  trimDehydratedState,
} from './settingsCacheConfig';

const storage = typeof window !== 'undefined' ? window.localStorage : {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const queryPersister = createSyncStoragePersister({
  storage,
  key: CACHE_STORAGE_KEY,
  throttleTime: 1000,
  serialize: (persistedClient) => JSON.stringify({
    ...persistedClient,
    clientState: trimDehydratedState(persistedClient.clientState),
  }),
  deserialize: (cached) => JSON.parse(cached),
});

export const persistOptions = {
  persister: queryPersister,
  maxAge: PERSIST_MAX_AGE_MS,
  dehydrateOptions: {
    shouldDehydrateQuery: shouldPersistQuery,
  },
};

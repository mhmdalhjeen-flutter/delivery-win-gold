import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 1000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export const queryKeys = {
  dashboardStats: ['delivery', 'dashboard', 'stats'],
  trips: (params) => ['delivery', 'trips', params],
  trip: (id) => ['delivery', 'trip', id],
};

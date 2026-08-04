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
  dashboardStats: ['delivery', 'company', 'dashboard', 'stats'],
  requests: (params) => ['delivery', 'company', 'requests', params],
  request: (id) => ['delivery', 'company', 'request', id],
  profile: ['delivery', 'company', 'profile'],
  paymentSettings: ['delivery', 'company', 'payment-settings'],
  pricing: ['delivery', 'company', 'pricing'],
  regions: ['delivery', 'company', 'regions'],
  chats: ['delivery', 'chats'],
  notifications: ['delivery', 'notifications'],
  notificationCount: ['delivery', 'notifications', 'unread'],
  sentOrders: ['delivery', 'company', 'sent-orders'],
  drivers: (params) => ['delivery', 'company', 'drivers', params],
};

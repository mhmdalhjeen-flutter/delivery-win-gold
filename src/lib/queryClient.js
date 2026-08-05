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
  chatUnreadCount: ['delivery', 'chats', 'unread'],
  notifications: ['delivery', 'notifications'],
  notificationCount: ['delivery', 'notifications', 'unread'],
  sentOrders: ['delivery', 'company', 'sent-orders'],
  assignedOrders: ['delivery', 'company', 'assigned-orders'],
  drivers: (params) => ['delivery', 'company', 'drivers', params],
  driverAssignments: ['delivery', 'driver', 'assignments'],
  driverAssignment: (id) => ['delivery', 'driver', 'assignment', id],
  driverHistory: ['delivery', 'driver', 'history'],
  driverRegistrationPassword: ['delivery', 'company', 'driver-registration-password'],
};

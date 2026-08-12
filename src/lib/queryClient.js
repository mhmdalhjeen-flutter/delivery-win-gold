import { QueryClient } from '@tanstack/react-query';



export const queryClient = new QueryClient({

  defaultOptions: {

    queries: {

      staleTime: 60 * 1000,

      gcTime: 7 * 24 * 60 * 60 * 1000,

      refetchOnWindowFocus: true,

      refetchOnReconnect: true,

      networkMode: 'offlineFirst',

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

  driverPendingConfirmations: ['delivery', 'driver', 'pending-confirmations'],

  driverAssignment: (id) => ['delivery', 'driver', 'assignment', id],

  driverHistory: ['delivery', 'driver', 'history'],

  driverRegistrationPassword: ['delivery', 'company', 'driver-registration-password'],

  deliveryProofs: (params) => ['delivery', 'company', 'proofs', params],

  deliveryProofFilterOptions: ['delivery', 'company', 'proofs', 'filter-options'],

  companyBilling: ['delivery', 'company', 'billing'],

  billingPaymentMethods: ['delivery', 'company', 'billing', 'payment-methods'],

};


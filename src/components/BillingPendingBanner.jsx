import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';

export default function BillingPendingBanner() {
  const { data: billing } = useQuery({
    queryKey: queryKeys.companyBilling,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/billing');
      return data;
    },
    staleTime: 0,
  });

  if (!billing?.paymentPending) return null;

  return (
    <div className="billing-pending-banner" role="status" aria-live="polite">
      الدفع قيد المراجعة
    </div>
  );
}

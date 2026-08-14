import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';

export default function BillingAccessGate({ children }) {
  const location = useLocation();
  const onBillingPage = location.pathname.startsWith('/settings/billing');

  const { data: billing, isLoading, isError } = useQuery({
    queryKey: queryKeys.companyBilling,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/billing');
      return data;
    },
    staleTime: 20 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="billing-access-loading">
        <Loader2 className="spin" size={28} aria-hidden="true" />
      </div>
    );
  }

  if (isError) {
    return children;
  }

  if (onBillingPage) {
    return children;
  }

  if (billing?.needsPayment) {
    return <Navigate to="/settings/billing" replace />;
  }

  return children;
}

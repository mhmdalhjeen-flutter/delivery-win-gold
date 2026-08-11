import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';

export default function BillingPaymentBanner() {
  const { data: billing } = useQuery({
    queryKey: queryKeys.companyBilling,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/billing');
      return data;
    },
    staleTime: 30 * 1000,
  });

  if (!billing) return null;
  if (billing.paymentRejected) return null;

  const show = billing.needsPayment || billing.paymentPending;
  if (!show) return null;

  const label = billing.paymentPending
    ? 'دفع الاشتراك الشهري قيد المراجعة'
    : 'مطلوب دفع الاشتراك الشهري';

  return (
    <Link to="/settings/billing" className="billing-banner">
      <span>{label}</span>
      <span className="billing-banner__cta">عرض</span>
    </Link>
  );
}

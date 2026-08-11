import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';

export default function BillingPaymentRejectedGate({ children }) {
  const location = useLocation();
  const onBillingPage = location.pathname.startsWith('/settings/billing');

  const { data: billing, isLoading } = useQuery({
    queryKey: queryKeys.companyBilling,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/billing');
      return data;
    },
    staleTime: 20 * 1000,
    retry: false,
  });

  if (isLoading || onBillingPage) return children;

  if (!billing?.paymentRejected) return children;

  return (
    <div className="billing-rejected-gate">
      <div className="billing-rejected-gate__card">
        <h2>تصحيح دفع الاشتراك مطلوب</h2>
        <p>{billing.payment?.rejectionReason || 'تم رفض بيانات الدفع — يرجى المراجعة وإعادة الإرسال.'}</p>
        <Link to="/settings/billing" className="billing-primary-btn">تصحيح الدفع</Link>
      </div>
    </div>
  );
}

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';

const PLATFORM_LOGO = '/brand/logo-192.png';

export default function DeliveryBrandHeader({ className = '' }) {
  const { user } = useAuth();
  const isCompany = user?.role === 'delivery_company';

  const { data: profile } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/profile');
      return data.company;
    },
    enabled: isCompany,
    staleTime: 5 * 60 * 1000,
  });

  if (!isCompany) {
    return (
      <div className={`delivery-brand delivery-brand--solo ${className}`.trim()}>
        <img src={PLATFORM_LOGO} alt="" className="delivery-brand__platform-logo" />
      </div>
    );
  }

  const companyName = profile?.name || user?.name || 'شركة التوصيل';

  return (
    <div className={`delivery-brand ${className}`.trim()} dir="rtl">
      <img src={PLATFORM_LOGO} alt="" className="delivery-brand__platform-logo" />
      <div className="delivery-brand__company">
        {profile?.logo ? (
          <img src={profile.logo} alt="" className="delivery-brand__company-logo" />
        ) : (
          <span className="delivery-brand__company-fallback">{companyName[0] || 'ش'}</span>
        )}
        <span className="delivery-brand__company-name">{companyName}</span>
      </div>
    </div>
  );
}

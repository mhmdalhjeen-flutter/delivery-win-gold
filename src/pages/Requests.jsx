import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import TripCard from '../components/TripCard';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';

const FILTER_TITLES = {
  new: 'بانتظار القبول',
  delivered: 'تم التسليم',
  rejected: 'مرفوضة',
  all: 'جميع الطلبات',
};

export default function Requests() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const status = params.get('status') || 'new';

  const { data: requests = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.requests({ status }),
    queryFn: async () => {
      const queryParams = status === 'all' ? {} : { status };
      const { data } = await api.get('/delivery/company/requests', { params: queryParams });
      return data.requests || [];
    },
    refetchInterval: 20_000,
  });

  const title = FILTER_TITLES[status] || FILTER_TITLES.all;

  return (
    <div className="app-shell">
      <AppHeader
        title={title}
        actions={(
          <button type="button" className="icon-btn" onClick={() => refetch()} aria-label="تحديث">
            <RefreshCw size={18} className={isFetching ? 'spin' : ''} />
          </button>
        )}
      />

      <div className="filter-chips">
        {Object.entries(FILTER_TITLES).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`filter-chip${status === key ? ' filter-chip--active' : ''}`}
            onClick={() => navigate(key === 'new' ? '/requests' : `/requests?status=${key}`)}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && requests.length === 0 && (
        <div className="empty-state">
          <p>لا توجد طلبات في هذا القسم</p>
        </div>
      )}

      <div className="trip-list">
        {requests.map((request) => (
          <TripCard
            key={request._id}
            trip={request}
            onClick={() => navigate(`/requests/${request._id}`)}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

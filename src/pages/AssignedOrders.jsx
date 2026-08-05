import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SentOrderCard from '../components/SentOrderCard';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';

export default function AssignedOrders() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.assignedOrders,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/requests', { params: { status: 'assigned' } });
      return data.requests || [];
    },
    refetchInterval: 20_000,
  });

  return (
    <div className="app-shell">
      <AppHeader
        title="معيّن لسائق"
        subtitle="بانتظار استلام السائق من المتجر"
        actions={(
          <button type="button" className="icon-btn" onClick={() => refetch()} aria-label="تحديث">
            <RefreshCw size={18} className={isFetching ? 'spin' : ''} />
          </button>
        )}
      />

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && orders.length === 0 && (
        <div className="empty-state">
          <p>لا توجد طلبات معيّنة لسائق</p>
          <p className="form-hint">عند تعيين سائق لطلب جاهز للاستلام، يظهر هنا حتى يستلم من المتجر.</p>
          <button type="button" className="btn-secondary" onClick={() => navigate('/requests')}>
            مراجعة الطلبات الجاهزة
          </button>
        </div>
      )}

      <div className="sent-order-list">
        {orders.map((order) => (
          <SentOrderCard key={order._id} order={order} showComplete={false} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

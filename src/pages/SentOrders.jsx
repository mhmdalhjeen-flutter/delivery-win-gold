import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SentOrderCard from '../components/SentOrderCard';
import BottomNav from '../components/BottomNav';

export default function SentOrders() {
  const { data: orders = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.sentOrders,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/requests', { params: { status: 'sent' } });
      return data.requests || [];
    },
    refetchInterval: 20_000,
  });

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <h1>الطلبات المرسلة</h1>
          <p className="page-header__eyebrow">طلبات قيد التوصيل مع سائق معيّن</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => refetch()} aria-label="تحديث">
          {isFetching ? '…' : '↻'}
        </button>
      </header>

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && orders.length === 0 && (
        <div className="empty-state">
          <p>لا توجد طلبات مرسلة حالياً</p>
          <p className="form-hint">عند قبول طلب وتعيين سائق، يظهر هنا تلقائياً.</p>
        </div>
      )}

      <div className="sent-order-list">
        {orders.map((order) => (
          <SentOrderCard key={order._id} order={order} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

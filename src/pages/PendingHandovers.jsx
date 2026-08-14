import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';

function formatHandoverDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ar-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function PendingHandovers() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.pendingHandovers,
    queryFn: async () => {
      const { data: res } = await api.get('/delivery/company/pending-handovers');
      return res.handovers || [];
    },
    refetchInterval: 20_000,
  });

  const handovers = data || [];

  return (
    <div className="app-shell">
      <AppHeader
        title="طلبات لم تُسلَّم للزبون"
        subtitle="تم استلامها من المتجر وبانتظار تسليم الزبون"
        actions={(
          <button type="button" className="icon-btn" onClick={() => refetch()} aria-label="تحديث">
            <RefreshCw size={18} className={isFetching ? 'spin' : ''} />
          </button>
        )}
      />

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && handovers.length === 0 && (
        <div className="empty-state">
          <p>لا توجد طلبات معلّقة</p>
          <p className="form-hint">عند تسليم المتجر للسائق، يظهر الطلب هنا حتى يؤكّد السائق التسليم للزبون.</p>
        </div>
      )}

      <div className="card-list">
        {handovers.map((row) => (
          <article key={row.handoverId || row.orderId} className="panel-card">
            <div className="panel-card__head">
              <strong>
                #
                {row.orderNumber || '—'}
              </strong>
            </div>
            <dl className="panel-card__meta">
              <div>
                <dt>السائق</dt>
                <dd>{row.driverName || '—'}</dd>
              </div>
              <div>
                <dt>الزبون</dt>
                <dd>{row.customerName || '—'}</dd>
              </div>
              <div>
                <dt>تاريخ التسليم للدلفري</dt>
                <dd>{formatHandoverDate(row.handoverAt)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

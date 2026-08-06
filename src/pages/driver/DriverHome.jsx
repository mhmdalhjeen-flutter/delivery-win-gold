import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LogOut, MapPin, Phone, RefreshCw, User, WifiOff } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { queryKeys } from '../../lib/queryClient';
import useOfflineSync from '../../hooks/useOfflineSync';
import AppHeader from '../../components/AppHeader';
import DriverBottomNav from '../../components/DriverBottomNav';


export default function DriverHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { pendingCount, syncing, syncQueue } = useOfflineSync(true);

  const { data: assignments = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.driverAssignments,
    queryFn: async () => {
      const { data } = await api.get('/delivery/driver/assignments');
      return data.assignments || [];
    },
    refetchInterval: 8_000,
  });

  return (
    <div className="app-shell app-shell--driver">
      <AppHeader
        eyebrow="تطبيق السائق"
        title={user?.name || 'السائق'}
        actions={(
          <>
            <button type="button" className="icon-btn" onClick={() => refetch()} aria-label="تحديث">
              <RefreshCw size={18} className={isFetching || syncing ? 'spin' : ''} />
            </button>
            <button type="button" className="icon-btn" onClick={logout} aria-label="خروج">
              <LogOut size={18} />
            </button>
          </>
        )}
      />

      {!navigator.onLine && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>لا يوجد اتصال — يمكنك تأكيد التسليم وسيتم المزامنة تلقائياً</span>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="sync-banner">
          <span>{pendingCount} تسليم بانتظار المزامنة</span>
          <button type="button" className="btn-ghost-sm" onClick={syncQueue} disabled={syncing}>
            مزامنة الآن
          </button>
        </div>
      )}

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && assignments.length === 0 && (
        <div className="empty-state">
          <p>لا توجد توصيلات معيّنة لك حالياً</p>
          <p className="form-hint">ستظهر هنا عند تعيينك من شركة التوصيل</p>
        </div>
      )}

      <div className="driver-assignment-list">
        {assignments.map((item) => (
          <button
            key={item.id}
            type="button"
            className="driver-assignment-card"
            onClick={() => navigate(`/driver/delivery/${item.id}`)}
          >
            <div className="driver-assignment-card__head">
              <strong>#{item.referenceNumber}</strong>
              <span className="trip-card__status status-way">{item.statusLabel}</span>
            </div>
            <div className="driver-assignment-card__row">
              <User size={16} />
              <span>{item.customerName}</span>
            </div>
            <div className="driver-assignment-card__row" dir="ltr">
              <Phone size={16} />
              <span>{item.customerPhone}</span>
            </div>
            <div className="driver-assignment-card__row">
              <MapPin size={16} />
              <span>{item.deliveryAddress || item.deliveryArea || '—'}</span>
            </div>
            <p className="driver-assignment-card__stores">
              {item.stores?.length || 0} متجر
            </p>
          </button>
        ))}
      </div>

      <DriverBottomNav />
    </div>
  );
}

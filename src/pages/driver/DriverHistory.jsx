import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, User } from 'lucide-react';
import api from '../../api/axios';
import { queryKeys } from '../../lib/queryClient';
import AppHeader from '../../components/AppHeader';
import DriverBottomNav from '../../components/DriverBottomNav';
import { formatDate } from '../../utils/tripHelpers';

export default function DriverHistory() {
  const navigate = useNavigate();

  const { data: history = [], isLoading } = useQuery({
    queryKey: queryKeys.driverHistory,
    queryFn: async () => {
      const { data } = await api.get('/delivery/driver/assignments/history');
      return data.history || data.assignments || [];
    },
  });

  return (
    <div className="app-shell app-shell--driver">
      <AppHeader title="سجل التوصيل" subtitle="التوصيلات المكتملة" />

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && history.length === 0 && (
        <div className="empty-state">
          <p>لا يوجد سجل توصيل بعد</p>
        </div>
      )}

      <div className="driver-assignment-list">
        {history.map((item) => (
          <article key={item.id} className="driver-assignment-card driver-assignment-card--history">
            <div className="driver-assignment-card__head">
              <strong>#{item.referenceNumber}</strong>
              <time>{formatDate(item.updatedAt)}</time>
            </div>
            <div className="driver-assignment-card__row">
              <User size={16} />
              <span>{item.customerName}</span>
            </div>
            <div className="driver-assignment-card__row">
              <MapPin size={16} />
              <span>{item.deliveryAddress || '—'}</span>
            </div>
            <span className="trip-card__status status-done">تم التسليم بنجاح</span>
          </article>
        ))}
      </div>

      <DriverBottomNav />
    </div>
  );
}

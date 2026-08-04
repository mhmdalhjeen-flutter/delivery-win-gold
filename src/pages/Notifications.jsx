import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import BottomNav from '../components/BottomNav';
import { formatDate } from '../utils/tripHelpers';

export default function Notifications() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data.notifications || data || [];
    },
    refetchInterval: 30_000,
  });

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>الإشعارات</h1>
      </header>

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && notifications.length === 0 && (
        <div className="empty-state"><p>لا توجد إشعارات</p></div>
      )}

      <div className="notification-list">
        {notifications.map((item) => (
          <article key={item._id} className={`notification-item${item.read ? '' : ' notification-item--unread'}`}>
            <h3>{item.title}</h3>
            {item.body && <p>{item.body}</p>}
            <time>{formatDate(item.createdAt)}</time>
          </article>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

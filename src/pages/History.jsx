import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import TripCard from '../components/TripCard';
import BottomNav from '../components/BottomNav';

export default function History() {
  const navigate = useNavigate();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: queryKeys.trips({ history: true }),
    queryFn: async () => {
      const { data } = await api.get('/delivery/driver/trips', { params: { history: true } });
      return data.trips || [];
    },
  });

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>سجل الرحلات</h1>
      </header>

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && trips.length === 0 && (
        <div className="empty-state"><p>لا يوجد سجل بعد</p></div>
      )}

      <div className="trip-list">
        {trips.map((trip) => (
          <TripCard key={trip._id} trip={trip} onClick={() => navigate(`/trips/${trip._id}`)} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

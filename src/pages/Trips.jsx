import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import TripCard from '../components/TripCard';
import BottomNav from '../components/BottomNav';

export default function Trips() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const filter = params.get('filter') || 'all';

  const { data: trips = [], isLoading } = useQuery({
    queryKey: queryKeys.trips({ filter }),
    queryFn: async () => {
      const { data } = await api.get('/delivery/driver/trips');
      return data.trips || [];
    },
    refetchInterval: 20_000,
  });

  const filtered = useMemo(() => {
    if (filter === 'new') {
      return trips.filter((t) => ['ready_for_pickup', 'waiting_for_acceptance'].includes(t.status));
    }
    if (filter === 'active') {
      return trips.filter((t) => ['driver_assigned', 'accepted', 'collecting_orders', 'on_delivery', 'on_the_way'].includes(t.status));
    }
    return trips;
  }, [trips, filter]);

  const title = filter === 'new' ? 'رحلات جديدة' : filter === 'active' ? 'رحلات جارية' : 'طلبات التوصيل';

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>{title}</h1>
      </header>

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && filtered.length === 0 && (
        <div className="empty-state">
          <p>لا توجد رحلات حالياً</p>
        </div>
      )}

      <div className="trip-list">
        {filtered.map((trip) => (
          <TripCard
            key={trip._id}
            trip={trip}
            onClick={() => navigate(`/trips/${trip._id}`)}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

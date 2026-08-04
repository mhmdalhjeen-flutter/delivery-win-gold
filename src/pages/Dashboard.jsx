import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LogOut, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { queryKeys } from '../lib/queryClient';
import StatCard from '../components/StatCard';
import BottomNav from '../components/BottomNav';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async () => {
      const { data: res } = await api.get('/delivery/driver/dashboard/stats');
      return res;
    },
    refetchInterval: 30_000,
  });

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">مرحباً</p>
          <h1>{user?.name || 'سائق'}</h1>
        </div>
        <div className="page-header__actions">
          <button type="button" className="icon-btn" onClick={() => refetch()} aria-label="تحديث">
            <RefreshCw size={18} className={isFetching ? 'spin' : ''} />
          </button>
          <button type="button" className="icon-btn" onClick={logout} aria-label="خروج">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard
          label="عدد الرحلات الجديدة"
          value={isLoading ? '…' : data?.newTrips}
          tone="amber"
          onClick={() => navigate('/trips?filter=new')}
        />
        <StatCard
          label="الرحلات الجارية"
          value={isLoading ? '…' : data?.activeTrips}
          tone="blue"
          onClick={() => navigate('/trips?filter=active')}
        />
        <StatCard
          label="الرحلات المكتملة"
          value={isLoading ? '…' : data?.completedTrips}
          tone="green"
          onClick={() => navigate('/history')}
        />
        <StatCard
          label="الطلبات المنتظرة"
          value={isLoading ? '…' : data?.pendingOrders}
          tone="slate"
          onClick={() => navigate('/trips?filter=active')}
        />
      </section>

      <section className="panel">
        <h2>ابدأ العمل</h2>
        <p>راجع الرحلات الجديدة واقبل الطلبات المتاحة لشركتك.</p>
        <button type="button" className="btn-primary btn-primary--block" onClick={() => navigate('/trips')}>
          عرض طلبات التوصيل
        </button>
      </section>

      <BottomNav />
    </div>
  );
}

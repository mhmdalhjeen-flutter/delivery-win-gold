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
      const { data: res } = await api.get('/delivery/company/dashboard/stats');
      return res;
    },
    refetchInterval: 30_000,
  });

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">بوابة شركة التوصيل</p>
          <h1>{user?.name || 'شركة التوصيل'}</h1>
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
          label="بانتظار القبول"
          value={isLoading ? '…' : data?.pendingConfirmation}
          tone="amber"
          onClick={() => navigate('/requests?status=new')}
        />
        <StatCard
          label="طلبات مرسلة"
          value={isLoading ? '…' : data?.sentOrders}
          tone="blue"
          onClick={() => navigate('/sent-orders')}
        />
        <StatCard
          label="تم التسليم"
          value={isLoading ? '…' : data?.delivered}
          tone="green"
          onClick={() => navigate('/requests?status=delivered')}
        />
        <StatCard
          label="مرفوضة"
          value={isLoading ? '…' : data?.rejected}
          tone="red"
          onClick={() => navigate('/requests?status=rejected')}
        />
      </section>

      <section className="panel">
        <h2>سير العمل</h2>
        <ol className="workflow-steps">
          <li>بانتظار تأكيد المتجر</li>
          <li>بانتظار شركة التوصيل</li>
          <li>تعيين سائق ← قيد التوصيل</li>
          <li>تم التسليم</li>
        </ol>
        <button type="button" className="btn-primary btn-primary--block" onClick={() => navigate('/requests?status=new')}>
          مراجعة الطلبات الجديدة
        </button>
        <button type="button" className="btn-secondary btn-primary--block" onClick={() => navigate('/sent-orders')}>
          الطلبات المرسلة
        </button>
      </section>

      <BottomNav />
    </div>
  );
}

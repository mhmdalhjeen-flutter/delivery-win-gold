import React from 'react';

import { useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { LogOut, RefreshCw } from 'lucide-react';

import api from '../api/axios';

import { useAuth } from '../context/AuthContext';

import { queryKeys } from '../lib/queryClient';

import StatCard from '../components/StatCard';

import AppHeader from '../components/AppHeader';

import DeliveryBrandHeader from '../components/DeliveryBrandHeader';

import BottomNav from '../components/BottomNav';
import BillingPaymentBanner from '../components/BillingPaymentBanner';



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

      <AppHeader

        eyebrow="بوابة شركة التوصيل"

        title={user?.name || 'شركة التوصيل'}

        brand={<DeliveryBrandHeader />}

        actions={(

          <>

            <button type="button" className="icon-btn" onClick={() => refetch()} aria-label="تحديث">

              <RefreshCw size={18} className={isFetching ? 'spin' : ''} />

            </button>

            <button type="button" className="icon-btn" onClick={logout} aria-label="خروج">

              <LogOut size={18} />

            </button>

          </>

        )}

      />

      <BillingPaymentBanner />

      <section className="stats-grid">

        <StatCard

          label="بانتظار القبول"

          value={isLoading ? '…' : data?.pendingConfirmation}

          tone="amber"

          onClick={() => navigate('/requests?status=new')}

        />

        <StatCard

          label="معيّن لسائق"

          value={isLoading ? '…' : data?.assignedToDriver}

          tone="amber"

          onClick={() => navigate('/assigned-orders')}

        />

        <StatCard

          label="قيد التوصيل"

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

          <li>جاهز للاستلام من المتجر</li>

          <li>تعيين سائق — معيّن لسائق</li>

          <li>استلام من المتجر — قيد التوصيل</li>

          <li>تم التسليم</li>

        </ol>

        <button type="button" className="btn-primary btn-primary--block" onClick={() => navigate('/requests?status=new')}>

          مراجعة الطلبات الجاهزة

        </button>

        <button type="button" className="btn-secondary btn-primary--block" onClick={() => navigate('/assigned-orders')}>

          الطلبات المعيّنة لسائق

        </button>

        <button type="button" className="btn-secondary btn-primary--block" onClick={() => navigate('/sent-orders')}>

          الطلبات قيد التوصيل

        </button>

      </section>



      <BottomNav />

    </div>

  );

}



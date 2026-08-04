import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Building2,
  ChevronLeft,
  CreditCard,
  MapPin,
  MessageCircle,
  Tags,
  Users,
  Wallet,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import BottomNav from '../components/BottomNav';

const LINKS = [
  { to: '/settings/company', icon: Building2, label: 'معلومات الشركة', desc: 'الهاتف والوصف والشعار' },
  { to: '/settings/regions', icon: MapPin, label: 'مناطق الخدمة', desc: 'توصية للزبائن — لا إخفاء للشركات' },
  { to: '/settings/pricing', icon: Tags, label: 'أسعار التوصيل', desc: 'السعر الأساسي والطلب الإضافي' },
  { to: '/settings/payment-methods', icon: CreditCard, label: 'طرق الدفع', desc: 'تفعيل COD وبنك فلسطين وPalPay' },
  { to: '/settings/payment-accounts', icon: Wallet, label: 'حسابات الدفع', desc: 'حساب نشط واحد لكل نوع' },
  { to: '/settings/drivers', icon: Users, label: 'دليل السائقين', desc: 'سجلات اتصال — بدون حسابات دخول' },
  { to: '/settings/chats', icon: MessageCircle, label: 'المحادثات', desc: 'تواصل مع الزبائن' },
  { to: '/notifications', icon: Bell, label: 'الإشعارات', desc: 'تنبيهات الطلبات والرسائل' },
];

export default function Settings() {
  const { data: profile } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/profile');
      return data.company;
    },
  });

  return (
    <div className="app-shell app-shell--settings">
      <header className="page-header">
        <h1>إعدادات الشركة</h1>
      </header>

      {profile && (
        <section className="panel panel--flat">
          <div className="settings-company">
            {profile.logo ? (
              <img src={profile.logo} alt="" className="settings-company__logo" />
            ) : (
              <span className="settings-company__icon">{profile.name?.[0] || 'ش'}</span>
            )}
            <div>
              <h2>{profile.name}</h2>
              <p dir="ltr">{profile.phone}</p>
            </div>
          </div>
        </section>
      )}

      <nav className="settings-links">
        {LINKS.map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="settings-link settings-link--rich">
            <span className="settings-link__icon"><Icon size={20} /></span>
            <span className="settings-link__text">
              <strong>{label}</strong>
              <small>{desc}</small>
            </span>
            <ChevronLeft size={18} className="settings-link__chevron" />
          </Link>
        ))}
      </nav>

      <BottomNav />
    </div>
  );
}

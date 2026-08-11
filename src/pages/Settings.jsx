import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  CreditCard,
  Download,
  MapPin,
  Tags,
  Users,
  Camera,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import { usePwaInstall } from '../hooks/usePwaInstall';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';

const LINKS = [
  { to: '/settings/company', icon: Building2, label: 'معلومات الشركة', desc: 'الهاتف والعنوان والشعار' },
  { to: '/settings/regions', icon: MapPin, label: 'مناطق الخدمة', desc: 'توصية للزبائن — لا إخفاء للشركات' },
  { to: '/settings/pricing', icon: Tags, label: 'أسعار التوصيل', desc: 'السعر الأساسي والطلب الإضافي' },
  { to: '/settings/payment', icon: CreditCard, label: 'إعدادات الدفع', desc: 'طرق الدفع وحسابات التحويل' },
  { to: '/settings/billing', icon: Receipt, label: 'الاشتراك الشهري', desc: 'فوترة الطلبات المسلّمة ودفع المنصة' },
  { to: '/settings/drivers', icon: Users, label: 'دليل السائقين', desc: 'إدارة السائقين المسجّلين — تفعيل وتعطيل' },
  { to: '/settings/driver-password', icon: Users, label: 'كلمة مرور تسجيل السائقين', desc: 'مشاركة مع السائقين للتسجيل الذاتي' },
  { to: '/proofs', icon: Camera, label: 'إثباتات التوصيل', desc: 'صور وملاحظات التسليم المكتملة' },
];

function getInstallRow(installStatus, installing) {
  if (installStatus === 'installed') {
    return {
      Icon: CheckCircle2,
      label: 'التطبيق مثبت',
      desc: 'التطبيق مثبت على هذا الجهاز',
      disabled: true,
      variant: 'installed',
    };
  }

  if (installStatus === 'installable') {
    return {
      Icon: Download,
      label: installing ? 'جاري التثبيت...' : 'تثبيت التطبيق',
      desc: 'إضافة Win Gold للتوصيل إلى الشاشة الرئيسية',
      disabled: installing,
      variant: 'installable',
    };
  }

  return {
    Icon: Download,
    label: 'تثبيت التطبيق',
    desc: 'غير متاح من هذا المتصفح حالياً — استخدم Chrome أو Edge على Android أو Windows',
    disabled: true,
    variant: 'unavailable',
  };
}

export default function Settings() {
  const { installStatus, installing, promptInstall } = usePwaInstall();
  const installRow = getInstallRow(installStatus, installing);
  const InstallIcon = installRow.Icon;

  const { data: profile } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/profile');
      return data.company;
    },
  });

  const handleInstall = async () => {
    if (installStatus !== 'installable' || installing) return;
    await promptInstall();
  };

  return (
    <div className="app-shell app-shell--settings">
      <AppHeader title="إعدادات الشركة" />

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
        <button
          type="button"
          className={`settings-link settings-link--rich settings-link--action settings-link--pwa settings-link--pwa-${installRow.variant}`}
          onClick={handleInstall}
          disabled={installRow.disabled}
          aria-disabled={installRow.disabled}
        >
          <span className="settings-link__icon"><InstallIcon size={20} /></span>
          <span className="settings-link__text">
            <strong>{installRow.label}</strong>
            <small>{installRow.desc}</small>
          </span>
          {installRow.variant === 'installable' && (
            <ChevronLeft size={18} className="settings-link__chevron" />
          )}
        </button>

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

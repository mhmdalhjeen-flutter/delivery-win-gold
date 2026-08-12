import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import { useSettingsQuery, isSettingsLoading } from '../hooks/useSettingsQuery';
import SettingsPageLayout from '../components/SettingsPageLayout';

export default function CompanyInfo() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    phone: '',
    whatsapp: '',
    address: '',
    announcement: '',
  });
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useSettingsQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/profile');
      return data.company;
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        phone: profile.phone || '',
        whatsapp: profile.whatsapp || '',
        address: profile.address || '',
        announcement: profile.description || '',
      });
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { data } = await api.put('/delivery/company/profile', {
        phone: form.phone,
        whatsapp: form.whatsapp,
        address: form.address,
        description: form.announcement,
      });
      return data.company;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  if (isSettingsLoading(isLoading, profile)) {
    return <SettingsPageLayout title="معلومات الشركة"><p className="muted-center">جاري التحميل...</p></SettingsPageLayout>;
  }

  return (
    <SettingsPageLayout title="معلومات الشركة" subtitle="بيانات التواصل والإعلانات الظاهرة للزبائن">
      {profile && (
        <section className="panel panel--flat">
          <div className="settings-company settings-company--large">
            <span className="settings-company__icon settings-company__icon--lg">{profile.name?.[0] || 'ش'}</span>
            <div>
              <h2>{profile.name}</h2>
              <p className="form-hint">اسم الشركة يُدار من الإدارة</p>
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <label>
            <span>هاتف الشركة</span>
            <input value={form.phone} onChange={set('phone')} required dir="ltr" inputMode="tel" />
          </label>
          <label>
            <span>رقم واتساب</span>
            <input value={form.whatsapp} onChange={set('whatsapp')} dir="ltr" inputMode="tel" placeholder="+970..." />
          </label>
          <label>
            <span>عنوان الشركة</span>
            <textarea value={form.address} onChange={set('address')} rows={3} maxLength={500} />
          </label>
          <label>
            <span>إعلان / تنبيه للزبائن</span>
            <textarea
              value={form.announcement}
              onChange={set('announcement')}
              rows={4}
              maxLength={2000}
              placeholder="مثال: التوصيل متاح اليوم حتى الساعة 8 مساءً"
            />
            <small className="form-hint">يظهر كإشعار أو ملاحظة للزبائن عند اختيار شركتكم للتوصيل.</small>
          </label>
          <button type="submit" className="btn-primary btn-primary--block" disabled={save.isPending}>
            {save.isPending ? <Loader2 size={18} className="spin" /> : null}
            {saved ? 'تم الحفظ' : 'حفظ التغييرات'}
          </button>
        </form>
      </section>
    </SettingsPageLayout>
  );
}

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SettingsPageLayout from '../components/SettingsPageLayout';

export default function CompanyInfo() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ phone: '', whatsapp: '', description: '', logo: '' });
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery({
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
        description: profile.description || '',
        logo: profile.logo || '',
      });
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { data } = await api.put('/delivery/company/profile', form);
      return data.company;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  if (isLoading) {
    return <SettingsPageLayout title="معلومات الشركة"><p className="muted-center">جاري التحميل...</p></SettingsPageLayout>;
  }

  return (
    <SettingsPageLayout title="معلومات الشركة" subtitle="بيانات التواصل الظاهرة للزبائن">
      {profile && (
        <section className="panel panel--flat">
          <div className="settings-company settings-company--large">
            {profile.logo ? (
              <img src={profile.logo} alt="" className="settings-company__logo" />
            ) : (
              <span className="settings-company__icon settings-company__icon--lg">{profile.name?.[0] || 'ش'}</span>
            )}
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
            <span>واتساب</span>
            <input value={form.whatsapp} onChange={set('whatsapp')} dir="ltr" inputMode="tel" />
          </label>
          <label>
            <span>الوصف</span>
            <textarea value={form.description} onChange={set('description')} rows={4} maxLength={2000} />
          </label>
          <label>
            <span>رابط الشعار (URL)</span>
            <input value={form.logo} onChange={set('logo')} dir="ltr" placeholder="https://..." />
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

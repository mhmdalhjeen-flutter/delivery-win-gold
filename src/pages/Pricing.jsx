import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SettingsPageLayout from '../components/SettingsPageLayout';
import { formatPrice } from '../utils/tripHelpers';

export default function Pricing() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ basePrice: '', extraOrderPrice: '', currency: 'ILS' });
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.pricing,
    queryFn: async () => {
      const { data: res } = await api.get('/delivery/company/pricing');
      return res.pricing;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        basePrice: String(data.basePrice ?? ''),
        extraOrderPrice: String(data.extraOrderPrice ?? ''),
        currency: data.currency || 'ILS',
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      await api.put('/delivery/company/pricing', {
        basePrice: Number(form.basePrice),
        extraOrderPrice: Number(form.extraOrderPrice),
        currency: form.currency,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pricing });
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const previewBase = Number(form.basePrice) || 0;
  const previewExtra = Number(form.extraOrderPrice) || 0;
  const sample3 = previewBase + previewExtra * 2;

  if (isLoading) {
    return <SettingsPageLayout title="أسعار التوصيل"><p className="muted-center">جاري التحميل...</p></SettingsPageLayout>;
  }

  return (
    <SettingsPageLayout title="أسعار التوصيل" subtitle="السعر الأساسي + سعر كل طلب إضافي">
      <section className="panel panel--highlight">
        <h2>معاينة</h2>
        <p>طلب واحد: <strong>{formatPrice(previewBase, form.currency)}</strong></p>
        <p>3 طلبات: <strong>{formatPrice(sample3, form.currency)}</strong></p>
        <p className="form-hint">= الأساس + 2 × سعر الطلب الإضافي</p>
      </section>

      <section className="panel">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <label>
            <span>السعر الأساسي (أول طلب)</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.basePrice}
              onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
              required
              dir="ltr"
            />
          </label>
          <label>
            <span>سعر كل طلب إضافي</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.extraOrderPrice}
              onChange={(e) => setForm((p) => ({ ...p, extraOrderPrice: e.target.value }))}
              required
              dir="ltr"
            />
          </label>
          <label>
            <span>العملة</span>
            <input value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} dir="ltr" maxLength={8} />
          </label>
          <button type="submit" className="btn-primary btn-primary--block" disabled={save.isPending}>
            {save.isPending ? <Loader2 size={18} className="spin" /> : null}
            {saved ? 'تم الحفظ' : 'حفظ الأسعار'}
          </button>
        </form>
      </section>
    </SettingsPageLayout>
  );
}

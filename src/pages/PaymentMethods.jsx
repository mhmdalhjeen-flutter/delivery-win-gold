import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SettingsPageLayout from '../components/SettingsPageLayout';

const METHOD_LABELS = {
  cashOnDelivery: 'الدفع عند الاستلام',
  bankPalestine: 'بنك فلسطين',
  palPay: 'PalPay',
  jawwalPay: 'Jawwal Pay',
};

export default function PaymentMethods() {
  const qc = useQueryClient();
  const [methods, setMethods] = useState(null);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.paymentSettings,
    queryFn: async () => {
      const { data: res } = await api.get('/delivery/company/payment-settings');
      return res;
    },
  });

  useEffect(() => {
    if (data?.paymentMethods) setMethods(data.paymentMethods);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      await api.patch('/delivery/company/payment-methods', { paymentMethods: methods });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.paymentSettings });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (isLoading || !methods) {
    return <SettingsPageLayout title="طرق الدفع"><p className="muted-center">جاري التحميل...</p></SettingsPageLayout>;
  }

  return (
    <SettingsPageLayout title="طرق الدفع" subtitle="فعّل أو عطّل طرق الدفع لشركتك">
      <section className="panel">
        <div className="toggle-list">
          {Object.entries(METHOD_LABELS).map(([key, label]) => (
            <label key={key} className="toggle-row toggle-row--card">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={methods[key]?.enabled !== false}
                onChange={(e) => setMethods((prev) => ({
                  ...prev,
                  [key]: { enabled: e.target.checked },
                }))}
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          className="btn-primary btn-primary--block"
          disabled={save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? <Loader2 size={18} className="spin" /> : null}
          {saved ? 'تم الحفظ' : 'حفظ'}
        </button>
      </section>
      <p className="form-hint settings-note">الدفع عند الاستلام لا يحتاج حساباً بنكياً. للطرق الرقمية أضف الحسابات من صفحة حسابات الدفع.</p>
    </SettingsPageLayout>
  );
}

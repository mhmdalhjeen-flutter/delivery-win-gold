import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SettingsPageLayout from '../components/SettingsPageLayout';
import PaymentAccountFormModal from '../components/PaymentAccountFormModal';

const METHOD_LABELS = {
  cashOnDelivery: 'الدفع عند الاستلام',
  bankPalestine: 'بنك فلسطين',
  palPay: 'PalPay',
  jawwalPay: 'Jawwal Pay',
};

const TYPE_LABELS = {
  bank_palestine: 'بنك فلسطين',
  palpay: 'PalPay',
  jawwal_pay: 'Jawwal Pay',
};

export default function PaymentSettings() {
  const qc = useQueryClient();
  const [methods, setMethods] = useState(null);
  const [saved, setSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.paymentSettings,
    queryFn: async () => {
      const { data: res } = await api.get('/delivery/company/payment-settings');
      return res;
    },
  });

  React.useEffect(() => {
    if (data?.paymentMethods) setMethods(data.paymentMethods);
  }, [data]);

  const accounts = data?.accounts || [];

  const saveMethods = useMutation({
    mutationFn: async () => {
      await api.patch('/delivery/company/payment-methods', { paymentMethods: methods });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.paymentSettings });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const saveAccount = useMutation({
    mutationFn: async (payload) => {
      if (editing?._id) {
        const { data: res } = await api.put(`/delivery/company/payment-accounts/${editing._id}`, payload);
        return res.account;
      }
      const { data: res } = await api.post('/delivery/company/payment-accounts', payload);
      return res.account;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.paymentSettings });
      setModalOpen(false);
      setEditing(null);
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/delivery/company/payment-accounts/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.paymentSettings });
      setDeletingId(null);
    },
  });

  const activateAccount = useMutation({
    mutationFn: async (id) => {
      await api.put(`/delivery/company/payment-accounts/${id}`, { isActive: true });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.paymentSettings }),
  });

  if (isLoading || !methods) {
    return <SettingsPageLayout title="إعدادات الدفع"><p className="muted-center">جاري التحميل...</p></SettingsPageLayout>;
  }

  return (
    <SettingsPageLayout title="إعدادات الدفع" subtitle="طرق الدفع وحسابات التحويل">
      <section className="panel">
        <h2>طرق الدفع</h2>
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
          disabled={saveMethods.isPending}
          onClick={() => saveMethods.mutate()}
        >
          {saveMethods.isPending ? <Loader2 size={18} className="spin" /> : null}
          {saved ? 'تم الحفظ' : 'حفظ طرق الدفع'}
        </button>
      </section>

      <section className="panel">
        <div className="panel__head-row">
          <h2>حسابات الدفع</h2>
          <button type="button" className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={18} />
            إضافة
          </button>
        </div>
        <p className="form-hint">حساب نشط واحد لكل نوع — ارفع صورة QR من الهاتف أو الكمبيوتر</p>

        {accounts.length === 0 && (
          <div className="empty-state empty-state--compact">
            <p>لا توجد حسابات بعد</p>
          </div>
        )}

        <div className="account-cards">
          {accounts.map((account) => (
            <article key={account._id} className={`account-card${account.isActive ? ' account-card--active' : ''}`}>
              <div className="account-card__head">
                <strong>{TYPE_LABELS[account.type] || account.type}</strong>
                {account.isActive ? <span className="badge badge-ok">نشط</span> : (
                  <button type="button" className="btn-ghost-sm" onClick={() => activateAccount.mutate(account._id)}>
                    تفعيل
                  </button>
                )}
              </div>
              <p>{account.accountName}</p>
              <p dir="ltr">{account.accountNumber}</p>
              {account.iban && <p dir="ltr" className="form-hint">IBAN: {account.iban}</p>}
              {account.qrCodeUrl && (
                <img src={account.qrCodeUrl} alt="QR" className="account-card__qr" />
              )}
              <div className="account-card__actions">
                <button type="button" className="icon-btn" onClick={() => { setEditing(account); setModalOpen(true); }} aria-label="تعديل">
                  <Pencil size={16} />
                </button>
                {deletingId === account._id ? (
                  <>
                    <button type="button" className="btn-danger-sm" disabled={deleteAccount.isPending} onClick={() => deleteAccount.mutate(account._id)}>حذف</button>
                    <button type="button" className="btn-ghost-sm" onClick={() => setDeletingId(null)}>إلغاء</button>
                  </>
                ) : (
                  <button type="button" className="icon-btn icon-btn--danger" onClick={() => setDeletingId(account._id)} aria-label="حذف">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <PaymentAccountFormModal
        open={modalOpen}
        account={editing}
        saving={saveAccount.isPending}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={(payload) => saveAccount.mutate(payload)}
      />
    </SettingsPageLayout>
  );
}

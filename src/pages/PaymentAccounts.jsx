import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SettingsPageLayout from '../components/SettingsPageLayout';
import PaymentAccountFormModal from '../components/PaymentAccountFormModal';

const TYPE_LABELS = {
  bank_palestine: 'بنك فلسطين',
  palpay: 'PalPay',
  jawwal_pay: 'Jawwal Pay',
};

export default function PaymentAccounts() {
  const qc = useQueryClient();
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

  const accounts = data?.accounts || [];

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

  return (
    <SettingsPageLayout title="حسابات الدفع" subtitle="حساب نشط واحد لكل نوع">
      <div className="settings-page-toolbar">
        <button type="button" className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={18} />
          إضافة حساب
        </button>
      </div>

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && accounts.length === 0 && (
        <div className="empty-state">
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

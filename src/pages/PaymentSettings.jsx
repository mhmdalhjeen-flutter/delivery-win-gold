import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SettingsPageLayout from '../components/SettingsPageLayout';
import PaymentAccountFormModal from '../components/PaymentAccountFormModal';
import {
  ALL_PAYMENT_METHODS,
  DEFAULT_PAYMENT_TOGGLES,
  TYPE_LABELS,
  accountTypeLabel,
} from '../utils/paymentMethodConstants';

export default function PaymentSettings() {
  const qc = useQueryClient();
  const [toggles, setToggles] = useState(DEFAULT_PAYMENT_TOGGLES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fixedType, setFixedType] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.paymentSettings,
    queryFn: async () => {
      const { data: res } = await api.get('/delivery/company/payment-settings');
      return res;
    },
  });

  React.useEffect(() => {
    if (data?.paymentMethods) {
      setToggles({ ...DEFAULT_PAYMENT_TOGGLES, ...data.paymentMethods });
    }
  }, [data]);

  const accounts = data?.accounts || [];

  const grouped = useMemo(() => {
    const map = {};
    accounts.forEach((a) => {
      if (!map[a.type]) map[a.type] = [];
      map[a.type].push(a);
    });
    return map;
  }, [accounts]);

  const saveMethods = useMutation({
    mutationFn: async (next) => {
      await api.patch('/delivery/company/payment-methods', { paymentMethods: next });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.paymentSettings });
      setMessage('تم حفظ طرق الدفع');
      setTimeout(() => setMessage(''), 2500);
    },
    onError: (err) => {
      setMessage(err.response?.data?.message || 'تعذّر الحفظ');
      if (data?.paymentMethods) setToggles({ ...DEFAULT_PAYMENT_TOGGLES, ...data.paymentMethods });
    },
  });

  const handleToggle = (settingsKey, enabled) => {
    const next = { ...toggles, [settingsKey]: { enabled } };
    setToggles(next);
    saveMethods.mutate(next);
  };

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
      setFixedType(null);
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

  const deactivateAccount = useMutation({
    mutationFn: async (id) => {
      await api.put(`/delivery/company/payment-accounts/${id}`, { isActive: false });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.paymentSettings }),
  });

  if (isLoading) {
    return (
      <SettingsPageLayout title="إعدادات الدفع">
        <p className="muted-center">جاري التحميل...</p>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="إعدادات الدفع"
      subtitle="فعّل طرق الدفع وأدر حسابات التحويل — نفس تجربة لوحة المتجر"
    >
      {message && <p className="form-hint" style={{ marginBottom: 12 }}>{message}</p>}

      <div className="payment-methods-list">
        {ALL_PAYMENT_METHODS.map((method) => {
          const enabled = toggles[method.settingsKey]?.enabled !== false;
          const list = method.requiresAccount ? (grouped[method.id] || []) : [];

          return (
            <section key={method.id} className={`payment-method-block${enabled ? ' is-enabled' : ''}`}>
              <div className="payment-method-block__head">
                <div className="payment-method-block__title">
                  <span className="payment-method-block__icon">{method.icon}</span>
                  <div>
                    <h3>{method.label}</h3>
                    <p>{method.description}</p>
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={enabled}
                    disabled={saveMethods.isPending}
                    onChange={(e) => handleToggle(method.settingsKey, e.target.checked)}
                  />
                  <span className="switch__slider" />
                </label>
              </div>

              {method.requiresAccount && enabled && (
                <div className="payment-method-block__accounts">
                  <div className="payment-method-block__accounts-head">
                    <span>الحسابات المحفوظة</span>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        setEditing(null);
                        setFixedType(method.id);
                        setModalOpen(true);
                      }}
                    >
                      <Plus size={16} />
                      إضافة حساب
                    </button>
                  </div>

                  {list.length === 0 && (
                    <div className="empty-state empty-state--compact">
                      <p>لا توجد حسابات — أضف حساباً ليظهر للزبائن عند تفعيله</p>
                    </div>
                  )}

                  <div className="account-cards">
                    {list.map((account) => (
                      <article key={account._id} className={`account-card${account.isActive ? ' account-card--active' : ''}`}>
                        <div className="account-card__head">
                          <strong>{TYPE_LABELS[account.type] || account.type}</strong>
                          {account.isActive ? (
                            <span className="badge badge-ok">نشط</span>
                          ) : (
                            <button
                              type="button"
                              className="btn-ghost-sm"
                              onClick={() => activateAccount.mutate(account._id)}
                            >
                              تفعيل
                            </button>
                          )}
                        </div>
                        <p>{account.accountName}</p>
                        <p dir="ltr">{account.accountNumber}</p>
                        <p className="form-hint">{accountTypeLabel(account.accountType)}</p>
                        {account.qrCodeUrl && (
                          <img src={account.qrCodeUrl} alt="QR" className="account-card__qr" />
                        )}
                        <div className="account-card__actions">
                          {account.isActive && (
                            <button
                              type="button"
                              className="btn-ghost-sm"
                              onClick={() => deactivateAccount.mutate(account._id)}
                            >
                              إيقاف
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-ghost-sm"
                            onClick={() => {
                              setEditing(account);
                              setFixedType(account.type);
                              setModalOpen(true);
                            }}
                          >
                            <Pencil size={14} />
                            تعديل
                          </button>
                          <button
                            type="button"
                            className="btn-ghost-sm"
                            onClick={() => {
                              setDeletingId(account._id);
                              deleteAccount.mutate(account._id);
                            }}
                            disabled={deletingId === account._id}
                          >
                            {deletingId === account._id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                            حذف
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <PaymentAccountFormModal
        open={modalOpen}
        account={editing}
        fixedType={fixedType}
        saving={saveAccount.isPending}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
          setFixedType(null);
        }}
        onSave={(payload) => saveAccount.mutate(payload)}
      />
    </SettingsPageLayout>
  );
}

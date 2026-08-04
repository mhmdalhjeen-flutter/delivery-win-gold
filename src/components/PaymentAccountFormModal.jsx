import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

const ACCOUNT_TYPES = [
  { id: 'bank_palestine', label: 'بنك فلسطين' },
  { id: 'palpay', label: 'PalPay' },
  { id: 'jawwal_pay', label: 'Jawwal Pay' },
];

const EMPTY = {
  type: 'bank_palestine',
  accountName: '',
  accountNumber: '',
  iban: '',
  qrCodeUrl: '',
  isActive: true,
};

export default function PaymentAccountFormModal({ open, account, saving, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (account) {
      setForm({
        type: account.type || 'bank_palestine',
        accountName: account.accountName || '',
        accountNumber: account.accountNumber || '',
        iban: account.iban || '',
        qrCodeUrl: account.qrCodeUrl || '',
        isActive: account.isActive !== false,
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, account]);

  if (!open) return null;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="modal-sheet__head">
          <h2>{account ? 'تعديل الحساب' : 'إضافة حساب'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </header>

        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
          <label>
            <span>نوع الدفع</span>
            <select value={form.type} onChange={set('type')}>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>اسم صاحب الحساب</span>
            <input value={form.accountName} onChange={set('accountName')} required maxLength={120} />
          </label>
          <label>
            <span>رقم الحساب</span>
            <input value={form.accountNumber} onChange={set('accountNumber')} required dir="ltr" maxLength={64} />
          </label>
          <label>
            <span>IBAN (اختياري)</span>
            <input value={form.iban} onChange={set('iban')} dir="ltr" maxLength={64} />
          </label>
          <label>
            <span>رابط QR (اختياري)</span>
            <input value={form.qrCodeUrl} onChange={set('qrCodeUrl')} dir="ltr" placeholder="https://..." />
          </label>
          {!account && (
            <label className="toggle-row">
              <span>تفعيل فوراً</span>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
            </label>
          )}
          <button type="submit" className="btn-primary btn-primary--block" disabled={saving}>
            {saving ? <Loader2 size={18} className="spin" /> : null}
            حفظ
          </button>
        </form>
      </div>
    </div>
  );
}

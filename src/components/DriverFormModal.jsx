import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

const EMPTY = { name: '', phone: '', whatsapp: '', notes: '', isActive: true };

export default function DriverFormModal({ open, driver, saving, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (driver) {
      setForm({
        name: driver.name || '',
        phone: driver.phone || '',
        whatsapp: driver.whatsapp || '',
        notes: driver.notes || '',
        isActive: driver.isActive !== false,
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, driver]);

  if (!open) return null;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const title = driver ? 'تعديل السائق' : 'إضافة سائق';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="modal-sheet__head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            <span>اسم السائق</span>
            <input value={form.name} onChange={set('name')} required maxLength={120} />
          </label>
          <label>
            <span>رقم الجوال</span>
            <input value={form.phone} onChange={set('phone')} required dir="ltr" inputMode="tel" maxLength={32} />
          </label>
          <label>
            <span>واتساب (اختياري)</span>
            <input value={form.whatsapp} onChange={set('whatsapp')} dir="ltr" inputMode="tel" maxLength={32} placeholder="إن كان مختلفاً عن الجوال" />
          </label>
          <label>
            <span>ملاحظات (اختياري)</span>
            <textarea value={form.notes} onChange={set('notes')} rows={3} maxLength={500} />
          </label>
          <label className="toggle-row">
            <span>نشط</span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
          </label>

          <div className="modal-sheet__actions">
            <button type="submit" className="btn-primary btn-primary--block" disabled={saving}>
              {saving ? <Loader2 size={18} className="spin" /> : null}
              حفظ
            </button>
            <button type="button" className="btn-ghost btn-primary--block" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

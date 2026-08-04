import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, User, X } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import useDebouncedValue from '../hooks/useDebouncedValue';

export default function AssignDriverModal({ open, saving, onClose, onConfirm }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [note, setNote] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: queryKeys.drivers({ q: debouncedSearch, activeOnly: true }),
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/drivers', {
        params: { q: debouncedSearch, activeOnly: true },
      });
      return data.drivers || [];
    },
    enabled: open,
  });

  if (!open) return null;

  const selected = drivers.find((d) => String(d._id) === String(selectedId));

  const handleConfirm = () => {
    if (!selectedId) return;
    onConfirm({ driverId: selectedId, note: note.trim() });
  };

  const handleClose = () => {
    setSearch('');
    setSelectedId('');
    setNote('');
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={handleClose}>
      <div className="modal-sheet modal-sheet--tall" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="modal-sheet__head">
          <h2>تعيين سائق</h2>
          <button type="button" className="icon-btn" onClick={handleClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </header>

        <p className="modal-sheet__hint">اختر سائقاً من دليل الشركة — سيتم إرسال بياناته للزبون فوراً.</p>

        <div className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            autoFocus
          />
        </div>

        <div className="driver-pick-list">
          {isLoading && <p className="muted-center">جاري البحث...</p>}
          {!isLoading && drivers.length === 0 && (
            <div className="empty-state empty-state--compact">
              <p>لا يوجد سائقون نشطون</p>
              <p className="form-hint">أضف سائقين من الإعدادات ← السائقون</p>
            </div>
          )}
          {drivers.map((driver) => {
            const active = String(selectedId) === String(driver._id);
            return (
              <button
                key={driver._id}
                type="button"
                className={`driver-pick${active ? ' driver-pick--active' : ''}`}
                onClick={() => setSelectedId(String(driver._id))}
              >
                <span className="driver-pick__icon"><User size={18} /></span>
                <span className="driver-pick__body">
                  <strong>{driver.name}</strong>
                  <span dir="ltr">{driver.phone}</span>
                </span>
              </button>
            );
          })}
        </div>

        <label className="modal-form__note">
          <span>ملاحظة (اختياري)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="ملاحظة داخلية أو للزبون"
            maxLength={500}
          />
        </label>

        {selected && (
          <div className="driver-pick-preview">
            <strong>{selected.name}</strong>
            <span dir="ltr">{selected.phone}</span>
          </div>
        )}

        <div className="modal-sheet__actions">
          <button
            type="button"
            className="btn-primary btn-primary--block"
            disabled={!selectedId || saving}
            onClick={handleConfirm}
          >
            {saving ? <Loader2 size={18} className="spin" /> : null}
            تأكيد التعيين
          </button>
          <button type="button" className="btn-ghost btn-primary--block" onClick={handleClose}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

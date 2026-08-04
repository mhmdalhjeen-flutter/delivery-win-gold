import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Search, Trash2, User } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import useDebouncedValue from '../hooks/useDebouncedValue';
import DriverFormModal from '../components/DriverFormModal';
import SettingsPageLayout from '../components/SettingsPageLayout';

export default function Drivers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: queryKeys.drivers({ q: debouncedSearch }),
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/drivers', { params: { q: debouncedSearch } });
      return data.drivers || [];
    },
  });

  const saveDriver = useMutation({
    mutationFn: async (payload) => {
      if (editing?._id) {
        const { data } = await api.put(`/delivery/company/drivers/${editing._id}`, payload);
        return data.driver;
      }
      const { data } = await api.post('/delivery/company/drivers', payload);
      return data.driver;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery', 'company', 'drivers'] });
      setFormOpen(false);
      setEditing(null);
    },
  });

  const deleteDriver = useMutation({
    mutationFn: async (driverId) => {
      await api.delete(`/delivery/company/drivers/${driverId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery', 'company', 'drivers'] });
      setDeletingId(null);
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ driverId, isActive }) => {
      const { data } = await api.put(`/delivery/company/drivers/${driverId}`, { isActive });
      return data.driver;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery', 'company', 'drivers'] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (driver) => {
    setEditing(driver);
    setFormOpen(true);
  };

  return (
    <SettingsPageLayout
      title="دليل السائقين"
      subtitle="سجلات اتصال — بدون حسابات دخول"
      actions={(
        <button type="button" className="icon-btn icon-btn--primary" onClick={openCreate} aria-label="إضافة سائق">
          <Plus size={20} />
        </button>
      )}
    >
      <div className="search-field">
        <Search size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو رقم الهاتف..."
        />
      </div>

      <p className="form-hint drivers-hint">يُستخدم السائق عند قبول الطلب — يصل اسمه ورقمه للزبون مباشرة.</p>

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && drivers.length === 0 && (
        <div className="empty-state">
          <p>{debouncedSearch ? 'لا توجد نتائج' : 'لا يوجد سائقون بعد'}</p>
          {!debouncedSearch && (
            <button type="button" className="btn-primary" onClick={openCreate}>
              إضافة أول سائق
            </button>
          )}
        </div>
      )}

      <div className="driver-directory">
        {drivers.map((driver) => (
          <article key={driver._id} className={`driver-card${driver.isActive ? '' : ' driver-card--inactive'}`}>
            <div className="driver-card__main">
              <span className="driver-card__icon"><User size={20} /></span>
              <div>
                <h3>{driver.name}</h3>
                <p dir="ltr">{driver.phone}</p>
                {driver.whatsapp && driver.whatsapp !== driver.phone && (
                  <p className="driver-card__wa" dir="ltr">WA: {driver.whatsapp}</p>
                )}
                {driver.notes && <p className="driver-card__notes">{driver.notes}</p>}
              </div>
            </div>

            <div className="driver-card__actions">
              <label className="toggle-row toggle-row--compact">
                <span>{driver.isActive ? 'نشط' : 'غير نشط'}</span>
                <input
                  type="checkbox"
                  checked={driver.isActive}
                  disabled={toggleActive.isPending}
                  onChange={(e) => toggleActive.mutate({ driverId: driver._id, isActive: e.target.checked })}
                />
              </label>
              <button type="button" className="icon-btn" onClick={() => openEdit(driver)} aria-label="تعديل">
                <Pencil size={16} />
              </button>
              {deletingId === driver._id ? (
                <div className="driver-card__confirm">
                  <button
                    type="button"
                    className="btn-danger-sm"
                    disabled={deleteDriver.isPending}
                    onClick={() => deleteDriver.mutate(driver._id)}
                  >
                    {deleteDriver.isPending ? <Loader2 size={14} className="spin" /> : 'حذف'}
                  </button>
                  <button type="button" className="btn-ghost-sm" onClick={() => setDeletingId(null)}>إلغاء</button>
                </div>
              ) : (
                <button type="button" className="icon-btn icon-btn--danger" onClick={() => setDeletingId(driver._id)} aria-label="حذف">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <DriverFormModal
        open={formOpen}
        driver={editing}
        saving={saveDriver.isPending}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={(payload) => saveDriver.mutate(payload)}
      />
    </SettingsPageLayout>
  );
}

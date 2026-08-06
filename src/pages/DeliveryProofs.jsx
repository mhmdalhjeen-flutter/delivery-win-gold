import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImageOff, RefreshCw, Search, X } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import useDebouncedValue from '../hooks/useDebouncedValue';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';

function formatDateTime(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export default function DeliveryProofs() {
  const [q, setQ] = useState('');
  const [driverId, setDriverId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [customer, setCustomer] = useState('');
  const [lightbox, setLightbox] = useState('');
  const debouncedQ = useDebouncedValue(q, 300);
  const debouncedCustomer = useDebouncedValue(customer, 300);
  const debouncedCode = useDebouncedValue(verificationCode, 300);

  const filters = useMemo(
    () => ({
      q: debouncedQ || undefined,
      driverId: driverId || undefined,
      from: from || undefined,
      to: to || undefined,
      verificationCode: debouncedCode || undefined,
      customer: debouncedCustomer || undefined,
    }),
    [debouncedQ, driverId, from, to, debouncedCode, debouncedCustomer],
  );

  const { data: options } = useQuery({
    queryKey: queryKeys.deliveryProofFilterOptions,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/proofs/filter-options');
      return data;
    },
  });

  const { data: proofs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.deliveryProofs(filters),
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/proofs', { params: filters });
      return data.proofs || [];
    },
  });

  return (
    <div className="app-shell">
      <AppHeader
        title="إثباتات التوصيل"
        subtitle="صور وملاحظات التسليم المكتملة"
        actions={(
          <button type="button" className="icon-btn" onClick={() => refetch()} aria-label="تحديث">
            <RefreshCw size={18} className={isFetching ? 'spin' : ''} />
          </button>
        )}
      />

      <section className="panel panel--filters">
        <label className="search-field">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث عام..."
          />
        </label>

        <div className="filter-grid">
          <label>
            <span>السائق</span>
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              <option value="">الكل</option>
              {(options?.drivers || []).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>من تاريخ</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            <span>إلى تاريخ</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label>
            <span>رمز التأكيد</span>
            <input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="رمز التحقق"
            />
          </label>
          <label>
            <span>الزبون</span>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="اسم أو هاتف"
            />
          </label>
        </div>
      </section>

      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && proofs.length === 0 && (
        <div className="empty-state">
          <p>لا توجد إثباتات توصيل</p>
          <p className="form-hint">تظهر هنا بعد تأكيد السائق للتسليم مع صورة الإثبات.</p>
        </div>
      )}

      <div className="proof-card-list">
        {proofs.map((proof) => (
          <article key={proof.id || proof._id} className="proof-card">
            <button
              type="button"
              className="proof-card__media"
              onClick={() => proof.photo && setLightbox(proof.photo)}
              disabled={!proof.photo}
              aria-label="عرض الصورة بحجم كامل"
            >
              {proof.photo ? (
                <img src={proof.photo} alt="إثبات التسليم" />
              ) : (
                <span className="proof-card__placeholder"><ImageOff size={28} /></span>
              )}
            </button>
            <div className="proof-card__body">
              <div className="proof-card__row">
                <span>الزبون</span>
                <strong>{proof.customerName || '—'}</strong>
              </div>
              <div className="proof-card__row">
                <span>الهاتف</span>
                <strong dir="ltr">{proof.customerPhone || '—'}</strong>
              </div>
              <div className="proof-card__row">
                <span>السائق</span>
                <strong>{proof.driverName || '—'}</strong>
              </div>
              <div className="proof-card__row">
                <span>التاريخ</span>
                <strong>{formatDateTime(proof.deliveredAt)}</strong>
              </div>
              <div className="proof-card__row">
                <span>رمز التأكيد</span>
                <strong>{proof.verificationCode || '—'}</strong>
              </div>
              {proof.note ? (
                <p className="proof-card__note">{proof.note}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {lightbox && (
        <div className="lightbox" role="presentation" onClick={() => setLightbox('')}>
          <button type="button" className="lightbox__close icon-btn" aria-label="إغلاق" onClick={() => setLightbox('')}>
            <X size={22} />
          </button>
          <img src={lightbox} alt="إثبات التسليم" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <BottomNav />
    </div>
  );
}

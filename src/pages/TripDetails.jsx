import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import ContactActions from '../components/ContactActions';
import StoreStopCard from '../components/StoreStopCard';
import {
  TRIP_STATUS_LABELS,
  TRIP_STATUS_COLORS,
  formatPrice,
  formatDate,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../utils/tripHelpers';

export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [confirmComplete, setConfirmComplete] = useState(false);

  const { data: trip, isLoading } = useQuery({
    queryKey: queryKeys.trip(tripId),
    queryFn: async () => {
      const { data } = await api.get(`/delivery/driver/trips/${tripId}`);
      return data.trip;
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.trip(tripId) });
    qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    qc.invalidateQueries({ queryKey: ['delivery', 'trips'] });
  };

  const action = useMutation({
    mutationFn: async ({ url, method = 'patch' }) => {
      const { data } = await api[method](url);
      return data.trip || data;
    },
    onSuccess: (updatedTrip) => {
      if (updatedTrip?._id) {
        qc.setQueryData(queryKeys.trip(tripId), updatedTrip);
      }
      invalidate();
    },
  });

  if (isLoading || !trip) {
    return <div className="app-shell"><p className="muted-center">جاري التحميل...</p></div>;
  }

  const isCash = trip.paymentMethod === 'cash_on_delivery';
  const allCollected = (trip.storeStops || []).every((s) => s.collectionStatus === 'collected');
  const remaining = (trip.storeStops || []).filter((s) => s.collectionStatus !== 'collected').length;
  const busy = action.isPending;

  return (
    <div className="app-shell app-shell--detail">
      <header className="page-header page-header--back">
        <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="رجوع">
          <ArrowRight size={20} />
        </button>
        <div>
          <h1>تفاصيل الرحلة</h1>
          <span className={`trip-card__status ${TRIP_STATUS_COLORS[trip.status] || ''}`}>
            {trip.statusLabel || TRIP_STATUS_LABELS[trip.status]}
          </span>
        </div>
      </header>

      <section className="panel">
        <h2>معلومات الزبون</h2>
        <div className="detail-grid">
          <div><span>الاسم</span><strong>{trip.customerName || '—'}</strong></div>
          <div><span>الهاتف</span><strong dir="ltr">{trip.customerPhone || '—'}</strong></div>
          <div><span>المنطقة</span><strong>{trip.deliveryArea || '—'}</strong></div>
          <div><span>العنوان</span><strong>{trip.deliveryAddress || '—'}</strong></div>
        </div>
        <ContactActions
          phone={trip.customerPhone}
          whatsapp={trip.customerWhatsapp}
          address={trip.deliveryAddress}
          chatUserId={trip.customer}
          chatLabel="محادثة الزبون"
        />
      </section>

      <section className="panel">
        <div className="panel__head-row">
          <h2>المتاجر ({trip.storeCount || 0})</h2>
          {remaining > 0 && <span className="badge badge-warn">متبقي {remaining}</span>}
        </div>
        <div className="store-stop-list">
          {(trip.storeStops || []).map((stop) => (
            <StoreStopCard
              key={String(stop.order)}
              stop={stop}
              collecting={busy}
              onCollect={stop.collectionStatus === 'collected' ? undefined : () => action.mutate({
                url: `/delivery/driver/trips/${tripId}/stops/${stop.order}/collect`,
              })}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>رسوم التوصيل</h2>
        <div className="detail-grid">
          <div><span>المبلغ</span><strong>{formatPrice(trip.deliveryFee, trip.currency)}</strong></div>
          <div><span>طريقة الدفع</span><strong>{PAYMENT_METHOD_LABELS[trip.paymentMethod] || trip.paymentMethod}</strong></div>
          <div><span>حالة الدفع</span><strong>{trip.paymentVerified ? 'تم التحقق' : (PAYMENT_STATUS_LABELS[trip.paymentStatus] || trip.paymentStatus)}</strong></div>
          <div><span>التاريخ</span><strong>{formatDate(trip.createdAt)}</strong></div>
        </div>

        {isCash ? (
          <p className="payment-note payment-note--cash">الدفع عند الاستلام</p>
        ) : (
          <div className="payment-digital">
            {trip.paymentProof && (
              <img src={trip.paymentProof} alt="إيصال الدفع" className="payment-proof" />
            )}
            <div className="detail-grid">
              <div><span>اسم المحوّل</span><strong>{trip.transferInformation?.senderName || '—'}</strong></div>
              <div><span>هاتف المحوّل</span><strong dir="ltr">{trip.transferInformation?.contactNumber || '—'}</strong></div>
              <div><span>مرجع</span><strong>{trip.transferInformation?.referenceNumber || '—'}</strong></div>
            </div>
          </div>
        )}

        {!trip.paymentVerified && !isCash && (
          <button
            type="button"
            className="btn-secondary btn-primary--block"
            disabled={busy}
            onClick={() => action.mutate({ url: `/delivery/driver/trips/${tripId}/verify-payment` })}
          >
            {busy ? <Loader2 size={18} className="spin" /> : null}
            تم التحقق من الدفع
          </button>
        )}
      </section>

      <footer className="detail-actions">
        {trip.status === 'ready_for_pickup' || trip.status === 'waiting_for_acceptance' ? (
          <button
            type="button"
            className="btn-primary btn-primary--block"
            disabled={busy}
            onClick={() => action.mutate({ url: `/delivery/driver/trips/${tripId}/accept` })}
          >
            قبول الرحلة
          </button>
        )}

        {['driver_assigned', 'accepted', 'collecting_orders'].includes(trip.status) && allCollected && (
          <button
            type="button"
            className="btn-primary btn-primary--block"
            disabled={busy}
            onClick={() => action.mutate({ url: `/delivery/driver/trips/${tripId}/start` })}
          >
            بدء التوصيل
          </button>
        )}

        {(trip.status === 'on_delivery' || trip.status === 'on_the_way') && !confirmComplete && (
          <button
            type="button"
            className="btn-primary btn-primary--block"
            onClick={() => setConfirmComplete(true)}
          >
            تم التسليم
          </button>
        )}

        {confirmComplete && (
          <div className="confirm-box">
            <p>هل تم تسليم جميع الطلبات؟</p>
            <div className="confirm-box__actions">
              <button
                type="button"
                className="btn-primary"
                disabled={busy}
                onClick={() => action.mutate(
                  { url: `/delivery/driver/trips/${tripId}/complete` },
                  { onSuccess: () => navigate('/history', { replace: true }) },
                )}
              >
                تأكيد الإكمال
              </button>
              <button type="button" className="btn-ghost" onClick={() => setConfirmComplete(false)}>
                إلغاء
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

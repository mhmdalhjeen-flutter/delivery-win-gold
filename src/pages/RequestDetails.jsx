import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import ContactActions from '../components/ContactActions';
import StoreStopCard from '../components/StoreStopCard';
import AssignDriverModal from '../components/AssignDriverModal';
import { HeaderIconLinks } from '../components/AppHeader';
import QueryErrorState from '../shared/QueryErrorState';
import {
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  formatPrice,
  formatDate,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  isPendingConfirmation,
  isAssignedRequest,
  isSentOrder,
} from '../utils/tripHelpers';

export default function RequestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);

  const { data: request, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.request(requestId),
    queryFn: async () => {
      const { data } = await api.get(`/delivery/company/requests/${requestId}`);
      return data.request;
    },
    refetchInterval: 15_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.request(requestId) });
    qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    qc.invalidateQueries({ queryKey: queryKeys.sentOrders });
    qc.invalidateQueries({ queryKey: queryKeys.assignedOrders });
    qc.invalidateQueries({ queryKey: ['delivery', 'company', 'requests'] });
  };

  const action = useMutation({
    mutationFn: async ({ url, method = 'patch', body }) => {
      const { data } = await api[method](url, body);
      return data.request || data;
    },
    onSuccess: (updated) => {
      if (updated?._id) {
        qc.setQueryData(queryKeys.request(requestId), updated);
      }
      invalidate();
    },
  });

  if (isLoading) {
    return <div className="app-shell"><p className="muted-center">جاري التحميل...</p></div>;
  }

  if (isError || !request) {
    const message = error?.response?.data?.message || 'تعذّر تحميل تفاصيل الطلب';
    return (
      <div className="app-shell">
        <QueryErrorState message={message} onRetry={() => refetch()} />
      </div>
    );
  }

  const isCash = request.paymentMethod === 'cash_on_delivery';
  const busy = action.isPending;
  const status = request.status;
  const assigned = request.assignedDriver;
  const canAssign = isPendingConfirmation(status) || isAssignedRequest(status);

  return (
    <div className="app-shell app-shell--detail">
      <header className="page-header page-header--back">
        <div className="page-header__start">
          <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="رجوع">
            <ArrowRight size={20} />
          </button>
          <div className="page-header__titles">
            <h1>{request.orderNumber ? `#${request.orderNumber}` : 'تفاصيل الطلب'}</h1>
            <span className={`trip-card__status ${REQUEST_STATUS_COLORS[status] || ''}`}>
              {request.statusLabel || REQUEST_STATUS_LABELS[status]}
            </span>
          </div>
        </div>
        <div className="page-header__actions">
          <HeaderIconLinks />
        </div>
      </header>

      {assigned?.name && (
        <section className="panel panel--driver">
          <h2>السائق المعيّن</h2>
          <div className="detail-grid">
            <div><span>الاسم</span><strong>{assigned.name}</strong></div>
            <div><span>الهاتف</span><strong dir="ltr">{assigned.phone || '—'}</strong></div>
          </div>
          {assigned.note && <p className="driver-note">{assigned.note}</p>}
          <ContactActions
            phone={assigned.phone}
            whatsapp={assigned.whatsapp || assigned.phone}
          />
        </section>
      )}

      <section className="panel">
        <h2>معلومات الزبون</h2>
        <div className="detail-grid">
          <div><span>الاسم</span><strong>{request.customerName || '—'}</strong></div>
          <div><span>الهاتف</span><strong dir="ltr">{request.customerPhone || '—'}</strong></div>
          <div><span>المنطقة</span><strong>{request.deliveryArea || '—'}</strong></div>
          <div><span>العنوان</span><strong>{request.deliveryAddress || '—'}</strong></div>
          <div><span>تاريخ الطلب</span><strong>{formatDate(request.submittedAt || request.createdAt)}</strong></div>
          <div><span>آخر تحديث</span><strong>{formatDate(request.lastUpdatedAt || request.updatedAt)}</strong></div>
        </div>
        <ContactActions
          phone={request.customerPhone}
          whatsapp={request.customerWhatsapp || request.customerPhone}
          address={request.deliveryAddress}
          chatUserId={request.customer}
          chatLabel="محادثة الزبون"
        />
      </section>

      <section className="panel">
        <div className="panel__head-row">
          <h2>المتاجر ({request.storeCount || 0})</h2>
        </div>
        <div className="store-stop-list">
          {(request.storeStops || []).map((stop) => (
            <StoreStopCard key={String(stop.order)} stop={stop} />
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>رسوم التوصيل</h2>
        <div className="detail-grid">
          <div><span>المبلغ</span><strong>{formatPrice(request.deliveryFee, request.currency)}</strong></div>
          <div><span>طريقة الدفع</span><strong>{PAYMENT_METHOD_LABELS[request.paymentMethod] || request.paymentMethod}</strong></div>
          <div><span>حالة الدفع</span><strong>{PAYMENT_STATUS_LABELS[request.paymentStatus] || request.paymentStatus}</strong></div>
          <div><span>التاريخ</span><strong>{formatDate(request.createdAt)}</strong></div>
        </div>

        {isCash ? (
          <p className="payment-note payment-note--cash">الدفع عند الاستلام</p>
        ) : (
          <div className="payment-digital">
            {request.paymentProof && (
              <img src={request.paymentProof} alt="إيصال الدفع" className="payment-proof" />
            )}
            <div className="detail-grid">
              <div><span>اسم المحوّل</span><strong>{request.transferInformation?.senderName || '—'}</strong></div>
              <div><span>هاتف المحوّل</span><strong dir="ltr">{request.transferInformation?.contactNumber || '—'}</strong></div>
              <div><span>مرجع</span><strong>{request.transferInformation?.referenceNumber || '—'}</strong></div>
              <div><span>ملاحظة</span><strong>{request.transferInformation?.note || request.paymentNotes || '—'}</strong></div>
            </div>
          </div>
        )}
        {request.paymentNotes && isCash && (
          <p className="payment-note">{request.paymentNotes}</p>
        )}
      </section>

      <footer className="detail-actions">
        {isPendingConfirmation(status) && !rejectOpen && (
          <>
            <button
              type="button"
              className="btn-primary btn-primary--block"
              disabled={busy}
              onClick={() => setAssignOpen(true)}
            >
              تعيين سائق
            </button>
            <button
              type="button"
              className="btn-ghost btn-primary--block"
              disabled={busy}
              onClick={() => setRejectOpen(true)}
            >
              رفض الطلب
            </button>
          </>
        )}

        {rejectOpen && (
          <div className="confirm-box">
            <p>سبب الرفض (اختياري)</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="مثال: خارج نطاق التغطية"
            />
            <div className="confirm-box__actions">
              <button
                type="button"
                className="btn-primary"
                disabled={busy}
                onClick={() => action.mutate(
                  {
                    url: `/delivery/company/requests/${requestId}/reject`,
                    body: { reason: rejectReason },
                  },
                  { onSuccess: () => navigate('/requests?status=rejected', { replace: true }) },
                )}
              >
                تأكيد الرفض
              </button>
              <button type="button" className="btn-ghost" onClick={() => setRejectOpen(false)}>
                إلغاء
              </button>
            </div>
          </div>
        )}

        {isAssignedRequest(status) && (
          <button
            type="button"
            className="btn-secondary btn-primary--block"
            disabled={busy}
            onClick={() => setAssignOpen(true)}
          >
            {busy ? <Loader2 size={18} className="spin" /> : null}
            تغيير السائق
          </button>
        )}

        {isSentOrder(status) && !confirmComplete && (
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
            <p>هل تم تسليم جميع الطلبات للزبون؟</p>
            <div className="confirm-box__actions">
              <button
                type="button"
                className="btn-primary"
                disabled={busy}
                onClick={() => action.mutate(
                  { url: `/delivery/company/requests/${requestId}/complete` },
                  { onSuccess: () => navigate('/requests?status=delivered', { replace: true }) },
                )}
              >
                تأكيد التسليم
              </button>
              <button type="button" className="btn-ghost" onClick={() => setConfirmComplete(false)}>
                إلغاء
              </button>
            </div>
          </div>
        )}
      </footer>

      <AssignDriverModal
        open={assignOpen}
        saving={busy}
        onClose={() => setAssignOpen(false)}
        onConfirm={({ driverId, note }) => {
          action.mutate(
            {
              url: `/delivery/company/requests/${requestId}/assign-driver`,
              body: { driverId, note },
            },
            {
              onSuccess: () => {
                setAssignOpen(false);
                navigate('/assigned-orders', { replace: true });
              },
            },
          );
        }}
      />
    </div>
  );
}

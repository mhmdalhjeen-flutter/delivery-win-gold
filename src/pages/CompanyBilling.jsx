import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Receipt, Upload } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import { syncCompanyBillingCache } from '../lib/billingQuerySync';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import { fileToCompressedDataUrl } from '../utils/imageUpload';
import { formatPrice } from '../utils/tripHelpers';
import QueryErrorState from '../shared/QueryErrorState';

const EMPTY_TRANSFER = {
  transferName: '',
  transferPhone: '',
  transferNumber: '',
  paymentNotes: '',
};

function statusLabel(status) {
  const map = {
    counting: 'جاري العد',
    awaiting_payment: 'بانتظار الدفع',
    payment_pending: 'قيد المراجعة',
    payment_rejected: 'مرفوض — يرجى التصحيح',
    paid: 'مدفوع',
    exempted: 'معفى',
  };
  return map[status] || status || '—';
}

function hasPaymentProof(payment, transfer, receipt, mode) {
  if (mode === 'receipt') return Boolean(receipt);
  const ti = transfer || {};
  return Boolean(String(ti.transferName || '').trim() || String(ti.transferNumber || '').trim());
}

export default function CompanyBilling() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('overview');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentMode, setPaymentMode] = useState('receipt');
  const [transfer, setTransfer] = useState(EMPTY_TRANSFER);
  const [receipt, setReceipt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const { data: billing, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.companyBilling,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/billing');
      return data;
    },
    staleTime: 0,
  });

  const needsMethods = step === 'methods' || step === 'pay' || Boolean(billing?.needsPayment);
  const { data: methodsData } = useQuery({
    queryKey: queryKeys.billingPaymentMethods,
    queryFn: async () => {
      const { data } = await api.get('/delivery/company/billing/payment-methods');
      return data;
    },
    enabled: needsMethods,
    staleTime: 60 * 1000,
  });

  const methods = methodsData?.methods || [];
  const openPeriod = billing?.openPeriod;
  const payablePeriod = openPeriod || billing?.previousPeriod;
  const currency = billing?.currency || 'ILS';
  const currentCount = billing?.currentPeriod?.deliveredOrderCount ?? 0;
  const mandatory = Boolean(billing?.needsPayment);

  useEffect(() => {
    if (!billing) return;
    const payment = billing.payment || {};
    const ti = payment.transferInformation || {};
    setTransfer({
      transferName: ti.senderName || '',
      transferPhone: ti.contactNumber || '',
      transferNumber: ti.referenceNumber || '',
      paymentNotes: ti.note || '',
    });
    if (payment.paymentProof) {
      setReceipt(payment.paymentProof);
      setPaymentMode('receipt');
    } else if (ti.senderName || ti.referenceNumber) {
      setPaymentMode('transfer');
    }

    if (billing.paymentRejected) {
      setStep('pay');
      if (payment.paymentMethod) {
        const match = methods.find((m) => m.type === payment.paymentMethod);
        setSelectedMethod(match || { type: payment.paymentMethod, label: payment.paymentMethod });
      }
    } else if (billing.paymentPending) {
      setStep('pending');
    } else if (billing.needsPayment) {
      setStep('methods');
    }
  }, [billing, methods]);

  const billSummary = useMemo(() => {
    if (!payablePeriod) return null;
    const count = payablePeriod.deliveredOrderCount ?? 0;
    const price = payablePeriod.pricePerOrder ?? billing?.pricePerOrder ?? 1;
    return {
      monthLabel: payablePeriod.monthLabel || payablePeriod.monthKey,
      monthKey: payablePeriod.monthKey,
      count,
      price,
      total: payablePeriod.amountDue ?? count * price,
      status: payablePeriod.status,
    };
  }, [payablePeriod, billing?.pricePerOrder]);

  const showToast = (text, isError = false) => {
    setToast({ text, isError });
    window.setTimeout(() => setToast({ text: '', isError: false }), 4000);
  };

  const handleReceiptPick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToCompressedDataUrl(file);
    setReceipt(dataUrl);
  };

  const handleSubmit = async () => {
    if (!selectedMethod?.type) {
      showToast('اختر طريقة الدفع', true);
      return;
    }
    if (!hasPaymentProof(billing?.payment, transfer, receipt, paymentMode)) {
      showToast('يرجى رفع إشعار الدفع أو إدخال بيانات التحويل', true);
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/delivery/company/billing/payment', {
        periodId: payablePeriod?._id,
        paymentMethod: selectedMethod.type,
        transferName: transfer.transferName,
        transferPhone: transfer.transferPhone,
        transferNumber: transfer.transferNumber,
        paymentNotes: transfer.paymentNotes,
        paymentProof: paymentMode === 'receipt' ? receipt : '',
      });
      showToast(data?.message || 'تم إرسال الدفع — قيد المراجعة');
      setStep('pending');
      await syncCompanyBillingCache(queryClient, data);
    } catch (err) {
      showToast(err.response?.data?.message || 'تعذّر إرسال الدفع', true);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-shell">
        <AppHeader title="الاشتراك الشهري" />
        <div className="billing-loading"><Loader2 className="spin" size={28} /></div>
        <BottomNav />
      </div>
    );
  }

  if (isError) {
    const message = error?.response?.data?.message || 'تعذّر تحميل بيانات الاشتراك';
    return (
      <div className="app-shell">
        <AppHeader title="الاشتراك الشهري" />
        <QueryErrorState message={message} onRetry={() => refetch()} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-shell app-shell--billing">
      <AppHeader title="الاشتراك الشهري" />

      {toast.text && (
        <div className={`billing-toast${toast.isError ? ' billing-toast--error' : ''}`}>{toast.text}</div>
      )}

      <div className="billing-page billing-page--compact">
        {mandatory && !billing?.paymentRejected && (
          <section className="billing-alert billing-alert--new-month">
            <h2>انتهى الشهر، يرجى تسديد الاشتراك الشهري</h2>
            <p>يرجى إتمام دفع فاتورة الشهر السابق للمتابعة في استخدام بوابة التوصيل.</p>
          </section>
        )}

        {mandatory && billing?.paymentRejected && (
          <section className="billing-alert billing-alert--rejected">
            <h2>تعذر التحقق من الدفع، يرجى مراجعة حالة الدفع وإعادة إرسال بيانات الدفع.</h2>
            {billing?.payment?.rejectionReason && (
              <p className="billing-reject-reason">{billing.payment.rejectionReason}</p>
            )}
          </section>
        )}

        {!mandatory && (
          <div className="billing-inline-stats">
            <span className="billing-chip billing-chip--current">
              {billing?.currentMonthLabel || billing?.currentMonthKey}
              {' · '}
              {currentCount.toLocaleString('ar-EG')} توصيلة
            </span>
          </div>
        )}

        {billSummary && mandatory && (
          <section className="billing-invoice-card">
            <p className="billing-invoice-card__label">الشهر السابق</p>
            <div className="billing-invoice-card__head">
              <strong>{billSummary.monthLabel}</strong>
              <span>{billSummary.count.toLocaleString('ar-EG')} طلب محتسب</span>
            </div>
            <p className="billing-invoice-card__meta">
              عدد الطلبات المحتسبة: {billSummary.count.toLocaleString('ar-EG')}
            </p>
            <p className="billing-invoice-card__meta">
              سعر الطلب: {formatPrice(billSummary.price, currency)}
            </p>
            <p className="billing-invoice-card__total">
              المبلغ المستحق: {formatPrice(billSummary.total, currency)}
            </p>
            <p className="billing-invoice-card__status">{statusLabel(billSummary.status)}</p>
          </section>
        )}

        {step === 'methods' && mandatory && !billing?.paymentPending && (
          <section className="billing-card billing-card--compact">
            <h3>طرق الدفع المتاحة</h3>
            <p className="billing-instructions">اختر طريقة الدفع وأرسل إثبات التحويل أو بيانات الدفع.</p>
            <div className="billing-methods billing-methods--compact">
              {methods.map((method) => (
                <button
                  key={method._id}
                  type="button"
                  className={`billing-method${selectedMethod?._id === method._id ? ' billing-method--active' : ''}`}
                  onClick={() => { setSelectedMethod(method); setStep('pay'); }}
                >
                  <strong>{method.label}</strong>
                  <span dir="ltr">{method.accountNumber}</span>
                  <span>{method.accountName}</span>
                  {method.barcodeImage && (
                    <img src={method.barcodeImage} alt={method.label} className="billing-method__qr" />
                  )}
                </button>
              ))}
            </div>
            {!methods.length && <p className="muted-center">لا توجد طرق دفع مفعّلة حالياً</p>}
          </section>
        )}

        {step === 'pay' && selectedMethod && mandatory && (
          <section className="billing-card billing-card--compact">
            <h3>إرسال الدفع — {selectedMethod.label}</h3>
            <div className="billing-mode-toggle">
              <button type="button" className={paymentMode === 'receipt' ? 'active' : ''} onClick={() => setPaymentMode('receipt')}>
                <Receipt size={16} /> إشعار
              </button>
              <button type="button" className={paymentMode === 'transfer' ? 'active' : ''} onClick={() => setPaymentMode('transfer')}>
                تحويل
              </button>
            </div>

            {paymentMode === 'receipt' ? (
              <label className="billing-upload">
                <Upload size={18} />
                <span>{receipt ? 'تم اختيار الإشعار' : 'رفع إشعار الدفع'}</span>
                <input type="file" accept="image/*" hidden onChange={handleReceiptPick} />
              </label>
            ) : (
              <div className="billing-form">
                <input placeholder="اسم المرسل" value={transfer.transferName} onChange={(e) => setTransfer((p) => ({ ...p, transferName: e.target.value }))} />
                <input dir="ltr" placeholder="رقم التواصل" value={transfer.transferPhone} onChange={(e) => setTransfer((p) => ({ ...p, transferPhone: e.target.value }))} />
                <input dir="ltr" placeholder="رقم المرجع" value={transfer.transferNumber} onChange={(e) => setTransfer((p) => ({ ...p, transferNumber: e.target.value }))} />
                <textarea rows={2} placeholder="ملاحظات" value={transfer.paymentNotes} onChange={(e) => setTransfer((p) => ({ ...p, paymentNotes: e.target.value }))} />
              </div>
            )}

            <button type="button" className="billing-primary-btn" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'جاري الإرسال...' : 'إرسال الدفع'}
            </button>
            <button type="button" className="billing-secondary-btn" onClick={() => setStep('methods')}>
              تغيير طريقة الدفع
            </button>
          </section>
        )}

        {step === 'pending' && (
          <section className="billing-card billing-card--pending billing-card--compact">
            <h3>الدفع قيد المراجعة</h3>
            <p>تم استلام بيانات الدفع. يمكنك متابعة العمل — سنُعلمك عند الاعتماد.</p>
            {!mandatory && (
              <Link to="/" className="billing-secondary-btn">العودة للرئيسية</Link>
            )}
          </section>
        )}

        {!mandatory && !billing?.paymentPending && (
          <section className="billing-card billing-card--ok billing-card--compact">
            <p>لا توجد فاتورة مستحقة. دورة {billing?.currentMonthLabel} قيد العد.</p>
          </section>
        )}
      </div>

      {!mandatory && <BottomNav />}
    </div>
  );
}

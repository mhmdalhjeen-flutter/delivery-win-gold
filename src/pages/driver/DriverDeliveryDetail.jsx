import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Camera, CheckCircle2, ImagePlus, Loader2, MapPin, Phone, Store, X } from 'lucide-react';
import api from '../../api/axios';
import { queryKeys } from '../../lib/queryClient';
import { queueDeliveryCompletion } from '../../lib/offlineDeliveryQueue';
import useOfflineSync from '../../hooks/useOfflineSync';
import ContactActions from '../../components/ContactActions';
import { fileToCompressedDataUrl } from '../../utils/imageUpload';

export default function DriverDeliveryDetail() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const [note, setNote] = useState('');
  const [proofPreview, setProofPreview] = useState('');
  const [proofData, setProofData] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const { refreshCount } = useOfflineSync(true);

  const { data: assignment, isLoading } = useQuery({
    queryKey: queryKeys.driverAssignment(assignmentId),
    queryFn: async () => {
      const { data } = await api.get(`/delivery/driver/assignments/${assignmentId}`);
      return data.assignment;
    },
    refetchInterval: (query) => (query.state.data?.canConfirmDelivery ? false : 5_000),
  });

  const complete = useMutation({
    mutationFn: async ({ deliveryProof, deliveryNote, clientSyncId }) => {
      const { data } = await api.patch(`/delivery/driver/assignments/${assignmentId}/complete`, {
        deliveryProof,
        deliveryNote,
        clientSyncId,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.driverAssignments });
      qc.invalidateQueries({ queryKey: queryKeys.driverHistory });
      navigate('/driver/history', { replace: true });
    },
  });

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCompressing(true);
    setPhotoError('');
    try {
      const dataUrl = await fileToCompressedDataUrl(file, { maxWidth: 1600, quality: 0.82 });
      setProofPreview(dataUrl);
      setProofData(dataUrl);
    } catch {
      setPhotoError('تعذّر قراءة الصورة — حاول مرة أخرى');
    } finally {
      setCompressing(false);
    }
  };

  const openConfirm = () => {
    setPhotoError('');
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (complete.isPending) return;
    setConfirmOpen(false);
    setPhotoError('');
  };

  const handleDeliver = async () => {
    if (!proofData) {
      setPhotoError('صورة إثبات التسليم مطلوبة');
      return;
    }

    const clientSyncId = `${assignmentId}-${Date.now()}`;
    const payload = {
      sessionId: assignmentId,
      clientSyncId,
      deliveryNote: note.trim(),
      deliveryProof: proofData,
    };

    if (!navigator.onLine) {
      queueDeliveryCompletion(payload);
      refreshCount();
      setOfflineSaved(true);
      setConfirmOpen(false);
      setTimeout(() => navigate('/driver', { replace: true }), 1200);
      return;
    }

    try {
      await complete.mutateAsync({
        deliveryProof: proofData,
        deliveryNote: note.trim(),
        clientSyncId,
      });
    } catch (err) {
      if (err.response?.data?.message) {
        setPhotoError(err.response.data.message);
        return;
      }
      if (!err.response) {
        queueDeliveryCompletion(payload);
        refreshCount();
        setOfflineSaved(true);
        setConfirmOpen(false);
        setTimeout(() => navigate('/driver', { replace: true }), 1200);
      }
    }
  };

  if (isLoading || !assignment) {
    return <div className="app-shell"><p className="muted-center">جاري التحميل...</p></div>;
  }

  return (
    <div className="app-shell app-shell--detail app-shell--driver-detail">
      <header className="page-header page-header--back">
        <div className="page-header__start">
          <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="رجوع">
            <ArrowRight size={20} />
          </button>
          <div className="page-header__titles">
            <h1>#{assignment.referenceNumber}</h1>
            <span className="trip-card__status status-way">{assignment.statusLabel}</span>
          </div>
        </div>
      </header>

      {offlineSaved && (
        <div className="sync-banner sync-banner--success">
          تم الحفظ محلياً — سيتم المزامنة عند عودة الإنترنت
        </div>
      )}

      <section className="panel">
        <h2>الزبون</h2>
        <div className="detail-grid">
          <div><span>الاسم</span><strong>{assignment.customerName}</strong></div>
          <div><span>الهاتف</span><strong dir="ltr">{assignment.customerPhone}</strong></div>
          <div><span>العنوان</span><strong>{assignment.deliveryAddress || '—'}</strong></div>
          <div><span>مرجع الشركة</span><strong>{assignment.referenceNumber}</strong></div>
        </div>
        <ContactActions
          phone={assignment.customerPhone}
          whatsapp={assignment.customerWhatsapp || assignment.customerPhone}
          address={assignment.deliveryAddress}
          chatUserId={assignment.customerId}
          chatBasePath="/driver/chat"
          chatLabel="محادثة"
        />
      </section>

      <section className="panel">
        <h2>المتاجر ({assignment.stores?.length || 0})</h2>
        <div className="driver-store-list">
          {(assignment.stores || []).map((store) => (
            <article key={store.orderId} className="driver-store-card">
              <div className="driver-store-card__head">
                <Store size={18} />
                <strong>{store.name}</strong>
              </div>
              <p><MapPin size={14} /> {store.address || '—'}</p>
              <p dir="ltr"><Phone size={14} /> {store.phone || '—'}</p>
              <p>رقم الطلب: <strong>{store.orderNumber}</strong></p>
              <p>رمز التأكيد: <strong>{store.verificationCode}</strong></p>
              <ul className="driver-items-list">
                {(store.items || []).map((item, idx) => (
                  <li key={idx}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {assignment.canConfirmDelivery && (
        <section className="panel panel--deliver">
          <h2>تأكيد التسليم</h2>
          <p className="form-hint">اضغط «تم التسليم» ثم أرفق صورة الإثبات لإكمال التوصيل.</p>
          <button type="button" className="btn-deliver-success" onClick={openConfirm}>
            <CheckCircle2 size={24} />
            تم التسليم
          </button>
        </section>
      )}

      {!assignment.canConfirmDelivery && (
        <section className="panel panel--hint">
          <p>توجّه إلى المتجر لاستلام الطلب — زر التسليم يتفعّل بعد استلام المتجر للطلب</p>
        </section>
      )}

      {confirmOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeConfirm}>
          <div
            className="modal-sheet modal-sheet--tall"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deliver-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-sheet__head">
              <h2 id="deliver-confirm-title">إثبات التسليم</h2>
              <button type="button" className="icon-btn" onClick={closeConfirm} aria-label="إغلاق">
                <X size={20} />
              </button>
            </header>

            <div className="modal-form">
              <p className="modal-sheet__hint">صورة إثبات التسليم مطلوبة قبل التأكيد النهائي.</p>

              <div className="driver-photo-actions driver-photo-actions--row">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={compressing}
                  onClick={() => cameraRef.current?.click()}
                >
                  <Camera size={18} />
                  كاميرا
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={compressing}
                  onClick={() => galleryRef.current?.click()}
                >
                  <ImagePlus size={18} />
                  معرض / ملفات
                </button>
              </div>

              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden-input"
                onChange={handlePhoto}
              />
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                className="hidden-input"
                onChange={handlePhoto}
              />

              {compressing && (
                <p className="muted-center"><Loader2 size={18} className="spin" /> جاري تجهيز الصورة...</p>
              )}

              {proofPreview && (
                <img src={proofPreview} alt="صورة التسليم" className="delivery-proof-preview" />
              )}

              <label className="modal-form__note">
                <span>ملاحظة (اختياري)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="ملاحظة للتسليم..."
                />
              </label>

              {photoError && <p className="form-error">{photoError}</p>}

              <div className="modal-sheet__actions">
                <button
                  type="button"
                  className="btn-primary btn-primary--block"
                  disabled={complete.isPending || compressing || !proofData}
                  onClick={handleDeliver}
                >
                  {complete.isPending ? <Loader2 size={18} className="spin" /> : 'تأكيد التسليم'}
                </button>
                <button type="button" className="btn-ghost btn-primary--block" onClick={closeConfirm}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

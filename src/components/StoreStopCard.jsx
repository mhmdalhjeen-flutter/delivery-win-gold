import React from 'react';
import { CheckCircle2, Store } from 'lucide-react';
import ContactActions from './ContactActions';

export default function StoreStopCard({ stop, onCollect, collecting }) {
  const collected = stop.collectionStatus === 'collected';

  return (
    <article className={`store-stop${collected ? ' store-stop--done' : ''}`}>
      <div className="store-stop__head">
        <span className="store-stop__icon"><Store size={18} /></span>
        <div>
          <h4>{stop.storeName || 'متجر'}</h4>
          <p className="store-stop__address">{stop.storeAddress || '—'}</p>
        </div>
        {collected && <CheckCircle2 size={20} className="store-stop__done-icon" />}
      </div>

      <div className="store-stop__details">
        <div><span>رقم الطلب</span><strong>{stop.orderNumber || '—'}</strong></div>
        <div><span>رقم التأكيد</span><strong dir="ltr">{stop.verificationCode || '—'}</strong></div>
        <div><span>الحالة</span><strong>{stop.orderStatusLabel || stop.orderStatus}</strong></div>
        <div><span>الاستلام</span><strong>{stop.collectionStatusLabel || stop.collectionStatus}</strong></div>
      </div>

      <ContactActions
        phone={stop.storePhone}
        whatsapp={stop.storeWhatsapp}
        address={stop.storeAddress}
        chatUserId={stop.storeOwnerId}
        chatLabel="مراسلة المتجر"
      />

      {!collected && onCollect && (
        <button
          type="button"
          className="btn-primary btn-primary--block"
          onClick={onCollect}
          disabled={collecting}
        >
          تم استلام الطلب
        </button>
      )}
    </article>
  );
}

import React from 'react';
import { Store } from 'lucide-react';
import ContactActions from './ContactActions';

export default function StoreStopCard({ stop }) {
  return (
    <article className="store-stop">
      <div className="store-stop__head">
        <span className="store-stop__icon"><Store size={18} /></span>
        <div>
          <h4>{stop.storeName || 'متجر'}</h4>
          <p className="store-stop__address">{stop.storeAddress || '—'}</p>
        </div>
      </div>

      <div className="store-stop__details">
        <div><span>رقم الطلب</span><strong>{stop.orderNumber || '—'}</strong></div>
        <div><span>رقم التأكيد</span><strong dir="ltr">{stop.verificationCode || '—'}</strong></div>
        <div><span>حالة الطلب</span><strong>{stop.orderStatusLabel || stop.orderStatus}</strong></div>
      </div>

      <ContactActions
        phone={stop.storePhone}
        whatsapp={stop.storeWhatsapp}
        address={stop.storeAddress}
        chatUserId={stop.storeOwnerId}
        chatLabel="مراسلة المتجر"
      />
    </article>
  );
}

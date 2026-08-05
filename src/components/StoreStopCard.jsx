import React from 'react';
import { Store, Package } from 'lucide-react';
import ContactActions from './ContactActions';

export default function StoreStopCard({ stop }) {
  const items = stop.items || [];

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
        <div><span>هاتف المتجر</span><strong dir="ltr">{stop.storePhone || '—'}</strong></div>
        <div><span>حالة الطلب</span><strong>{stop.orderStatusLabel || stop.orderStatus}</strong></div>
      </div>

      {items.length > 0 && (
        <div className="store-stop__products">
          <h5>
            <Package size={14} />
            المنتجات
          </h5>
          <ul className="store-stop__items">
            {items.map((item, idx) => (
              <li key={`${item.name}-${idx}`}>
                <span className="store-stop__item-name">
                  {item.name}
                  {item.notes ? (
                    <span className="store-stop__item-note">{item.notes}</span>
                  ) : null}
                </span>
                <strong className="store-stop__item-qty">
                  {item.purchaseMethod === 'price' ? 'بالقيمة' : `× ${item.quantity}`}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stop.customerNotes ? (
        <p className="store-stop__notes">
          <span>ملاحظات:</span>
          {' '}
          {stop.customerNotes}
        </p>
      ) : null}

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

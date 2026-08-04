import React from 'react';
import { ChevronLeft, Package } from 'lucide-react';
import { TRIP_STATUS_LABELS, TRIP_STATUS_COLORS, formatPrice, formatDate, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '../utils/tripHelpers';

export default function TripCard({ trip, onClick }) {
  return (
    <button type="button" className="trip-card" onClick={onClick}>
      <div className="trip-card__head">
        <div>
          <strong className="trip-card__customer">{trip.customerName || 'زبون'}</strong>
          <p className="trip-card__phone" dir="ltr">{trip.customerPhone || '—'}</p>
        </div>
        <span className={`trip-card__status ${TRIP_STATUS_COLORS[trip.status] || ''}`}>
          {trip.statusLabel || TRIP_STATUS_LABELS[trip.status]}
        </span>
      </div>

      <div className="trip-card__meta">
        <span>{trip.deliveryArea || trip.deliveryAddress || '—'}</span>
        <span>
          <Package size={14} className="inline ml-1" />
          {trip.storeCount || 0} متاجر · {trip.orderCount || 0} طلبات
        </span>
      </div>

      <div className="trip-card__footer">
        <span>{formatPrice(trip.deliveryFee, trip.currency)}</span>
        <span>{PAYMENT_METHOD_LABELS[trip.paymentMethod] || trip.paymentMethod || '—'}</span>
        {(trip.status === 'completed' || trip.status === 'delivered') && (
          <span>{PAYMENT_STATUS_LABELS[trip.paymentStatus] || trip.paymentStatus}</span>
        )}
        <span>{formatDate(trip.createdAt)}</span>
      </div>

      <ChevronLeft size={18} className="trip-card__chevron" aria-hidden />
    </button>
  );
}

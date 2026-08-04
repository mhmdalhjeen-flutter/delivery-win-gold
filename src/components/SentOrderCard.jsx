import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, MapPin, Phone, User } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import {
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  formatDate,
} from '../utils/tripHelpers';

export default function SentOrderCard({ order, onUpdated }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [confirmDeliver, setConfirmDeliver] = useState(false);

  const complete = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/delivery/company/requests/${order._id}/complete`);
      return data.request;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sentOrders });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      qc.invalidateQueries({ queryKey: ['delivery', 'company', 'requests'] });
      setConfirmDeliver(false);
      onUpdated?.();
    },
  });

  const status = order.status;
  const note = order.internalNote || order.assignedDriver?.note || order.driverNote;

  return (
    <article className="sent-order-card">
      <div className="sent-order-card__head">
        <div>
          <span className="sent-order-card__number">#{order.orderNumber}</span>
          <span className={`trip-card__status ${REQUEST_STATUS_COLORS[status] || ''}`}>
            {order.statusLabel || REQUEST_STATUS_LABELS[status]}
          </span>
        </div>
        <time>{formatDate(order.lastUpdatedAt || order.updatedAt)}</time>
      </div>

      <div className="sent-order-card__grid">
        <div className="sent-order-card__row">
          <User size={16} />
          <span>{order.customerName || '—'}</span>
        </div>
        <div className="sent-order-card__row" dir="ltr">
          <Phone size={16} />
          <span>{order.customerPhone || '—'}</span>
        </div>
        <div className="sent-order-card__row">
          <User size={16} />
          <span>{order.driverName || order.assignedDriver?.name || '—'}</span>
        </div>
        <div className="sent-order-card__row" dir="ltr">
          <Phone size={16} />
          <span>{order.driverPhone || order.assignedDriver?.phone || '—'}</span>
        </div>
        <div className="sent-order-card__row sent-order-card__row--full">
          <MapPin size={16} />
          <span>{order.deliveryAddress || order.deliveryArea || '—'}</span>
        </div>
      </div>

      {note && (
        <p className="sent-order-card__note">
          <strong>ملاحظة:</strong> {note}
        </p>
      )}

      <div className="sent-order-card__actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(`/requests/${order._id}`)}
        >
          التفاصيل
        </button>

        {!confirmDeliver ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setConfirmDeliver(true)}
          >
            تم التسليم
          </button>
        ) : (
          <div className="sent-order-card__confirm">
            <button
              type="button"
              className="btn-primary"
              disabled={complete.isPending}
              onClick={() => complete.mutate()}
            >
              {complete.isPending ? <Loader2 size={16} className="spin" /> : 'تأكيد'}
            </button>
            <button type="button" className="btn-ghost-sm" onClick={() => setConfirmDeliver(false)}>
              إلغاء
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

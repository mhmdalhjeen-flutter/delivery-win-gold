export const REQUEST_STATUS_LABELS = {
  waiting: 'بانتظار التأكيد',
  waiting_for_stores: 'بانتظار تأكيد المتجر',
  ready_for_pickup: 'بانتظار شركة التوصيل',
  accepted: 'مقبول من الشركة',
  out_for_delivery: 'قيد التوصيل',
  completed: 'تم التسليم',
  rejected: 'مرفوض',
  cancelled: 'ملغى',
  waiting_for_acceptance: 'بانتظار شركة التوصيل',
  driver_assigned: 'مقبول من الشركة',
  collecting_orders: 'قيد التوصيل',
  on_delivery: 'قيد التوصيل',
  on_the_way: 'قيد التوصيل',
  delivered: 'تم التسليم',
};

export const REQUEST_STATUS_COLORS = {
  waiting: 'status-waiting',
  waiting_for_stores: 'status-waiting',
  ready_for_pickup: 'status-waiting',
  accepted: 'status-active',
  out_for_delivery: 'status-way',
  completed: 'status-done',
  rejected: 'status-cancel',
  cancelled: 'status-cancel',
  waiting_for_acceptance: 'status-waiting',
  driver_assigned: 'status-active',
  collecting_orders: 'status-way',
  on_delivery: 'status-way',
  on_the_way: 'status-way',
  delivered: 'status-done',
};

/** @deprecated use REQUEST_STATUS_LABELS */
export const TRIP_STATUS_LABELS = REQUEST_STATUS_LABELS;
/** @deprecated use REQUEST_STATUS_COLORS */
export const TRIP_STATUS_COLORS = REQUEST_STATUS_COLORS;

export const PAYMENT_METHOD_LABELS = {
  cash_on_delivery: 'الدفع عند الاستلام',
  bank_palestine: 'بنك فلسطين',
  palpay: 'PalPay',
  jawwal_pay: 'Jawwal Pay',
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'غير مدفوع',
  pending: 'بانتظار التحقق',
  paid: 'مدفوع',
  verified: 'تم التحقق',
};

export function formatPrice(amount, currency = 'ILS') {
  const value = Number(amount) || 0;
  if (currency === 'ILS') return `${value.toFixed(value % 1 ? 1 : 0)} ₪`;
  return `${value.toFixed(2)} ${currency}`;
}

export function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ar-PS', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function phoneHref(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:${digits}` : null;
}

export function whatsappHref(phone, text = '') {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `972${digits.slice(1)}`;
  const msg = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${digits}${msg}`;
}

export function mapsHref(address) {
  if (!address?.trim()) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
}

export function isPendingConfirmation(status) {
  return ['ready_for_pickup', 'waiting_for_acceptance'].includes(status);
}

/** @deprecated use isPendingConfirmation */
export function isNewRequest(status) {
  return isPendingConfirmation(status);
}

export function isSentOrder(status) {
  return ['out_for_delivery', 'collecting_orders', 'on_delivery', 'on_the_way'].includes(status);
}

export function isAcceptedRequest(status) {
  return ['accepted', 'driver_assigned'].includes(status);
}

export function isOutForDelivery(status) {
  return isSentOrder(status);
}

export function isDelivered(status) {
  return ['completed', 'delivered'].includes(status);
}

export function isRejected(status) {
  return status === 'rejected';
}

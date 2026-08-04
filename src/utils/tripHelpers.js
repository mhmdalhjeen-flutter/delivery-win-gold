export const TRIP_STATUS_LABELS = {
  waiting: 'بانتظار التأكيد',
  waiting_for_stores: 'بانتظار المتاجر',
  ready_for_pickup: 'جاهز للاستلام',
  driver_assigned: 'تم تعيين السائق',
  collecting_orders: 'جمع الطلبات',
  on_delivery: 'في الطريق',
  completed: 'تم التسليم',
  cancelled: 'ملغاة',
  // legacy aliases from older documents
  waiting_for_acceptance: 'بانتظار القبول',
  accepted: 'مقبولة',
  on_the_way: 'في الطريق',
  delivered: 'تم التسليم',
};

export const TRIP_STATUS_COLORS = {
  waiting: 'status-waiting',
  waiting_for_stores: 'status-waiting',
  ready_for_pickup: 'status-waiting',
  driver_assigned: 'status-active',
  collecting_orders: 'status-active',
  on_delivery: 'status-way',
  completed: 'status-done',
  cancelled: 'status-cancel',
  waiting_for_acceptance: 'status-waiting',
  accepted: 'status-active',
  on_the_way: 'status-way',
  delivered: 'status-done',
};

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

/** Delivery PWA notification allowlist — mirrors backend pushTarget.util.js */

export const DELIVERY_COMPANY_NOTIFICATION_TYPES = new Set([
  'delivery_waiting_stores',
  'delivery_new_request',
  'delivery_billing_required',
  'delivery_billing_submitted',
  'delivery_billing_verified',
  'delivery_billing_rejected',
  'delivery_billing_exempted',
  'chat_message',
]);

export const DELIVERY_DRIVER_NOTIFICATION_TYPES = new Set([
  'delivery_assigned_to_you',
  'delivery_out_for_delivery',
  'chat_message',
]);

export function isDeliveryNotificationType(type, role) {
  const normalized = typeof type === 'string' ? type.trim() : '';
  if (role === 'delivery_company') return DELIVERY_COMPANY_NOTIFICATION_TYPES.has(normalized);
  if (role === 'delivery_driver') return DELIVERY_DRIVER_NOTIFICATION_TYPES.has(normalized);
  return DELIVERY_COMPANY_NOTIFICATION_TYPES.has(normalized)
    || DELIVERY_DRIVER_NOTIFICATION_TYPES.has(normalized);
}

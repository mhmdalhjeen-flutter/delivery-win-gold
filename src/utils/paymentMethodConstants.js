/** Unified payment method definitions — mirrors adminstore + backend. */

export const ACCOUNT_KINDS = [
  { id: 'merchant', label: 'تاجر' },
  { id: 'personal', label: 'شخصي' },
];

export const ALL_PAYMENT_METHODS = [
  {
    id: 'cash_on_delivery',
    settingsKey: 'cashOnDelivery',
    label: 'الدفع عند التوصيل',
    icon: '💵',
    description: 'الزبون يدفع نقداً عند الاستلام',
    requiresAccount: false,
  },
  {
    id: 'seller_agreement',
    settingsKey: 'agreementWithStore',
    label: 'الاتفاق مع المتجر',
    icon: '🤝',
    description: 'اتفاق مخصص مع المتجر (دين، حساب شهري، أو أي ترتيب متفق عليه)',
    requiresAccount: false,
  },
  {
    id: 'bank_palestine',
    settingsKey: 'bankPalestine',
    label: 'بنك فلسطين',
    icon: '🏦',
    description: 'تحويل بنكي عبر بنك فلسطين',
    requiresAccount: true,
  },
  {
    id: 'palpay',
    settingsKey: 'palPay',
    label: 'PalPay',
    icon: '💳',
    description: 'دفع عبر PalPay',
    requiresAccount: true,
  },
  {
    id: 'jawwal_pay',
    settingsKey: 'jawwalPay',
    label: 'Jawwal Pay',
    icon: '📱',
    description: 'دفع عبر Jawwal Pay',
    requiresAccount: true,
  },
];

export const DIGITAL_PAYMENT_METHODS = ALL_PAYMENT_METHODS.filter((m) => m.requiresAccount);

export const TYPE_LABELS = Object.fromEntries(
  DIGITAL_PAYMENT_METHODS.map((m) => [m.id, m.label]),
);

export const DEFAULT_PAYMENT_TOGGLES = {
  cashOnDelivery: { enabled: true },
  agreementWithStore: { enabled: false },
  bankPalestine: { enabled: false },
  palPay: { enabled: false },
  jawwalPay: { enabled: false },
};

export function accountTypeLabel(kind) {
  return ACCOUNT_KINDS.find((k) => k.id === kind)?.label || 'تاجر';
}

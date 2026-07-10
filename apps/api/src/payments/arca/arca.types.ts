export const ARCA_CURRENCY_AMD = '051';

export const ARCA_PAYMENT_STATE = {
  DEPOSITED: 'DEPOSITED',
  DECLINED: 'DECLINED',
  CREATED: 'CREATED',
  APPROVED: 'APPROVED',
  REVERSED: 'REVERSED',
  REFUNDED: 'REFUNDED',
} as const;

export type ArcaPaymentState =
  (typeof ARCA_PAYMENT_STATE)[keyof typeof ARCA_PAYMENT_STATE];

export type ArcaRegisterResponse = {
  orderId?: string;
  formUrl?: string;
  errorCode?: number | string;
  errorMessage?: string;
};

export type ArcaOrderStatusResponse = {
  errorCode?: number | string;
  errorMessage?: string;
  orderNumber?: string;
  orderStatus?: number;
  actionCode?: number;
  // Per the Merchant Manual `paymentState` is numeric (N2); some gateways return the string form.
  paymentState?: string | number;
  paymentAmountInfo?: {
    paymentState?: string | number;
    approvedAmount?: number;
    depositedAmount?: number;
  };
};

/** Outcome of re-checking a pending Arca payment against the bank. */
export type ArcaSyncOutcome =
  | 'deposited'
  | 'failed'
  | 'in_progress'
  | 'not_found'
  | 'error';

export type ArcaPaymentMetadata = {
  provider?: 'arca';
  arcaOrderId?: string;
  checkoutLocale?: string;
  checkoutSource?: string;
  arcaRegisterAttempt?: number;
};

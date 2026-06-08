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
  paymentAmountInfo?: {
    paymentState?: string;
    approvedAmount?: number;
    depositedAmount?: number;
  };
};

export type ArcaPaymentMetadata = {
  provider?: 'arca';
  arcaOrderId?: string;
  checkoutLocale?: string;
  checkoutSource?: string;
  arcaRegisterAttempt?: number;
};

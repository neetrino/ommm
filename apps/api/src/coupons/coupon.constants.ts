/** Checkout and admin copy for coupon rejection. Stable English phrases. */
export const COUPON_ERROR = {
  INVALID: 'Invalid code',
  EXPIRED: 'Expired',
  NOT_ACTIVE: 'Not active',
  USAGE_LIMIT: 'Usage limit reached',
  USER_LIMIT: 'Already used maximum allowed times',
  NOT_FOR_USER: 'Not available for this user',
  NOT_APPLICABLE: 'Not applicable to this purchase',
  REFUND_BLOCKED: 'Purchases paid with a coupon cannot be refunded',
} as const;

export const COUPON_CODE_MIN_LENGTH = 3;
export const COUPON_CODE_MAX_LENGTH = 32;
export const COUPON_PERCENT_MIN = 1;
export const COUPON_PERCENT_MAX = 100;
export const COUPON_FIXED_MIN_AMD = 1;
export const COUPON_FIXED_MAX_AMD = 100_000_000;
export const COUPON_USAGE_LIMIT_MAX = 1_000_000;
export const COUPON_ELIGIBLE_USER_MAX = 100;
export const COUPON_ELIGIBLE_PRODUCT_MAX = 50;
export const COUPON_METADATA_KEY = 'coupon';

export const COUPON_CODE_PATTERN = /^[A-Z0-9]+$/;

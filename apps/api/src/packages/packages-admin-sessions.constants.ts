export const ADMIN_PACKAGE_SESSION_ADJUST_MIN = 1;
export const ADMIN_PACKAGE_SESSION_ADJUST_MAX = 20;
export const ADMIN_PACKAGE_SESSION_REASON_MIN = 2;
export const ADMIN_PACKAGE_SESSION_REASON_MAX = 200;

export const CLIENT_PACKAGE_SESSIONS_ADDED_ACTION =
  'CLIENT_PACKAGE_SESSIONS_ADDED';

export const ADMIN_SESSION_ADJUST_ERROR = {
  NOT_FOUND: 'User package not found',
  UNLIMITED: 'Cannot add sessions to an unlimited package',
  CANCELLED: 'Cannot add sessions to a cancelled package',
  PENDING: 'Cannot add sessions to a pending package',
  BALANCE_REQUIRED: 'Select which class type to add sessions to',
  BALANCE_INVALID: 'Selected package balance is not valid',
} as const;

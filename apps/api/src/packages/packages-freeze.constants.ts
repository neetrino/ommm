export const MIN_FREEZE_DAYS_PER_REQUEST = 1;
export const MAX_FREEZE_ALLOWED_COUNT = 10;
export const MAX_FREEZE_DAYS_PER_USE = 90;

export const FREEZE_ERROR = {
  NOT_FOUND: 'User package not found',
  NOT_ACTIVE: 'Package must be active to freeze',
  ALREADY_FROZEN: 'Package is already frozen',
  NOT_FROZEN: 'Package is not frozen',
  NOT_ALLOWED: 'Package freeze is not allowed on this plan',
  NO_REMAINING: 'No remaining freezes on this package',
  INVALID_DAYS: 'Freeze days are outside the allowed range',
  UPCOMING_BOOKINGS: 'Cancel upcoming bookings before freezing this package',
} as const;

import { PACKAGE_PERIOD_DAY_MS } from '../packages/user-package-period.util';

/** How far back an admin/manager may attach a past class to a package. */
export const RETROACTIVE_SESSION_LOOKBACK_DAYS = 30;

export const RETROACTIVE_SESSION_LOOKBACK_MS =
  RETROACTIVE_SESSION_LOOKBACK_DAYS * PACKAGE_PERIOD_DAY_MS;

export const RETROACTIVE_ATTACH_NOTE_MAX_LENGTH = 500;

export const RETROACTIVE_ATTACH_ERROR = {
  CLIENT_NOT_FOUND: 'Client not found',
  PACKAGE_NOT_FOUND: 'Package not found',
  PACKAGE_NOT_ACTIVE: 'Package is not active',
  SESSION_NOT_FOUND: 'Session not found',
  SESSION_NOT_STARTED: 'Session has not started yet',
  SESSION_NOT_ATTACHABLE: 'Session cannot be attached',
  SESSION_OUTSIDE_WINDOW: 'Session is outside the attachable window',
  ALREADY_DEDUCTED: 'This visit is already deducted from a package',
} as const;

import {
  PACKAGE_PERIOD_DAY_MS,
  startOfUtcDay,
} from './user-package-period.util';

/** Helen's rule: activate by first visit, no later than purchase + this many days. */
export const PACKAGE_ACTIVATION_GRACE_DAYS = 30;

export function addUtcDays(start: Date, days: number): Date {
  return new Date(start.getTime() + days * PACKAGE_PERIOD_DAY_MS);
}

export function resolveActivationGraceDeadline(purchasedAt: Date): Date {
  return addUtcDays(startOfUtcDay(purchasedAt), PACKAGE_ACTIVATION_GRACE_DAYS);
}

export function isActivationGraceElapsed(
  purchasedAt: Date,
  now: Date,
): boolean {
  return now.getTime() >= resolveActivationGraceDeadline(purchasedAt).getTime();
}

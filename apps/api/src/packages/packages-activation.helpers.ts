import {
  PACKAGE_PERIOD_DAY_MS,
  startOfUtcDay,
} from './user-package-period.util';
import {
  isActivationGraceElapsed,
  resolveActivationGraceDeadline,
} from './packages-activation.time';

export function shouldAwaitFirstVisit(
  planStartDate: Date | null | undefined,
  purchasedAt: Date,
): boolean {
  if (planStartDate == null) {
    return true;
  }
  const configuredStart = startOfUtcDay(planStartDate);
  const purchaseDayStart = startOfUtcDay(purchasedAt);
  return configuredStart.getTime() <= purchaseDayStart.getTime();
}

export function resolveActivatedPeriodBounds(params: {
  activationAt: Date;
  periodDays: number;
}): { currentPeriodStart: Date; currentPeriodEnd: Date } {
  const currentPeriodStart = startOfUtcDay(params.activationAt);
  const currentPeriodEnd = new Date(
    currentPeriodStart.getTime() + params.periodDays * PACKAGE_PERIOD_DAY_MS,
  );
  return { currentPeriodStart, currentPeriodEnd };
}

export function isVisitEligibleForActivation(params: {
  purchasedAt: Date;
  visitAt: Date;
}): boolean {
  return params.visitAt.getTime() >= params.purchasedAt.getTime();
}

/**
 * First visit day if it is on or before the grace deadline; otherwise the deadline.
 * Returns null while still waiting (no visit yet and grace has not elapsed).
 */
export function resolveActivationInstant(params: {
  purchasedAt: Date;
  firstVisitAt: Date | null;
  now: Date;
}): Date | null {
  const deadline = resolveActivationGraceDeadline(params.purchasedAt);
  const eligibleVisitAt =
    params.firstVisitAt !== null &&
    isVisitEligibleForActivation({
      purchasedAt: params.purchasedAt,
      visitAt: params.firstVisitAt,
    })
      ? params.firstVisitAt
      : null;
  if (eligibleVisitAt !== null) {
    const visitDay = startOfUtcDay(eligibleVisitAt);
    if (visitDay.getTime() <= deadline.getTime()) {
      return eligibleVisitAt;
    }
  }
  if (isActivationGraceElapsed(params.purchasedAt, params.now)) {
    return deadline;
  }
  return null;
}

export function toUserPackageActivationApi(row: {
  awaitingFirstVisit: boolean;
  createdAt: Date;
}): {
  awaitingFirstVisit: boolean;
  activationDeadline: string | null;
} {
  return {
    awaitingFirstVisit: row.awaitingFirstVisit,
    activationDeadline: row.awaitingFirstVisit
      ? resolveActivationGraceDeadline(row.createdAt).toISOString()
      : null,
  };
}

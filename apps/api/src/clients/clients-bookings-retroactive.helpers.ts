import { ClassSessionStatus } from '@prisma/client';
import {
  hasAnyBookableCredit,
  isUserPackageBookableAt,
  membershipCoversSessionType,
  type UserPackageWithPlanAndBalances,
} from '../packages/package-usage.helpers';
import { RETROACTIVE_SESSION_LOOKBACK_MS } from './clients-bookings-retroactive.constants';

export function resolveRetroactiveLookbackStart(now: Date): Date {
  return new Date(now.getTime() - RETROACTIVE_SESSION_LOOKBACK_MS);
}

export function isRetroactiveSessionStarted(
  startsAt: Date,
  now: Date,
): boolean {
  return startsAt.getTime() < now.getTime();
}

export function isRetroactiveSessionInLookback(
  startsAt: Date,
  now: Date,
): boolean {
  return startsAt.getTime() >= resolveRetroactiveLookbackStart(now).getTime();
}

export function isRetroactiveSessionStatusAllowed(
  status: ClassSessionStatus,
): boolean {
  return (
    status !== ClassSessionStatus.CANCELLED &&
    status !== ClassSessionStatus.DRAFT
  );
}

export function hasUnrestoredConsumption(
  consumptions: ReadonlyArray<{ restoredAt: Date | null }>,
): boolean {
  return consumptions.some((row) => row.restoredAt === null);
}

export function readOptionalAttachNote(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export function isSessionAttachableToPackage(
  membership: UserPackageWithPlanAndBalances,
  session: {
    startsAt: Date;
    classType: { id: string; name: string };
  },
  booking:
    | { consumptions: ReadonlyArray<{ restoredAt: Date | null }> }
    | undefined,
): boolean {
  if (booking !== undefined && hasUnrestoredConsumption(booking.consumptions)) {
    return false;
  }
  if (!isUserPackageBookableAt(membership, session.startsAt)) {
    return false;
  }
  if (!membershipCoversSessionType(membership, session.classType)) {
    return false;
  }
  return hasAnyBookableCredit(membership, session.classType);
}

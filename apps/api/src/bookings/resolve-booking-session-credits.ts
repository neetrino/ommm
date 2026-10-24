import type { ClassSession } from '@prisma/client';

type SessionCreditFields = Pick<
  ClassSession,
  'priceCents' | 'sessionRequirement'
>;

type ResolveBookingSessionCreditsParams = {
  session: SessionCreditFields;
  userPackageId?: string;
  /** Member self-service bookings require credit even when no drop-in price is set. */
  requireCredit?: boolean;
};

/**
 * Resolves how many package sessions a booking should consume.
 * Free sessions still consume one credit when booked with a member package.
 */
export function resolveBookingSessionCredits(
  params: ResolveBookingSessionCreditsParams,
): number {
  const configured =
    params.session.sessionRequirement ??
    (params.session.priceCents > 0 ? 1 : 0);
  if (configured > 0) {
    return configured;
  }
  return params.requireCredit || params.userPackageId !== undefined ? 1 : 0;
}

/** Whether booking should validate and charge against a member package. */
export function shouldValidatePackageForBooking(
  params: ResolveBookingSessionCreditsParams,
): boolean {
  return (
    resolveBookingSessionCredits(params) > 0 ||
    params.userPackageId !== undefined
  );
}

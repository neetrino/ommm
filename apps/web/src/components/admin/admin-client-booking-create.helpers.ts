import type { EligibleBookingPackage } from "@/components/account/booking-package-select-modal";
import { formatDateTimeForUi } from "@/lib/date-display";

export const ADMIN_CLIENT_BOOKING_SESSION_LOOKAHEAD_DAYS = 30;
export const ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE = "";

export type AdminClientBookingUpcomingSession = {
  id: string;
  startsAt: string;
  status: string;
  priceCents: number;
  sessionRequirement: number | null;
  classType: { name: string };
  coach: { user: { name: string | null } };
};

export function sessionRequiresPackage(
  session: AdminClientBookingUpcomingSession,
): boolean {
  const configured =
    session.sessionRequirement ?? (session.priceCents > 0 ? 1 : 0);
  return configured > 0;
}

export function filterUpcomingBookableSessions(
  rows: readonly AdminClientBookingUpcomingSession[],
  nowMs: number = Date.now(),
): AdminClientBookingUpcomingSession[] {
  return rows.filter(
    (row) =>
      row.status !== "CANCELLED" &&
      row.status !== "DRAFT" &&
      new Date(row.startsAt).getTime() > nowMs,
  );
}

export function packageOptionLabel(
  pkg: EligibleBookingPackage,
  locale: string,
  duplicateSuffixes: ReadonlyMap<string, number>,
  unlimitedLabel: string,
  remainingLabel: (count: number) => string,
): string {
  const suffix = duplicateSuffixes.get(pkg.userPackageId);
  const name = suffix !== undefined ? `${pkg.planName} (${suffix})` : pkg.planName;
  const remaining = pkg.isUnlimited
    ? unlimitedLabel
    : remainingLabel(pkg.remainingSessions ?? 0);
  const expiry = formatDateTimeForUi(pkg.currentPeriodEnd, locale);
  return `${name} · ${remaining} · ${expiry}`;
}

export function canSubmitAdminClientBooking(params: {
  sessionId: string;
  sessionsLoading: boolean;
  packagesLoading: boolean;
  packagesError: string | null;
  packageRequired: boolean;
  userPackageId: string;
  bookablePackageCount: number;
}): boolean {
  if (
    params.sessionId === "" ||
    params.sessionsLoading ||
    params.packagesLoading ||
    params.packagesError !== null
  ) {
    return false;
  }
  if (params.packageRequired) {
    return (
      params.userPackageId !== ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE &&
      params.bookablePackageCount > 0
    );
  }
  return true;
}

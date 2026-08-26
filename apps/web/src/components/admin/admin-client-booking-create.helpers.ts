import type { EligibleBookingPackage } from "@/lib/eligible-booking-package";
import { formatDateCompactForUi } from "@/lib/date-display";
import { formatTimeForUiFromIso } from "@/lib/format-time-display";

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

function resolvePackageDisplayName(
  pkg: EligibleBookingPackage,
  duplicateSuffixes: ReadonlyMap<string, number>,
): string {
  const suffix = duplicateSuffixes.get(pkg.userPackageId);
  return suffix !== undefined ? `${pkg.planName} (${suffix})` : pkg.planName;
}

/** Compact session label for the inline booking bar trigger. */
export function sessionOptionLabel(
  session: AdminClientBookingUpcomingSession,
  locale: string,
): string {
  const date = formatDateCompactForUi(session.startsAt);
  const time = formatTimeForUiFromIso(session.startsAt, locale);
  const coach = session.coach.user.name?.trim();
  if (coach !== undefined && coach.length > 0) {
    return `${date} ${time} · ${session.classType.name} · ${coach}`;
  }
  return `${date} ${time} · ${session.classType.name}`;
}

/** Compact package label for the inline booking bar (`Name · remaining · expiry`). */
export function packageOptionLabel(
  pkg: EligibleBookingPackage,
  _locale: string,
  duplicateSuffixes: ReadonlyMap<string, number>,
  unlimitedLabel: string,
  remainingLabel: (count: number) => string,
): string {
  const name = resolvePackageDisplayName(pkg, duplicateSuffixes);
  const remaining = pkg.isUnlimited
    ? unlimitedLabel
    : remainingLabel(pkg.remainingSessions ?? 0);
  const expiry = formatDateCompactForUi(pkg.currentPeriodEnd);
  return `${name} · ${remaining} · ${expiry}`;
}

export function buildAdminClientBookingRequestBody(params: {
  sessionId: string;
  userPackageId: string;
  guestName: string;
}): { sessionId: string; userPackageId?: string; guestName?: string } {
  const body: { sessionId: string; userPackageId?: string; guestName?: string } = {
    sessionId: params.sessionId,
  };
  if (params.userPackageId !== ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE) {
    body.userPackageId = params.userPackageId;
  }
  if (params.guestName.trim().length > 0) {
    body.guestName = params.guestName.trim();
  }
  return body;
}

export function canSubmitAdminClientBooking(params: {
  sessionId: string;
  sessionsLoading: boolean;
  packagesLoading: boolean;
  packagesError: string | null;
  packageRequired: boolean;
  userPackageId: string;
  selectedCanBook: boolean;
  selectedCanBookGuest: boolean;
  guestName: string;
}): boolean {
  if (
    params.sessionId === "" ||
    params.sessionsLoading ||
    params.packagesLoading ||
    params.packagesError !== null
  ) {
    return false;
  }
  if (params.guestName.trim().length > 0) {
    return (
      params.userPackageId !== ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE &&
      params.selectedCanBookGuest
    );
  }
  if (params.userPackageId !== ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE) {
    return params.selectedCanBook;
  }
  return !params.packageRequired;
}

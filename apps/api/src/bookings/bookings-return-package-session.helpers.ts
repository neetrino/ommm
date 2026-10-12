export const RETURN_PACKAGE_SESSION_NOT_PAST =
  'This class has not finished yet';

export const RETURN_PACKAGE_SESSION_NOTHING_HELD =
  'No package session is left to return';

export type PackageSessionHold = {
  restoredAt: Date | null;
  consumedSessions: number;
  consumedGuestSlots: number;
};

/** A countable package session or guest pass is still charged to this booking. */
export function hasReturnablePackageSession(
  consumptions: readonly PackageSessionHold[],
): boolean {
  return consumptions.some(
    (row) =>
      row.restoredAt == null &&
      (row.consumedSessions > 0 || row.consumedGuestSlots > 0),
  );
}

/**
 * Admin can put the credit back after the class has finished,
 * in any booking outcome, while the package charge is still open.
 */
export function canReturnPackageSession(params: {
  sessionEndsAt: Date;
  now: Date;
  consumptions: readonly PackageSessionHold[];
}): boolean {
  if (params.sessionEndsAt.getTime() > params.now.getTime()) {
    return false;
  }
  return hasReturnablePackageSession(params.consumptions);
}

export function withReturnPackageSessionFlag<
  T extends {
    session: { endsAt: Date };
    consumptions: readonly PackageSessionHold[];
  },
>(
  row: T,
  now: Date,
): Omit<T, 'consumptions'> & { canReturnPackageCredit: boolean } {
  const { consumptions, ...booking } = row;
  return {
    ...booking,
    canReturnPackageCredit: canReturnPackageSession({
      sessionEndsAt: row.session.endsAt,
      now,
      consumptions,
    }),
  };
}

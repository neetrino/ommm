export type BookingConsumptionHold = {
  restoredAt: Date | null;
  consumedSessions: number;
};

export function hasUnrestoredPackageHold(
  consumptions: ReadonlyArray<Pick<BookingConsumptionHold, 'restoredAt'>>,
): boolean {
  return consumptions.some((row) => row.restoredAt === null);
}

/** Whether this booking already paid the package credit that a rebook would take. */
export function shouldChargePackageOnBook(params: {
  usePackageCredit: boolean;
  requiredSessions: number;
  alreadyHoldsCredit: boolean;
}): boolean {
  return (
    params.usePackageCredit &&
    params.requiredSessions > 0 &&
    !params.alreadyHoldsCredit
  );
}

export type SessionBookingEligibilityStatus = 'included' | 'purchase_required';

export type SessionBookingEligibilityRow = {
  sessionId: string;
  status: SessionBookingEligibilityStatus;
  classTypeName: string;
};

type EligiblePackageRow = {
  canBook: boolean;
};

/** Maps package + plan availability to a schedule badge status, if any. */
export function resolveSessionBookingEligibilityStatus(params: {
  packages: readonly EligiblePackageRow[];
  hasPurchasePlans: boolean;
}): SessionBookingEligibilityStatus | null {
  if (params.packages.some((pkg) => pkg.canBook)) {
    return 'included';
  }
  if (params.hasPurchasePlans) {
    return 'purchase_required';
  }
  return null;
}

export const MAX_SESSION_ELIGIBILITY_IDS = 80;

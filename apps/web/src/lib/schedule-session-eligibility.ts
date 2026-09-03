export type ScheduleSessionEligibilityStatus = "included" | "purchase_required";

export type ScheduleSessionEligibility = {
  status: ScheduleSessionEligibilityStatus;
  classTypeName: string;
};

export type ScheduleSessionEligibilityRow = {
  sessionId: string;
  status: ScheduleSessionEligibilityStatus;
  classTypeName: string;
};

export type ScheduleSessionEligibilityMap = ReadonlyMap<
  string,
  ScheduleSessionEligibility
>;

export function buildScheduleSessionEligibilityMap(
  rows: readonly ScheduleSessionEligibilityRow[],
): ScheduleSessionEligibilityMap {
  const next = new Map<string, ScheduleSessionEligibility>();
  for (const row of rows) {
    next.set(row.sessionId, {
      status: row.status,
      classTypeName: row.classTypeName,
    });
  }
  return next;
}

export function resolveSchedulePackageEligibilityBadge(params: {
  isMember: boolean;
  isClosed: boolean;
  userBookingId?: string;
  eligibility?: ScheduleSessionEligibility;
  eligibilityLoaded: boolean;
}): ScheduleSessionEligibility | null {
  if (!params.isMember || params.isClosed || params.userBookingId !== undefined) {
    return null;
  }
  if (!params.eligibilityLoaded || params.eligibility === undefined) {
    return null;
  }
  if (params.eligibility.status !== "included") {
    return null;
  }
  return params.eligibility;
}

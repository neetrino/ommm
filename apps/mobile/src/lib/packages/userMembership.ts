export type UserPackageStatus =
  | "ACTIVE"
  | "PAUSED"
  | "CANCELLED"
  | "EXPIRED"
  | "PENDING";

export type UserPackagePlanSummary = {
  id: string;
  name: string;
  categoryName: string;
  priceCents: number;
  periodDays: number;
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
};

export type UserMembershipRow = {
  id: string;
  status: UserPackageStatus;
  sessionsRemaining: number | null;
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  awaitingFirstVisit?: boolean;
  activationDeadline?: string | null;
  plan: UserPackagePlanSummary;
};

const USER_PACKAGE_STATUSES: readonly UserPackageStatus[] = [
  "ACTIVE",
  "PAUSED",
  "CANCELLED",
  "EXPIRED",
  "PENDING",
];

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

export function normalizeUserPackageStatus(status: unknown): UserPackageStatus {
  if (typeof status === "string" && USER_PACKAGE_STATUSES.includes(status as UserPackageStatus)) {
    return status as UserPackageStatus;
  }
  return "ACTIVE";
}

function normalizePlanSummary(raw: unknown): UserPackagePlanSummary | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const plan = raw as Record<string, unknown>;
  const id = readString(plan.id);
  const name = readString(plan.name);
  const categoryName = readString(plan.categoryName);
  const priceCents = readNumber(plan.priceCents);
  const periodDays = readNumber(plan.periodDays);
  if (id === null || name === null || categoryName === null || priceCents === null || periodDays === null) {
    return null;
  }
  return {
    id,
    name,
    categoryName,
    priceCents,
    periodDays,
    isUnlimited: readBoolean(plan.isUnlimited),
    sessionsPerMonth: readNumber(plan.sessionsPerMonth),
  };
}

export function normalizeUserMembershipRow(raw: unknown): UserMembershipRow | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const id = readString(row.id);
  const currentPeriodStart = readString(row.currentPeriodStart);
  const currentPeriodEnd = readString(row.currentPeriodEnd);
  const plan = normalizePlanSummary(row.plan);
  if (id === null || currentPeriodStart === null || currentPeriodEnd === null || plan === null) {
    return null;
  }
  return {
    id,
    status: normalizeUserPackageStatus(row.status),
    sessionsRemaining: readNumber(row.sessionsRemaining),
    totalSessions: readNumber(row.totalSessions),
    usedSessions: readNumber(row.usedSessions),
    remainingSessions: readNumber(row.remainingSessions),
    isUnlimited: readBoolean(row.isUnlimited),
    currentPeriodStart,
    currentPeriodEnd,
    awaitingFirstVisit: readBoolean(row.awaitingFirstVisit),
    activationDeadline: readString(row.activationDeadline),
    plan,
  };
}

/** One validity day = 24 hours from activation, in milliseconds. */
const USER_PACKAGE_VALIDITY_DAY_MS = 24 * 60 * 60 * 1000;

export function computeRemainingValidityDays(
  membership: Pick<UserMembershipRow, "currentPeriodStart" | "currentPeriodEnd" | "plan">,
  now: Date = new Date(),
): number {
  const periodEnd = new Date(membership.currentPeriodEnd);
  if (!Number.isNaN(periodEnd.getTime())) {
    const remainingMs = periodEnd.getTime() - now.getTime();
    if (remainingMs <= 0) {
      return 0;
    }
    return Math.ceil(remainingMs / USER_PACKAGE_VALIDITY_DAY_MS);
  }
  return Math.max(0, membership.plan.periodDays);
}

export function formatMembershipStatusLabel(status: UserPackageStatus): string {
  const labels: Record<UserPackageStatus, string> = {
    ACTIVE: "Active",
    PAUSED: "Paused",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
    PENDING: "Pending payment",
  };
  return labels[status];
}

export function formatMembershipValidityLabel(
  membership: Pick<UserMembershipRow, "currentPeriodStart" | "currentPeriodEnd" | "plan">,
  now: Date = new Date(),
): string {
  const remainingDays = computeRemainingValidityDays(membership, now);
  if (remainingDays <= 0) {
    return "Expired";
  }
  return remainingDays === 1 ? "1 day remaining" : `${remainingDays} days remaining`;
}

export function buildMembershipSessionsSummary(membership: UserMembershipRow): string {
  if (membership.isUnlimited) {
    return "Unlimited sessions";
  }
  const total =
    membership.totalSessions ??
    membership.plan.sessionsPerMonth ??
    0;
  const remaining =
    membership.remainingSessions ?? membership.sessionsRemaining ?? 0;
  const used =
    membership.usedSessions ?? Math.max(0, Math.min(total, total - remaining));
  return `Used ${used} of ${total}`;
}

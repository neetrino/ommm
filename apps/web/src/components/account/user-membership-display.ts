import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";
import { formatMembershipValidityLabel } from "@/lib/user-package-validity";

export function normalizeUserPackageStatus(status: string): UserPackageStatus {
  if (
    status === "ACTIVE" ||
    status === "PAUSED" ||
    status === "CANCELLED" ||
    status === "EXPIRED" ||
    status === "PENDING"
  ) {
    return status;
  }
  return "ACTIVE";
}

export function formatMembershipStatusLabel(
  status: UserPackageStatus,
  t: (key: string) => string,
): string {
  return t(`membershipStatus.${status}`);
}

export function memberStatusClassName(status: UserPackageStatus): string {
  const base =
    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]";
  if (status === "ACTIVE") {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-800`;
  }
  if (status === "PENDING") {
    return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  }
  if (status === "PAUSED") {
    return `${base} border-sand-300 bg-sand-50 text-sage-700`;
  }
  if (status === "EXPIRED") {
    return `${base} border-red-200 bg-red-50 text-red-800`;
  }
  return `${base} border-white/70 bg-white/70 text-sage-600`;
}

export type MembershipDisplayModel = {
  sessionName: string;
  sessionsSummary: string;
  sessionsUsedSummary: string | null;
  sessionsRemainingSummary: string | null;
  guestPassesSummary: string | null;
  usagePercent: number | null;
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  statusLabel: string;
  validityLabel: string;
};

function resolveGuestPassesSummary(
  membership: UserMembershipRow,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
): string | null {
  const total = membership.guestSlotsTotal ?? 0;
  if (total <= 0) {
    return null;
  }
  const remaining = membership.guestSlotsRemaining ?? 0;
  return t("guestPassesUsedOfTotal", {
    used: Math.max(0, total - remaining),
    total,
  });
}

export function buildMembershipDisplayModel(
  membership: UserMembershipRow,
  status: UserPackageStatus,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  m: (key: string, values?: Record<string, string | number | Date>) => string,
): MembershipDisplayModel {
  const sessionName = formatPackagePlanName(
    membership.plan.name,
    membership.plan.sessionsPerMonth,
  );

  const validityLabel = formatMembershipValidityLabel(membership, t);
  const guestPassesSummary = resolveGuestPassesSummary(membership, t);

  if (membership.isUnlimited) {
    return {
      sessionName,
      sessionsSummary: m("packagesSessionsUnlimited"),
      sessionsUsedSummary: null,
      sessionsRemainingSummary: null,
      guestPassesSummary,
      usagePercent: null,
      totalSessions: null,
      usedSessions: null,
      remainingSessions: null,
      statusLabel: formatMembershipStatusLabel(status, t),
      validityLabel,
    };
  }

  const usage = resolveLimitedSessionUsage(membership);
  return {
    sessionName,
    sessionsSummary: t("sessionsUsedOfTotal", {
      used: usage.used,
      total: usage.total,
    }),
    sessionsUsedSummary: t("sessionsUsed", { count: usage.used }),
    sessionsRemainingSummary: t("sessionsRemaining", { count: usage.remaining }),
    guestPassesSummary,
    usagePercent: usage.usagePercent,
    totalSessions: usage.total,
    usedSessions: usage.used,
    remainingSessions: usage.remaining,
    statusLabel: formatMembershipStatusLabel(status, t),
    validityLabel,
  };
}

function resolveLimitedSessionUsage(membership: UserMembershipRow): {
  total: number;
  remaining: number;
  used: number;
  usagePercent: number;
} {
  const total =
    membership.totalSessions ?? membership.plan.sessionsPerMonth ?? 0;
  const remaining =
    membership.remainingSessions ?? membership.sessionsRemaining ?? 0;
  const used =
    membership.usedSessions ?? Math.max(0, Math.min(total, total - remaining));
  return {
    total,
    remaining,
    used,
    usagePercent: total > 0 ? Math.round((used / total) * 100) : 0,
  };
}

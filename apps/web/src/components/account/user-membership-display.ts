import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

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
  usagePercent: number | null;
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  statusLabel: string;
};

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

  if (membership.isUnlimited) {
    return {
      sessionName,
      sessionsSummary: m("packagesSessionsUnlimited"),
      sessionsUsedSummary: null,
      sessionsRemainingSummary: null,
      usagePercent: null,
      totalSessions: null,
      usedSessions: null,
      remainingSessions: null,
      statusLabel: formatMembershipStatusLabel(status, t),
    };
  }

  const total =
    membership.totalSessions ??
    membership.plan.sessionsPerMonth ??
    0;
  const remaining =
    membership.remainingSessions ?? membership.sessionsRemaining ?? 0;
  const used =
    membership.usedSessions ?? Math.max(0, Math.min(total, total - remaining));
  const usagePercent = total > 0 ? Math.round((used / total) * 100) : 0;

  return {
    sessionName,
    sessionsSummary: t("sessionsUsedOfTotal", { used, total }),
    sessionsUsedSummary: t("sessionsUsed", { count: used }),
    sessionsRemainingSummary: t("sessionsRemaining", { count: remaining }),
    usagePercent,
    totalSessions: total,
    usedSessions: used,
    remainingSessions: remaining,
    statusLabel: formatMembershipStatusLabel(status, t),
  };
}

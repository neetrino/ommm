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
  return `${base} border-white/70 bg-white/70 text-sage-600`;
}

export type MembershipDisplayModel = {
  sessionName: string;
  sessionsLabel: string;
  sessionsUsedLabel: string | null;
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
  const sessionsLabel =
    membership.sessionsRemaining === null
      ? m("packagesSessionsUnlimited")
      : t("sessionsLeft", { count: membership.sessionsRemaining });

  let sessionsUsedLabel: string | null = null;
  if (
    membership.sessionsRemaining !== null &&
    membership.plan.sessionsPerMonth !== null &&
    membership.plan.sessionsPerMonth > 0
  ) {
    const used = Math.max(
      0,
      membership.plan.sessionsPerMonth - membership.sessionsRemaining,
    );
    sessionsUsedLabel = t("sessionsUsed", { count: used });
  }

  return {
    sessionName,
    sessionsLabel,
    sessionsUsedLabel,
    statusLabel: formatMembershipStatusLabel(status, t),
  };
}

"use client";

import { useTranslations } from "next-intl";
import { PackageUsageBar } from "@/components/account/package-usage-bar";
import {
  formatMembershipStatusLabel,
  memberStatusClassName,
  normalizeUserPackageStatus,
} from "@/components/account/user-membership-display";
import { ADMIN_CARD_CONTAIN_CLASS } from "@/components/admin/admin-list-table-layout";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";

export type CoachClientPackageItem = {
  id: string;
  status: string;
  packageName: string;
  categoryName: string;
  activationDate: string;
  expirationDate: string;
  awaitingFirstVisit: boolean;
  activationDeadline: string | null;
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
};

const CARD_CLASS = [
  ADMIN_CARD_CONTAIN_CLASS,
  "flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5",
  "shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)]",
  "sm:p-6",
].join(" ");

type PackageUsageCopy = {
  summary: string;
  remaining: string | null;
  showBar: boolean;
  used: number;
  total: number;
};

type PackageLabel = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export function CoachClientPackageCard({ item }: { item: CoachClientPackageItem }) {
  const t = useTranslations("userPages.packages");
  const tMarketing = useTranslations("marketing");
  const status = normalizeUserPackageStatus(item.status);
  const usage = packageUsageCopy(item, t, tMarketing);

  return (
    <article className={CARD_CLASS}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sand-600">
            {item.categoryName}
          </p>
          <h3 className="font-serif text-xl font-normal text-sage-900 sm:text-2xl">
            {formatPackagePlanName(item.packageName, item.totalSessions)}
          </h3>
        </div>
        <span className={memberStatusClassName(status)}>
          {formatMembershipStatusLabel(status, t)}
        </span>
      </div>
      <PackageUsage usage={usage} />
    </article>
  );
}

function PackageUsage({ usage }: { usage: PackageUsageCopy }) {
  return (
    <div className="mt-5 space-y-3 rounded-2xl border border-white/70 bg-white/60 p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-sage-900">{usage.summary}</p>
        {usage.remaining !== null ? (
          <p className="text-sm text-sage-600">{usage.remaining}</p>
        ) : null}
      </div>
      {usage.showBar ? (
        <PackageUsageBar used={usage.used} total={usage.total} ariaLabel={usage.summary} />
      ) : null}
    </div>
  );
}

function packageUsageCopy(
  item: CoachClientPackageItem,
  t: PackageLabel,
  tMarketing: PackageLabel,
): PackageUsageCopy {
  const used = item.usedSessions ?? 0;
  const total = item.totalSessions ?? 0;
  const summary = item.isUnlimited
    ? tMarketing("packagesSessionsUnlimited")
    : t("sessionsUsedOfTotal", { used, total });
  const remaining =
    !item.isUnlimited && item.remainingSessions !== null
      ? t("sessionsRemaining", { count: item.remainingSessions })
      : null;
  return {
    summary,
    remaining,
    showBar: !item.isUnlimited && total > 0 && item.usedSessions !== null,
    used,
    total,
  };
}

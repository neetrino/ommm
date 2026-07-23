"use client";

import { useTranslations } from "next-intl";
import { MembershipPeriodHighlight } from "@/components/account/membership-period-highlight";
import { PackageUsageBar } from "@/components/account/package-usage-bar";
import {
  formatMembershipStatusLabel,
  memberStatusClassName,
  normalizeUserPackageStatus,
} from "@/components/account/user-membership-display";
import type { ClientSheetPackageItem } from "@/components/admin/admin-clients-types";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import { USER_PACKAGE_VALIDITY_DAY_MS } from "@/lib/user-package-validity";

const BOARD_CARD_CLASS = [
  "flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5",
  "shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)]",
  "sm:p-6",
].join(" ");

type AdminClientPackageCardProps = {
  item: ClientSheetPackageItem;
  locale: string;
  paymentMethodLabel: string;
};

function resolveValidityLabel(
  expirationDate: string,
  status: ReturnType<typeof normalizeUserPackageStatus>,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
): string {
  if (status === "EXPIRED") {
    return t("validityExpired");
  }
  const endMs = Date.parse(expirationDate);
  if (Number.isNaN(endMs)) {
    return "—";
  }
  const remainingMs = endMs - Date.now();
  if (remainingMs <= 0) {
    return t("validityExpired");
  }
  const days = Math.ceil(remainingMs / USER_PACKAGE_VALIDITY_DAY_MS);
  return t("validityDaysRemaining", { count: days });
}

export function AdminClientPackageCard({
  item,
  locale,
  paymentMethodLabel,
}: AdminClientPackageCardProps) {
  const t = useTranslations("userPages.packages");
  const tMarketing = useTranslations("marketing");
  const tAdmin = useTranslations("adminPages.clients");
  const status = normalizeUserPackageStatus(item.status);
  const sessionName = formatPackagePlanName(item.packageName, item.totalSessions);
  const statusLabel = formatMembershipStatusLabel(status, t);
  const validityLabel = resolveValidityLabel(item.expirationDate, status, t);

  const remainingSessions = item.remainingSessions;
  const sessionsSummary = item.isUnlimited
    ? tMarketing("packagesSessionsUnlimited")
    : t("sessionsUsedOfTotal", {
        used: item.usedSessions ?? 0,
        total: item.totalSessions ?? 0,
      });
  const remainingSummary =
    !item.isUnlimited && remainingSessions !== null
      ? t("sessionsRemaining", { count: remainingSessions })
      : null;

  const showUsageBar =
    !item.isUnlimited &&
    item.totalSessions !== null &&
    item.totalSessions > 0 &&
    item.usedSessions !== null;

  return (
    <article className={BOARD_CARD_CLASS}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sand-600">
            {item.categoryName}
          </p>
          <h3 className="font-serif text-xl font-normal text-sage-900 sm:text-2xl">
            {sessionName}
          </h3>
        </div>
        <span className={memberStatusClassName(status)}>{statusLabel}</span>
      </div>

      <div className="mt-5 space-y-3 rounded-2xl border border-white/70 bg-white/60 p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-sage-900">{sessionsSummary}</p>
          {remainingSummary !== null ? (
            <p className="text-sm text-sage-600">{remainingSummary}</p>
          ) : null}
        </div>
        {showUsageBar ? (
          <PackageUsageBar
            used={item.usedSessions ?? 0}
            total={item.totalSessions ?? 0}
            ariaLabel={sessionsSummary}
          />
        ) : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-b border-white/70 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
            {tAdmin("packages.paymentMethod")}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-sage-950">
            {paymentMethodLabel}
          </p>
        </div>
        <p className="text-sm text-sage-600">{validityLabel}</p>
      </div>

      <div className="mt-5">
        <MembershipPeriodHighlight
          locale={locale}
          periodStart={item.activationDate}
          periodEnd={item.expirationDate}
          variant="board"
        />
      </div>
    </article>
  );
}

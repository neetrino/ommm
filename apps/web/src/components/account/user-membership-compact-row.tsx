"use client";

import { useTranslations } from "next-intl";
import {
  buildMembershipDisplayModel,
  memberStatusClassName,
} from "@/components/account/user-membership-display";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

type UserMembershipCompactRowProps = {
  membership: UserMembershipRow;
  locale: string;
  status: UserPackageStatus;
  onOpenDetails: () => void;
};

export function UserMembershipCompactRow({
  membership,
  locale,
  status,
  onOpenDetails,
}: UserMembershipCompactRowProps) {
  const t = useTranslations("userPages.packages");
  const m = useTranslations("marketing");
  const display = buildMembershipDisplayModel(membership, status, t, m);
  const priceLabel = formatAmdFromCents(membership.plan.priceCents, locale);
  const durationLabel = m("packagesPeriodDaysShort", { days: membership.plan.periodDays });
  const periodStartLabel = formatDateForUi(membership.currentPeriodStart);
  const periodEndLabel = formatDateForUi(membership.currentPeriodEnd);
  const periodLabel = `${periodStartLabel} – ${periodEndLabel}`;
  const sessionsCompact =
    display.totalSessions !== null && display.usedSessions !== null
      ? t("listSessionsCompact", {
          used: display.usedSessions,
          total: display.totalSessions,
          remaining: display.remainingSessions ?? 0,
        })
      : display.sessionsSummary;

  return (
    <>
      <button
        type="button"
        aria-label={t("viewDetailsFor", { name: display.sessionName })}
        onClick={onOpenDetails}
        className="ommm-list-row ommm-membership-row-interactive flex w-full flex-col gap-3 text-left md:hidden"
      >
        <MobileRowContent
          display={display}
          status={status}
          categoryName={membership.plan.categoryName}
          priceLabel={priceLabel}
          durationLabel={durationLabel}
          periodLabel={periodLabel}
          sessionsCompact={sessionsCompact}
          viewDetailsLabel={t("viewDetails")}
        />
      </button>

      <button
        type="button"
        aria-label={t("viewDetailsFor", { name: display.sessionName })}
        onClick={onOpenDetails}
        className="ommm-list-row ommm-membership-row-interactive hidden w-full items-center gap-4 text-left md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_auto]"
      >
        <DesktopCell
          title={display.sessionName}
          subtitle={membership.plan.categoryName}
          className="min-w-0"
        />
        <DesktopCell title={priceLabel} subtitle={durationLabel} />
        <DesktopCell title={sessionsCompact} subtitle={display.sessionsUsedSummary ?? "—"} />
        <DesktopCell title={periodStartLabel} subtitle={periodEndLabel} />
        <span className={memberStatusClassName(status)}>{display.statusLabel}</span>
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-sand-600">
          {t("viewDetails")}
        </span>
      </button>
    </>
  );
}

type MobileRowContentProps = {
  display: ReturnType<typeof buildMembershipDisplayModel>;
  status: UserPackageStatus;
  categoryName: string;
  priceLabel: string;
  durationLabel: string;
  periodLabel: string;
  sessionsCompact: string;
  viewDetailsLabel: string;
};

function MobileRowContent({
  display,
  status,
  categoryName,
  priceLabel,
  durationLabel,
  periodLabel,
  sessionsCompact,
  viewDetailsLabel,
}: MobileRowContentProps) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sage-800">{display.sessionName}</p>
          <p className="mt-0.5 text-xs text-sage-500">{categoryName}</p>
        </div>
        <span className={memberStatusClassName(status)}>{display.statusLabel}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-sage-600">
        <div>
          <p className="text-sage-500">{priceLabel}</p>
          <p className="font-medium text-sage-900">{durationLabel}</p>
        </div>
        <div>
          <p className="text-sage-500">{sessionsCompact}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-sage-500">{periodLabel}</p>
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-sand-600">
        {viewDetailsLabel}
      </p>
    </div>
  );
}

function DesktopCell({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`.trim()}>
      <p className="truncate font-medium text-sage-800">{title}</p>
      <p className="mt-0.5 truncate text-xs text-sage-500">{subtitle}</p>
    </div>
  );
}

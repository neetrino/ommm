"use client";

import { useTranslations } from "next-intl";
import { MembershipPeriodHighlight } from "@/components/account/membership-period-highlight";
import {
  buildMembershipDisplayModel,
  memberStatusClassName,
} from "@/components/account/user-membership-display";
import {
  USER_PACKAGES_LIST_CELL_CLASS,
  USER_PACKAGES_LIST_PERIOD_CELL,
  USER_PACKAGES_LIST_ROW_CLASS,
} from "@/components/account/user-packages-list-layout";
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
  const hasSessionLimit =
    display.totalSessions !== null && display.usedSessions !== null && display.totalSessions > 0;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={t("viewDetailsFor", { name: display.sessionName })}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      className={USER_PACKAGES_LIST_ROW_CLASS}
    >
      <div className={USER_PACKAGES_LIST_CELL_CLASS}>
        <p className="truncate font-serif text-xl leading-snug tracking-tight text-sage-950">
          {display.sessionName}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-sage-500">
          {membership.plan.categoryName}
        </p>
      </div>

      <div className={USER_PACKAGES_LIST_CELL_CLASS}>
        <MobileLabel label={t("listHeaderPrice")} />
        <p className="whitespace-nowrap font-medium tabular-nums text-sage-800">{priceLabel}</p>
        <p className="mt-0.5 text-xs text-sage-500">{durationLabel}</p>
      </div>

      <div className={USER_PACKAGES_LIST_CELL_CLASS}>
        <MobileLabel label={t("listHeaderSessions")} />
        {hasSessionLimit ? (
          <>
            <p className="whitespace-nowrap font-serif text-lg tabular-nums leading-none text-sage-950">
              {display.usedSessions}/{display.totalSessions}
            </p>
            <p className="mt-1 truncate text-xs text-sage-500">
              {t("listSessionsCompact", {
                used: display.usedSessions ?? 0,
                total: display.totalSessions ?? 0,
                remaining: display.remainingSessions ?? 0,
              })}
            </p>
          </>
        ) : (
          <p className="truncate text-sm font-medium text-sage-800">{display.sessionsSummary}</p>
        )}
      </div>

      <div className={USER_PACKAGES_LIST_PERIOD_CELL}>
        <MobileLabel label={t("listHeaderPeriod")} />
        <MembershipPeriodHighlight
          locale={locale}
          periodStart={membership.currentPeriodStart}
          periodEnd={membership.currentPeriodEnd}
          variant="list"
        />
      </div>

      <div className={USER_PACKAGES_LIST_CELL_CLASS}>
        <MobileLabel label={t("listHeaderStatus")} />
        <span className={memberStatusClassName(status)}>{display.statusLabel}</span>
      </div>
    </article>
  );
}

function MobileLabel({ label }: { label: string }) {
  return (
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-sage-500 md:hidden">
      {label}
    </p>
  );
}

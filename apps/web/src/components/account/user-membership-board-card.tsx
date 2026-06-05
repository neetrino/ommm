"use client";

import { useTranslations } from "next-intl";
import { MembershipPeriodHighlight } from "@/components/account/membership-period-highlight";
import { PackageUsageBar } from "@/components/account/package-usage-bar";
import {
  buildMembershipDisplayModel,
  memberStatusClassName,
} from "@/components/account/user-membership-display";
import { USER_LIST_ROW_INTERACTIVE } from "@/components/account/user-list-table-layout";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

type UserMembershipBoardCardProps = {
  membership: UserMembershipRow;
  locale: string;
  status: UserPackageStatus;
  onOpenDetails: () => void;
};

const BOARD_CARD_CLASS = [
  "flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5",
  "shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)]",
  "transition-all hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)]",
  "sm:p-6",
  USER_LIST_ROW_INTERACTIVE,
].join(" ");

export function UserMembershipBoardCard({
  membership,
  locale,
  status,
  onOpenDetails,
}: UserMembershipBoardCardProps) {
  const t = useTranslations("userPages.packages");
  const m = useTranslations("marketing");
  const display = buildMembershipDisplayModel(membership, status, t, m);
  const priceLabel = formatAmdFromCents(membership.plan.priceCents, locale);
  const durationLabel = m("packagesPeriodDaysShort", { days: membership.plan.periodDays });

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
      className={BOARD_CARD_CLASS}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sand-600">
            {membership.plan.categoryName}
          </p>
          <h3 className="font-serif text-xl font-normal text-sage-900 sm:text-2xl">
            {display.sessionName}
          </h3>
        </div>
        <span className={memberStatusClassName(status)}>{display.statusLabel}</span>
      </div>

      <div className="mt-5 space-y-3 rounded-2xl border border-white/70 bg-white/60 p-4">
        <div>
          <p className="text-sm font-medium text-sage-900">{display.sessionsSummary}</p>
        </div>
        {display.totalSessions !== null &&
        display.usedSessions !== null &&
        display.totalSessions > 0 ? (
          <PackageUsageBar
            used={display.usedSessions}
            total={display.totalSessions}
            ariaLabel={display.sessionsSummary}
          />
        ) : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-b border-white/70 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
            {t("membershipDetailsPrice")}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-sage-950">{priceLabel}</p>
        </div>
        <p className="text-sm text-sage-600">{durationLabel}</p>
      </div>

      <div className="mt-5 flex-1">
        <MembershipPeriodHighlight
          locale={locale}
          periodStart={membership.currentPeriodStart}
          periodEnd={membership.currentPeriodEnd}
          variant="board"
        />
      </div>

      {status === "PENDING" ? (
        <p className="mt-4 text-sm text-sage-600">{t("awaitingPaymentConfirmation")}</p>
      ) : null}
    </article>
  );
}

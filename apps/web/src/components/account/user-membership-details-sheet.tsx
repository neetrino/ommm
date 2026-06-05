"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { MembershipPeriodHighlight } from "@/components/account/membership-period-highlight";
import { UserPackageLifecycleActions } from "@/components/account/user-package-lifecycle-actions";
import { PackageUsageBar } from "@/components/account/package-usage-bar";
import {
  buildMembershipDisplayModel,
  formatMembershipStatusLabel,
  memberStatusClassName,
} from "@/components/account/user-membership-display";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

/** Side sheet occupies half the viewport width on larger screens. */
const MEMBERSHIP_DETAILS_SHEET_WIDTH_CLASS = "w-full sm:w-1/2 sm:max-w-[50vw]";

/** Side sheet height — 90% of the viewport, anchored to the bottom edge. */
const MEMBERSHIP_DETAILS_SHEET_HEIGHT_CLASS = "h-[90dvh]";

export const USER_MEMBERSHIP_DETAILS_SHEET_PANEL_CLASS = [
  "relative z-10 flex flex-col overflow-hidden",
  MEMBERSHIP_DETAILS_SHEET_WIDTH_CLASS,
  MEMBERSHIP_DETAILS_SHEET_HEIGHT_CLASS,
  "rounded-tl-[28px] border border-white/70 border-b-0 border-r-0",
  "bg-white/95 shadow-[-16px_0_48px_-24px_rgba(45,40,35,0.4)] backdrop-blur-md",
].join(" ");

type UserMembershipDetailsSheetProps = {
  membership: UserMembershipRow | null;
  locale: string;
  status: UserPackageStatus;
  isOpen: boolean;
  onClose: () => void;
};

export function UserMembershipDetailsSheet({
  membership,
  locale,
  status,
  isOpen,
  onClose,
}: UserMembershipDetailsSheetProps) {
  const t = useTranslations("userPages.packages");
  const m = useTranslations("marketing");
  const titleId = useId();

  if (membership === null) {
    return null;
  }

  const display = buildMembershipDisplayModel(membership, status, t, m);

  return (
    <OmmDrawerPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={t("membershipDetailsCloseBackdrop")}
      ariaLabelledBy={titleId}
      overlayClassName="ommm-drawer-overlay z-[105] items-end"
      panelClassName={USER_MEMBERSHIP_DETAILS_SHEET_PANEL_CLASS}
    >
      <header className="shrink-0 border-b border-white/60 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
              {display.sessionName}
            </h2>
            <p className="text-sm text-sage-600">{t("membershipDetailsLead")}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <button
              type="button"
              className="rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              aria-label={t("membershipDetailsClose")}
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <span className={memberStatusClassName(status)}>
              {formatMembershipStatusLabel(status, t)}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <dl className="space-y-3 rounded-2xl border border-white/60 bg-white/50 p-4">
          <DetailRow label={t("membershipDetailsSessionName")} value={display.sessionName} />
          <DetailRow label={t("membershipDetailsCategory")} value={membership.plan.categoryName} />
          <DetailRow
            label={t("membershipDetailsPrice")}
            value={formatAmdFromCents(membership.plan.priceCents, locale)}
          />
          <DetailRow
            label={t("membershipDetailsDuration")}
            value={m("packagesPeriodDaysShort", { days: membership.plan.periodDays })}
          />
          <DetailRow label={t("membershipDetailsSessions")} value={display.sessionsSummary} />
          {display.sessionsRemainingSummary !== null ? (
            <DetailRow
              label={t("membershipDetailsSessionsRemaining")}
              value={display.sessionsRemainingSummary}
            />
          ) : null}
          {display.totalSessions !== null &&
          display.usedSessions !== null &&
          display.totalSessions > 0 ? (
            <div className="space-y-2 py-1">
              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
                {t("membershipDetailsUsage")}
              </dt>
              <dd>
                <PackageUsageBar
                  used={display.usedSessions}
                  total={display.totalSessions}
                  ariaLabel={display.sessionsSummary}
                />
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-5">
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

        <div className="mt-5 border-t border-white/60 pt-5">
          <UserPackageLifecycleActions userPackageId={membership.id} status={status} />
        </div>
      </div>
    </OmmDrawerPortal>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">{label}</dt>
      <dd className="text-sm font-medium text-sage-800">{value}</dd>
    </div>
  );
}

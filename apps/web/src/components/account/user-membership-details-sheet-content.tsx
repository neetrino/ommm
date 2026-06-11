"use client";

import { useTranslations } from "next-intl";
import { MembershipPeriodHighlight } from "@/components/account/membership-period-highlight";
import {
  hasPackageLifecycleActions,
  PackageLifecycleConfirmDialog,
  UserPackageLifecycleActions,
  useUserPackageLifecycle,
} from "@/components/account/user-package-lifecycle-actions";
import { PackageUsageBar } from "@/components/account/package-usage-bar";
import {
  buildMembershipDisplayModel,
  formatMembershipStatusLabel,
  memberStatusClassName,
} from "@/components/account/user-membership-display";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

export const MEMBERSHIP_DETAILS_SHEET_TITLE_ID = "user-membership-details-sheet-title";

const MEMBERSHIP_DETAIL_LABEL_CLASS =
  "text-xs font-bold uppercase tracking-[0.08em] text-sage-600";

const MEMBERSHIP_DETAIL_VALUE_CLASS = "text-sm font-semibold text-sage-950";

const MEMBERSHIP_DETAIL_PRICE_VALUE_CLASS =
  "text-base font-semibold tracking-tight text-sage-950";

type MembershipDetailsSheetContentProps = {
  membership: UserMembershipRow;
  locale: string;
  status: UserPackageStatus;
  onClose: () => void;
};

export function MembershipDetailsSheetContent({
  membership,
  locale,
  status,
  onClose,
}: MembershipDetailsSheetContentProps) {
  const t = useTranslations("userPages.packages");
  const m = useTranslations("marketing");
  const display = buildMembershipDisplayModel(membership, status, t, m);
  const lifecycle = useUserPackageLifecycle(membership.id, status);
  const showLifecycleActions = hasPackageLifecycleActions(status);

  return (
    <>
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-3">
            <h2 id={MEMBERSHIP_DETAILS_SHEET_TITLE_ID} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {display.sessionName}
            </h2>
            {showLifecycleActions ? (
              <UserPackageLifecycleActions
                userPackageId={membership.id}
                status={status}
                layout="sheetHeader"
                lifecycle={lifecycle}
              />
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={memberStatusClassName(status)}>
              {formatMembershipStatusLabel(status, t)}
            </span>
            <button
              type="button"
              className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
              aria-label={t("membershipDetailsCloseBackdrop")}
              onClick={onClose}
            >
              <CloseGlyph />
            </button>
          </div>
        </div>
      </header>

      <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
        <dl className={ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS}>
          <DetailRow label={t("membershipDetailsSessionName")} value={display.sessionName} />
          <DetailRow label={t("membershipDetailsCategory")} value={membership.plan.categoryName} />
          <DetailRow
            label={t("membershipDetailsPrice")}
            value={formatAmdFromCents(membership.plan.priceCents, locale)}
            valueClassName={MEMBERSHIP_DETAIL_PRICE_VALUE_CLASS}
          />
          <DetailRow
            label={t("membershipDetailsValidity")}
            value={display.validityLabel}
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
              <dt className={MEMBERSHIP_DETAIL_LABEL_CLASS}>{t("membershipDetailsUsage")}</dt>
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
      </div>

      {showLifecycleActions ? (
        <footer className={ADMIN_DETAILS_SHEET_FOOTER_CLASS}>
          <UserPackageLifecycleActions
            userPackageId={membership.id}
            status={status}
            layout="sheetFooter"
            hiddenActions={["pause", "cancel"]}
            lifecycle={lifecycle}
          />
          <PackageLifecycleConfirmDialog lifecycle={lifecycle} />
        </footer>
      ) : null}
    </>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function DetailRow({ label, value, valueClassName = MEMBERSHIP_DETAIL_VALUE_CLASS }: DetailRowProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className={MEMBERSHIP_DETAIL_LABEL_CLASS}>{label}</dt>
      <dd className={valueClassName}>{value}</dd>
    </div>
  );
}

function CloseGlyph() {
  return (
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
  );
}

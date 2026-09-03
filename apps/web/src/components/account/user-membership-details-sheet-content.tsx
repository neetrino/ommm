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
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

export const MEMBERSHIP_DETAILS_SHEET_TITLE_ID = "user-membership-details-sheet-title";

const DETAIL_LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-500";

const DETAIL_VALUE_CLASS = "text-sm font-medium text-sage-900 text-right";

const DETAIL_BLOCK_CLASS =
  "divide-y divide-sand-100/90 rounded-[1.35rem] border border-white/70 bg-white/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]";

const DETAIL_ROW_CLASS =
  "flex items-baseline justify-between gap-x-6 gap-y-1 px-3.5 py-3";

const USAGE_BLOCK_CLASS =
  "mt-4 space-y-3 rounded-[1.35rem] border border-white/70 bg-gradient-to-br from-white/90 via-white/75 to-sand-50/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]";

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
  const lifecycle = useUserPackageLifecycle(membership.id, status, membership.freeze);
  const showLifecycleActions = hasPackageLifecycleActions(status);
  const showUsage =
    display.totalSessions !== null &&
    display.usedSessions !== null &&
    display.totalSessions > 0;
  const guestUsed =
    membership.guestSlotsTotal != null && membership.guestSlotsTotal > 0
      ? Math.max(
          0,
          membership.guestSlotsTotal - (membership.guestSlotsRemaining ?? 0),
        )
      : null;

  return (
    <>
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <h2
              id={MEMBERSHIP_DETAILS_SHEET_TITLE_ID}
              className={ADMIN_DETAILS_SHEET_TITLE_CLASS}
            >
              {display.sessionName}
            </h2>
            {membership.plan.categoryName ? (
              <p className="text-sm text-sage-600">{membership.plan.categoryName}</p>
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
        <dl className={DETAIL_BLOCK_CLASS}>
          <DetailRow
            label={t("membershipDetailsPrice")}
            value={formatAmdFromCents(membership.plan.priceCents, locale)}
            valueClassName="text-base font-semibold tracking-tight text-sage-950 text-right"
          />
          <DetailRow
            label={t("membershipDetailsValidity")}
            value={display.validityLabel}
          />
          {membership.freeze !== undefined && membership.freeze.allowedCount > 0 ? (
            <DetailRow
              label={t("membershipDetailsFreeze")}
              value={t("membershipFreezeRemaining", {
                remaining: membership.freeze.remainingCount,
                allowed: membership.freeze.allowedCount,
                days: membership.freeze.maxDaysPerUse,
              })}
            />
          ) : null}
          {guestUsed !== null && membership.guestSlotsTotal != null ? (
            <DetailRow
              label={t("membershipDetailsGuestPasses")}
              value={t("sessionsUsedOfTotal", {
                used: guestUsed,
                total: membership.guestSlotsTotal,
              })}
            />
          ) : null}
          {!showUsage ? (
            <DetailRow
              label={t("membershipDetailsSessions")}
              value={display.sessionsSummary}
            />
          ) : null}
        </dl>

        {showUsage &&
        display.usedSessions !== null &&
        display.totalSessions !== null ? (
          <div className={USAGE_BLOCK_CLASS}>
            <div className="flex items-baseline justify-between gap-3">
              <p className={DETAIL_LABEL_CLASS}>{t("membershipDetailsSessions")}</p>
              <p className="text-sm font-semibold text-sage-950">
                {display.sessionsSummary}
              </p>
            </div>
            <PackageUsageBar
              used={display.usedSessions}
              total={display.totalSessions}
              ariaLabel={display.sessionsSummary}
            />
          </div>
        ) : null}

        {membership.awaitingFirstVisit === true ? null : (
          <div className="mt-4">
            <MembershipPeriodHighlight
              locale={locale}
              periodStart={membership.currentPeriodStart}
              periodEnd={membership.currentPeriodEnd}
              variant="board"
            />
          </div>
        )}

        {showLifecycleActions ? (
          <div className="mt-5 flex justify-end">
            <UserPackageLifecycleActions
              userPackageId={membership.id}
              status={status}
              freeze={membership.freeze}
              layout="boardPhone"
              hiddenActions={["renew"]}
              lifecycle={lifecycle}
            />
          </div>
        ) : null}
      </div>

      {showLifecycleActions && lifecycle.showRenew ? (
        <footer className={ADMIN_DETAILS_SHEET_FOOTER_CLASS}>
          <UserPackageLifecycleActions
            userPackageId={membership.id}
            status={status}
            layout="sheetFooter"
            freeze={membership.freeze}
            hiddenActions={["freeze", "unfreeze", "cancel"]}
            lifecycle={lifecycle}
          />
        </footer>
      ) : null}
      {showLifecycleActions ? (
        <PackageLifecycleConfirmDialog lifecycle={lifecycle} />
      ) : null}
    </>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function DetailRow({
  label,
  value,
  valueClassName = DETAIL_VALUE_CLASS,
}: DetailRowProps) {
  return (
    <div className={DETAIL_ROW_CLASS}>
      <dt className={DETAIL_LABEL_CLASS}>{label}</dt>
      <dd className={`min-w-0 ${valueClassName}`}>{value}</dd>
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

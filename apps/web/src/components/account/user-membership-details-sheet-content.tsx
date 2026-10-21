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
import {
  DETAILS_CARD_FOOTER_CLASS,
  DetailsCard,
  DetailsField,
  DetailsFieldRow,
  DetailsStat,
  DetailsStatStrip,
} from "@/components/shared/details/details-card";
import {
  CalendarGlyph,
  PauseGlyph,
  TicketGlyph,
  UsersGlyph,
  WalletGlyph,
} from "@/components/shared/details/details-glyphs";
import { GUEST_PASSES_ENABLED } from "@/lib/guest-passes";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

export const MEMBERSHIP_DETAILS_SHEET_TITLE_ID = "user-membership-details-sheet-title";

type MembershipDetailsSheetContentProps = {
  membership: UserMembershipRow;
  locale: string;
  status: UserPackageStatus;
  onClose: () => void;
  showClose?: boolean;
};

export function MembershipDetailsSheetContent({
  membership,
  locale,
  status,
  onClose,
  showClose = true,
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
    GUEST_PASSES_ENABLED &&
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
              <p className="text-sm text-sage-500">{membership.plan.categoryName}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={memberStatusClassName(status)}>
              {formatMembershipStatusLabel(status, t)}
            </span>
            {showClose ? (
              <button
                type="button"
                className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
                aria-label={t("membershipDetailsCloseBackdrop")}
                onClick={onClose}
              >
                <CloseGlyph />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
        <DetailsCard>
          <div>
            <DetailsStatStrip bordered={false}>
              <DetailsStat label={t("membershipDetailsPrice")} icon={<WalletGlyph />} tone="mint">
                <span className="font-serif text-lg">
                  {formatAmdFromCents(membership.plan.priceCents, locale)}
                </span>
              </DetailsStat>
              <DetailsStat label={t("membershipDetailsValidity")} icon={<CalendarGlyph />} tone="blue">
                {display.validityLabel}
              </DetailsStat>
              <DetailsStat label={t("membershipDetailsSessions")} icon={<TicketGlyph />} tone="peach">
                {display.sessionsSummary}
              </DetailsStat>
            </DetailsStatStrip>
            {showUsage && display.usedSessions !== null && display.totalSessions !== null ? (
              <div className="pt-4">
                <PackageUsageBar
                  used={display.usedSessions}
                  total={display.totalSessions}
                  ariaLabel={display.sessionsSummary}
                />
              </div>
            ) : null}
          </div>

          <MembershipExtraFields membership={membership} guestUsed={guestUsed} />

          {membership.awaitingFirstVisit === true ? null : (
            <MembershipPeriodHighlight
              locale={locale}
              periodStart={membership.currentPeriodStart}
              periodEnd={membership.currentPeriodEnd}
              variant="board"
            />
          )}

          {showLifecycleActions ? (
            <div className={`${DETAILS_CARD_FOOTER_CLASS} justify-end`}>
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
        </DetailsCard>
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

/** Freeze allowance and guest passes, side by side when both apply. */
function MembershipExtraFields({
  membership,
  guestUsed,
}: {
  membership: UserMembershipRow;
  guestUsed: number | null;
}) {
  const t = useTranslations("userPages.packages");
  const freeze =
    membership.freeze !== undefined && membership.freeze.allowedCount > 0
      ? membership.freeze
      : null;
  const guestTotal = guestUsed !== null ? membership.guestSlotsTotal : null;
  if (freeze === null && guestTotal == null) {
    return null;
  }

  return (
    <DetailsFieldRow>
      {freeze !== null ? (
        <DetailsField
          label={t("membershipDetailsFreeze")}
          icon={<PauseGlyph />}
          wide={guestTotal == null}
          multiline
        >
          {t("membershipFreezeRemaining", {
            remaining: freeze.remainingCount,
            allowed: freeze.allowedCount,
            days: freeze.maxDaysPerUse,
          })}
        </DetailsField>
      ) : null}
      {guestTotal != null && guestUsed !== null ? (
        <DetailsField
          label={t("membershipDetailsGuestPasses")}
          icon={<UsersGlyph />}
          wide={freeze === null}
        >
          {t("sessionsUsedOfTotal", { used: guestUsed, total: guestTotal })}
        </DetailsField>
      ) : null}
    </DetailsFieldRow>
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

"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
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
  USER_MEMBERSHIP_DETAILS_DESKTOP_BACKDROP_CLASS,
  USER_MEMBERSHIP_DETAILS_DESKTOP_MOTION_MS,
  USER_MEMBERSHIP_DETAILS_DESKTOP_OVERLAY_CLASS,
  USER_MEMBERSHIP_DETAILS_DESKTOP_PANEL_CLASS,
} from "@/components/account/user-membership-details-sheet-layout";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  USER_MEMBERSHIP_DETAILS_SHEET_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";
import { dismissMobileKeyboard } from "@/lib/dismiss-mobile-keyboard";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

type UserMembershipDetailsSheetProps = {
  membership: UserMembershipRow | null;
  locale: string;
  status: UserPackageStatus;
  isOpen: boolean;
  onClose: () => void;
};

const MEMBERSHIP_DETAIL_LABEL_CLASS =
  "text-xs font-bold uppercase tracking-[0.08em] text-sage-600";

const MEMBERSHIP_DETAIL_VALUE_CLASS = "text-sm font-semibold text-sage-950";

const MEMBERSHIP_DETAIL_PRICE_VALUE_CLASS =
  "text-base font-semibold tracking-tight text-sage-950";

export function UserMembershipDetailsSheet({
  membership,
  locale,
  status,
  isOpen,
  onClose,
}: UserMembershipDetailsSheetProps) {
  if (!isOpen && membership === null) {
    return null;
  }

  return (
    <UserMembershipDetailsSheetInner
      membership={membership}
      locale={locale}
      status={status}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

function UserMembershipDetailsSheetInner({
  membership,
  locale,
  status,
  isOpen,
  onClose,
}: {
  membership: UserMembershipRow | null;
  locale: string;
  status: UserPackageStatus;
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("userPages.packages");
  const m = useTranslations("marketing");
  const titleId = useId();
  const isPhone = useMemberHubSheetPhone();
  const closingRef = useRef(false);
  const [motionState, setMotionState] = useState<"open" | "closed">("closed");
  const [displayMembership, setDisplayMembership] = useState<UserMembershipRow | null>(
    membership,
  );
  const [displayStatus, setDisplayStatus] = useState<UserPackageStatus>(status);

  useLayoutEffect(() => {
    if (membership === null) {
      return;
    }
    setDisplayMembership(membership);
    setDisplayStatus(status);
  }, [membership, status]);

  useLayoutEffect(() => {
    if (isPhone || !isOpen) {
      return undefined;
    }

    setMotionState("closed");
    const frame = requestAnimationFrame(() => {
      setMotionState("open");
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [displayMembership?.id, isOpen, isPhone]);

  const lifecycle = useUserPackageLifecycle(displayMembership?.id ?? "", displayStatus);

  function finishClose() {
    closingRef.current = false;
    onClose();
  }

  function handleClose() {
    if (closingRef.current) {
      return;
    }

    dismissMobileKeyboard();

    if (isPhone) {
      finishClose();
      return;
    }

    closingRef.current = true;
    setMotionState("closed");
    window.setTimeout(finishClose, USER_MEMBERSHIP_DETAILS_DESKTOP_MOTION_MS);
  }

  if (displayMembership === null) {
    return null;
  }

  const display = buildMembershipDisplayModel(displayMembership, displayStatus, t, m);
  const showLifecycleActions = hasPackageLifecycleActions(displayStatus);

  const sheetContent = (
    <>
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-3">
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {display.sessionName}
            </h2>
            {showLifecycleActions ? (
              <UserPackageLifecycleActions
                userPackageId={displayMembership.id}
                status={displayStatus}
                layout="sheetHeader"
                lifecycle={lifecycle}
              />
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={memberStatusClassName(displayStatus)}>
              {formatMembershipStatusLabel(displayStatus, t)}
            </span>
            <button
              type="button"
              className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
              aria-label={t("membershipDetailsCloseBackdrop")}
              onClick={handleClose}
            >
              <CloseGlyph />
            </button>
          </div>
        </div>
      </header>

      <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
        <dl className={ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS}>
          <DetailRow label={t("membershipDetailsSessionName")} value={display.sessionName} />
          <DetailRow
            label={t("membershipDetailsCategory")}
            value={displayMembership.plan.categoryName}
          />
          <DetailRow
            label={t("membershipDetailsPrice")}
            value={formatAmdFromCents(displayMembership.plan.priceCents, locale)}
            valueClassName={MEMBERSHIP_DETAIL_PRICE_VALUE_CLASS}
          />
          <DetailRow
            label={t("membershipDetailsValidity")}
            value={m("packagesPeriodDaysShort", { days: displayMembership.plan.periodDays })}
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
            periodStart={displayMembership.currentPeriodStart}
            periodEnd={displayMembership.currentPeriodEnd}
            variant="board"
          />
        </div>
      </div>

      {showLifecycleActions ? (
        <footer className={ADMIN_DETAILS_SHEET_FOOTER_CLASS}>
          <UserPackageLifecycleActions
            userPackageId={displayMembership.id}
            status={displayStatus}
            layout="sheetFooter"
            hiddenActions={["pause", "cancel"]}
            lifecycle={lifecycle}
          />
          <PackageLifecycleConfirmDialog lifecycle={lifecycle} />
        </footer>
      ) : null}
    </>
  );

  if (isPhone) {
    return (
      <OmmDrawerPortal
        isOpen={isOpen}
        onClose={handleClose}
        backdropAriaLabel={t("membershipDetailsCloseBackdrop")}
        ariaLabelledBy={titleId}
        overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
        panelClassName={USER_MEMBERSHIP_DETAILS_SHEET_PANEL_CLASS}
      >
        {sheetContent}
      </OmmDrawerPortal>
    );
  }

  return (
    <OmmDrawerPortal
      isOpen={isOpen}
      onClose={handleClose}
      backdropAriaLabel={t("membershipDetailsCloseBackdrop")}
      ariaLabelledBy={titleId}
      overlayClassName={USER_MEMBERSHIP_DETAILS_DESKTOP_OVERLAY_CLASS}
      backdropClassName={USER_MEMBERSHIP_DETAILS_DESKTOP_BACKDROP_CLASS}
      panelClassName={USER_MEMBERSHIP_DETAILS_DESKTOP_PANEL_CLASS}
      motionState={motionState}
    >
      {sheetContent}
    </OmmDrawerPortal>
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

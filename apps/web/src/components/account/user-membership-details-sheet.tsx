"use client";

import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS,
  memberAccountHubSheetPanelStyle,
} from "@/components/account/member-account-hub-sheet-layout";
import {
  MEMBERSHIP_DETAILS_SHEET_TITLE_ID,
  MembershipDetailsSheetContent,
} from "@/components/account/user-membership-details-sheet-content";
import {
  USER_MEMBERSHIP_DETAILS_DESKTOP_BACKDROP_CLASS,
  USER_MEMBERSHIP_DETAILS_DESKTOP_MOTION_MS,
  USER_MEMBERSHIP_DETAILS_DESKTOP_OVERLAY_CLASS,
  USER_MEMBERSHIP_DETAILS_DESKTOP_PANEL_CLASS,
  USER_MEMBERSHIP_DETAILS_MOBILE_MOTION_MS,
  USER_MEMBERSHIP_DETAILS_MOBILE_OVERLAY_CLASS,
  USER_MEMBERSHIP_DETAILS_MOBILE_PANEL_CLASS,
} from "@/components/account/user-membership-details-sheet-layout";
import { OmmDrawerPortal, OmmModalPortal } from "@/components/ui/omm-modal";
import { useDesktopSheetEnterMotion } from "@/hooks/use-desktop-sheet-enter-motion";
import {
  readMemberHubSheetPhoneViewport,
  useMemberHubSheetPhone,
} from "@/hooks/use-member-hub-sheet-phone";
import { dismissMobileKeyboard } from "@/lib/dismiss-mobile-keyboard";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

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
  if (!isOpen || membership === null) {
    return null;
  }

  return (
    <UserMembershipDetailsSheetPortal
      membership={membership}
      locale={locale}
      status={status}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

function UserMembershipDetailsSheetPortal({
  membership,
  locale,
  status,
  isOpen,
  onClose,
}: {
  membership: UserMembershipRow;
  locale: string;
  status: UserPackageStatus;
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("userPages.packages");
  const closingRef = useRef(false);
  const isPhone = useMemberHubSheetPhone();
  const { motionState, closeMotion } = useDesktopSheetEnterMotion(isOpen);

  const finishClose = useCallback(() => {
    closingRef.current = false;
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    dismissMobileKeyboard();
    closingRef.current = true;
    closeMotion();

    const motionMs = readMemberHubSheetPhoneViewport()
      ? USER_MEMBERSHIP_DETAILS_MOBILE_MOTION_MS
      : USER_MEMBERSHIP_DETAILS_DESKTOP_MOTION_MS;

    window.setTimeout(finishClose, motionMs);
  }, [closeMotion, finishClose]);

  const sheetContent = (
    <MembershipDetailsSheetContent
      membership={membership}
      locale={locale}
      status={status}
      onClose={handleClose}
    />
  );

  if (isPhone) {
    return (
      <OmmModalPortal
        isOpen={isOpen}
        onClose={handleClose}
        bottomAnchored
        backdropAriaLabel={t("membershipDetailsCloseBackdrop")}
        ariaLabelledBy={MEMBERSHIP_DETAILS_SHEET_TITLE_ID}
        overlayClassName={USER_MEMBERSHIP_DETAILS_MOBILE_OVERLAY_CLASS}
        panelClassName={USER_MEMBERSHIP_DETAILS_MOBILE_PANEL_CLASS}
        panelStyle={memberAccountHubSheetPanelStyle()}
        motionState={motionState}
      >
        <div className={MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS} aria-hidden />
        {sheetContent}
      </OmmModalPortal>
    );
  }

  return (
    <OmmDrawerPortal
      isOpen={isOpen}
      onClose={handleClose}
      backdropAriaLabel={t("membershipDetailsCloseBackdrop")}
      ariaLabelledBy={MEMBERSHIP_DETAILS_SHEET_TITLE_ID}
      overlayClassName={USER_MEMBERSHIP_DETAILS_DESKTOP_OVERLAY_CLASS}
      backdropClassName={USER_MEMBERSHIP_DETAILS_DESKTOP_BACKDROP_CLASS}
      panelClassName={USER_MEMBERSHIP_DETAILS_DESKTOP_PANEL_CLASS}
      motionState={motionState}
    >
      {sheetContent}
    </OmmDrawerPortal>
  );
}

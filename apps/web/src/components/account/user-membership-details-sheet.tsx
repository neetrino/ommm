"use client";

import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS,
  memberAccountHubSheetPanelStyle,
} from "@/components/account/member-account-hub-sheet-layout";
import {
  MemberHubMobileSheet,
  useMemberHubMobileSheetClose,
} from "@/components/account/member-hub-mobile-sheet";
import {
  MEMBERSHIP_DETAILS_SHEET_TITLE_ID,
  MembershipDetailsSheetContent,
} from "@/components/account/user-membership-details-sheet-content";
import {
  USER_MEMBERSHIP_DETAILS_DESKTOP_BACKDROP_CLASS,
  USER_MEMBERSHIP_DETAILS_DESKTOP_MOTION_MS,
  USER_MEMBERSHIP_DETAILS_DESKTOP_OVERLAY_CLASS,
  USER_MEMBERSHIP_DETAILS_DESKTOP_PANEL_CLASS,
} from "@/components/account/user-membership-details-sheet-layout";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { useDesktopSheetEnterMotion } from "@/hooks/use-desktop-sheet-enter-motion";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";
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

function MembershipDetailsMobileBody({
  membership,
  locale,
  status,
}: {
  membership: UserMembershipRow;
  locale: string;
  status: UserPackageStatus;
}) {
  const requestClose = useMemberHubMobileSheetClose();

  return (
    <>
      <div className={MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS} aria-hidden />
      <MembershipDetailsSheetContent
        membership={membership}
        locale={locale}
        status={status}
        onClose={requestClose}
      />
    </>
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
  const { motionState: desktopMotionState, closeMotion: closeDesktopMotion } =
    useDesktopSheetEnterMotion(!isPhone && isOpen);

  const finishClose = useCallback(() => {
    closingRef.current = false;
    onClose();
  }, [onClose]);

  const handleDesktopClose = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    dismissMobileKeyboard();
    closingRef.current = true;
    closeDesktopMotion();
    window.setTimeout(finishClose, USER_MEMBERSHIP_DETAILS_DESKTOP_MOTION_MS);
  }, [closeDesktopMotion, finishClose]);

  if (isPhone) {
    return (
      <MemberHubMobileSheet
        bare
        titleId={MEMBERSHIP_DETAILS_SHEET_TITLE_ID}
        closeLabel={t("membershipDetailsCloseBackdrop")}
        backdropCloseLabel={t("membershipDetailsCloseBackdrop")}
        onClose={finishClose}
        panelStyle={memberAccountHubSheetPanelStyle()}
      >
        <MembershipDetailsMobileBody membership={membership} locale={locale} status={status} />
      </MemberHubMobileSheet>
    );
  }

  return (
    <OmmDrawerPortal
      isOpen={isOpen}
      onClose={handleDesktopClose}
      backdropAriaLabel={t("membershipDetailsCloseBackdrop")}
      ariaLabelledBy={MEMBERSHIP_DETAILS_SHEET_TITLE_ID}
      overlayClassName={USER_MEMBERSHIP_DETAILS_DESKTOP_OVERLAY_CLASS}
      backdropClassName={USER_MEMBERSHIP_DETAILS_DESKTOP_BACKDROP_CLASS}
      panelClassName={USER_MEMBERSHIP_DETAILS_DESKTOP_PANEL_CLASS}
      motionState={desktopMotionState}
    >
      <MembershipDetailsSheetContent
        membership={membership}
        locale={locale}
        status={status}
        onClose={handleDesktopClose}
      />
    </OmmDrawerPortal>
  );
}

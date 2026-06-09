"use client";

import { useRouter } from "@/i18n/navigation";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  MEMBER_ACCOUNT_HUB_SHEET_BODY_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_HEADER_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_OVERLAY_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_PANEL_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_TITLE_CLASS,
  MEMBER_NOTIFICATIONS_DESKTOP_BODY_CLASS,
  MEMBER_NOTIFICATIONS_DESKTOP_BACKDROP_CLASS,
  MEMBER_NOTIFICATIONS_DESKTOP_HEADER_CLASS,
  MEMBER_NOTIFICATIONS_DESKTOP_MOTION_MS,
  MEMBER_NOTIFICATIONS_DESKTOP_OVERLAY_CLASS,
  MEMBER_NOTIFICATIONS_DESKTOP_PANEL_CLASS,
  memberAccountHubSheetPanelStyle,
} from "@/components/account/member-account-hub-sheet-layout";
import { ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { OmmDrawerPortal, OmmModalPortal } from "@/components/ui/omm-modal";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";
import { dismissMobileKeyboard } from "@/lib/dismiss-mobile-keyboard";

type MemberAccountHubSectionSheetProps = {
  title: string;
  closeLabel: string;
  backdropCloseLabel: string;
  /** Tablet+ right-side panel instead of navigating to a full page (notifications). */
  desktopSidePanel?: boolean;
  children: ReactNode;
};

function SheetCloseIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

/** Member hub section overlay — bottom sheet on phone, optional right panel on desktop. */
export function MemberAccountHubSectionSheet({
  title,
  closeLabel,
  backdropCloseLabel,
  desktopSidePanel = false,
  children,
}: MemberAccountHubSectionSheetProps) {
  const router = useRouter();
  const isPhone = useMemberHubSheetPhone();
  const desktopClosingRef = useRef(false);
  const [desktopMotionState, setDesktopMotionState] = useState<"open" | "closed">("closed");

  useLayoutEffect(() => {
    if (isPhone || !desktopSidePanel) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      setDesktopMotionState("open");
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [desktopSidePanel, isPhone]);

  function closeSheet() {
    dismissMobileKeyboard();

    if (!isPhone && desktopSidePanel) {
      if (desktopClosingRef.current) {
        return;
      }
      desktopClosingRef.current = true;
      setDesktopMotionState("closed");
      window.setTimeout(() => {
        router.back();
      }, MEMBER_NOTIFICATIONS_DESKTOP_MOTION_MS);
      return;
    }

    router.back();
  }

  if (isPhone) {
    return (
      <OmmModalPortal
        isOpen
        onClose={closeSheet}
        bottomAnchored
        backdropAriaLabel={backdropCloseLabel}
        ariaLabelledBy="member-hub-section-sheet-title"
        overlayClassName={MEMBER_ACCOUNT_HUB_SHEET_OVERLAY_CLASS}
        panelClassName={MEMBER_ACCOUNT_HUB_SHEET_PANEL_CLASS}
        panelStyle={memberAccountHubSheetPanelStyle()}
      >
        <div className={MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS} aria-hidden />
        <header className={MEMBER_ACCOUNT_HUB_SHEET_HEADER_CLASS}>
          <h2 id="member-hub-section-sheet-title" className={MEMBER_ACCOUNT_HUB_SHEET_TITLE_CLASS}>
            {title}
          </h2>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
            aria-label={closeLabel}
            onClick={closeSheet}
          >
            <SheetCloseIcon />
          </button>
        </header>
        <div className={MEMBER_ACCOUNT_HUB_SHEET_BODY_CLASS}>{children}</div>
      </OmmModalPortal>
    );
  }

  if (!desktopSidePanel) {
    return null;
  }

  return (
    <OmmDrawerPortal
      isOpen
      onClose={closeSheet}
      backdropAriaLabel={backdropCloseLabel}
      ariaLabelledBy="member-hub-section-sheet-title"
      overlayClassName={MEMBER_NOTIFICATIONS_DESKTOP_OVERLAY_CLASS}
      backdropClassName={MEMBER_NOTIFICATIONS_DESKTOP_BACKDROP_CLASS}
      panelClassName={MEMBER_NOTIFICATIONS_DESKTOP_PANEL_CLASS}
      motionState={desktopMotionState}
    >
      <header className={MEMBER_NOTIFICATIONS_DESKTOP_HEADER_CLASS}>
        <h2 id="member-hub-section-sheet-title" className={MEMBER_ACCOUNT_HUB_SHEET_TITLE_CLASS}>
          {title}
        </h2>
        <button
          type="button"
          className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
          aria-label={closeLabel}
          onClick={closeSheet}
        >
          <SheetCloseIcon />
        </button>
      </header>
      <div className={MEMBER_NOTIFICATIONS_DESKTOP_BODY_CLASS}>{children}</div>
    </OmmDrawerPortal>
  );
}

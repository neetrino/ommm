"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  MEMBER_NOTIFICATIONS_DESKTOP_BODY_CLASS,
  MEMBER_NOTIFICATIONS_DESKTOP_BACKDROP_CLASS,
  MEMBER_NOTIFICATIONS_DESKTOP_HEADER_CLASS,
  MEMBER_NOTIFICATIONS_DESKTOP_MOTION_MS,
  MEMBER_NOTIFICATIONS_DESKTOP_OVERLAY_CLASS,
  MEMBER_NOTIFICATIONS_DESKTOP_PANEL_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_TITLE_CLASS,
} from "@/components/account/member-account-hub-sheet-layout";
import { MemberHubMobileSheet } from "@/components/account/member-hub-mobile-sheet";
import { ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
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

/** Member hub overlay — bottom sheet on phone; notifications use a right panel on desktop. */
export function MemberAccountHubSectionSheet({
  title,
  closeLabel,
  backdropCloseLabel,
  desktopSidePanel = false,
  children,
}: MemberAccountHubSectionSheetProps) {
  const router = useRouter();
  const clientMounted = useIsClientMounted();
  const isPhone = useMemberHubSheetPhone();
  const desktopClosingRef = useRef(false);
  const [desktopMotionState, setDesktopMotionState] = useState<"open" | "closed">("closed");

  useEffect(() => {
    if (!clientMounted || isPhone || !desktopSidePanel) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      setDesktopMotionState("open");
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [clientMounted, desktopSidePanel, isPhone]);

  function closeDesktopSheet() {
    dismissMobileKeyboard();

    if (!desktopSidePanel || desktopClosingRef.current) {
      router.back();
      return;
    }

    desktopClosingRef.current = true;
    setDesktopMotionState("closed");
    window.setTimeout(() => {
      router.back();
    }, MEMBER_NOTIFICATIONS_DESKTOP_MOTION_MS);
  }

  if (clientMounted && !isPhone && !desktopSidePanel) {
    return null;
  }

  if (desktopSidePanel && clientMounted && !isPhone) {
    return (
      <OmmDrawerPortal
        isOpen
        onClose={closeDesktopSheet}
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
            onClick={closeDesktopSheet}
          >
            <SheetCloseIcon />
          </button>
        </header>
        <div className={MEMBER_NOTIFICATIONS_DESKTOP_BODY_CLASS}>{children}</div>
      </OmmDrawerPortal>
    );
  }

  return (
    <MemberHubMobileSheet
      titleId="member-hub-section-sheet-title"
      title={title}
      closeLabel={closeLabel}
      backdropCloseLabel={backdropCloseLabel}
      onClose={() => router.back()}
    >
      {children}
    </MemberHubMobileSheet>
  );
}

"use client";

import { useRouter } from "@/i18n/navigation";
import type { ReactNode } from "react";
import {
  MEMBER_ACCOUNT_HUB_SHEET_BODY_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_HEADER_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_OVERLAY_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_PANEL_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_TITLE_CLASS,
  memberAccountHubSheetPanelStyle,
} from "@/components/account/member-account-hub-sheet-layout";
import { ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { OmmModalPortal } from "@/components/ui/omm-modal";

type MemberAccountHubSectionSheetProps = {
  title: string;
  closeLabel: string;
  backdropCloseLabel: string;
  children: ReactNode;
};

/** Mobile bottom sheet for member hub sections (bookings, waitlists, …). */
export function MemberAccountHubSectionSheet({
  title,
  closeLabel,
  backdropCloseLabel,
  children,
}: MemberAccountHubSectionSheetProps) {
  const router = useRouter();

  function closeSheet() {
    router.back();
  }

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
        </button>
      </header>
      <div className={MEMBER_ACCOUNT_HUB_SHEET_BODY_CLASS}>{children}</div>
    </OmmModalPortal>
  );
}

"use client";

import type { ReactNode } from "react";
import {
  MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS,
} from "@/components/account/member-account-hub-sheet-layout";
import { useMemberHubMobileSheetClose } from "@/components/account/member-hub-mobile-sheet";
import { PACKAGE_SUBSCRIBE_MOBILE_BODY_CLASS } from "@/components/account/package-subscribe-payment-sheet-layout";

export function BookingPackageSelectSheetCloseIcon() {
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

export function BookingPackageSelectMobileSheetLayout({
  renderHeader,
  renderBody,
}: {
  renderHeader: (onClose: () => void) => ReactNode;
  renderBody: (onClose: () => void) => ReactNode;
}) {
  const requestClose = useMemberHubMobileSheetClose();

  return (
    <>
      <div className={MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS} aria-hidden />
      {renderHeader(requestClose)}
      <div className={PACKAGE_SUBSCRIBE_MOBILE_BODY_CLASS}>{renderBody(requestClose)}</div>
    </>
  );
}

"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { AdminUserDetailsContent } from "@/components/admin/admin-user-details-content";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";

type AdminUserDetailsDrawerProps = {
  locale: string;
  userId: string | null;
  onClose: () => void;
  /** Stack above nested confirm dialogs (e.g. package delete modal). */
  useOverlayPortalRoot?: boolean;
};

export function AdminUserDetailsDrawer({
  locale,
  userId,
  onClose,
  useOverlayPortalRoot = false,
}: AdminUserDetailsDrawerProps) {
  const t = useTranslations("adminPages.waitlists");
  const titleId = useId();
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose, {
    openKey: userId,
  });
  const portalOpen = userId !== null && sheetOpen;

  if (userId === null) {
    return null;
  }

  return (
    <AdminSheetPortal
      presentation="drawer"
      isOpen={portalOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      backdropAriaLabel={t("drawer.close")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS}
      useOverlayPortalRoot={useOverlayPortalRoot}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {t("drawer.title")}
            </h2>
            <p className={ADMIN_DETAILS_SHEET_LEDE_CLASS}>{t("drawer.lead")}</p>
          </div>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
            aria-label={t("drawer.close")}
            onClick={requestClose}
          >
            <CloseGlyph />
          </button>
        </div>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        <AdminUserDetailsContent key={userId} locale={locale} userId={userId} />
      </div>
    </AdminSheetPortal>
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

"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { CustomGiftComposer } from "@/components/account/custom-gift-composer";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import {
  ADMIN_CREATE_SHEET_HEADER_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";

type CustomGiftComposerModalProps = {
  isOpen: boolean;
  locale: string;
  onClose: () => void;
};

const USER_GIFT_SHEET_OVERLAY_CLASS =
  "ommm-drawer-overlay z-[140] max-sm:items-end max-sm:justify-center sm:items-end sm:justify-end";

/** Custom gift purchase, opened as a sheet from the right. */
export function CustomGiftComposerModal({
  isOpen,
  locale,
  onClose,
}: CustomGiftComposerModalProps) {
  const t = useTranslations("userPages.giftCards.customGift");
  const titleId = useId();

  return (
    <AdminSheetPortal
      presentation="drawer"
      isOpen={isOpen}
      onClose={onClose}
      useOverlayPortalRoot
      ariaLabelledBy={titleId}
      backdropAriaLabel={t("closeModal")}
      drawerOverlayClassName={USER_GIFT_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
      zIndexClass="z-[140]"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper">
        <header className={ADMIN_CREATE_SHEET_HEADER_CLASS}>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-serif text-[1.75rem] font-normal leading-none tracking-tight text-sage-900"
            >
              {t("buyNewGift")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-sage-600">{t("lead")}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            aria-label={t("closeModal")}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>
        <div className="ommm-soft-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-5 sm:p-6">
          {isOpen ? <CustomGiftComposer locale={locale} /> : null}
        </div>
      </div>
    </AdminSheetPortal>
  );
}

function CloseIcon() {
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

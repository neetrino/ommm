"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { CustomGiftComposer } from "@/components/account/custom-gift-composer";
import { ADMIN_CREATE_SHEET_HEADER_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { adminFormModalPanelClass } from "@/components/admin/admin-mobile-sheet-layout";
import { OmmModalPortal } from "@/components/ui/omm-modal";

type CustomGiftComposerModalProps = {
  isOpen: boolean;
  locale: string;
  onClose: () => void;
};

const MODAL_OVERLAY_CLASS = "ommm-modal-overlay z-[140] items-center p-3 sm:p-4";

/** Custom gift purchase, using the same sheet chrome as the admin create form. */
export function CustomGiftComposerModal({
  isOpen,
  locale,
  onClose,
}: CustomGiftComposerModalProps) {
  const t = useTranslations("userPages.giftCards.customGift");
  const titleId = useId();

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      useOverlayPortalRoot
      dialogRole="dialog"
      ariaLabelledBy={titleId}
      backdropAriaLabel={t("closeModal")}
      overlayClassName={MODAL_OVERLAY_CLASS}
      panelClassName={adminFormModalPanelClass("max-w-lg")}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
        <div className="ommm-soft-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-paper p-5 sm:p-6">
          {isOpen ? <CustomGiftComposer locale={locale} /> : null}
        </div>
      </div>
    </OmmModalPortal>
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

"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { CustomGiftComposer } from "@/components/account/custom-gift-composer";
import { OmmModalPortal } from "@/components/ui/omm-modal";

type CustomGiftComposerModalProps = {
  isOpen: boolean;
  locale: string;
  onClose: () => void;
};

const MODAL_OVERLAY_CLASS =
  "ommm-modal-overlay z-[140] items-center justify-center p-4";

const MODAL_PANEL_CLASS =
  "flex max-h-[min(92vh,52rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-[0_28px_64px_-36px_rgba(45,40,35,0.38)]";

/** Custom gift form. Gift type is the first field; money and class show different inputs. */
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
      centered
      useOverlayPortalRoot
      dialogRole="dialog"
      ariaLabelledBy={titleId}
      backdropAriaLabel={t("closeModal")}
      overlayClassName={MODAL_OVERLAY_CLASS}
      panelClassName={MODAL_PANEL_CLASS}
    >
      <header className="flex items-center justify-between gap-3 border-b border-sand-500/25 px-5 py-4 sm:px-8">
        <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
          {t("buyNewGift")}
        </h2>
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sage-500 transition-colors hover:bg-sand-100 hover:text-sage-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700"
          aria-label={t("closeModal")}
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </header>
      {isOpen ? <CustomGiftComposer locale={locale} /> : null}
    </OmmModalPortal>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

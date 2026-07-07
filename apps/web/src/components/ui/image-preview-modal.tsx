"use client";

import { useId } from "react";
import { OmmModalPortal } from "@/components/ui/omm-modal";

const IMAGE_PREVIEW_OVERLAY_CLASS =
  "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8";

const IMAGE_PREVIEW_PANEL_CLASS =
  "relative flex h-[min(85vh,720px)] w-[min(92vw,720px)] min-h-[min(60vh,420px)] min-w-[min(88vw,420px)] items-center justify-center overflow-hidden rounded-[24px] border border-white/70 bg-sage-950/90 p-3 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.55)] sm:p-4";

const IMAGE_PREVIEW_IMAGE_CLASS = "h-full w-full rounded-[18px] object-contain";

const IMAGE_PREVIEW_CLOSE_BUTTON_CLASS =
  "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-sage-900/70 text-lg text-white shadow-sm transition hover:bg-sage-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

type ImagePreviewModalProps = {
  isOpen: boolean;
  imageSrc: string;
  imageAlt: string;
  closeAriaLabel: string;
  backdropAriaLabel: string;
  onClose: () => void;
  useOverlayPortalRoot?: boolean;
};

/** Full-size image preview dialog for avatars and profile photos. */
export function ImagePreviewModal({
  isOpen,
  imageSrc,
  imageAlt,
  closeAriaLabel,
  backdropAriaLabel,
  onClose,
  useOverlayPortalRoot = true,
}: ImagePreviewModalProps) {
  const titleId = useId();

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={backdropAriaLabel}
      ariaLabelledBy={titleId}
      overlayClassName={IMAGE_PREVIEW_OVERLAY_CLASS}
      panelClassName={IMAGE_PREVIEW_PANEL_CLASS}
      lockBodyScroll={false}
      useOverlayPortalRoot={useOverlayPortalRoot}
    >
      <h2 id={titleId} className="sr-only">
        {imageAlt}
      </h2>
      <button
        type="button"
        className={IMAGE_PREVIEW_CLOSE_BUTTON_CLASS}
        aria-label={closeAriaLabel}
        onClick={onClose}
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element -- scale small avatar URLs to full preview size */}
      <img src={imageSrc} alt={imageAlt} className={IMAGE_PREVIEW_IMAGE_CLASS} />
    </OmmModalPortal>
  );
}

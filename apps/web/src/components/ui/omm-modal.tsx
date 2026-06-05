"use client";

import { createPortal } from "react-dom";
import { useEffect, type ReactNode } from "react";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";

export const OMM_MODAL_BACKDROP_CLASS = "ommm-modal-backdrop";

export const OMM_MODAL_OVERLAY_CLASS = "ommm-modal-overlay";

export const OMM_DRAWER_OVERLAY_CLASS = "ommm-drawer-overlay";

/** Keeps layout width stable when the classic scrollbar disappears on lock. */
function useLockBodyScroll(active: boolean): void {
  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [active]);
}

type OmmModalBackdropProps = {
  onClose: () => void;
  ariaLabel: string;
  disabled?: boolean;
};

export function OmmModalBackdrop({ onClose, ariaLabel, disabled = false }: OmmModalBackdropProps) {
  return (
    <button
      type="button"
      className={OMM_MODAL_BACKDROP_CLASS}
      onClick={onClose}
      disabled={disabled}
      aria-label={ariaLabel}
    />
  );
}

type OmmModalPortalProps = {
  isOpen: boolean;
  onClose: () => void;
  backdropAriaLabel: string;
  dialogRole?: "dialog" | "alertdialog";
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  closeDisabled?: boolean;
  overlayClassName?: string;
  panelClassName?: string;
  children: ReactNode;
};

export function OmmModalPortal({
  isOpen,
  onClose,
  backdropAriaLabel,
  dialogRole = "dialog",
  ariaLabelledBy,
  ariaDescribedBy,
  closeDisabled = false,
  overlayClassName = OMM_MODAL_OVERLAY_CLASS,
  panelClassName,
  children,
}: OmmModalPortalProps) {
  const portalReady = useIsClientMounted();

  useCloseOnEscape(isOpen, onClose, { disabled: closeDisabled });
  useLockBodyScroll(isOpen);

  if (!isOpen || !portalReady || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={overlayClassName} role="presentation">
      <OmmModalBackdrop
        onClose={onClose}
        ariaLabel={backdropAriaLabel}
        disabled={closeDisabled}
      />
      <div
        role={dialogRole}
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        className={`relative z-10 mt-auto w-full sm:mt-0 ${panelClassName ?? ""}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

type OmmDrawerPortalProps = {
  isOpen: boolean;
  onClose: () => void;
  backdropAriaLabel: string;
  ariaLabelledBy?: string;
  closeDisabled?: boolean;
  overlayClassName?: string;
  panelClassName?: string;
  children: ReactNode;
};

export function OmmDrawerPortal({
  isOpen,
  onClose,
  backdropAriaLabel,
  ariaLabelledBy,
  closeDisabled = false,
  overlayClassName = OMM_DRAWER_OVERLAY_CLASS,
  panelClassName = "relative z-10 h-full w-full max-w-md overflow-auto bg-white p-5 shadow-xl",
  children,
}: OmmDrawerPortalProps) {
  const portalReady = useIsClientMounted();

  useCloseOnEscape(isOpen, onClose, { disabled: closeDisabled });
  useLockBodyScroll(isOpen);

  if (!isOpen || !portalReady || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={overlayClassName} role="presentation">
      <OmmModalBackdrop
        onClose={onClose}
        ariaLabel={backdropAriaLabel}
        disabled={closeDisabled}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        className={panelClassName}
      >
        {children}
      </aside>
    </div>,
    document.body,
  );
}

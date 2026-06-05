"use client";

import { createPortal } from "react-dom";
import { useEffect, type ReactNode } from "react";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";

export const OMM_MODAL_BACKDROP_CLASS = "ommm-modal-backdrop";

export const OMM_MODAL_OVERLAY_CLASS = "ommm-modal-overlay";

export const OMM_DRAWER_OVERLAY_CLASS = "ommm-drawer-overlay";

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

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

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
  closeDisabled?: boolean;
  panelClassName?: string;
  children: ReactNode;
};

export function OmmDrawerPortal({
  isOpen,
  onClose,
  backdropAriaLabel,
  closeDisabled = false,
  panelClassName = "relative z-10 h-full w-full max-w-md overflow-auto bg-white p-5 shadow-xl",
  children,
}: OmmDrawerPortalProps) {
  const portalReady = useIsClientMounted();

  useCloseOnEscape(isOpen, onClose, { disabled: closeDisabled });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !portalReady || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={OMM_DRAWER_OVERLAY_CLASS} role="presentation">
      <OmmModalBackdrop
        onClose={onClose}
        ariaLabel={backdropAriaLabel}
        disabled={closeDisabled}
      />
      <aside className={panelClassName}>{children}</aside>
    </div>,
    document.body,
  );
}

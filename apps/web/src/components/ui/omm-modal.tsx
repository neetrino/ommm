"use client";

import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode } from "react";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

export const OMM_MODAL_BACKDROP_CLASS = "ommm-modal-backdrop";

export const OMM_MODAL_OVERLAY_CLASS = "ommm-modal-overlay";

export const OMM_DRAWER_OVERLAY_CLASS = "ommm-drawer-overlay";

export const OMM_DRAWER_BACKDROP_CLASS = "ommm-drawer-backdrop";

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

type OmmDrawerBackdropProps = {
  onClose: () => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
};

/** Click target behind side sheets — static dim, no extra darkening on hover. */
export function OmmDrawerBackdrop({
  onClose,
  ariaLabel,
  disabled = false,
  className = OMM_DRAWER_BACKDROP_CLASS,
}: OmmDrawerBackdropProps) {
  return (
    <button
      type="button"
      className={className}
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
  panelStyle?: CSSProperties;
  /** Keep panel anchored to the bottom on all breakpoints (mobile bottom sheets). */
  bottomAnchored?: boolean;
  /** Drives `data-state` on the overlay for enter/exit CSS transitions. */
  motionState?: "open" | "closed";
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
  panelStyle,
  bottomAnchored = false,
  motionState,
  children,
}: OmmModalPortalProps) {
  const portalReady = useIsClientMounted();

  useCloseOnEscape(isOpen, onClose, { disabled: closeDisabled });
  useLockBodyScroll(isOpen);

  const panelPositionClass = bottomAnchored
    ? "relative z-10 mt-auto w-full"
    : "relative z-10 mt-auto w-full sm:mt-0";

  if (!isOpen || !portalReady || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={overlayClassName} role="presentation" data-state={motionState}>
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
        className={`${panelPositionClass} ${panelClassName ?? ""}`}
        style={panelStyle}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

type OmmWorkspaceDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  backdropAriaLabel: string;
  ariaLabelledBy?: string;
  closeDisabled?: boolean;
  overlayClassName?: string;
  backdropClassName?: string;
  panelClassName?: string;
  children: ReactNode;
};

/** Right-side drawer scoped to the dashboard main pane (not full viewport). */
export function OmmWorkspaceDrawer({
  isOpen,
  onClose,
  backdropAriaLabel,
  ariaLabelledBy,
  closeDisabled = false,
  overlayClassName,
  backdropClassName,
  panelClassName,
  children,
}: OmmWorkspaceDrawerProps) {
  useCloseOnEscape(isOpen, onClose, { disabled: closeDisabled });
  useLockBodyScroll(isOpen);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={overlayClassName} role="presentation">
      <OmmDrawerBackdrop
        onClose={onClose}
        ariaLabel={backdropAriaLabel}
        disabled={closeDisabled}
        className={backdropClassName}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        className={panelClassName}
      >
        {children}
      </aside>
    </div>
  );
}

type OmmDrawerPortalProps = {
  isOpen: boolean;
  onClose: () => void;
  backdropAriaLabel: string;
  ariaLabelledBy?: string;
  closeDisabled?: boolean;
  overlayClassName?: string;
  backdropClassName?: string;
  panelClassName?: string;
  /** Drives `data-state` on the overlay for enter/exit CSS transitions. */
  motionState?: "open" | "closed";
  children: ReactNode;
};

export function OmmDrawerPortal({
  isOpen,
  onClose,
  backdropAriaLabel,
  ariaLabelledBy,
  closeDisabled = false,
  overlayClassName = OMM_DRAWER_OVERLAY_CLASS,
  backdropClassName = OMM_DRAWER_BACKDROP_CLASS,
  panelClassName = "relative z-10 h-full w-full max-w-md overflow-auto bg-white p-5 shadow-xl",
  motionState,
  children,
}: OmmDrawerPortalProps) {
  const portalReady = useIsClientMounted();

  useCloseOnEscape(isOpen, onClose, { disabled: closeDisabled });
  useLockBodyScroll(isOpen);

  if (!isOpen || !portalReady || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={overlayClassName}
      role="presentation"
      data-state={motionState}
    >
      <OmmDrawerBackdrop
        onClose={onClose}
        ariaLabel={backdropAriaLabel}
        disabled={closeDisabled}
        className={backdropClassName}
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

"use client";

import { createPortal } from "react-dom";
import { useId, type ReactNode } from "react";
import { ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { OmmButton } from "@/components/ui/omm-button";
import styles from "@/components/ui/omm-confirm-centered-modal.module.css";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { useOverlayEnterExitMotion } from "@/hooks/use-overlay-enter-exit-motion";

export type OmmConfirmCenteredModalTone =
  | "default"
  | "warm"
  | "danger"
  | "success";

type OmmConfirmCenteredModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  backdropAriaLabel: string;
  pending?: boolean;
  confirmPending?: boolean;
  tone?: OmmConfirmCenteredModalTone;
  confirmClassName?: string;
  /** Hide the cancel button; dismiss via an X in the top-right corner. */
  dismissAsCloseIcon?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

const TONE_PANEL_CLASS: Record<OmmConfirmCenteredModalTone, string> = {
  default: "",
  warm: styles.panelWarm,
  danger: styles.panelDanger,
  success: styles.panelSuccess,
};

/**
 * Centered confirm modal with fade + soft rise enter/exit (all breakpoints).
 */
export function OmmConfirmCenteredModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  backdropAriaLabel,
  pending = false,
  confirmPending,
  tone = "default",
  confirmClassName = "",
  dismissAsCloseIcon = false,
  onConfirm,
  onCancel,
  children,
}: OmmConfirmCenteredModalProps) {
  const titleId = useId();
  const descId = useId();
  const clientMounted = useIsClientMounted();
  const { presented, motionOpen, requestClose } = useOverlayEnterExitMotion(
    isOpen,
    onCancel,
    { closeDisabled: pending },
  );
  const resolvedConfirmPending = confirmPending ?? pending;

  useLockBodyScroll(presented);
  useCloseOnEscape(presented, requestClose, { disabled: pending });

  if (!presented || !clientMounted) {
    return null;
  }

  const backdropClass = [
    styles.backdrop,
    motionOpen ? styles.backdropOpen : styles.backdropClosing,
  ].join(" ");
  const panelClass = [
    styles.panel,
    TONE_PANEL_CLASS[tone],
    motionOpen ? styles.panelOpen : styles.panelClosing,
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className={styles.overlay} role="presentation">
      <button
        type="button"
        className={backdropClass}
        aria-label={backdropAriaLabel}
        disabled={pending}
        onClick={requestClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={panelClass}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <h2
                id={titleId}
                className="font-serif text-2xl font-normal text-sage-900"
              >
                {title}
              </h2>
              {dismissAsCloseIcon ? (
                <button
                  type="button"
                  className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
                  aria-label={cancelLabel}
                  disabled={pending}
                  onClick={requestClose}
                >
                  ×
                </button>
              ) : null}
            </div>
            <p id={descId} className="text-sm leading-relaxed text-sage-700">
              {description}
            </p>
          </div>
          {children}
          <div
            className={
              dismissAsCloseIcon
                ? "flex justify-center pt-1"
                : "flex flex-wrap justify-end gap-3 pt-1"
            }
          >
            {dismissAsCloseIcon ? null : (
              <OmmButton
                type="button"
                variant="secondary"
                size="md"
                onClick={requestClose}
                disabled={pending}
              >
                {cancelLabel}
              </OmmButton>
            )}
            <OmmButton
              type="button"
              variant="secondary"
              size="md"
              className={confirmClassName}
              onClick={onConfirm}
              disabled={resolvedConfirmPending}
            >
              {confirmLabel}
            </OmmButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

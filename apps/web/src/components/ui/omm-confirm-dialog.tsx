"use client";

import { useId, type ReactNode } from "react";
import { ADMIN_CONFIRM_MODAL_PANEL_CLASS } from "@/components/admin/admin-mobile-sheet-layout";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmCenteredModal } from "@/components/ui/omm-confirm-centered-modal";

export type OmmConfirmDialogTone = "default" | "warm" | "danger" | "success";

type OmmConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  backdropAriaLabel: string;
  pending?: boolean;
  /** When set, only the confirm action is blocked (dismiss stays enabled unless `pending`). */
  confirmPending?: boolean;
  tone?: OmmConfirmDialogTone;
  confirmClassName?: string;
  overlayClassName?: string;
  lockBodyScroll?: boolean;
  closeOnEscape?: boolean;
  /**
   * Always show a centered modal with enter/exit motion (skip phone bottom sheet).
   */
  forceCenteredModal?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

const CONFIRM_DIALOG_TONE_PANEL_CLASS: Record<OmmConfirmDialogTone, string> = {
  default: "",
  warm: "ommm-confirm-dialog--warm",
  danger: "ommm-confirm-dialog--danger",
  success: "ommm-confirm-dialog--success",
};

export function OmmConfirmDialog({
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
  overlayClassName = "ommm-modal-overlay z-[110] p-4",
  lockBodyScroll = true,
  closeOnEscape = true,
  forceCenteredModal = false,
  onConfirm,
  onCancel,
  children,
}: OmmConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const resolvedConfirmPending = confirmPending ?? pending;

  if (forceCenteredModal) {
    return (
      <OmmConfirmCenteredModal
        isOpen={isOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        backdropAriaLabel={backdropAriaLabel}
        pending={pending}
        confirmPending={confirmPending}
        tone={tone}
        confirmClassName={confirmClassName}
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        {children}
      </OmmConfirmCenteredModal>
    );
  }

  const panelClassName = [
    ADMIN_CONFIRM_MODAL_PANEL_CLASS,
    CONFIRM_DIALOG_TONE_PANEL_CLASS[tone],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AdminSheetPortal
      isOpen={isOpen}
      onClose={onCancel}
      presentation="modal"
      dialogRole="alertdialog"
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
      closeDisabled={pending}
      backdropAriaLabel={backdropAriaLabel}
      modalOverlayClassName={overlayClassName}
      modalPanelClassName={panelClassName}
      lockBodyScroll={lockBodyScroll}
      closeOnEscape={closeOnEscape}
      zIndexClass="z-[110]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
            {title}
          </h2>
          <p id={descId} className="text-sm leading-relaxed text-sage-700">
            {description}
          </p>
        </div>
        {children}
        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <OmmButton type="button" variant="secondary" size="md" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </OmmButton>
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
    </AdminSheetPortal>
  );
}

"use client";

import { useId, type ReactNode } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";

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
  lockBodyScroll?: boolean;
  closeOnEscape?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

const CONFIRM_DIALOG_PANEL_CLASS =
  "w-full max-w-md rounded-[28px] border border-sand-200/80 bg-white p-6 shadow-[0_24px_48px_-28px_rgba(45,40,35,0.35)]";

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
  lockBodyScroll = true,
  closeOnEscape = true,
  onConfirm,
  onCancel,
  children,
}: OmmConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const resolvedConfirmPending = confirmPending ?? pending;
  const panelClassName = [
    CONFIRM_DIALOG_PANEL_CLASS,
    CONFIRM_DIALOG_TONE_PANEL_CLASS[tone],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onCancel}
      dialogRole="alertdialog"
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
      closeDisabled={pending}
      backdropAriaLabel={backdropAriaLabel}
      overlayClassName="ommm-modal-overlay z-[110] p-4"
      panelClassName={panelClassName}
      lockBodyScroll={lockBodyScroll}
      closeOnEscape={closeOnEscape}
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
    </OmmModalPortal>
  );
}

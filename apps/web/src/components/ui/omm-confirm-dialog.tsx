"use client";

import { useId, type ReactNode } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";

type OmmConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  backdropAriaLabel: string;
  pending?: boolean;
  confirmVariant?: "primary" | "secondary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function OmmConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  backdropAriaLabel,
  pending = false,
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  children,
}: OmmConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();

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
      panelClassName="w-full max-w-md rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md"
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
            variant={confirmVariant}
            size="md"
            onClick={onConfirm}
            disabled={pending}
          >
            {confirmLabel}
          </OmmButton>
        </div>
      </div>
    </OmmModalPortal>
  );
}

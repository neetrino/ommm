"use client";

import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

type AdminClassTypeDeleteConfirmProps = {
  isOpen: boolean;
  pending: boolean;
  title: string;
  description: string;
  warning: string;
  confirmLabel: string;
  cancelLabel: string;
  backdropAriaLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AdminClassTypeDeleteConfirm({
  isOpen,
  pending,
  title,
  description,
  warning,
  confirmLabel,
  cancelLabel,
  backdropAriaLabel,
  onConfirm,
  onCancel,
}: AdminClassTypeDeleteConfirmProps) {
  return (
    <OmmConfirmDialog
      isOpen={isOpen}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      backdropAriaLabel={backdropAriaLabel}
      tone="danger"
      confirmClassName="ommm-btn-lifecycle-action--danger"
      overlayClassName="ommm-modal-overlay z-[120] p-4"
      pending={pending}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <p className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900">
        {warning}
      </p>
    </OmmConfirmDialog>
  );
}

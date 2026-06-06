"use client";

import { useId, type ReactNode } from "react";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_ELEVATED_CLASS,
  ADMIN_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";

export type AdminConfirmSheetTone = "default" | "warm" | "danger" | "success";

type AdminConfirmSheetProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  backdropAriaLabel: string;
  pending?: boolean;
  tone?: AdminConfirmSheetTone;
  confirmClassName?: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

const CONFIRM_SHEET_TONE_CLASS: Record<AdminConfirmSheetTone, string> = {
  default: "",
  warm: "ommm-confirm-dialog--warm",
  danger: "ommm-confirm-dialog--danger",
  success: "ommm-confirm-dialog--success",
};

export function AdminConfirmSheet({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  backdropAriaLabel,
  pending = false,
  tone = "default",
  confirmClassName = "",
  confirmDisabled = false,
  onConfirm,
  onCancel,
  children,
}: AdminConfirmSheetProps) {
  const titleId = useId();
  const descId = useId();

  return (
    <OmmDrawerPortal
      isOpen={isOpen}
      onClose={onCancel}
      backdropAriaLabel={backdropAriaLabel}
      ariaLabelledBy={titleId}
      closeDisabled={pending}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_ELEVATED_CLASS}
      panelClassName={`${ADMIN_DETAILS_SHEET_PANEL_CLASS} ${CONFIRM_SHEET_TONE_CLASS[tone]}`.trim()}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
          {title}
        </h2>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        <p id={descId} className="text-sm leading-relaxed text-sage-700">
          {description}
        </p>
        {children}
      </div>
      <footer className={`${ADMIN_DETAILS_SHEET_FOOTER_CLASS} flex flex-wrap justify-end gap-3`}>
        <OmmButton type="button" variant="secondary" size="md" onClick={onCancel} disabled={pending}>
          {cancelLabel}
        </OmmButton>
        <OmmButton
          type="button"
          variant="secondary"
          size="md"
          className={confirmClassName}
          onClick={onConfirm}
          disabled={pending || confirmDisabled}
        >
          {confirmLabel}
        </OmmButton>
      </footer>
    </OmmDrawerPortal>
  );
}

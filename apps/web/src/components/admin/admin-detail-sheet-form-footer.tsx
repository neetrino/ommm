"use client";

import { ADMIN_DETAILS_SHEET_FOOTER_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { OmmButton } from "@/components/ui/omm-button";

type AdminDetailSheetFormFooterProps = {
  saveLabel: string;
  cancelLabel: string;
  savingLabel: string;
  dirty: boolean;
  busy: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export function AdminDetailSheetFormFooter({
  saveLabel,
  cancelLabel,
  savingLabel,
  dirty,
  busy,
  onSave,
  onCancel,
}: AdminDetailSheetFormFooterProps) {
  if (!dirty && !busy) {
    return null;
  }

  return (
    <footer
      className={`${ADMIN_DETAILS_SHEET_FOOTER_CLASS} flex flex-wrap items-center justify-end gap-3`}
    >
      <OmmButton type="button" variant="secondary" size="md" onClick={onCancel} disabled={busy}>
        {cancelLabel}
      </OmmButton>
      <OmmButton type="button" variant="primary" size="md" onClick={onSave} disabled={busy || !dirty}>
        {busy ? savingLabel : saveLabel}
      </OmmButton>
    </footer>
  );
}

"use client";

import { ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { DeleteActionButton } from "@/components/ui/delete-action-button";

type ContentPostSheetHeaderActionsProps = {
  showDelete: boolean;
  busy: boolean;
  deleteLabel: string;
  closeLabel: string;
  onDelete: () => void;
  onClose: () => void;
};

/** Delete + close — top-right of the content post sheet. */
export function ContentPostSheetHeaderActions({
  showDelete,
  busy,
  deleteLabel,
  closeLabel,
  onDelete,
  onClose,
}: ContentPostSheetHeaderActionsProps) {
  return (
    <>
      {showDelete ? (
        <DeleteActionButton
          ariaLabel={deleteLabel}
          title={deleteLabel}
          disabled={busy}
          onClick={onDelete}
        />
      ) : null}
      <button
        type="button"
        className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
        aria-label={closeLabel}
        onClick={onClose}
        disabled={busy}
      >
        ×
      </button>
    </>
  );
}

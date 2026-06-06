"use client";

import { ADMIN_DETAILS_SHEET_FOOTER_CLASS } from "@/components/admin/admin-details-sheet-layout";
import type { ContentPostRow } from "@/components/shared/content/content-post-types";
import { ContentPostWorkflowActions } from "@/components/shared/content/content-post-workflow-actions";
import { OmmButton } from "@/components/ui/omm-button";

type ContentPostSheetFooterProps = {
  mode: "create" | "edit";
  post: ContentPostRow | null;
  busy: boolean;
  dirty: boolean;
  saveLabel: string;
  cancelLabel: string;
  savingLabel: string;
  deleteLabel: string;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onChanged: () => void;
};

export function ContentPostSheetFooter({
  mode,
  post,
  busy,
  dirty,
  saveLabel,
  cancelLabel,
  savingLabel,
  deleteLabel,
  onSave,
  onCancel,
  onDelete,
  onChanged,
}: ContentPostSheetFooterProps) {
  const showWorkflow = mode === "edit" && post !== null;
  const showDelete = mode === "edit" && post !== null;
  const showSaveActions = dirty || busy || mode === "create";

  return (
    <footer className={`${ADMIN_DETAILS_SHEET_FOOTER_CLASS} shrink-0`}>
      <div className="flex flex-col gap-3">
        {showWorkflow ? (
          <ContentPostWorkflowActions post={post} busy={busy} onChanged={onChanged} />
        ) : null}

        {(showDelete || showSaveActions) ? (
          <div className="flex flex-wrap items-center justify-end gap-3">
            {showDelete ? (
              <OmmButton
                type="button"
                variant="ghost"
                size="md"
                disabled={busy}
                className="mr-auto"
                onClick={onDelete}
              >
                {deleteLabel}
              </OmmButton>
            ) : null}

            {showSaveActions ? (
              <>
                <OmmButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={onCancel}
                  disabled={busy}
                >
                  {cancelLabel}
                </OmmButton>
                <OmmButton
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={onSave}
                  disabled={busy || (!dirty && mode !== "create")}
                >
                  {busy ? savingLabel : saveLabel}
                </OmmButton>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </footer>
  );
}

"use client";

import { ADMIN_DETAILS_SHEET_FOOTER_CLASS } from "@/components/admin/admin-details-sheet-layout";
import type { ContentPostRow } from "@/components/shared/content/content-post-types";
import { ContentPostWorkflowActions, hasContentPostWorkflowActions } from "@/components/shared/content/content-post-workflow-actions";
import { DeleteActionButton } from "@/components/ui/delete-action-button";
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
  canDelete?: boolean;
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
  canDelete = true,
  onSave,
  onCancel,
  onDelete,
  onChanged,
}: ContentPostSheetFooterProps) {
  const showSaveActions = mode === "create" || dirty || busy;
  const showWorkflow =
    mode === "edit" &&
    post !== null &&
    !showSaveActions &&
    hasContentPostWorkflowActions(post);
  const showDelete = mode === "edit" && post !== null && canDelete;

  if (!showDelete && !showSaveActions && !showWorkflow) {
    return null;
  }

  return (
    <footer
      className={`${ADMIN_DETAILS_SHEET_FOOTER_CLASS} flex shrink-0 flex-wrap items-center gap-3`}
    >
      {showDelete ? (
        <DeleteActionButton
          ariaLabel={deleteLabel}
          title={deleteLabel}
          disabled={busy}
          onClick={onDelete}
        />
      ) : null}

      <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
        {showSaveActions ? (
          <>
            <OmmButton type="button" variant="secondary" size="md" onClick={onCancel} disabled={busy}>
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

        {showWorkflow && post !== null ? (
          <ContentPostWorkflowActions post={post} busy={busy} onChanged={onChanged} />
        ) : null}
      </div>
    </footer>
  );
}

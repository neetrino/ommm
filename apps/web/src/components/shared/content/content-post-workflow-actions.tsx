"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ContentPostRow } from "@/components/shared/content/content-post-types";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

export function hasContentPostWorkflowActions(post: ContentPostRow): boolean {
  return (
    post.status === "DRAFT" ||
    post.status === "REJECTED" ||
    post.status === "HIDDEN" ||
    post.status === "IN_REVIEW"
  );
}

type ContentPostWorkflowActionsProps = {
  post: ContentPostRow;
  busy: boolean;
  onChanged: () => void;
};

export function ContentPostWorkflowActions({
  post,
  busy,
  onChanged,
}: ContentPostWorkflowActionsProps) {
  const t = useTranslations("contentAdminPages.content");
  const router = useRouter();
  const [actionBusy, setActionBusy] = useState(false);
  const disabled = busy || actionBusy;

  async function run(action: () => Promise<void>): Promise<void> {
    setActionBusy(true);
    try {
      await action();
      onChanged();
      router.refresh();
    } catch (error) {
      window.alert(error instanceof ApiError ? error.message : t("feedback.actionFailed"));
    } finally {
      setActionBusy(false);
    }
  }

  const showSubmit =
    post.status === "DRAFT" || post.status === "REJECTED" || post.status === "HIDDEN";
  const showReview = post.status === "IN_REVIEW";

  if (!hasContentPostWorkflowActions(post)) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {showSubmit ? (
        <OmmButton
          type="button"
          size="md"
          variant="primary"
          disabled={disabled}
          onClick={() =>
            void run(() =>
              apiFetch(`/content/admin/posts/${post.id}/submit-review`, { method: "POST" }),
            )
          }
        >
          {t("labels.submitReview")}
        </OmmButton>
      ) : null}

      {showReview ? (
        <>
          <OmmButton
            type="button"
            size="md"
            variant="secondary"
            disabled={disabled}
            onClick={() => {
              const note = window.prompt(t("feedback.rejectionNotePrompt"));
              if (!note || note.trim().length === 0) {
                return;
              }
              void run(() =>
                apiFetch(`/content/admin/posts/${post.id}/review`, {
                  method: "POST",
                  body: JSON.stringify({ decision: "REJECT", note }),
                }),
              );
            }}
          >
            {t("labels.reject")}
          </OmmButton>
          <OmmButton
            type="button"
            size="md"
            variant="primary"
            disabled={disabled}
            onClick={() =>
              void run(() =>
                apiFetch(`/content/admin/posts/${post.id}/review`, {
                  method: "POST",
                  body: JSON.stringify({ decision: "APPROVE" }),
                }),
              )
            }
          >
            {t("labels.approve")}
          </OmmButton>
        </>
      ) : null}
    </div>
  );
}

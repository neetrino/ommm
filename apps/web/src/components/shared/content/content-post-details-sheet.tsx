"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AdminDetailSheetFormFooter } from "@/components/admin/admin-detail-sheet-form-footer";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { contentPostStatusBadgeClass } from "@/components/shared/content/content-post-display-helpers";
import { ContentPostFormFields } from "@/components/shared/content/content-post-form-fields";
import { ContentPostWorkflowActions } from "@/components/shared/content/content-post-workflow-actions";
import {
  contentPostFormPayload,
  contentPostFormValuesFromRow,
  emptyContentPostFormValues,
  type ContentPostFormValues,
  type ContentPostRow,
} from "@/components/shared/content/content-post-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { ApiError, apiFetch } from "@/lib/api";

export type ContentPostSheetMode = "create" | "edit";

type ContentPostDetailsSheetProps = {
  mode: ContentPostSheetMode | null;
  post: ContentPostRow | null;
  onClose: () => void;
  onChanged: () => void;
};

export function ContentPostDetailsSheet({
  mode,
  post,
  onClose,
  onChanged,
}: ContentPostDetailsSheetProps) {
  if (mode === null) {
    return null;
  }

  return (
    <ContentPostDetailsSheetInner
      key={mode === "create" ? "create" : post?.id ?? "edit"}
      mode={mode}
      post={post}
      onClose={onClose}
      onChanged={onChanged}
    />
  );
}

function ContentPostDetailsSheetInner({
  mode,
  post,
  onClose,
  onChanged,
}: {
  mode: ContentPostSheetMode;
  post: ContentPostRow | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const t = useTranslations("contentAdminPages.content");
  const router = useRouter();
  const titleId = useId();
  const initialValues = useMemo(
    () => (post !== null ? contentPostFormValuesFromRow(post) : emptyContentPostFormValues()),
    [post],
  );
  const [values, setValues] = useState<ContentPostFormValues>(initialValues);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [notice, setNotice] = useState<{ message: string; tone: "ok" | "err" } | null>(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [initialValues, values],
  );

  const handleClose = useCallback(() => {
    if (busy) {
      return;
    }
    onClose();
  }, [busy, onClose]);

  async function handleSave(): Promise<void> {
    setBusy(true);
    setNotice(null);
    try {
      if (mode === "create") {
        await apiFetch("/content/admin/posts", {
          method: "POST",
          body: JSON.stringify(contentPostFormPayload(values)),
        });
        setNotice({ message: t("feedback.postCreated"), tone: "ok" });
      } else if (post !== null) {
        await apiFetch(`/content/admin/posts/${post.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            ...contentPostFormPayload(values),
            reviewNotes: post.reviewNotes ?? undefined,
          }),
        });
        setNotice({ message: t("feedback.postSaved"), tone: "ok" });
      }
      onChanged();
      router.refresh();
      onClose();
    } catch (error) {
      setNotice({
        message: error instanceof ApiError ? error.message : t("feedback.actionFailed"),
        tone: "err",
      });
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete(): Promise<void> {
    if (post === null) {
      return;
    }
    setBusy(true);
    try {
      await apiFetch(`/content/admin/posts/${post.id}`, { method: "DELETE" });
      onChanged();
      router.refresh();
      onClose();
    } catch (error) {
      setNotice({
        message: error instanceof ApiError ? error.message : t("feedback.actionFailed"),
        tone: "err",
      });
    } finally {
      setBusy(false);
      setPendingDelete(false);
    }
  }

  const sheetTitle =
    mode === "create" ? t("sheetCreateTitle") : (post?.title ?? t("sheetEditTitle"));

  return (
    <>
      <OmmDrawerPortal
        isOpen
        onClose={handleClose}
        closeDisabled={busy}
        backdropAriaLabel={t("modalBackdropClose")}
        ariaLabelledBy={titleId}
        overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
        panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
      >
        <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className={`truncate ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
                {sheetTitle}
              </h2>
              {post !== null ? (
                <span className={`mt-2 inline-flex ${contentPostStatusBadgeClass(post.status)}`}>
                  {t(`statusValues.${post.status}`)}
                </span>
              ) : null}
            </div>
            {mode === "edit" && post !== null ? (
              <OmmButton
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => setPendingDelete(true)}
              >
                {t("labels.delete")}
              </OmmButton>
            ) : null}
          </div>
        </header>

        {mode === "edit" && post !== null ? (
          <ContentPostWorkflowActions post={post} busy={busy} onChanged={onChanged} />
        ) : null}

        <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
          {notice ? (
            <AdminCenterToast
              message={notice.message}
              tone={notice.tone}
              onDismiss={() => setNotice(null)}
            />
          ) : null}
          {post?.reviewNotes ? (
            <p className="mb-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-900">
              {t("labels.review")}: {post.reviewNotes}
            </p>
          ) : null}
          <ContentPostFormFields values={values} disabled={busy} onChange={setValues} />
        </div>

        <AdminDetailSheetFormFooter
          saveLabel={mode === "create" ? t("labels.create") : t("saveButton")}
          cancelLabel={t("cancelButton")}
          savingLabel={t("savingButton")}
          dirty={dirty || mode === "create"}
          busy={busy}
          onSave={() => {
            void handleSave();
          }}
          onCancel={handleClose}
        />
      </OmmDrawerPortal>

      <OmmConfirmDialog
        isOpen={pendingDelete}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmBody", { title: post?.title ?? "" })}
        confirmLabel={busy ? t("savingButton") : t("labels.delete")}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="danger"
        confirmClassName="ommm-btn-lifecycle-action--danger"
        pending={busy}
        onConfirm={() => {
          void confirmDelete();
        }}
        onCancel={() => {
          if (!busy) {
            setPendingDelete(false);
          }
        }}
      />
    </>
  );
}

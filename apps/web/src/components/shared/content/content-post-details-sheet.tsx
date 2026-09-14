"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { ContentPostLocaleFormFields } from "@/components/shared/content/content-post-locale-form-fields";
import {
  CONTENT_POST_SHEET_TITLE_INPUT_CLASS,
  ContentPostLocaleTabBar,
} from "@/components/shared/content/content-post-locale-tab-bar";
import { ContentPostSharedFormFields } from "@/components/shared/content/content-post-shared-form-fields";
import { ContentPostSheetFooter } from "@/components/shared/content/content-post-sheet-footer";
import { ContentPostSheetHeaderActions } from "@/components/shared/content/content-post-sheet-header-actions";
import {
  CONTENT_POST_LOCALE_SWITCHER_ORDER,
  contentPostFormPayload,
  contentPostFormValuesFromRow,
  emptyContentPostFormValues,
  type ContentPostFormValues,
  type ContentPostLocale,
  type ContentPostRow,
} from "@/components/shared/content/content-post-types";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";
import type { ContentCapabilities } from "@/lib/backoffice-capabilities";
import { adminContentCapabilities } from "@/lib/backoffice-capabilities";

export type ContentPostSheetMode = "create" | "edit";

type ContentPostDetailsSheetProps = {
  mode: ContentPostSheetMode | null;
  post: ContentPostRow | null;
  onClose: () => void;
  onChanged: () => void;
  capabilities?: ContentCapabilities;
};

export function ContentPostDetailsSheet({
  mode,
  post,
  onClose,
  onChanged,
  capabilities,
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
      capabilities={capabilities ?? adminContentCapabilities()}
    />
  );
}

function ContentPostDetailsSheetInner({
  mode,
  post,
  onClose,
  onChanged,
  capabilities,
}: {
  mode: ContentPostSheetMode;
  post: ContentPostRow | null;
  onClose: () => void;
  onChanged: () => void;
  capabilities: ContentCapabilities;
}) {
  const t = useTranslations("contentAdminPages.content");
  const router = useRouter();
  const titleId = useId();
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose, {
    openKey: mode === "create" ? "create" : post?.id ?? "edit",
  });
  const isPhone = useMemberHubSheetPhone();
  const showHeaderActions = !isPhone;
  const showFooterDelete =
    isPhone && mode === "edit" && post !== null && capabilities.canDelete;
  const initialValues = useMemo(
    () => (post !== null ? contentPostFormValuesFromRow(post) : emptyContentPostFormValues()),
    [post],
  );
  const [values, setValues] = useState<ContentPostFormValues>(initialValues);
  const [prevInitialValues, setPrevInitialValues] = useState(initialValues);
  if (initialValues !== prevInitialValues) {
    setPrevInitialValues(initialValues);
    setValues(initialValues);
  }
  const [activeLocale, setActiveLocale] = useState<ContentPostLocale>("en");
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [notice, setNotice] = useState<{ message: string; tone: "ok" | "err" } | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [initialValues, values],
  );

  const localeTabs = useMemo(
    () =>
      CONTENT_POST_LOCALE_SWITCHER_ORDER.map((locale) => ({
        value: locale,
        label: t(`localeTabs.${locale}`),
      })),
    [t],
  );

  const activeTitle = values.locales[activeLocale].title;
  const activeSlug = values.locales[activeLocale].slug.trim();
  const canPreviewOnSite =
    values.status === "PUBLISHED" &&
    activeSlug.length > 0 &&
    activeTitle.trim().length > 0;

  const updateActiveLocaleTitle = useCallback(
    (title: string) => {
      setValues((current) => ({
        ...current,
        locales: {
          ...current.locales,
          [activeLocale]: {
            ...current.locales[activeLocale],
            title,
          },
        },
      }));
    },
    [activeLocale],
  );

  const handleClose = useCallback(() => {
    if (busy) {
      return;
    }
    requestClose();
  }, [busy, requestClose]);

  async function handleSave(): Promise<void> {
    setBusy(true);
    setNotice(null);
    let shouldClose = false;
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
      shouldClose = true;
    } catch (error) {
      setNotice({
        message: error instanceof ApiError ? error.message : t("feedback.actionFailed"),
        tone: "err",
      });
    } finally {
      setBusy(false);
    }
    if (shouldClose) {
      requestClose();
    }
  }

  async function confirmDelete(): Promise<void> {
    if (post === null) {
      return;
    }
    setBusy(true);
    let shouldClose = false;
    try {
      await apiFetch(`/content/admin/posts/${post.id}`, { method: "DELETE" });
      onChanged();
      router.refresh();
      shouldClose = true;
    } catch (error) {
      setNotice({
        message: error instanceof ApiError ? error.message : t("feedback.actionFailed"),
        tone: "err",
      });
    } finally {
      setBusy(false);
      setPendingDelete(false);
    }
    if (shouldClose) {
      requestClose();
    }
  }

  return (
    <>
      <AdminSheetPortal
        presentation="drawer"
        isOpen={sheetOpen}
        onClose={handleClose}
        onAfterClose={onAfterClose}
        closeDisabled={busy}
        backdropAriaLabel={t("modalBackdropClose")}
        ariaLabelledBy={titleId}
        drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
        drawerPanelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
      >
        <ContentPostLocaleTabBar
          tabs={localeTabs}
          activeTab={activeLocale}
          onTabChange={setActiveLocale}
          ariaLabel={t("localeTabs.aria")}
          trailing={
            showHeaderActions ? (
              <ContentPostSheetHeaderActions
                showDelete={mode === "edit" && post !== null && capabilities.canDelete}
                busy={busy}
                deleteLabel={t("labels.delete")}
                closeLabel={t("modalCloseAria")}
                onDelete={() => setPendingDelete(true)}
                onClose={handleClose}
              />
            ) : undefined
          }
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="shrink-0">
            <header className={`${ADMIN_DETAILS_SHEET_HEADER_CLASS} border-t-0`}>
              {mode === "create" ? (
                <p className={`mb-2 ${ADMIN_DETAILS_SHEET_LEDE_CLASS}`}>{t("sheetCreateTitle")}</p>
              ) : null}
              <input
                id={titleId}
                className={CONTENT_POST_SHEET_TITLE_INPUT_CLASS}
                value={activeTitle}
                disabled={busy}
                placeholder={t("placeholders.title")}
                onChange={(event) => updateActiveLocaleTitle(event.target.value)}
              />
              {canPreviewOnSite ? (
                <p className="mt-3">
                  <Link
                    href={`/explore/${activeSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-sage-700 underline decoration-sand-500/50 underline-offset-4 transition-colors hover:text-sage-900"
                  >
                    {t("labels.previewOnSite")}
                  </Link>
                </p>
              ) : null}
            </header>

            <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} pt-0`}>
              <ContentPostLocaleFormFields
                values={values}
                activeLocale={activeLocale}
                disabled={busy}
                onChange={setValues}
              />
            </div>
          </div>

          <div className="shrink-0 border-t border-white/60">
            <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} space-y-4`}>
              {notice ? (
                <AdminCenterToast
                  message={notice.message}
                  tone={notice.tone}
                  onDismiss={() => setNotice(null)}
                />
              ) : null}
              {post?.reviewNotes ? (
                <p className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-900">
                  {t("labels.review")}: {post.reviewNotes}
                </p>
              ) : null}
              <ContentPostSharedFormFields
                values={values}
                disabled={busy}
                onChange={setValues}
              />
            </div>
          </div>
        </div>

        <ContentPostSheetFooter
          mode={mode}
          post={post}
          busy={busy}
          dirty={dirty}
          saveLabel={mode === "create" ? t("labels.create") : t("saveButton")}
          cancelLabel={t("cancelButton")}
          savingLabel={t("savingButton")}
          deleteLabel={t("labels.delete")}
          showDelete={showFooterDelete}
          onSave={() => {
            void handleSave();
          }}
          onCancel={handleClose}
          onDelete={() => setPendingDelete(true)}
          onChanged={onChanged}
        />
      </AdminSheetPortal>

      <OmmConfirmDialog
        isOpen={pendingDelete}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmBody", { title: post?.title ?? "" })}
        confirmLabel={busy ? t("savingButton") : t("labels.delete")}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="danger"
        confirmClassName="ommm-btn-lifecycle-action--danger"
        forceCenteredModal
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

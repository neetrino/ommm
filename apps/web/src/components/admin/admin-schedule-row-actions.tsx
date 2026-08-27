"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminScheduleForm } from "@/components/admin/admin-schedule-form";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { adminFormModalPanelClass } from "@/components/admin/admin-mobile-sheet-layout";
import type { AdminScheduleItem } from "@/components/admin/admin-schedule-types";
import {
  ADMIN_ACTION_ICON_CLASS,
  PencilGlyph,
  ToggleOffGlyph,
  ToggleOnGlyph,
  TrashGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AdminRowIconButton, AdminRowIconGroup } from "@/components/ui/admin-row-icon-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

const EDIT_SCHEDULE_QUERY_KEY = "editSchedule";

function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

type AdminScheduleRowActionsProps = {
  item: AdminScheduleItem;
  classTypeOptions: readonly string[];
};

export function AdminScheduleRowActions({
  item,
  classTypeOptions,
}: AdminScheduleRowActionsProps) {
  const t = useTranslations("adminPages.schedule");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const titleId = useId();
  const descId = useId();
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const isOpen = searchParams.get(EDIT_SCHEDULE_QUERY_KEY) === item.id;

  const closeModal = useCallback(() => {
    if (busy) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete(EDIT_SCHEDULE_QUERY_KEY);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [busy, pathname, router, searchParams]);

  function openModal() {
    const params = new URLSearchParams(searchParams.toString());
    params.set(EDIT_SCHEDULE_QUERY_KEY, item.id);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setMessage(null);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const focusable = document.querySelector<HTMLElement>('input[name="className"]');
    focusable?.focus();
  }, [isOpen]);

  async function run(action: () => Promise<void>, okLabel: string) {
    if (busy) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setTone("ok");
      setMessage(okLabel);
      closeModal();
      router.refresh();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("messages.genericError"));
    } finally {
      setBusy(false);
    }
  }

  function onSaved() {
    setTone("ok");
    setMessage(t("messages.updateSuccess"));
    const params = new URLSearchParams(searchParams.toString());
    params.delete(EDIT_SCHEDULE_QUERY_KEY);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    router.refresh();
  }

  async function toggleStatus() {
    await run(
      () =>
        apiFetch(`/schedule/admin/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isActive: !item.isActive }),
        }),
      item.isActive ? t("messages.disabledSuccess") : t("messages.enabledSuccess"),
    );
  }

  async function onDelete() {
    await run(
      () =>
        apiFetch(`/schedule/admin/${item.id}`, {
          method: "DELETE",
        }),
      t("messages.deleteSuccess"),
    );
    setPendingDelete(false);
  }

  const toggleLabel = item.isActive ? t("disableButton") : t("enableButton");

  return (
    <>
      <AdminRowIconGroup>
        <AdminRowIconButton
          ariaLabel={t("editButtonAria")}
          title={t("editButtonAria")}
          onClick={openModal}
          disabled={busy}
        >
          <PencilGlyph className={ADMIN_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
        <AdminRowIconButton
          ariaLabel={toggleLabel}
          title={toggleLabel}
          variant="subtle"
          onClick={() => {
            void toggleStatus();
          }}
          disabled={busy}
        >
          {item.isActive ? (
            <ToggleOffGlyph className={ADMIN_ACTION_ICON_CLASS} />
          ) : (
            <ToggleOnGlyph className={ADMIN_ACTION_ICON_CLASS} />
          )}
        </AdminRowIconButton>
        <AdminRowIconButton
          ariaLabel={t("deleteButtonAria")}
          title={t("deleteButtonAria")}
          variant="danger"
          onClick={() => {
            if (!busy) {
              setPendingDelete(true);
            }
          }}
          disabled={busy}
        >
          <TrashGlyph className={ADMIN_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
      </AdminRowIconGroup>

      <OmmConfirmDialog
        isOpen={pendingDelete}
        title={t("confirmDeleteTitle")}
        description={t("deleteConfirm")}
        confirmLabel={busy ? t("savingEdit") : t("confirmDialogDelete")}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="danger"
        confirmClassName="ommm-btn-lifecycle-action--danger"
        pending={busy}
        onConfirm={() => {
          void onDelete();
        }}
        onCancel={() => {
          if (!busy) {
            setPendingDelete(false);
          }
        }}
      />

      {message ? (
        <div
          role="status"
          className={`fixed bottom-4 right-4 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-20px_rgba(45,40,35,0.4)] backdrop-blur-md ${
            tone === "ok"
              ? "border-mint-200/80 bg-mint-50/95 text-sage-900"
              : "border-red-200/80 bg-red-50/95 text-red-900"
          }`}
        >
          {message}
        </div>
      ) : null}

      <AdminSheetPortal
        presentation="modal"
        isOpen={isOpen}
          onClose={closeModal}
          backdropAriaLabel={t("modalBackdropClose")}
          ariaLabelledBy={titleId}
          ariaDescribedBy={descId}
          closeDisabled={busy}
          modalOverlayClassName="ommm-modal-overlay z-[90] items-center p-3 sm:p-4"
          modalPanelClassName={adminFormModalPanelClass("max-w-2xl p-5 sm:p-6")}
          zIndexClass="z-[90]"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className={adminChrome.panelHeading}>
                  {t("editTitle")}
                </h2>
                <p id={descId} className="ommm-body-muted mt-1 text-sm">
                  {t("editDescription")}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                aria-label={t("modalCloseAria")}
                onClick={closeModal}
                disabled={busy}
              >
                <CloseGlyph className="h-5 w-5" />
              </button>
            </div>

            <AdminScheduleForm
              mode="edit"
              classTypeOptions={classTypeOptions}
              item={item}
              onSaved={onSaved}
              onCancel={closeModal}
            />
          </div>
        </AdminSheetPortal>
    </>
  );
}

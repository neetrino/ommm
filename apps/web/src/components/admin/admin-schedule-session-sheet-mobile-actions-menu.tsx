"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import { MoreVerticalGlyph } from "@/components/ui/admin-action-glyphs";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { ApiError, apiFetch } from "@/lib/api";

const MENU_MIN_WIDTH_PX = 176;
const MENU_MIN_HEIGHT_PX = 120;

const TRIGGER_CLASS =
  "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/80 text-sage-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50";

const MENU_ITEM_CLASS =
  "block w-full px-4 py-2.5 text-left text-sm text-sage-900 transition-colors hover:bg-sand-50/90 disabled:opacity-50";

const MENU_ITEM_DANGER_CLASS =
  "block w-full px-4 py-2.5 text-left text-sm text-red-800 transition-colors hover:bg-red-50/80 disabled:opacity-50";

type PendingConfirm = "cancel" | "activate" | "delete";

type SessionSheetMobileActionsMenuProps = {
  row: AdminScheduleSession;
  disabled: boolean;
  canToggleLifecycle: boolean;
  canDelete: boolean;
  onDuplicate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
  onStatusChanged: (row: AdminScheduleSession) => void;
  onBusyChange: (busy: boolean) => void;
  onStatusMessage: (message: string, tone: "ok" | "err") => void;
};

/** Mobile ⋯ menu for session sheet — duplicate, cancel/activate, delete. */
export function SessionSheetMobileActionsMenu({
  row,
  disabled,
  canToggleLifecycle,
  canDelete,
  onDuplicate,
  onDelete,
  onStatusChanged,
  onBusyChange,
  onStatusMessage,
}: SessionSheetMobileActionsMenuProps) {
  const t = useTranslations("adminPages.classes");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const isCancelled = row.status === "CANCELLED";
  const isDisabled = disabled || busy;
  const menuPosition = useFloatingMenuPosition(
    triggerRef,
    open,
    false,
    MENU_MIN_HEIGHT_PX,
    MENU_MIN_WIDTH_PX,
    "end",
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function onPointerDown(event: MouseEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function openConfirm(kind: PendingConfirm): void {
    if (isDisabled) {
      return;
    }
    setOpen(false);
    setPendingConfirm(kind);
  }

  async function confirmStatusChange(kind: "cancel" | "activate"): Promise<void> {
    if (busy) {
      return;
    }
    const nextStatus = kind === "activate" ? "ACTIVE" : "CANCELLED";
    setBusy(true);
    onBusyChange(true);
    try {
      const updated = await apiFetch<AdminScheduleSession>(
        `/classes/sessions/${row.id}/status`,
        { method: "POST", body: JSON.stringify({ status: nextStatus }) },
      );
      onStatusChanged(updated);
      onStatusMessage(
        nextStatus === "ACTIVE" ? t("messages.activateSuccess") : t("messages.cancelSuccess"),
        "ok",
      );
      setPendingConfirm(null);
    } catch (requestError) {
      onStatusMessage(
        requestError instanceof ApiError ? requestError.message : t("messages.genericError"),
        "err",
      );
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }

  function confirmAction(): void {
    if (pendingConfirm === null || isDisabled) {
      return;
    }
    if (pendingConfirm === "delete") {
      onDelete?.(row);
      setPendingConfirm(null);
      return;
    }
    void confirmStatusChange(pendingConfirm);
  }

  const confirmCopy =
    pendingConfirm === "delete"
      ? {
          title: t("confirmDeleteTitle"),
          description: t("deleteConfirm"),
          confirmLabel: t("confirmDialogDelete"),
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        }
      : pendingConfirm === "activate"
        ? {
            title: t("confirm.activateTitle"),
            description: t("confirm.activateDescription"),
            confirmLabel: t("activateAction"),
            tone: "success" as const,
            confirmClassName: "ommm-btn-lifecycle-action--success",
          }
        : {
            title: t("confirm.cancelTitle"),
            description: t("confirm.cancelDescription"),
            confirmLabel: t("cancelAction"),
            tone: "warm" as const,
            confirmClassName: "ommm-btn-lifecycle-action--warm",
          };

  const menu =
    open && menuPosition !== null && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={t("rowActionsAria")}
            className="fixed z-[120] overflow-hidden rounded-2xl border border-white/70 bg-white/95 py-1 shadow-[0_16px_40px_-24px_rgba(45,40,35,0.35)] backdrop-blur-md"
            data-placement={menuPosition.placement}
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
            }}
          >
            {onDuplicate ? (
              <button
                type="button"
                role="menuitem"
                className={MENU_ITEM_CLASS}
                disabled={isDisabled}
                onClick={() => {
                  setOpen(false);
                  onDuplicate(row);
                }}
              >
                {t("duplicateButton")}
              </button>
            ) : null}
            {canToggleLifecycle ? (
              <button
                type="button"
                role="menuitem"
                className={MENU_ITEM_CLASS}
                disabled={isDisabled}
                onClick={() => openConfirm(isCancelled ? "activate" : "cancel")}
              >
                {isCancelled ? t("activateAction") : t("cancelAction")}
              </button>
            ) : null}
            {canDelete && onDelete ? (
              <button
                type="button"
                role="menuitem"
                className={MENU_ITEM_DANGER_CLASS}
                disabled={isDisabled}
                onClick={() => openConfirm("delete")}
              >
                {t("actions.delete")}
              </button>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={TRIGGER_CLASS}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("rowActionsAria")}
        title={t("rowActionsAria")}
        disabled={isDisabled}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreVerticalGlyph className="h-5 w-5 shrink-0" />
      </button>
      {menu}
      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={isDisabled ? t("savingButton") : confirmCopy.confirmLabel}
        cancelLabel={t("confirmDialogNo")}
        backdropAriaLabel={t("confirmDialogBackdrop")}
        tone={confirmCopy.tone}
        confirmClassName={confirmCopy.confirmClassName}
        pending={isDisabled}
        onConfirm={confirmAction}
        onCancel={() => {
          if (!busy) {
            setPendingConfirm(null);
          }
        }}
      />
    </>
  );
}

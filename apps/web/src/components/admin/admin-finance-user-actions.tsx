"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AdminFinanceNotifyModal } from "@/components/admin/admin-finance-notify-modal";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { ApiError, apiFetch } from "@/lib/api";
import {
  MoreVerticalGlyph,
  PencilGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { AdminRowIconButton, AdminRowIconGroup } from "@/components/ui/admin-row-icon-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

const MENU_MIN_WIDTH = 196;
const MENU_GAP = 4;

type MenuPosition = {
  top: number;
  left: number;
  placement: "top" | "bottom";
};

type Props = {
  row: ClientRow;
  onEdit: () => void;
  onChanged: () => void;
};

function displayName(row: ClientRow): string {
  const merged = [row.name, row.lastName].filter(Boolean).join(" ").trim();
  return merged.length > 0 ? merged : row.email;
}

function canPausePackage(row: ClientRow): boolean {
  if (row.activePackageId === null || row.activePackageStatus === null) {
    return false;
  }
  return (
    row.activePackageStatus === "ACTIVE" || row.activePackageStatus === "PENDING"
  );
}

export function AdminFinanceUserActions({ row, onEdit, onChanged }: Props) {
  const t = useTranslations("adminPages.finance.actions");
  const router = useRouter();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "err" } | null>(null);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [pauseConfirmOpen, setPauseConfirmOpen] = useState(false);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (trigger === null || typeof window === "undefined") {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 120;
    const availableBelow = window.innerHeight - rect.bottom - MENU_GAP;
    const availableAbove = rect.top - MENU_GAP;
    const openAbove = availableBelow < menuHeight && availableAbove > availableBelow;

    setMenuPosition({
      top: openAbove ? rect.top - MENU_GAP : rect.bottom + MENU_GAP,
      left: Math.max(8, rect.right - MENU_MIN_WIDTH),
      placement: openAbove ? "top" : "bottom",
    });
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    updateMenuPosition();
    const rafId = window.requestAnimationFrame(updateMenuPosition);

    function onPointerDown(event: MouseEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setMenuOpen(false);
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, updateMenuPosition]);

  function closeMenu(): void {
    setMenuOpen(false);
  }

  async function confirmPausePackage(): Promise<void> {
    if (busy || row.activePackageId === null) {
      return;
    }
    setBusy(true);
    try {
      await apiFetch(`/packages/admin/${row.activePackageId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "PAUSED" }),
      });
      setPauseConfirmOpen(false);
      setToast({ message: t("packageUpdated"), tone: "ok" });
      onChanged();
      router.refresh();
    } catch (error) {
      setToast({
        message: error instanceof ApiError ? error.message : t("actionFailed"),
        tone: "err",
      });
    } finally {
      setBusy(false);
    }
  }

  function handlePauseClick(): void {
    closeMenu();
    if (!canPausePackage(row)) {
      setToast({ message: t("noActivePackage"), tone: "err" });
      return;
    }
    setPauseConfirmOpen(true);
  }

  function handleNotifyClick(): void {
    closeMenu();
    setNotifyOpen(true);
  }

  function handleRefundClick(): void {
    closeMenu();
    setToast({ message: t("refundUnsupported"), tone: "err" });
  }

  const menu =
    menuOpen && menuPosition && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            className="fixed z-[90] min-w-[12rem] overflow-hidden rounded-2xl border border-white/70 bg-white/95 py-1 shadow-[0_16px_40px_-20px_rgba(45,40,35,0.35)] backdrop-blur-md"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
            }}
          >
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-sm text-sage-800 transition-colors hover:bg-sand-50/90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy || !canPausePackage(row)}
              onClick={handlePauseClick}
            >
              {t("pausePackage")}
            </button>
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-sm text-sage-800 transition-colors hover:bg-sand-50/90"
              disabled={busy}
              onClick={handleNotifyClick}
            >
              {t("sendNotification")}
            </button>
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-sm text-sage-800 transition-colors hover:bg-sand-50/90"
              disabled={busy}
              onClick={handleRefundClick}
            >
              {t("sendRefundRequest")}
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <AdminRowIconGroup>
        <AdminRowIconButton
          ariaLabel={t("edit")}
          title={t("edit")}
          className="ommm-admin-row-icon-button-lg"
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
        >
          <PencilGlyph className="h-5 w-5 shrink-0" />
        </AdminRowIconButton>
        <button
          ref={triggerRef}
          type="button"
          className="ommm-admin-row-icon-button ommm-admin-row-icon-button-lg"
          aria-label={t("openMenu")}
          title={t("openMenu")}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((open) => !open);
          }}
        >
          <MoreVerticalGlyph className="h-5 w-5 shrink-0" />
        </button>
      </AdminRowIconGroup>

      {menu}

      {notifyOpen ? (
        <AdminFinanceNotifyModal
          recipientEmail={row.email}
          recipientName={displayName(row)}
          onClose={() => setNotifyOpen(false)}
        />
      ) : null}

      {toast ? (
        <AdminCenterToast
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      ) : null}

      <OmmConfirmDialog
        isOpen={pauseConfirmOpen}
        title={t("pauseConfirmTitle")}
        description={t("pauseConfirmDescription", { name: displayName(row) })}
        confirmLabel={busy ? t("pausing") : t("pausePackage")}
        cancelLabel={t("closeModal")}
        backdropAriaLabel={t("closeModal")}
        tone="warm"
        pending={busy}
        onConfirm={() => {
          void confirmPausePackage();
        }}
        onCancel={() => {
          if (!busy) {
            setPauseConfirmOpen(false);
          }
        }}
      />
    </>
  );
}

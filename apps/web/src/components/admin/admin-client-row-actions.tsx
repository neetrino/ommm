"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { MoreVerticalGlyph } from "@/components/ui/admin-action-glyphs";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";

const MENU_MIN_WIDTH_PX = 176;
const MENU_MIN_HEIGHT_PX = 88;

const TRIGGER_CLASS =
  "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/80 text-sage-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50";

const MENU_ITEM_CLASS =
  "block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-sand-50/90";

const RESET_PASSWORD_MENU_ITEM_CLASS =
  "block w-full px-4 py-2.5 text-left text-sm text-sage-900 transition-colors hover:bg-[color-mix(in_srgb,var(--ommm-admin-olive)_14%,white)] hover:text-sage-900";

type PendingConfirm = "activate" | "deactivate" | "resetPassword";

type AdminClientRowActionsProps = {
  client: ClientRow;
  onChanged: () => void;
};

export function AdminClientRowActions({ client, onChanged }: AdminClientRowActionsProps) {
  const t = useTranslations("adminPages.clients");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const isActive = !(client.isBlocked ?? false);
  const statusLabel = isActive ? t("deactivateClient") : t("activateClient");
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

    function onPointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
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

  function openStatusConfirm(): void {
    if (busy) {
      return;
    }
    setOpen(false);
    setPendingConfirm(isActive ? "deactivate" : "activate");
  }

  function openResetPasswordConfirm(): void {
    if (busy) {
      return;
    }
    setOpen(false);
    setPendingConfirm("resetPassword");
  }

  function closeConfirm(): void {
    if (busy) {
      return;
    }
    setPendingConfirm(null);
  }

  async function confirmStatusChange(): Promise<void> {
    if (busy || pendingConfirm === null || pendingConfirm === "resetPassword") {
      return;
    }

    const nextIsActive = pendingConfirm === "activate";
    setBusy(true);
    setMessage(null);

    try {
      await apiFetch(`/clients/${client.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked: !nextIsActive }),
      });
      setTone("ok");
      setMessage(nextIsActive ? t("activateSuccess") : t("deactivateSuccess"));
      setPendingConfirm(null);
      onChanged();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
    }
  }

  async function confirmResetPassword(): Promise<void> {
    if (busy || pendingConfirm !== "resetPassword") {
      return;
    }

    const email = client.email.trim().toLowerCase();
    if (email === "") {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      await apiFetch<{ ok: boolean }>("/auth/request-password-reset", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setTone("ok");
      setMessage(t("resetPasswordSuccess"));
      setPendingConfirm(null);
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("resetPasswordFailed"));
    } finally {
      setBusy(false);
    }
  }

  const confirmCopy =
    pendingConfirm === "resetPassword"
      ? {
          title: t("resetPassword"),
          description: t("confirmResetPassword", { email: client.email.trim() }),
          confirmLabel: t("resetPassword"),
          tone: "default" as const,
          confirmClassName: undefined as string | undefined,
          onConfirm: confirmResetPassword,
        }
      : pendingConfirm === "deactivate"
        ? {
            title: t("deactivateClient"),
            description: t("confirmDeactivate"),
            confirmLabel: t("deactivateClient"),
            tone: "danger" as const,
            confirmClassName: "ommm-btn-lifecycle-action--danger",
            onConfirm: confirmStatusChange,
          }
        : {
            title: t("activateClient"),
            description: t("confirmActivate"),
            confirmLabel: t("activateClient"),
            tone: "success" as const,
            confirmClassName: "ommm-btn-lifecycle-action--success",
            onConfirm: confirmStatusChange,
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
            <button
              type="button"
              role="menuitem"
              className={RESET_PASSWORD_MENU_ITEM_CLASS}
              disabled={busy}
              onClick={openResetPasswordConfirm}
            >
              {t("resetPassword")}
            </button>
            <button
              type="button"
              role="menuitem"
              className={`${MENU_ITEM_CLASS} ${
                isActive ? "text-red-800 hover:bg-red-50/80" : "text-sage-800"
              }`}
              disabled={busy}
              onClick={openStatusConfirm}
            >
              {statusLabel}
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="flex items-center justify-center" role="group" aria-label={t("colActions")}>
        <button
          ref={triggerRef}
          type="button"
          className={TRIGGER_CLASS}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={t("rowActionsAria")}
          title={t("rowActionsAria")}
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((value) => !value);
          }}
        >
          <MoreVerticalGlyph className="h-5 w-5 shrink-0" />
        </button>
      </div>

      {menu}

      {message ? (
        <AdminCenterToast message={message} tone={tone} onDismiss={() => setMessage(null)} />
      ) : null}

      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={
          busy
            ? pendingConfirm === "resetPassword"
              ? t("resetPasswordSending")
              : t("savingButton")
            : confirmCopy.confirmLabel
        }
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone={confirmCopy.tone}
        confirmClassName={confirmCopy.confirmClassName}
        pending={busy}
        onConfirm={() => {
          void confirmCopy.onConfirm();
        }}
        onCancel={closeConfirm}
      />
    </>
  );
}

"use client";

import { useState, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { AdminManagerDirectoryRow } from "@/components/admin/admin-managers-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";

const TOGGLE_BUTTON_CLASS =
  "inline-flex shrink-0 items-center justify-center rounded-full p-0 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50";

type PendingConfirm = "block" | "unblock";

type AdminManagerRowActionsProps = {
  manager: AdminManagerDirectoryRow;
  onChanged: () => void;
  onPatched?: (patch: Pick<AdminManagerDirectoryRow, "isBlocked">) => void;
};

export function AdminManagerRowActions({
  manager,
  onChanged,
  onPatched,
}: AdminManagerRowActionsProps) {
  const t = useTranslations("adminPages.managers");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const isActive = !manager.isBlocked;
  const toggleLabel = isActive ? t("blockManager") : t("unblockManager");
  const disabled = busy || manager.isSelf;

  function openConfirm(): void {
    if (disabled) {
      if (manager.isSelf) {
        setTone("err");
        setMessage(t("cannotChangeOwnStatus"));
      }
      return;
    }
    setPendingConfirm(isActive ? "block" : "unblock");
  }

  async function confirmStatusChange(): Promise<void> {
    if (busy || pendingConfirm === null) {
      return;
    }
    const nextBlocked = pendingConfirm === "block";
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/managers/${manager.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked: nextBlocked }),
      });
      setTone("ok");
      setMessage(nextBlocked ? t("blockSuccess") : t("unblockSuccess"));
      setPendingConfirm(null);
      onPatched?.({ isBlocked: nextBlocked });
      onChanged();
      router.refresh();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
    }
  }

  const confirmCopy =
    pendingConfirm === "block"
      ? {
          title: t("blockManager"),
          description: t("confirmBlock"),
          confirmLabel: t("blockManager"),
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        }
      : {
          title: t("unblockManager"),
          description: t("confirmUnblock"),
          confirmLabel: t("unblockManager"),
          tone: "success" as const,
          confirmClassName: "ommm-btn-lifecycle-action--success",
        };

  return (
    <>
      <div className="flex items-center justify-center gap-2" role="group" aria-label={t("colActions")}>
        <button
          type="button"
          className={TOGGLE_BUTTON_CLASS}
          aria-label={toggleLabel}
          title={toggleLabel}
          disabled={disabled}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            openConfirm();
          }}
        >
          <AnimatedToggleSwitch checked={isActive} className="ommm-toggle-switch-board" />
        </button>
      </div>
      {message ? (
        <AdminCenterToast
          message={message}
          tone={tone}
          onDismiss={() => setMessage(null)}
        />
      ) : null}
      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={busy ? t("savingButton") : confirmCopy.confirmLabel}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone={confirmCopy.tone}
        confirmClassName={confirmCopy.confirmClassName}
        pending={busy}
        onConfirm={() => {
          void confirmStatusChange();
        }}
        onCancel={() => {
          if (!busy) {
            setPendingConfirm(null);
          }
        }}
      />
    </>
  );
}

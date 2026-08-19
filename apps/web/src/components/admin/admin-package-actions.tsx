"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

type AdminPackageActionsProps = {
  packageId: string;
  isActive: boolean;
};

export function AdminPackageActions({ packageId, isActive }: AdminPackageActionsProps) {
  const t = useTranslations("adminPages.packages");
  const [pending, setPending] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  async function updateStatus(nextActive: boolean) {
    if (pending) {
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      await apiFetch(`/packages/plans/${packageId}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextActive }),
      });
      setTone("ok");
      setMessage(nextActive ? t("messages.enabledSuccess") : t("messages.disabledSuccess"));
      window.location.reload();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setPending(false);
    }
  }

  async function removePackage() {
    if (pending) {
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      await apiFetch(`/packages/plans/${packageId}`, { method: "DELETE" });
      setTone("ok");
      setMessage(t("messages.deleteSuccess"));
      window.location.reload();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setPending(false);
      setPendingDelete(false);
    }
  }

  return (
    <div className="flex min-w-[12rem] flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <OmmButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            void updateStatus(!isActive);
          }}
          disabled={pending}
        >
          {isActive ? t("disableButton") : t("enableButton")}
        </OmmButton>
        <OmmButton
          type="button"
          variant="danger"
          size="sm"
          onClick={() => {
            if (!pending) {
              setPendingDelete(true);
            }
          }}
          disabled={pending}
        >
          {t("deleteButton")}
        </OmmButton>
      </div>
      {message !== null ? (
        <p className={`text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}>{message}</p>
      ) : null}

      <OmmConfirmDialog
        isOpen={pendingDelete}
        title={t("deletePackageTitle")}
        description={t("deleteConfirm")}
        confirmLabel={pending ? t("savingButton") : t("deleteButton")}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="danger"
        confirmClassName="ommm-btn-lifecycle-action--danger"
        pending={pending}
        onConfirm={() => {
          void removePackage();
        }}
        onCancel={() => {
          if (!pending) {
            setPendingDelete(false);
          }
        }}
      />
    </div>
  );
}

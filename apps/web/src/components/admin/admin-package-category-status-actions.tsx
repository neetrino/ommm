"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePublicPackages } from "@/lib/revalidate-public-packages";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

type CategoryStatusResponse = {
  categorySlug: string;
  isActive: boolean;
  plans: AdminPackageRow[];
};

type PendingConfirm = "enable" | "disable";

type AdminPackageCategoryStatusActionsProps = {
  categorySlug: string;
  isActive: boolean;
  disabled?: boolean;
  onUpdated: (plans: readonly AdminPackageRow[]) => void;
};

export function AdminPackageCategoryStatusActions({
  categorySlug,
  isActive,
  disabled = false,
  onUpdated,
}: AdminPackageCategoryStatusActionsProps) {
  const t = useTranslations("adminPages.packages");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const toggleLabel = isActive ? t("disableCategoryButton") : t("enableCategoryButton");

  function openConfirm(): void {
    if (busy || disabled) {
      return;
    }
    setPendingConfirm(isActive ? "disable" : "enable");
  }

  function closeConfirm(): void {
    if (busy) {
      return;
    }
    setPendingConfirm(null);
  }

  async function confirmStatusChange(): Promise<void> {
    if (busy || pendingConfirm === null) {
      return;
    }

    const nextIsActive = pendingConfirm === "enable";
    setBusy(true);
    setMessage(null);

    try {
      const saved = await apiFetch<CategoryStatusResponse>(
        "/packages/admin/categories/status",
        {
          method: "PATCH",
          body: JSON.stringify({ categorySlug, isActive: nextIsActive }),
        },
      );
      onUpdated(saved.plans);
      await revalidatePublicPackages();
      setTone("ok");
      setMessage(
        nextIsActive ? t("messages.categoryEnabledSuccess") : t("messages.categoryDisabledSuccess"),
      );
      setPendingConfirm(null);
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
    }
  }

  const confirmCopy =
    pendingConfirm === "disable"
      ? {
          title: t("disableCategoryButton"),
          description: t("confirmDisableCategory"),
          confirmLabel: t("disableCategoryButton"),
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        }
      : {
          title: t("enableCategoryButton"),
          description: t("confirmEnableCategory"),
          confirmLabel: t("enableCategoryButton"),
          tone: "success" as const,
          confirmClassName: "ommm-btn-lifecycle-action--success",
        };

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#464646] transition-colors hover:bg-white/60 hover:text-sand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={toggleLabel}
        title={toggleLabel}
        disabled={busy || disabled}
        onClick={(event) => {
          event.stopPropagation();
          openConfirm();
        }}
      >
        <AnimatedToggleSwitch checked={isActive} />
      </button>

      {message ? (
        <AdminCenterToast message={message} tone={tone} onDismiss={() => setMessage(null)} />
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
        onCancel={closeConfirm}
      />
    </>
  );
}

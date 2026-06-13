"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

const DELETE_PACKAGE_CONFIRM_CLASS = "ommm-btn-lifecycle-action--danger";

type AdminPackageDeleteModalProps = {
  isOpen: boolean;
  packageId: string;
  packageName: string;
  onClose: () => void;
  onDeleted: (packageId: string) => void;
};

export function AdminPackageDeleteModal({
  isOpen,
  packageId,
  packageName,
  onClose,
  onDeleted,
}: AdminPackageDeleteModalProps) {
  const t = useTranslations("adminPages.packages");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const trimmedName = packageName.trim();

  async function onConfirm(): Promise<void> {
    if (pending) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await apiFetch(`/packages/plans/${packageId}`, { method: "DELETE" });
      onDeleted(packageId);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("genericError"));
    } finally {
      setPending(false);
    }
  }

  function handleCancel(): void {
    if (pending) {
      return;
    }
    setError(null);
    onClose();
  }

  return (
    <OmmConfirmDialog
      isOpen={isOpen}
      title={t("deletePackageTitle")}
      description={t("deletePackageDescription", { name: trimmedName })}
      confirmLabel={pending ? t("deletingButton") : t("deletePackageConfirmButton")}
      cancelLabel={t("cancelButton")}
      backdropAriaLabel={t("modalBackdropClose")}
      tone="danger"
      confirmClassName={DELETE_PACKAGE_CONFIRM_CLASS}
      pending={pending}
      onConfirm={() => void onConfirm()}
      onCancel={handleCancel}
    >
      <p className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900">
        {t("deletePackageWarning")}
      </p>
      {error !== null ? (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
    </OmmConfirmDialog>
  );
}

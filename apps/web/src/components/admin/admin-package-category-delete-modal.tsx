"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePublicPackages } from "@/lib/revalidate-public-packages";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

const DELETE_CATEGORY_CONFIRM_CLASS = "ommm-btn-lifecycle-action--danger";

type AdminPackageCategoryDeleteModalProps = {
  isOpen: boolean;
  categoryName: string;
  packages: readonly AdminPackageRow[];
  onClose: () => void;
  onDeleted: (categoryName: string, deletedPackageIds: readonly string[]) => void;
};

export function AdminPackageCategoryDeleteModal({
  isOpen,
  categoryName,
  packages,
  onClose,
  onDeleted,
}: AdminPackageCategoryDeleteModalProps) {
  const t = useTranslations("adminPages.packages");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const trimmedName = categoryName.trim();
  const categoryKey = normalizePackageCategoryKey(trimmedName);
  const categoryPackages = packages.filter(
    (pkg) => normalizePackageCategoryKey(pkg.categoryName) === categoryKey,
  );

  async function onConfirm(): Promise<void> {
    if (pending || trimmedName.length === 0) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await apiFetch<{ deletedIds: string[] }>("/packages/admin/categories", {
        method: "DELETE",
        body: JSON.stringify({ categoryName: trimmedName }),
      });
      onDeleted(trimmedName, result.deletedIds);
      await revalidatePublicPackages();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("genericError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <OmmConfirmDialog
      isOpen={isOpen}
      title={t("deleteCategoryTitle")}
      description={t("deleteCategoryDescription", { name: trimmedName })}
      confirmLabel={pending ? t("deletingButton") : t("deleteCategoryConfirmButton")}
      cancelLabel={t("cancelButton")}
      backdropAriaLabel={t("modalBackdropClose")}
      tone="danger"
      confirmClassName={DELETE_CATEGORY_CONFIRM_CLASS}
      pending={pending}
      onConfirm={() => void onConfirm()}
      onCancel={onClose}
    >
      <p className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900">
        {categoryPackages.length > 0
          ? t("deleteCategoryWarning", { count: categoryPackages.length })
          : t("deleteCategoryWarningEmpty")}
      </p>
      {error !== null ? (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
    </OmmConfirmDialog>
  );
}

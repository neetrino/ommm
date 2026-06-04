"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";

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
  const titleId = useId();
  const descId = useId();
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
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("genericError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      dialogRole="alertdialog"
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
      closeDisabled={pending}
      backdropAriaLabel={t("modalBackdropClose")}
      overlayClassName="ommm-modal-overlay z-[110] p-4"
      panelClassName="w-full max-w-md rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
            {t("deleteCategoryTitle")}
          </h2>
          <p id={descId} className="text-sm leading-relaxed text-sage-700">
            {t("deleteCategoryDescription", { name: trimmedName })}
          </p>
        </div>
        <p className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900">
          {categoryPackages.length > 0
            ? t("deleteCategoryWarning", { count: categoryPackages.length })
            : t("deleteCategoryWarningEmpty")}
        </p>
        {error !== null ? (
          <p className="text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <OmmButton type="button" variant="secondary" size="md" onClick={onClose} disabled={pending}>
            {t("cancelButton")}
          </OmmButton>
          <OmmButton
            type="button"
            variant="danger"
            size="md"
            onClick={() => void onConfirm()}
            disabled={pending}
          >
            {pending ? t("deletingButton") : t("deleteCategoryConfirmButton")}
          </OmmButton>
        </div>
      </div>
    </OmmModalPortal>
  );
}

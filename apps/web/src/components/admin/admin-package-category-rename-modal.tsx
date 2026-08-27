"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePublicPackages } from "@/lib/revalidate-public-packages";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { OmmButton } from "@/components/ui/omm-button";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { ADMIN_MODAL_PANEL_SHELL_CLASS } from "@/components/admin/admin-mobile-sheet-layout";
import { MAX_CATEGORY_NAME_LENGTH } from "@/components/admin/admin-package-form-utils";
import { normalizePackageCategoryLabel } from "@/components/admin/package-category-utils";
import { packagesInCategory } from "@/components/admin/admin-packages-categories";

type AdminPackageCategoryRenameModalProps = {
  isOpen: boolean;
  categorySlug: string;
  categoryName: string;
  packages: readonly AdminPackageRow[];
  onClose: () => void;
  onRenamed: (
    categorySlug: string,
    fromName: string,
    toName: string,
    updated: readonly AdminPackageRow[],
  ) => void;
};

export function AdminPackageCategoryRenameModal({
  isOpen,
  categorySlug,
  categoryName,
  packages,
  onClose,
  onRenamed,
}: AdminPackageCategoryRenameModalProps) {
  const t = useTranslations("adminPages.packages");
  const titleId = useId();
  const [nextName, setNextName] = useState(categoryName);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const categoryPackages = packagesInCategory(packages, categorySlug);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = normalizePackageCategoryLabel(nextName);
    if (trimmed.length === 0) {
      setError(t("categoryRequired"));
      return;
    }
    if (trimmed.length > MAX_CATEGORY_NAME_LENGTH) {
      setError(t("categoryTooLong"));
      return;
    }
    if (trimmed === normalizePackageCategoryLabel(categoryName)) {
      onClose();
      return;
    }
    setPending(true);
    setError(null);
    try {
      const updated: AdminPackageRow[] = [];
      for (const pkg of categoryPackages) {
        const saved = await apiFetch<AdminPackageRow>(`/packages/plans/${pkg.id}`, {
          method: "PATCH",
          body: JSON.stringify({ categoryName: trimmed }),
        });
        updated.push(saved);
      }
      onRenamed(categorySlug, categoryName.trim(), trimmed, updated);
      await revalidatePublicPackages();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("genericError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <AdminSheetPortal presentation="modal"
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      modalOverlayClassName="ommm-modal-overlay z-[110]"
      modalPanelClassName={`${ADMIN_MODAL_PANEL_SHELL_CLASS} max-w-md p-6`}
      zIndexClass="z-[110]"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
      <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4">
        <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
          {t("renameCategoryTitle")}
        </h2>
        <p className="text-sm text-sage-600">
          {categoryPackages.length > 0
            ? t("editCategoryDescription", { count: categoryPackages.length })
            : t("editCategoryDescriptionEmpty")}
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldCategory")}</span>
          <input
            className="ommm-input"
            value={nextName}
            maxLength={MAX_CATEGORY_NAME_LENGTH}
            onChange={(event) => setNextName(event.target.value)}
            required
            disabled={pending}
            aria-labelledby={titleId}
          />
        </label>
        {error !== null ? (
          <p className="text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3">
          <OmmButton type="button" variant="secondary" size="md" onClick={onClose} disabled={pending}>
            {t("cancelButton")}
          </OmmButton>
          <OmmButton type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? t("savingButton") : t("saveButton")}
          </OmmButton>
        </div>
      </form>
      </div>
    </AdminSheetPortal>
  );
}

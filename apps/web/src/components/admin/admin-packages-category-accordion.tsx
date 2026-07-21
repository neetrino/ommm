"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAccordionPanel } from "@/components/admin/admin-accordion-panel";
import { AdminPackageCategoryStatusActions } from "@/components/admin/admin-package-category-status-actions";
import { AdminPackagesCategoryTable } from "@/components/admin/admin-packages-category-table";
import type { AdminPackagesCategoryOption } from "@/components/admin/admin-packages-category-multi-select";
import {
  isPackageCategoryActive,
  packagesInCategory,
} from "@/components/admin/admin-packages-categories";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";

export type AdminPackagesCategoryAccordionProps = {
  category: AdminPackagesCategoryOption;
  packages: readonly AdminPackageRow[];
  locale: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditCategory: () => void;
  onDeleteCategory?: () => void;
  onEditPackage: (packageId: string) => void;
  onAddTier?: () => void;
  onDeletePackage?: (packageId: string) => void;
  onPackageStatusUpdated: (saved: AdminPackageRow) => void;
  onCategoryPlansUpdated: (plans: readonly AdminPackageRow[]) => void;
};

export function AdminPackagesCategoryAccordion({
  category,
  packages,
  locale,
  open,
  onOpenChange,
  onEditCategory,
  onDeleteCategory,
  onEditPackage,
  onAddTier,
  onDeletePackage,
  onPackageStatusUpdated,
  onCategoryPlansUpdated,
}: AdminPackagesCategoryAccordionProps) {
  const t = useTranslations("adminPages.packages");

  const categoryPackages = useMemo(
    () => packagesInCategory(packages, category.id),
    [category.id, packages],
  );

  const categoryIsActive = useMemo(
    () => isPackageCategoryActive(packages, category.id),
    [category.id, packages],
  );

  const configuredPackages = useMemo(
    () => categoryPackages.filter((pkg) => pkg.priceCents > 0),
    [categoryPackages],
  );

  const body =
    categoryPackages.length > 0 ? (
      <AdminPackagesCategoryTable
        packages={configuredPackages}
        locale={locale}
        onAddTier={onAddTier}
        onEditPackage={onEditPackage}
        onDeletePackage={onDeletePackage}
        onPackageStatusUpdated={onPackageStatusUpdated}
      />
    ) : undefined;

  return (
    <AdminAccordionPanel
      title={category.label}
      statusControl={
        <AdminPackageCategoryStatusActions
          categorySlug={category.id}
          isActive={categoryIsActive}
          disabled={categoryPackages.length === 0}
          onUpdated={onCategoryPlansUpdated}
        />
      }
      editLabel={t("editCategory")}
      deleteLabel={onDeleteCategory ? t("deleteCategoryButton") : undefined}
      onEdit={onEditCategory}
      onDelete={onDeleteCategory}
      open={open}
      onOpenChange={onOpenChange}
      contentVariant="table"
      emptyLabel={categoryPackages.length === 0 ? t("categoryEmpty") : undefined}
    >
      {body}
    </AdminAccordionPanel>
  );
}

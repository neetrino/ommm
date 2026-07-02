"use client";

import { AdminPackageCategoryDeleteModal } from "@/components/admin/admin-package-category-delete-modal";
import { AdminPackageDeleteModal } from "@/components/admin/admin-package-delete-modal";
import { AdminPackageCategoryRenameModal } from "@/components/admin/admin-package-category-rename-modal";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import type { AdminClassTypeRow } from "@/components/admin/admin-types-management";
import { AdminTypesModal } from "@/components/admin/admin-types-modal";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";

type AdminPackagesManagementModalsProps = {
  locale: string;
  classTypes: readonly AdminClassTypeRow[];
  packageRows: readonly AdminPackageRow[];
  isTypesModalOpen: boolean;
  isEditCategoryOpen: boolean;
  editingCategorySlug: string | null;
  editingCategoryName: string;
  isDeleteCategoryOpen: boolean;
  deletingCategorySlug: string;
  deletingCategoryName: string;
  isDeletePackageOpen: boolean;
  deletingPackage: AdminPackageRow | null;
  toastMessage: string | null;
  onCloseTypesModal: () => void;
  onTypesChanged: (nextTypes: readonly AdminClassTypeRow[]) => void;
  onCloseEditCategory: () => void;
  onCategoryRenamed: (
    categorySlug: string,
    fromName: string,
    toName: string,
    updated: readonly AdminPackageRow[],
  ) => void;
  onCloseDeleteCategory: () => void;
  onCategoryDeleted: (categorySlug: string, deletedPackageIds: readonly string[]) => void;
  onCloseDeletePackage: () => void;
  onPackageDeleted: (packageId: string) => void;
  onDismissToast: () => void;
};

export function AdminPackagesManagementModals({
  locale,
  classTypes,
  packageRows,
  isTypesModalOpen,
  isEditCategoryOpen,
  editingCategorySlug,
  editingCategoryName,
  isDeleteCategoryOpen,
  deletingCategorySlug,
  deletingCategoryName,
  isDeletePackageOpen,
  deletingPackage,
  toastMessage,
  onCloseTypesModal,
  onTypesChanged,
  onCloseEditCategory,
  onCategoryRenamed,
  onCloseDeleteCategory,
  onCategoryDeleted,
  onCloseDeletePackage,
  onPackageDeleted,
  onDismissToast,
}: AdminPackagesManagementModalsProps) {
  return (
    <>
      <AdminTypesModal
        isOpen={isTypesModalOpen}
        initialTypes={classTypes}
        onClose={onCloseTypesModal}
        onTypesChanged={onTypesChanged}
      />
      <AdminPackageCategoryRenameModal
        key={editingCategorySlug ? `rename-category-${editingCategorySlug}` : "rename-category-closed"}
        isOpen={isEditCategoryOpen}
        categorySlug={editingCategorySlug ?? ""}
        categoryName={editingCategoryName}
        packages={packageRows}
        onClose={onCloseEditCategory}
        onRenamed={onCategoryRenamed}
      />
      <AdminPackageCategoryDeleteModal
        key={deletingCategorySlug ? `delete-category-${deletingCategorySlug}` : "delete-category-closed"}
        isOpen={isDeleteCategoryOpen}
        categorySlug={deletingCategorySlug}
        categoryName={deletingCategoryName}
        packages={packageRows}
        onClose={onCloseDeleteCategory}
        onDeleted={onCategoryDeleted}
      />
      <AdminPackageDeleteModal
        key={deletingPackage ? `delete-package-${deletingPackage.id}` : "delete-package-closed"}
        isOpen={isDeletePackageOpen}
        packageId={deletingPackage?.id ?? ""}
        packageName={
          deletingPackage
            ? formatPackagePlanName(deletingPackage.name, deletingPackage.sessionsPerMonth)
            : ""
        }
        locale={locale}
        onClose={onCloseDeletePackage}
        onDeleted={onPackageDeleted}
      />
      <AdminCenterToast message={toastMessage} tone="ok" onDismiss={onDismissToast} />
    </>
  );
}

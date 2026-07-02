"use client";

import { AdminPackagesCategoryList } from "@/components/admin/admin-packages-category-list";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminPackagesManagementModals } from "@/components/admin/admin-packages-management-modals";
import { useAdminPackagesFilterSync } from "@/components/admin/use-admin-packages-filter-sync";
import { useAdminPackagesModalUrl } from "@/components/admin/use-admin-packages-modal-url";
import { useAdminPackagesCategoryDisplay } from "@/components/admin/use-admin-packages-category-display";
import { useAdminPackagesRowHandlers } from "@/components/admin/use-admin-packages-row-handlers";
import type { AdminClassTypeRow } from "@/components/admin/admin-types-management";
import { AdminPackagesCategoryDropdown } from "@/components/admin/admin-packages-category-dropdown";
import {
  buildPackageCategoryOptions,
} from "@/components/admin/admin-packages-categories";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { AdminPackagesShell } from "@/components/admin/admin-packages-shell";
import { AdminPackagesFilters } from "@/components/admin/admin-packages-filters";
import {
  filterPackages,
  sortPackages,
} from "@/components/admin/admin-packages-filter-logic";
import {
  type AdminPackageRow,
  mergeAdminPackageRowsFromServer,
  normalizeAdminPackageRow,
  type PackageFilterValues,
} from "@/components/admin/admin-packages-types";
import { OmmButton } from "@/components/ui/omm-button";
import { PlusIcon } from "@/components/ui/plus-icon";

type AdminPackagesManagementProps = {
  packages: readonly AdminPackageRow[];
  initialClassTypes: readonly AdminClassTypeRow[];
  locale: string;
  initialFilters: PackageFilterValues;
};

export function AdminPackagesManagement({
  packages: packagesFromServer,
  initialClassTypes,
  locale,
  initialFilters,
}: AdminPackagesManagementProps) {
  const t = useTranslations("adminPages.packages");
  const [classTypes, setClassTypes] = useState<readonly AdminClassTypeRow[]>(initialClassTypes);
  const [prevInitialClassTypes, setPrevInitialClassTypes] = useState(initialClassTypes);
  const classTypeOptions = useMemo(
    () => classTypes.map((type) => ({ id: type.id, name: type.name })),
    [classTypes],
  );
  const [packageRows, setPackageRows] = useState<readonly AdminPackageRow[]>(() =>
    packagesFromServer.map(normalizeAdminPackageRow),
  );
  const [prevPackagesFromServer, setPrevPackagesFromServer] =
    useState(packagesFromServer);
  const { filterValues, searchDraft, updatePackageFilter, resetPackageFilters } =
    useAdminPackagesFilterSync({ initialFilters });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (prevInitialClassTypes !== initialClassTypes) {
    setPrevInitialClassTypes(initialClassTypes);
    setClassTypes(initialClassTypes);
  }

  if (packagesFromServer !== prevPackagesFromServer) {
    setPrevPackagesFromServer(packagesFromServer);
    setPackageRows((current) =>
      mergeAdminPackageRowsFromServer(
        current,
        packagesFromServer.map(normalizeAdminPackageRow),
      ),
    );
  }

  const sortedPackages = useMemo(
    () => [...packageRows].sort((left, right) => left.displayOrder - right.displayOrder),
    [packageRows],
  );

  const filteredPackages = useMemo(
    () => sortPackages(filterPackages(sortedPackages, filterValues), filterValues.order),
    [filterValues, sortedPackages],
  );

  const categoryOptions = useMemo(
    () => buildPackageCategoryOptions(sortedPackages),
    [sortedPackages],
  );

  const {
    openEditTier,
    openAddTier,
    closeDeletePackage,
    openDeletePackage,
    openAddModal,
    isTypesModalOpen,
    openTypesModal,
    closeTypesModal,
    openEditCategory,
    closeEditCategory,
    openDeleteCategory,
    closeDeleteCategory,
  } = useAdminPackagesModalUrl({
    packageRows,
    sortedPackages,
    setSelectedCategoryIds: () => {},
    setExpandedCategoryKeys: () => {},
  });

  const categoryDisplay = useAdminPackagesCategoryDisplay({
    sortedPackages,
    filteredPackages,
    filterValues,
    categoryOptions,
    packageRows,
    closeDeletePackage,
  });

  const {
    selectedCategoryIds,
    setSelectedCategoryIds,
    expandedCategoryKeys,
    setExpandedCategoryKeys,
    editingCategorySlug,
    isEditCategoryOpen,
    editingCategory,
    isDeleteCategoryOpen,
    deletingCategory,
    isDeletePackageOpen,
    deletingPackage,
    visibleCategories,
    displayCategories,
    categoryListPageClamped,
    pagedDisplayCategories,
    syncCategoryListPage,
    defaultCategoryId,
  } = categoryDisplay;

  const {
    handlePackageCreated,
    handlePackageUpdated,
    handleCategoryPlansUpdated,
    handlePackageDeleted,
    handleCategoryRenamed,
    handleCategoryDeleted,
    handleClassTypesChanged,
  } = useAdminPackagesRowHandlers({
    setPackageRows,
    setSelectedCategoryIds,
    setExpandedCategoryKeys,
    setClassTypes,
    setToastMessage,
    closeDeletePackage,
    deleteSuccessMessage: t("messages.deleteSuccess"),
    categoryDeleteSuccessMessage: t("messages.categoryDeleteSuccess"),
  });

  return (
    <div className="space-y-5">
      <AdminPageHero
        title={t("title")}
        search={
          <AdminPackagesFilters
            values={{ ...filterValues, search: searchDraft }}
            onChange={updatePackageFilter}
            onReset={resetPackageFilters}
          />
        }
        trailing={
          <>
            <OmmButton
              type="button"
              variant="ghost"
              size="md"
              onClick={openTypesModal}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full"
            >
              {t("manageTypesButton")}
            </OmmButton>
            <OmmButton
              type="button"
              variant="secondary"
              size="md"
              onClick={openAddModal}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full"
            >
              <PlusIcon className="h-5 w-5 shrink-0" />
              {t("addGroupButton")}
            </OmmButton>
          </>
        }
      />

      {categoryOptions.length > 0 ? (
        <AdminPackagesCategoryDropdown
          options={categoryOptions}
          selectedIds={selectedCategoryIds}
          onChange={setSelectedCategoryIds}
        />
      ) : null}

      <AdminPackagesShell
        packages={sortedPackages}
        classTypeOptions={classTypeOptions}
        categoryOptions={categoryOptions}
        defaultCategoryName={defaultCategoryId}
        onPackageCreated={handlePackageCreated}
        onPackageUpdated={handlePackageUpdated}
      >
        <AdminPackagesCategoryList
          locale={locale}
          sortedPackages={sortedPackages}
          visibleCategories={visibleCategories}
          displayCategories={displayCategories}
          filteredPackages={filteredPackages}
          pagedDisplayCategories={pagedDisplayCategories}
          categoryListPageClamped={categoryListPageClamped}
          expandedCategoryKeys={expandedCategoryKeys}
          setExpandedCategoryKeys={setExpandedCategoryKeys}
          emptyCategoriesLabel={t("noPackageCategoriesYet")}
          emptyFilterLabel={t("empty")}
          noCategoriesSelectedLabel={t("noCategoriesSelected")}
          onEditCategory={openEditCategory}
          onDeleteCategory={openDeleteCategory}
          onEditPackage={openEditTier}
          onAddTier={openAddTier}
          onDeletePackage={openDeletePackage}
          onPackageStatusUpdated={handlePackageUpdated}
          onCategoryPlansUpdated={handleCategoryPlansUpdated}
          onCategoryPageChange={syncCategoryListPage}
        />
      </AdminPackagesShell>

      <AdminPackagesManagementModals
        locale={locale}
        classTypes={classTypes}
        packageRows={packageRows}
        isTypesModalOpen={isTypesModalOpen}
        isEditCategoryOpen={isEditCategoryOpen}
        editingCategorySlug={editingCategorySlug}
        editingCategoryName={editingCategory?.label ?? ""}
        isDeleteCategoryOpen={isDeleteCategoryOpen}
        deletingCategorySlug={deletingCategory?.id ?? ""}
        deletingCategoryName={deletingCategory?.label ?? ""}
        isDeletePackageOpen={isDeletePackageOpen}
        deletingPackage={deletingPackage}
        toastMessage={toastMessage}
        onCloseTypesModal={closeTypesModal}
        onTypesChanged={handleClassTypesChanged}
        onCloseEditCategory={closeEditCategory}
        onCategoryRenamed={handleCategoryRenamed}
        onCloseDeleteCategory={closeDeleteCategory}
        onCategoryDeleted={handleCategoryDeleted}
        onCloseDeletePackage={closeDeletePackage}
        onPackageDeleted={handlePackageDeleted}
        onDismissToast={() => setToastMessage(null)}
      />
    </div>
  );
}

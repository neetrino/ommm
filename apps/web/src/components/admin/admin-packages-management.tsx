"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminAccordionPanel } from "@/components/admin/admin-accordion-panel";
import { AdminClassTypesModal, type AdminClassTypeRow } from "@/components/admin/admin-class-types-modal";
import {
  AdminPackagesCategoryMultiSelect,
  allPackageCategoryIds,
  syncPackageCategorySelection,
  type AdminPackagesCategoryOption,
} from "@/components/admin/admin-packages-category-multi-select";
import {
  AdminPackagesShell,
  PackagesAddButton,
} from "@/components/admin/admin-packages-shell";
import { AdminPackagesCategoryTable } from "@/components/admin/admin-packages-category-table";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  buildPackagesPathname,
  clearPackageModalQueryKeys,
  PACKAGE_CATEGORY_QUERY_KEY,
  PACKAGE_EDIT_CATEGORY_QUERY_KEY,
  PACKAGE_EDIT_QUERY_KEY,
  PACKAGE_MODAL_CREATE_VALUE,
  PACKAGE_MODAL_QUERY_KEY,
} from "@/components/admin/admin-packages-url";

type AdminPackagesManagementProps = {
  packages: readonly AdminPackageRow[];
  classTypes: readonly AdminClassTypeRow[];
  locale: string;
};

export function AdminPackagesManagement({
  packages,
  classTypes,
  locale,
}: AdminPackagesManagementProps) {
  const t = useTranslations("adminPages.packages");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editingClassTypeId = searchParams.get(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
  const isEditCategoryOpen =
    editingClassTypeId !== null &&
    classTypes.some((type) => type.id === editingClassTypeId);

  const categoryOptions = useMemo<readonly AdminPackagesCategoryOption[]>(
    () => classTypes.map((type) => ({ id: type.id, label: type.name })),
    [classTypes],
  );

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<ReadonlySet<string>>(() =>
    allPackageCategoryIds(categoryOptions),
  );
  const previousCategoryOptionsRef = useRef<readonly AdminPackagesCategoryOption[]>(categoryOptions);

  useEffect(() => {
    setSelectedCategoryIds((current) =>
      syncPackageCategorySelection(
        categoryOptions,
        previousCategoryOptionsRef.current,
        current,
      ),
    );
    previousCategoryOptionsRef.current = categoryOptions;
  }, [categoryOptions]);

  const sortedPackages = useMemo(
    () => [...packages].sort((left, right) => left.displayOrder - right.displayOrder),
    [packages],
  );

  const visibleCategories = useMemo(
    () => classTypes.filter((type) => selectedCategoryIds.has(type.id)),
    [classTypes, selectedCategoryIds],
  );

  const defaultCategoryId = visibleCategories[0]?.id ?? categoryOptions[0]?.id ?? "";

  const openAddModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
    params.delete(PACKAGE_EDIT_QUERY_KEY);
    clearPackageModalQueryKeys(params);
    params.set(PACKAGE_MODAL_QUERY_KEY, PACKAGE_MODAL_CREATE_VALUE);
    if (defaultCategoryId.length > 0) {
      params.set(PACKAGE_CATEGORY_QUERY_KEY, defaultCategoryId);
    }
    router.replace(buildPackagesPathname(pathname, params));
  }, [defaultCategoryId, pathname, router, searchParams]);

  const openEditCategory = useCallback(
    (classTypeId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      clearPackageModalQueryKeys(params);
      params.set(PACKAGE_EDIT_CATEGORY_QUERY_KEY, classTypeId);
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const closeEditCategory = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
    router.replace(buildPackagesPathname(pathname, params), { scroll: false });
  }, [pathname, router, searchParams]);

  const openEditPackage = useCallback(
    (packageId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
      clearPackageModalQueryKeys(params);
      params.set(PACKAGE_EDIT_QUERY_KEY, packageId);
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toolbar =
    categoryOptions.length > 0 ? (
      <div className="ommm-admin-packages-toolbar">
        <AdminPackagesCategoryMultiSelect
          options={categoryOptions}
          selectedIds={selectedCategoryIds}
          onChange={setSelectedCategoryIds}
        />
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
          <PackagesAddButton label={t("addPackageButton")} onClick={openAddModal} />
        </div>
      </div>
    ) : (
      <div className="flex flex-wrap justify-end gap-3">
        <PackagesAddButton label={t("addPackageButton")} onClick={openAddModal} />
      </div>
    );

  return (
    <>
      <AdminPackagesShell
        toolbar={toolbar}
        packages={sortedPackages}
        categoryOptions={categoryOptions}
      >
        {classTypes.length === 0 ? (
          <p className="text-sm text-sage-500">{t("categoryEmpty")}</p>
        ) : visibleCategories.length === 0 ? (
          <p className="text-sm text-sage-500">{t("noCategoriesSelected")}</p>
        ) : (
          <div className="flex flex-col gap-5">
            {visibleCategories.map((classType) => (
              <CategoryAccordion
                key={classType.id}
                classType={classType}
                packages={sortedPackages}
                locale={locale}
                onEditCategory={() => openEditCategory(classType.id)}
                onEditPackage={openEditPackage}
              />
            ))}
          </div>
        )}
      </AdminPackagesShell>

      <AdminClassTypesModal
        isOpen={isEditCategoryOpen}
        classTypes={classTypes}
        sessionCountByTypeId={{}}
        initialSelectedId={editingClassTypeId}
        allowCreate={false}
        allowDelete={false}
        onClose={closeEditCategory}
        onChanged={(nextTypes) => {
          router.refresh();
          if (
            editingClassTypeId !== null &&
            !nextTypes.some((type) => type.id === editingClassTypeId)
          ) {
            closeEditCategory();
          }
        }}
      />
    </>
  );
}

type CategoryAccordionProps = {
  classType: AdminClassTypeRow;
  packages: readonly AdminPackageRow[];
  locale: string;
  onEditCategory: () => void;
  onEditPackage: (packageId: string) => void;
};

function CategoryAccordion({
  classType,
  packages,
  locale,
  onEditCategory,
  onEditPackage,
}: CategoryAccordionProps) {
  const t = useTranslations("adminPages.packages");
  const [open, setOpen] = useState(true);

  const categoryPackages = useMemo(
    () => packages.filter((pkg) => pkg.classTypeId === classType.id),
    [classType.id, packages],
  );

  const body =
    categoryPackages.length > 0 ? (
      <AdminPackagesCategoryTable
        packages={categoryPackages}
        locale={locale}
        onEditPackage={onEditPackage}
      />
    ) : undefined;

  return (
    <AdminAccordionPanel
      title={classType.name}
      editLabel={t("editCategory")}
      onEdit={onEditCategory}
      open={open}
      onOpenChange={setOpen}
      contentVariant="table"
      emptyLabel={t("categoryEmpty")}
    >
      {body}
    </AdminAccordionPanel>
  );
}

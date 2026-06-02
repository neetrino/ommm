"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import {
  type AdminPackageRow,
  upsertAdminPackageRow,
} from "@/components/admin/admin-packages-types";
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

function toCategoryOptions(
  types: readonly AdminClassTypeRow[],
): readonly AdminPackagesCategoryOption[] {
  return types.map((type) => ({ id: type.id, label: type.name }));
}

function PackagesEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[min(48vh,32rem)] w-full items-center justify-center px-4 py-16 sm:py-20">
      <p className="max-w-xl text-center text-sm leading-relaxed text-sage-600">{children}</p>
    </div>
  );
}

function classTypeIdsUsedByPackages(packages: readonly AdminPackageRow[]): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const pkg of packages) {
    const classTypeId = pkg.classTypeId;
    if (classTypeId !== null && classTypeId !== undefined && classTypeId.length > 0) {
      ids.add(classTypeId);
    }
  }
  return ids;
}

export function AdminPackagesManagement({
  packages: packagesFromServer,
  classTypes,
  locale,
}: AdminPackagesManagementProps) {
  const t = useTranslations("adminPages.packages");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [packageRows, setPackageRows] = useState<readonly AdminPackageRow[]>(packagesFromServer);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  useEffect(() => {
    setPackageRows(packagesFromServer);
  }, [packagesFromServer]);
  const editingClassTypeId = searchParams.get(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
  const isEditCategoryOpen =
    editingClassTypeId !== null &&
    classTypes.some((type) => type.id === editingClassTypeId);

  const sortedPackages = useMemo(
    () => [...packageRows].sort((left, right) => left.displayOrder - right.displayOrder),
    [packageRows],
  );

  const classTypeIdsWithPackages = useMemo(
    () => classTypeIdsUsedByPackages(sortedPackages),
    [sortedPackages],
  );

  const allCategoryOptions = useMemo(
    () => toCategoryOptions(classTypes),
    [classTypes],
  );

  const listedClassTypes = useMemo(
    () => classTypes.filter((type) => classTypeIdsWithPackages.has(type.id)),
    [classTypeIdsWithPackages, classTypes],
  );

  const filterCategoryOptions = useMemo(
    () => toCategoryOptions(listedClassTypes),
    [listedClassTypes],
  );

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<ReadonlySet<string>>(() =>
    allPackageCategoryIds(filterCategoryOptions),
  );
  const previousCategoryOptionsRef =
    useRef<readonly AdminPackagesCategoryOption[]>(filterCategoryOptions);

  useEffect(() => {
    setSelectedCategoryIds((current) =>
      syncPackageCategorySelection(
        filterCategoryOptions,
        previousCategoryOptionsRef.current,
        current,
      ),
    );
    previousCategoryOptionsRef.current = filterCategoryOptions;
  }, [filterCategoryOptions]);

  const handlePackageCreated = useCallback((saved: AdminPackageRow) => {
    setPackageRows((current) => upsertAdminPackageRow(current, saved));
    const classTypeId = saved.classTypeId;
    if (classTypeId !== null && classTypeId.length > 0) {
      setSelectedCategoryIds((current) => new Set([...current, classTypeId]));
      setExpandedCategoryIds((current) => new Set([...current, classTypeId]));
    }
  }, []);

  const handlePackageUpdated = useCallback((saved: AdminPackageRow) => {
    setPackageRows((current) => upsertAdminPackageRow(current, saved));
  }, []);

  const visibleCategories = useMemo(
    () => listedClassTypes.filter((type) => selectedCategoryIds.has(type.id)),
    [listedClassTypes, selectedCategoryIds],
  );

  const defaultCategoryId =
    visibleCategories[0]?.id ?? allCategoryOptions[0]?.id ?? "";

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
    filterCategoryOptions.length > 0 ? (
      <div className="ommm-admin-packages-toolbar">
        <AdminPackagesCategoryMultiSelect
          options={filterCategoryOptions}
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
        categoryOptions={allCategoryOptions}
        onPackageCreated={handlePackageCreated}
        onPackageUpdated={handlePackageUpdated}
      >
        {classTypes.length === 0 ? (
          <PackagesEmptyState>{t("noClassTypesInStudio")}</PackagesEmptyState>
        ) : listedClassTypes.length === 0 ? (
          <PackagesEmptyState>{t("noPackageCategoriesYet")}</PackagesEmptyState>
        ) : visibleCategories.length === 0 ? (
          <PackagesEmptyState>{t("noCategoriesSelected")}</PackagesEmptyState>
        ) : (
          <div className="flex flex-col gap-5">
            {visibleCategories.map((classType) => (
              <CategoryAccordion
                key={classType.id}
                classType={classType}
                packages={sortedPackages}
                locale={locale}
                open={expandedCategoryIds.has(classType.id)}
                onOpenChange={(nextOpen) => {
                  setExpandedCategoryIds((current) => {
                    const next = new Set(current);
                    if (nextOpen) {
                      next.add(classType.id);
                    } else {
                      next.delete(classType.id);
                    }
                    return next;
                  });
                }}
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditCategory: () => void;
  onEditPackage: (packageId: string) => void;
};

function CategoryAccordion({
  classType,
  packages,
  locale,
  open,
  onOpenChange,
  onEditCategory,
  onEditPackage,
}: CategoryAccordionProps) {
  const t = useTranslations("adminPages.packages");

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
      onOpenChange={onOpenChange}
      contentVariant="table"
      emptyLabel={t("categoryEmpty")}
    >
      {body}
    </AdminAccordionPanel>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminAccordionPanel } from "@/components/admin/admin-accordion-panel";
import { AdminPackageCategoryRenameModal } from "@/components/admin/admin-package-category-rename-modal";
import { buildPackageCategoryOptions, packagesInCategory } from "@/components/admin/admin-packages-categories";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
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
  mergeAdminPackageRowsFromServer,
  normalizeAdminPackageRow,
  upsertAdminPackageRow,
} from "@/components/admin/admin-packages-types";
import {
  buildPackagesPathname,
  clearPackageModalQueryKeys,
  PACKAGE_CATEGORY_QUERY_KEY,
  PACKAGE_EDIT_CATEGORY_QUERY_KEY,
  PACKAGE_EDIT_QUERY_KEY,
  PACKAGE_MODAL_CREATE_VALUE,
  PACKAGE_MODAL_PRICING_VALUE,
  PACKAGE_MODAL_QUERY_KEY,
  PACKAGE_PRICING_QUERY_KEY,
} from "@/components/admin/admin-packages-url";

type AdminPackagesManagementProps = {
  packages: readonly AdminPackageRow[];
  locale: string;
};

function PackagesEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[min(48vh,32rem)] w-full items-center justify-center px-4 py-16 sm:py-20">
      <p className="max-w-xl text-center text-sm leading-relaxed text-sage-600">{children}</p>
    </div>
  );
}

export function AdminPackagesManagement({
  packages: packagesFromServer,
  locale,
}: AdminPackagesManagementProps) {
  const t = useTranslations("adminPages.packages");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [packageRows, setPackageRows] = useState<readonly AdminPackageRow[]>(() =>
    packagesFromServer.map(normalizeAdminPackageRow),
  );

  const editingCategoryName = searchParams.get(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
  const isEditCategoryOpen =
    editingCategoryName !== null &&
    editingCategoryName.trim().length > 0 &&
    packageRows.some(
      (pkg) =>
        normalizePackageCategoryKey(pkg.categoryName) ===
        normalizePackageCategoryKey(editingCategoryName),
    );

  useEffect(() => {
    setPackageRows((current) =>
      mergeAdminPackageRowsFromServer(
        current,
        packagesFromServer.map(normalizeAdminPackageRow),
      ),
    );
  }, [packagesFromServer]);

  const categoryOptions = useMemo(
    () => buildPackageCategoryOptions(packageRows),
    [packageRows],
  );

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<ReadonlySet<string>>(() =>
    allPackageCategoryIds(categoryOptions),
  );
  const previousCategoryOptionsRef = useRef<readonly AdminPackagesCategoryOption[]>(categoryOptions);

  useEffect(() => {
    setSelectedCategoryIds((current) => {
      const synced = syncPackageCategorySelection(
        categoryOptions,
        previousCategoryOptionsRef.current,
        current,
      );
      if (categoryOptions.length > 0 && synced.size === 0) {
        return allPackageCategoryIds(categoryOptions);
      }
      return synced;
    });
    previousCategoryOptionsRef.current = categoryOptions;
  }, [categoryOptions]);

  const sortedPackages = useMemo(
    () => [...packageRows].sort((left, right) => left.displayOrder - right.displayOrder),
    [packageRows],
  );

  const visibleCategories = useMemo(
    () => categoryOptions.filter((option) => selectedCategoryIds.has(option.id)),
    [categoryOptions, selectedCategoryIds],
  );

  const defaultCategoryId = visibleCategories[0]?.id ?? categoryOptions[0]?.id ?? "";

  const handlePackageCreated = useCallback((saved: AdminPackageRow) => {
    const normalizedSaved = normalizeAdminPackageRow(saved);
    setPackageRows((current) => upsertAdminPackageRow(current, normalizedSaved));
    setSelectedCategoryIds((current) => {
      const next = new Set(current);
      next.add(normalizedSaved.categoryName);
      return next;
    });
  }, []);

  const handlePackageUpdated = useCallback((saved: AdminPackageRow) => {
    setPackageRows((current) => upsertAdminPackageRow(current, normalizeAdminPackageRow(saved)));
  }, []);

  const handleCategoryRenamed = useCallback(
    (_fromName: string, _toName: string, updated: readonly AdminPackageRow[]) => {
      setPackageRows((current) => {
        let next = current;
        for (const row of updated) {
          next = upsertAdminPackageRow(next, row);
        }
        return next;
      });
      router.refresh();
    },
    [router],
  );

  const handleCategoryDeleted = useCallback(
    (_categoryName: string, deletedPackageIds: readonly string[]) => {
      if (deletedPackageIds.length === 0) {
        return;
      }
      const removed = new Set(deletedPackageIds);
      setPackageRows((current) => current.filter((row) => !removed.has(row.id)));
      router.refresh();
    },
    [router],
  );

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
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      clearPackageModalQueryKeys(params);
      params.set(PACKAGE_EDIT_CATEGORY_QUERY_KEY, categoryId);
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

  const openConfigurePricing = useCallback(
    (packageId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
      clearPackageModalQueryKeys(params);
      params.set(PACKAGE_MODAL_QUERY_KEY, PACKAGE_MODAL_PRICING_VALUE);
      params.set(PACKAGE_PRICING_QUERY_KEY, packageId);
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
        onPackageCreated={handlePackageCreated}
        onPackageUpdated={handlePackageUpdated}
      >
        {sortedPackages.length === 0 ? (
          <PackagesEmptyState>{t("noPackageCategoriesYet")}</PackagesEmptyState>
        ) : visibleCategories.length === 0 ? (
          <p className="text-sm text-sage-500">{t("noCategoriesSelected")}</p>
        ) : (
          <div className="flex flex-col gap-5">
            {visibleCategories.map((category) => (
              <CategoryAccordion
                key={category.id}
                category={category}
                packages={sortedPackages}
                locale={locale}
                onEditCategory={() => openEditCategory(category.id)}
                onEditPackage={openEditPackage}
                onConfigurePricing={openConfigurePricing}
              />
            ))}
          </div>
        )}
      </AdminPackagesShell>

      <AdminPackageCategoryRenameModal
        key={editingCategoryName ?? "closed"}
        isOpen={isEditCategoryOpen}
        categoryName={editingCategoryName ?? ""}
        packages={packageRows}
        onClose={closeEditCategory}
        onRenamed={handleCategoryRenamed}
        onDeleted={handleCategoryDeleted}
      />
    </>
  );
}

type CategoryAccordionProps = {
  category: AdminPackagesCategoryOption;
  packages: readonly AdminPackageRow[];
  locale: string;
  onEditCategory: () => void;
  onEditPackage: (packageId: string) => void;
  onConfigurePricing: (packageId: string) => void;
};

function CategoryAccordion({
  category,
  packages,
  locale,
  onEditCategory,
  onEditPackage,
  onConfigurePricing,
}: CategoryAccordionProps) {
  const t = useTranslations("adminPages.packages");
  const [open, setOpen] = useState(false);

  const categoryPackages = useMemo(
    () => packagesInCategory(packages, category.id),
    [category.id, packages],
  );
  const latestPackage = categoryPackages.at(-1);

  const body =
    categoryPackages.length > 0 ? (
      <AdminPackagesCategoryTable
        packages={categoryPackages}
        locale={locale}
        onEditPackage={onEditPackage}
        onConfigurePricing={onConfigurePricing}
      />
    ) : undefined;

  return (
    <AdminAccordionPanel
      title={category.label}
      onAdd={
        latestPackage
          ? () => {
              onConfigurePricing(latestPackage.id);
            }
          : undefined
      }
      addDisabled={latestPackage === undefined}
      addAriaLabel={t("configurePricingAria")}
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

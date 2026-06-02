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
import { AdminPackagesCategoryDropdown } from "@/components/admin/admin-packages-category-dropdown";
import {
  buildPackageCategoryOptions,
  packagesInCategory,
} from "@/components/admin/admin-packages-categories";
import {
  AdminPackagesShell,
  PackagesAddButton,
} from "@/components/admin/admin-packages-shell";
import { AdminPackagesCategoryTable } from "@/components/admin/admin-packages-category-table";
import {
  syncPackageCategorySelection,
  type AdminPackagesCategoryOption,
} from "@/components/admin/admin-packages-category-multi-select";
import {
  type AdminPackageRow,
  mergeAdminPackageRowsFromServer,
  normalizeAdminPackageRow,
  upsertAdminPackageRow,
} from "@/components/admin/admin-packages-types";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import {
  buildPackagesPathname,
  clearPackageModalQueryKeys,
  PACKAGE_CATEGORY_QUERY_KEY,
  PACKAGE_EDIT_CATEGORY_QUERY_KEY,
  PACKAGE_EDIT_QUERY_KEY,
  PACKAGE_MODAL_CREATE_VALUE,
  PACKAGE_MODAL_PRICING_VALUE,
  PACKAGE_MODAL_ADD_TIER_VALUE,
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

  useEffect(() => {
    setPackageRows((current) =>
      mergeAdminPackageRowsFromServer(
        current,
        packagesFromServer.map(normalizeAdminPackageRow),
      ),
    );
  }, [packagesFromServer]);

  const sortedPackages = useMemo(
    () => [...packageRows].sort((left, right) => left.displayOrder - right.displayOrder),
    [packageRows],
  );

  const categoryOptions = useMemo(
    () => buildPackageCategoryOptions(sortedPackages),
    [sortedPackages],
  );

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const prevCategoryOptionsRef = useRef<readonly AdminPackagesCategoryOption[]>([]);
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  useEffect(() => {
    setSelectedCategoryIds((current) =>
      syncPackageCategorySelection(categoryOptions, prevCategoryOptionsRef.current, current),
    );
    prevCategoryOptionsRef.current = categoryOptions;
  }, [categoryOptions]);

  const editingCategoryName = searchParams.get(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
  const isEditCategoryOpen =
    editingCategoryName !== null &&
    editingCategoryName.trim().length > 0 &&
    sortedPackages.some(
      (pkg) =>
        normalizePackageCategoryKey(pkg.categoryName) ===
        normalizePackageCategoryKey(editingCategoryName),
    );

  const visibleCategories = useMemo(
    () => categoryOptions.filter((option) => selectedCategoryIds.has(option.id)),
    [categoryOptions, selectedCategoryIds],
  );

  const defaultCategoryId = useMemo(() => {
    const firstSelected = categoryOptions.find((option) => selectedCategoryIds.has(option.id));
    return firstSelected?.id ?? categoryOptions[0]?.id ?? "";
  }, [categoryOptions, selectedCategoryIds]);

  const handlePackageCreated = useCallback((saved: AdminPackageRow) => {
    const normalized = normalizeAdminPackageRow(saved);
    setPackageRows((current) => upsertAdminPackageRow(current, normalized));
    setSelectedCategoryIds((current) => {
      const next = new Set(current);
      next.add(normalized.categoryName);
      return next;
    });
    setExpandedCategoryKeys((current) => {
      const next = new Set(current);
      next.add(normalizePackageCategoryKey(normalized.categoryName));
      return next;
    });
  }, []);

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

  const openAddTier = useCallback(
    (categoryId: string) => {
      const categoryKey = normalizePackageCategoryKey(categoryId);
      const shellPlan = sortedPackages.find(
        (pkg) =>
          normalizePackageCategoryKey(pkg.categoryName) === categoryKey && pkg.priceCents <= 0,
      );
      const params = new URLSearchParams(searchParams.toString());
      params.delete(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
      clearPackageModalQueryKeys(params);
      params.set(PACKAGE_MODAL_QUERY_KEY, PACKAGE_MODAL_ADD_TIER_VALUE);
      params.set(PACKAGE_CATEGORY_QUERY_KEY, categoryId);
      if (shellPlan !== undefined) {
        params.set(PACKAGE_PRICING_QUERY_KEY, shellPlan.id);
      }
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [pathname, router, searchParams, sortedPackages],
  );

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
      if (deletedPackageIds.length > 0) {
        const removed = new Set(deletedPackageIds);
        setPackageRows((current) => current.filter((row) => !removed.has(row.id)));
      }
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
    params.delete(PACKAGE_CATEGORY_QUERY_KEY);
    router.replace(buildPackagesPathname(pathname, params));
  }, [pathname, router, searchParams]);

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

  const toolbar = (
    <div className="ommm-admin-packages-toolbar">
      {categoryOptions.length > 0 ? (
        <AdminPackagesCategoryDropdown
          options={categoryOptions}
          selectedIds={selectedCategoryIds}
          onChange={setSelectedCategoryIds}
        />
      ) : (
        <div className="min-w-0 flex-1" />
      )}
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
        <PackagesAddButton label={t("addPackageButton")} onClick={openAddModal} />
      </div>
    </div>
  );

  return (
    <>
      <AdminPackagesShell
        toolbar={toolbar}
        packages={sortedPackages}
        categoryOptions={categoryOptions}
        defaultCategoryName={defaultCategoryId}
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
                open={expandedCategoryKeys.has(normalizePackageCategoryKey(category.id))}
                onOpenChange={(next) => {
                  const categoryKey = normalizePackageCategoryKey(category.id);
                  setExpandedCategoryKeys((current) => {
                    const updated = new Set(current);
                    if (next) {
                      updated.add(categoryKey);
                    } else {
                      updated.delete(categoryKey);
                    }
                    return updated;
                  });
                }}
                onEditCategory={() => openEditCategory(category.id)}
                onEditPackage={openConfigurePricing}
                onAddTier={() => openAddTier(category.id)}
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditCategory: () => void;
  onEditPackage: (packageId: string) => void;
  onAddTier: () => void;
};

function CategoryAccordion({
  category,
  packages,
  locale,
  open,
  onOpenChange,
  onEditCategory,
  onEditPackage,
  onAddTier,
}: CategoryAccordionProps) {
  const t = useTranslations("adminPages.packages");

  const categoryPackages = useMemo(
    () => packagesInCategory(packages, category.id),
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
      />
    ) : undefined;

  return (
    <AdminAccordionPanel
      title={category.label}
      editLabel={t("editCategory")}
      onEdit={onEditCategory}
      open={open}
      onOpenChange={onOpenChange}
      contentVariant="table"
      emptyLabel={categoryPackages.length === 0 ? t("categoryEmpty") : undefined}
    >
      {body}
    </AdminAccordionPanel>
  );
}

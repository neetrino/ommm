"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { revealPackageCategoryInFilters } from "@/components/admin/admin-packages-management.helpers";
import {
  syncPackageCategorySelection,
  type AdminPackagesCategoryOption,
} from "@/components/admin/admin-packages-category-multi-select";
import {
  categoryHasConfiguredPackages,
  sortPackageCategoriesActiveFirst,
} from "@/components/admin/admin-packages-categories";
import { hasActivePackageFilters } from "@/components/admin/admin-packages-filter-logic";
import type { AdminPackageRow, PackageFilterValues } from "@/components/admin/admin-packages-types";
import {
  buildPackagesPathname,
  PACKAGE_CATEGORIES_PAGE_QUERY_KEY,
  PACKAGE_DELETE_CATEGORY_QUERY_KEY,
  PACKAGE_DELETE_QUERY_KEY,
  PACKAGE_EDIT_CATEGORY_QUERY_KEY,
} from "@/components/admin/admin-packages-url";
import { ADMIN_PACKAGES_CATEGORIES_PAGE_SIZE } from "@/components/admin/admin-packages.constants";
import { clampListPage } from "@/lib/list-pagination";
import { useAdminPackagesModalUrl } from "@/components/admin/use-admin-packages-modal-url";

type UseAdminPackagesCategoryDisplayOptions = {
  sortedPackages: readonly AdminPackageRow[];
  filteredPackages: readonly AdminPackageRow[];
  filterValues: PackageFilterValues;
  categoryOptions: readonly AdminPackagesCategoryOption[];
  packageRows: readonly AdminPackageRow[];
};

export function useAdminPackagesCategoryDisplay({
  sortedPackages,
  filteredPackages,
  filterValues,
  categoryOptions,
  packageRows,
}: UseAdminPackagesCategoryDisplayOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const prevCategoryOptionsRef = useRef<readonly AdminPackagesCategoryOption[]>([]);
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
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
    setSelectedCategoryIds,
    setExpandedCategoryKeys,
  });

  useEffect(() => {
    setSelectedCategoryIds((current) =>
      syncPackageCategorySelection(categoryOptions, prevCategoryOptionsRef.current, current),
    );
    prevCategoryOptionsRef.current = categoryOptions;
  }, [categoryOptions]);

  const editingCategorySlug = searchParams.get(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
  const isEditCategoryOpen =
    editingCategorySlug !== null &&
    editingCategorySlug.trim().length > 0 &&
    sortedPackages.some((pkg) => pkg.categorySlug === editingCategorySlug.trim());
  const editingCategory = useMemo(() => {
    if (editingCategorySlug === null || editingCategorySlug.trim().length === 0) {
      return null;
    }
    return categoryOptions.find((option) => option.id === editingCategorySlug.trim()) ?? null;
  }, [categoryOptions, editingCategorySlug]);

  const deletingCategoryId = searchParams.get(PACKAGE_DELETE_CATEGORY_QUERY_KEY);
  const deletingCategory = useMemo(() => {
    if (deletingCategoryId === null || deletingCategoryId.trim().length === 0) {
      return null;
    }
    return categoryOptions.find((option) => option.id === deletingCategoryId.trim()) ?? null;
  }, [categoryOptions, deletingCategoryId]);
  const isDeleteCategoryOpen = deletingCategory !== null;

  const deletingPackageId = searchParams.get(PACKAGE_DELETE_QUERY_KEY);
  const deletingPackage = useMemo(() => {
    if (deletingPackageId === null || deletingPackageId.trim().length === 0) {
      return null;
    }
    return packageRows.find((row) => row.id === deletingPackageId) ?? null;
  }, [deletingPackageId, packageRows]);
  const isDeletePackageOpen = deletingPackage !== null;

  const [prevDeletePackageRevealId, setPrevDeletePackageRevealId] = useState<string | null>(
    null,
  );

  if (
    deletingPackage !== null &&
    deletingPackage.id !== prevDeletePackageRevealId
  ) {
    setPrevDeletePackageRevealId(deletingPackage.id);
    revealPackageCategoryInFilters(
      deletingPackage.categorySlug,
      setSelectedCategoryIds,
      setExpandedCategoryKeys,
    );
  } else if (deletingPackage === null && prevDeletePackageRevealId !== null) {
    setPrevDeletePackageRevealId(null);
  }

  useEffect(() => {
    if (deletingCategoryId === null || isDeleteCategoryOpen) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PACKAGE_DELETE_CATEGORY_QUERY_KEY);
    router.replace(buildPackagesPathname(pathname, params), { scroll: false });
  }, [deletingCategoryId, isDeleteCategoryOpen, pathname, router, searchParams]);

  useEffect(() => {
    if (deletingPackageId === null || isDeletePackageOpen) {
      return;
    }
    closeDeletePackage();
  }, [closeDeletePackage, deletingPackageId, isDeletePackageOpen]);

  const visibleCategories = useMemo(
    () => categoryOptions.filter((option) => selectedCategoryIds.has(option.id)),
    [categoryOptions, selectedCategoryIds],
  );

  const filtersActive = hasActivePackageFilters(filterValues);

  const displayCategories = useMemo(() => {
    const matching = filtersActive
      ? visibleCategories.filter((option) =>
          categoryHasConfiguredPackages(filteredPackages, option.id),
        )
      : visibleCategories;
    return sortPackageCategoriesActiveFirst(matching, sortedPackages);
  }, [filteredPackages, filtersActive, sortedPackages, visibleCategories]);

  const categoryPage = (() => {
    const raw = searchParams.get(PACKAGE_CATEGORIES_PAGE_QUERY_KEY);
    if (raw === null || raw.trim() === "") {
      return 1;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  })();
  const categoryListPageClamped = clampListPage(
    categoryPage,
    displayCategories.length,
    ADMIN_PACKAGES_CATEGORIES_PAGE_SIZE,
  );

  const syncCategoryListPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete(PACKAGE_CATEGORIES_PAGE_QUERY_KEY);
      } else {
        params.set(PACKAGE_CATEGORIES_PAGE_QUERY_KEY, String(page));
      }
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (categoryPage === categoryListPageClamped) {
      return;
    }
    syncCategoryListPage(categoryListPageClamped);
  }, [categoryListPageClamped, categoryPage, syncCategoryListPage]);

  const pagedDisplayCategories = useMemo(() => {
    const offset = (categoryListPageClamped - 1) * ADMIN_PACKAGES_CATEGORIES_PAGE_SIZE;
    return displayCategories.slice(offset, offset + ADMIN_PACKAGES_CATEGORIES_PAGE_SIZE);
  }, [categoryListPageClamped, displayCategories]);

  const defaultCategoryId = useMemo(() => {
    const firstSelected = categoryOptions.find((option) => selectedCategoryIds.has(option.id));
    return firstSelected?.id ?? categoryOptions[0]?.id ?? "";
  }, [categoryOptions, selectedCategoryIds]);

  return {
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
  };
}

"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { revealPackageCategoryInFilters } from "@/components/admin/admin-packages-management.helpers";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  buildPackagesPathname,
  clearPackageDeleteQueryKeys,
  clearPackageModalQueryKeys,
  PACKAGE_CATEGORY_QUERY_KEY,
  PACKAGE_DELETE_CATEGORY_QUERY_KEY,
  PACKAGE_DELETE_QUERY_KEY,
  PACKAGE_EDIT_CATEGORY_QUERY_KEY,
  PACKAGE_EDIT_QUERY_KEY,
  PACKAGE_MODAL_ADD_TIER_VALUE,
  PACKAGE_MODAL_CREATE_VALUE,
  PACKAGE_MODAL_EDIT_TIER_VALUE,
  PACKAGE_MODAL_QUERY_KEY,
  PACKAGE_MODAL_TYPES_VALUE,
  PACKAGE_PRICING_QUERY_KEY,
} from "@/components/admin/admin-packages-url";

type UseAdminPackagesModalUrlParams = {
  packageRows: readonly AdminPackageRow[];
  sortedPackages: readonly AdminPackageRow[];
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<ReadonlySet<string>>>;
  setExpandedCategoryKeys: React.Dispatch<React.SetStateAction<ReadonlySet<string>>>;
};

export function useAdminPackagesModalUrl({
  packageRows,
  sortedPackages,
  setSelectedCategoryIds,
  setExpandedCategoryKeys,
}: UseAdminPackagesModalUrlParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openEditTier = useCallback(
    (packageId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
      params.delete(PACKAGE_DELETE_CATEGORY_QUERY_KEY);
      clearPackageDeleteQueryKeys(params);
      clearPackageModalQueryKeys(params);
      params.set(PACKAGE_MODAL_QUERY_KEY, PACKAGE_MODAL_EDIT_TIER_VALUE);
      params.set(PACKAGE_PRICING_QUERY_KEY, packageId);
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openAddTier = useCallback(
    (categorySlug: string) => {
      const shellPlan = sortedPackages.find(
        (pkg) => pkg.categorySlug === categorySlug && pkg.priceCents <= 0,
      );
      const params = new URLSearchParams(searchParams.toString());
      params.delete(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
      params.delete(PACKAGE_DELETE_CATEGORY_QUERY_KEY);
      clearPackageDeleteQueryKeys(params);
      clearPackageModalQueryKeys(params);
      params.set(PACKAGE_MODAL_QUERY_KEY, PACKAGE_MODAL_ADD_TIER_VALUE);
      params.set(PACKAGE_CATEGORY_QUERY_KEY, categorySlug);
      if (shellPlan !== undefined) {
        params.set(PACKAGE_PRICING_QUERY_KEY, shellPlan.id);
      }
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [pathname, router, searchParams, sortedPackages],
  );

  const closeDeletePackage = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    clearPackageDeleteQueryKeys(params);
    router.replace(buildPackagesPathname(pathname, params), { scroll: false });
  }, [pathname, router, searchParams]);

  const openDeletePackage = useCallback(
    (packageId: string) => {
      const target = packageRows.find((row) => row.id === packageId);
      if (target === undefined) {
        return;
      }
      revealPackageCategoryInFilters(
        target.categorySlug,
        setSelectedCategoryIds,
        setExpandedCategoryKeys,
      );
      const params = new URLSearchParams(searchParams.toString());
      params.delete(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
      params.delete(PACKAGE_DELETE_CATEGORY_QUERY_KEY);
      clearPackageModalQueryKeys(params);
      clearPackageDeleteQueryKeys(params);
      params.set(PACKAGE_DELETE_QUERY_KEY, packageId);
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [packageRows, pathname, router, searchParams, setExpandedCategoryKeys, setSelectedCategoryIds],
  );

  const openAddModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
    params.delete(PACKAGE_DELETE_CATEGORY_QUERY_KEY);
    clearPackageDeleteQueryKeys(params);
    params.delete(PACKAGE_EDIT_QUERY_KEY);
    clearPackageModalQueryKeys(params);
    params.set(PACKAGE_MODAL_QUERY_KEY, PACKAGE_MODAL_CREATE_VALUE);
    params.delete(PACKAGE_CATEGORY_QUERY_KEY);
    router.replace(buildPackagesPathname(pathname, params));
  }, [pathname, router, searchParams]);

  const isTypesModalOpen =
    searchParams.get(PACKAGE_MODAL_QUERY_KEY) === PACKAGE_MODAL_TYPES_VALUE;

  const openTypesModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
    params.delete(PACKAGE_DELETE_CATEGORY_QUERY_KEY);
    clearPackageDeleteQueryKeys(params);
    params.delete(PACKAGE_EDIT_QUERY_KEY);
    clearPackageModalQueryKeys(params);
    params.delete(PACKAGE_CATEGORY_QUERY_KEY);
    params.set(PACKAGE_MODAL_QUERY_KEY, PACKAGE_MODAL_TYPES_VALUE);
    router.replace(buildPackagesPathname(pathname, params), { scroll: false });
  }, [pathname, router, searchParams]);

  const closeTypesModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    clearPackageModalQueryKeys(params);
    router.replace(buildPackagesPathname(pathname, params), { scroll: false });
  }, [pathname, router, searchParams]);

  const openEditCategory = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(PACKAGE_DELETE_CATEGORY_QUERY_KEY);
      clearPackageDeleteQueryKeys(params);
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

  const openDeleteCategory = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(PACKAGE_EDIT_CATEGORY_QUERY_KEY);
      clearPackageDeleteQueryKeys(params);
      clearPackageModalQueryKeys(params);
      params.set(PACKAGE_DELETE_CATEGORY_QUERY_KEY, categoryId);
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const closeDeleteCategory = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PACKAGE_DELETE_CATEGORY_QUERY_KEY);
    router.replace(buildPackagesPathname(pathname, params), { scroll: false });
  }, [pathname, router, searchParams]);

  return {
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

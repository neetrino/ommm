"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import {
  adminFilterRevealVariants,
} from "@/components/admin/admin-filter-reveal-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminPackageCategoryDeleteModal } from "@/components/admin/admin-package-category-delete-modal";
import { AdminPackageDeleteModal } from "@/components/admin/admin-package-delete-modal";
import { AdminPackageCategoryRenameModal } from "@/components/admin/admin-package-category-rename-modal";
import { AdminPackagesCategoryAccordion } from "@/components/admin/admin-packages-category-accordion";
import { AdminPackagesEmptyState } from "@/components/admin/admin-packages-empty-state";
import {
  DEFAULT_PACKAGE_FILTER_VALUES,
  PACKAGE_SEARCH_DEBOUNCE_MS,
} from "@/components/admin/admin-packages-management.constants";
import { revealPackageCategoryInFilters } from "@/components/admin/admin-packages-management.helpers";
import { AdminTypesModal } from "@/components/admin/admin-types-modal";
import type { AdminClassTypeRow } from "@/components/admin/admin-types-management";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import { AdminPackagesCategoryDropdown } from "@/components/admin/admin-packages-category-dropdown";
import {
  buildPackageCategoryOptions,
  categoryHasConfiguredPackages,
} from "@/components/admin/admin-packages-categories";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { AdminPackagesShell } from "@/components/admin/admin-packages-shell";
import {
  syncPackageCategorySelection,
  type AdminPackagesCategoryOption,
} from "@/components/admin/admin-packages-category-multi-select";
import { AdminPackagesFilters } from "@/components/admin/admin-packages-filters";
import {
  filterPackages,
  hasActivePackageFilters,
  sortPackages,
} from "@/components/admin/admin-packages-filter-logic";
import {
  type AdminPackageRow,
  mergeAdminPackageRowsFromServer,
  normalizeAdminPackageRow,
  type PackageFilterValues,
  upsertAdminPackageRow,
} from "@/components/admin/admin-packages-types";
import {
  buildPackageUrlFiltersQuery,
  buildPackagesPathname,
  clearPackageModalQueryKeys,
  clearPackageDeleteQueryKeys,
  PACKAGE_CATEGORY_QUERY_KEY,
  PACKAGE_CATEGORIES_PAGE_QUERY_KEY,
  PACKAGE_DELETE_CATEGORY_QUERY_KEY,
  PACKAGE_DELETE_QUERY_KEY,
  PACKAGE_EDIT_CATEGORY_QUERY_KEY,
  PACKAGE_EDIT_QUERY_KEY,
  PACKAGE_FILTER_QUERY_KEYS,
  PACKAGE_MODAL_CREATE_VALUE,
  PACKAGE_MODAL_EDIT_TIER_VALUE,
  PACKAGE_MODAL_ADD_TIER_VALUE,
  PACKAGE_MODAL_QUERY_KEY,
  PACKAGE_MODAL_TYPES_VALUE,
  PACKAGE_PRICING_QUERY_KEY,
  parsePackageFiltersFromSearch,
} from "@/components/admin/admin-packages-url";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { PlusIcon } from "@/components/ui/plus-icon";
import {
  ADMIN_PACKAGES_CATEGORIES_PAGE_SIZE,
} from "@/components/admin/admin-packages.constants";
import {
  clampListPage,
} from "@/lib/list-pagination";

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
  const reducedMotion = usePrefersReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filtersRef = useRef(initialFilters);
  const searchParamsRef = useRef(searchParams.toString());
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
  const [filterValues, setFilterValues] = useState<PackageFilterValues>(initialFilters);
  const [searchDraft, setSearchDraft] = useState(() => initialFilters.search);
  const [prevUrlSearch, setPrevUrlSearch] = useState(() => initialFilters.search);
  const [prevSearchDraft, setPrevSearchDraft] = useState(() => initialFilters.search);
  const [prevInitialFilterStatusOrder, setPrevInitialFilterStatusOrder] = useState({
    status: initialFilters.status,
    order: initialFilters.order,
  });

  if (prevInitialClassTypes !== initialClassTypes) {
    setPrevInitialClassTypes(initialClassTypes);
    setClassTypes(initialClassTypes);
  }

  useEffect(() => {
    searchParamsRef.current = searchParams.toString();
  }, [searchParams]);

  useEffect(() => {
    filtersRef.current = filterValues;
  }, [filterValues]);

  const urlFilters = parsePackageFiltersFromSearch(
    Object.fromEntries(searchParams.entries()),
  );
  if (urlFilters.search !== prevUrlSearch) {
    setPrevUrlSearch(urlFilters.search);
    setSearchDraft(urlFilters.search);
  }

  if (searchDraft !== prevSearchDraft) {
    setPrevSearchDraft(searchDraft);
    setFilterValues((current) =>
      current.search === searchDraft ? current : { ...current, search: searchDraft },
    );
  }

  if (
    initialFilters.status !== prevInitialFilterStatusOrder.status ||
    initialFilters.order !== prevInitialFilterStatusOrder.order
  ) {
    setPrevInitialFilterStatusOrder({
      status: initialFilters.status,
      order: initialFilters.order,
    });
    setFilterValues((current) =>
      current.status === initialFilters.status && current.order === initialFilters.order
        ? current
        : {
            ...current,
            status: initialFilters.status,
            order: initialFilters.order,
          },
    );
  }

  const syncFiltersToUrl = useCallback(
    (values: PackageFilterValues) => {
      const params = new URLSearchParams(searchParamsRef.current);
      for (const key of PACKAGE_FILTER_QUERY_KEYS) {
        params.delete(key);
      }
      const filterQuery = buildPackageUrlFiltersQuery(values);
      if (filterQuery.length > 0) {
        for (const [key, entryValue] of new URLSearchParams(filterQuery)) {
          params.set(key, entryValue);
        }
      }
      const qs = params.toString();
      if (qs === searchParamsRef.current) {
        return;
      }
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = searchDraft.trim();
      const currentSearch =
        new URLSearchParams(searchParamsRef.current).get("search")?.trim() ?? "";
      if (trimmed === currentSearch) {
        return;
      }
      syncFiltersToUrl({ ...filtersRef.current, search: searchDraft });
    }, PACKAGE_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchDraft, syncFiltersToUrl]);

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

  function updatePackageFilter<K extends keyof PackageFilterValues>(
    key: K,
    value: PackageFilterValues[K],
  ): void {
    if (key === "search") {
      setSearchDraft(value);
      return;
    }
    setFilterValues((current) => {
      const next = { ...current, [key]: value };
      syncFiltersToUrl({ ...next, search: searchDraft });
      return next;
    });
  }

  function resetPackageFilters(): void {
    setSearchDraft("");
    setFilterValues(DEFAULT_PACKAGE_FILTER_VALUES);
    syncFiltersToUrl(DEFAULT_PACKAGE_FILTER_VALUES);
  }

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    const params = new URLSearchParams(searchParams.toString());
    clearPackageDeleteQueryKeys(params);
    router.replace(buildPackagesPathname(pathname, params), { scroll: false });
  }, [deletingPackageId, isDeletePackageOpen, pathname, router, searchParams]);

  const visibleCategories = useMemo(
    () => categoryOptions.filter((option) => selectedCategoryIds.has(option.id)),
    [categoryOptions, selectedCategoryIds],
  );

  const filtersActive = hasActivePackageFilters(filterValues);

  const displayCategories = useMemo(() => {
    if (!filtersActive) {
      return visibleCategories;
    }
    return visibleCategories.filter((option) =>
      categoryHasConfiguredPackages(filteredPackages, option.id),
    );
  }, [filteredPackages, filtersActive, visibleCategories]);

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
  const pagedDisplayCategories = useMemo(() => {
    const offset = (categoryListPageClamped - 1) * ADMIN_PACKAGES_CATEGORIES_PAGE_SIZE;
    return displayCategories.slice(offset, offset + ADMIN_PACKAGES_CATEGORIES_PAGE_SIZE);
  }, [categoryListPageClamped, displayCategories]);

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

  const defaultCategoryId = useMemo(() => {
    const firstSelected = categoryOptions.find((option) => selectedCategoryIds.has(option.id));
    return firstSelected?.id ?? categoryOptions[0]?.id ?? "";
  }, [categoryOptions, selectedCategoryIds]);

  const handlePackageCreated = useCallback((saved: AdminPackageRow) => {
    const normalized = normalizeAdminPackageRow(saved);
    setPackageRows((current) => upsertAdminPackageRow(current, normalized));
    setSelectedCategoryIds((current) => {
      const next = new Set(current);
      next.add(normalized.categorySlug);
      return next;
    });
    setExpandedCategoryKeys((current) => {
      const next = new Set(current);
      next.add(normalized.categorySlug);
      return next;
    });
  }, []);

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

  const handlePackageUpdated = useCallback((saved: AdminPackageRow) => {
    setPackageRows((current) => upsertAdminPackageRow(current, normalizeAdminPackageRow(saved)));
  }, []);

  const handleCategoryPlansUpdated = useCallback((updated: readonly AdminPackageRow[]) => {
    setPackageRows((current) => {
      let next = current;
      for (const row of updated) {
        next = upsertAdminPackageRow(next, normalizeAdminPackageRow(row));
      }
      return next;
    });
  }, []);

  const closeDeletePackage = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    clearPackageDeleteQueryKeys(params);
    router.replace(buildPackagesPathname(pathname, params), { scroll: false });
  }, [pathname, router, searchParams]);

  const handlePackageDeleted = useCallback(
    (packageId: string) => {
      setPackageRows((current) => current.filter((row) => row.id !== packageId));
      setToastMessage(t("messages.deleteSuccess"));
      closeDeletePackage();
      router.refresh();
    },
    [closeDeletePackage, router, t],
  );

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
    [packageRows, pathname, router, searchParams],
  );

  const handleCategoryRenamed = useCallback(
    (
      categorySlug: string,
      _fromName: string,
      _toName: string,
      updated: readonly AdminPackageRow[],
    ) => {
      const normalizedUpdated = updated.map(normalizeAdminPackageRow);
      setPackageRows((current) => {
        const withoutPreviousCategory = current.filter(
          (row) => row.categorySlug !== categorySlug,
        );
        let next = withoutPreviousCategory;
        for (const row of normalizedUpdated) {
          next = upsertAdminPackageRow(next, row);
        }
        return next;
      });
      router.refresh();
    },
    [router],
  );

  const handleCategoryDeleted = useCallback(
    (categorySlug: string, deletedPackageIds: readonly string[]) => {
      const removed = new Set(deletedPackageIds);
      setPackageRows((current) =>
        current.filter(
          (row) => !removed.has(row.id) && row.categorySlug !== categorySlug,
        ),
      );
      setSelectedCategoryIds((current) => {
        const next = new Set(current);
        next.delete(categorySlug);
        return next;
      });
      setExpandedCategoryKeys((current) => {
        if (!current.has(categorySlug)) {
          return current;
        }
        const next = new Set(current);
        next.delete(categorySlug);
        return next;
      });
      setToastMessage(t("messages.categoryDeleteSuccess"));
      router.refresh();
    },
    [router, t],
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

  const handleClassTypesChanged = useCallback((nextTypes: readonly AdminClassTypeRow[]) => {
    setClassTypes(nextTypes);
  }, []);

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
        {sortedPackages.length === 0 ? (
          <AdminPackagesEmptyState>{t("noPackageCategoriesYet")}</AdminPackagesEmptyState>
        ) : visibleCategories.length === 0 ? (
          <p className="text-sm text-sage-500">{t("noCategoriesSelected")}</p>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {displayCategories.length === 0 ? (
              <AdminPackagesEmptyState key="packages-filter-empty">{t("empty")}</AdminPackagesEmptyState>
            ) : (
              <motion.div
                key="packages-filter-list"
                className="flex flex-col gap-5"
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.22 }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {pagedDisplayCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      layout={!reducedMotion}
                      variants={adminFilterRevealVariants(index, reducedMotion)}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <AdminPackagesCategoryAccordion
                        category={category}
                        packages={filteredPackages}
                        locale={locale}
                        open={expandedCategoryKeys.has(category.id)}
                        onOpenChange={(next) => {
                          setExpandedCategoryKeys((current) => {
                            const updated = new Set(current);
                            if (next) {
                              updated.add(category.id);
                            } else {
                              updated.delete(category.id);
                            }
                            return updated;
                          });
                        }}
                        onEditCategory={() => openEditCategory(category.id)}
                        onDeleteCategory={() => openDeleteCategory(category.id)}
                        onEditPackage={openEditTier}
                        onAddTier={() => openAddTier(category.id)}
                        onDeletePackage={openDeletePackage}
                        onPackageStatusUpdated={handlePackageUpdated}
                        onCategoryPlansUpdated={handleCategoryPlansUpdated}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {displayCategories.length > ADMIN_PACKAGES_CATEGORIES_PAGE_SIZE ? (
                  <OmmListPagination
                    total={displayCategories.length}
                    page={categoryListPageClamped}
                    pageSize={ADMIN_PACKAGES_CATEGORIES_PAGE_SIZE}
                    offset={(categoryListPageClamped - 1) * ADMIN_PACKAGES_CATEGORIES_PAGE_SIZE}
                    onPageChange={syncCategoryListPage}
                  />
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </AdminPackagesShell>

      <AdminTypesModal
        isOpen={isTypesModalOpen}
        initialTypes={classTypes}
        onClose={closeTypesModal}
        onTypesChanged={handleClassTypesChanged}
      />
      <AdminPackageCategoryRenameModal
        key={editingCategorySlug ? `rename-category-${editingCategorySlug}` : "rename-category-closed"}
        isOpen={isEditCategoryOpen}
        categorySlug={editingCategorySlug ?? ""}
        categoryName={editingCategory?.label ?? ""}
        packages={packageRows}
        onClose={closeEditCategory}
        onRenamed={handleCategoryRenamed}
      />
      <AdminPackageCategoryDeleteModal
        key={deletingCategory ? `delete-category-${deletingCategory.id}` : "delete-category-closed"}
        isOpen={isDeleteCategoryOpen}
        categorySlug={deletingCategory?.id ?? ""}
        categoryName={deletingCategory?.label ?? ""}
        packages={packageRows}
        onClose={closeDeleteCategory}
        onDeleted={handleCategoryDeleted}
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
        onClose={closeDeletePackage}
        onDeleted={handlePackageDeleted}
      />
      <AdminCenterToast
        message={toastMessage}
        tone="ok"
        onDismiss={() => setToastMessage(null)}
      />
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { AdminPackagesCategoryAccordion } from "@/components/admin/admin-packages-category-accordion";
import { AdminPackagesEmptyState } from "@/components/admin/admin-packages-empty-state";
import { adminFilterRevealVariants } from "@/components/admin/admin-filter-reveal-motion";
import type { AdminPackagesCategoryOption } from "@/components/admin/admin-packages-category-multi-select";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { ADMIN_PACKAGES_CATEGORIES_PAGE_SIZE } from "@/components/admin/admin-packages.constants";

type AdminPackagesCategoryListProps = {
  locale: string;
  sortedPackages: readonly AdminPackageRow[];
  visibleCategories: readonly AdminPackagesCategoryOption[];
  displayCategories: readonly AdminPackagesCategoryOption[];
  filteredPackages: readonly AdminPackageRow[];
  pagedDisplayCategories: readonly AdminPackagesCategoryOption[];
  categoryListPageClamped: number;
  expandedCategoryKeys: ReadonlySet<string>;
  setExpandedCategoryKeys: React.Dispatch<React.SetStateAction<ReadonlySet<string>>>;
  emptyCategoriesLabel: string;
  emptyFilterLabel: string;
  noCategoriesSelectedLabel: string;
  onEditCategory: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditPackage: (packageId: string) => void;
  onAddTier: (categoryId: string) => void;
  onDeletePackage: (packageId: string) => void;
  onPackageStatusUpdated: (saved: AdminPackageRow) => void;
  onCategoryPlansUpdated: (updated: readonly AdminPackageRow[]) => void;
  onCategoryPageChange: (page: number) => void;
};

export function AdminPackagesCategoryList({
  locale,
  sortedPackages,
  visibleCategories,
  displayCategories,
  filteredPackages,
  pagedDisplayCategories,
  categoryListPageClamped,
  expandedCategoryKeys,
  setExpandedCategoryKeys,
  emptyCategoriesLabel,
  emptyFilterLabel,
  noCategoriesSelectedLabel,
  onEditCategory,
  onDeleteCategory,
  onEditPackage,
  onAddTier,
  onDeletePackage,
  onPackageStatusUpdated,
  onCategoryPlansUpdated,
  onCategoryPageChange,
}: AdminPackagesCategoryListProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (sortedPackages.length === 0) {
    return <AdminPackagesEmptyState>{emptyCategoriesLabel}</AdminPackagesEmptyState>;
  }
  if (visibleCategories.length === 0) {
    return <p className="text-sm text-sage-500">{noCategoriesSelectedLabel}</p>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {displayCategories.length === 0 ? (
        <AdminPackagesEmptyState key="packages-filter-empty">{emptyFilterLabel}</AdminPackagesEmptyState>
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
                  onEditCategory={() => onEditCategory(category.id)}
                  onDeleteCategory={() => onDeleteCategory(category.id)}
                  onEditPackage={onEditPackage}
                  onAddTier={() => onAddTier(category.id)}
                  onDeletePackage={onDeletePackage}
                  onPackageStatusUpdated={onPackageStatusUpdated}
                  onCategoryPlansUpdated={onCategoryPlansUpdated}
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
              onPageChange={onCategoryPageChange}
            />
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

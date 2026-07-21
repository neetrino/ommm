"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { adminFilterRevealVariants } from "@/components/admin/admin-filter-reveal-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { AdminPackageRowMenu } from "@/components/admin/admin-package-row-menu";
import { AdminPackagePlanStatusActions } from "@/components/admin/admin-package-plan-status-actions";
import { AdminPackagePlanStatusBadge } from "@/components/admin/admin-package-plan-status-badge";
import {
  PACKAGE_CATEGORY_TABLE_PAGE_SIZE,
} from "@/components/admin/admin-packages.constants";
import {
  formatPackageGuestCount,
  formatPackagePlanName,
  formatPackagePriceLabel,
  formatPackageStockCount,
  formatPackageStartDateLabel,
  formatPackageValidityLabel,
} from "@/components/admin/admin-packages-display";
import { resolvePackageTotalSessions } from "@/components/admin/admin-package-type-sessions.util";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";

type AdminPackagesCategoryTableProps = {
  packages: readonly AdminPackageRow[];
  locale: string;
  onAddTier?: () => void;
  onEditPackage: (packageId: string) => void;
  onDeletePackage?: (packageId: string) => void;
  onPackageStatusUpdated: (saved: AdminPackageRow) => void;
};

function EmptyCell() {
  return <span className="text-[rgba(80,69,59,0.4)]">—</span>;
}

function TableCell({
  children,
  emphasis = false,
  lead = false,
}: {
  children: ReactNode;
  emphasis?: boolean;
  lead?: boolean;
}) {
  const classes = [
    "ommm-admin-packages-table-cell",
    emphasis ? "ommm-admin-packages-table-cell--emphasis" : "",
    lead ? "ommm-admin-packages-table-cell--lead" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}

export function AdminPackagesCategoryTable({
  packages,
  locale,
  onAddTier,
  onEditPackage,
  onDeletePackage,
  onPackageStatusUpdated,
}: AdminPackagesCategoryTableProps) {
  const t = useTranslations("adminPages.packages");
  const reducedMotion = usePrefersReducedMotion();
  const [page, setPage] = useState(1);
  const pageSize = PACKAGE_CATEGORY_TABLE_PAGE_SIZE;
  const [prevPackages, setPrevPackages] = useState(packages);
  if (packages !== prevPackages) {
    setPrevPackages(packages);
    setPage(1);
  }

  const visiblePackages = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return packages.slice(offset, offset + pageSize);
  }, [packages, page, pageSize]);

  const offset = (page - 1) * pageSize;
  const showPager = packages.length > PACKAGE_CATEGORY_TABLE_PAGE_SIZE;

  return (
    <div className="ommm-admin-packages-table">
      <div className="ommm-admin-packages-table-scroll">
        <div className="ommm-admin-packages-table-grid ommm-admin-packages-table-header">
          <div>{t("tablePageName")}</div>
          <div>{t("tableTotalSessions")}</div>
          <div>{t("tablePrice")}</div>
          <div>{t("tableValidity")}</div>
          <div>{t("tableGuests")}</div>
          <div>{t("tableStockCount")}</div>
          <div>{t("tableStartDate")}</div>
          <div>{t("colStatus")}</div>
          <div className="ommm-admin-packages-table-actions sr-only">{t("rowActionsAria")}</div>
        </div>
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
          {visiblePackages.map((pkg, index) => {
            const packageName = formatPackagePlanName(pkg.name, pkg.sessionsPerMonth);
            const guestCount = formatPackageGuestCount(pkg);
            const stockCount = formatPackageStockCount(pkg);
            const startDateLabel = formatPackageStartDateLabel(pkg);
            const hasDiscount =
              typeof pkg.discountedPriceCents === "number" &&
              pkg.discountedPriceCents > 0 &&
              pkg.discountedPriceCents < pkg.priceCents;
            const originalPriceLabel = hasDiscount
              ? formatPackagePriceLabel({ ...pkg, discountedPriceCents: null }, locale)
              : null;
            const finalPriceLabel = formatPackagePriceLabel(pkg, locale);
            const validityLabel = formatPackageValidityLabel(pkg, {
              days: (count) => t("validityDays", { count }),
              months: (count) => t("validityMonths", { count }),
            });
            const totalSessions = resolvePackageTotalSessions(pkg);

            function activatePackageRow(): void {
              onEditPackage(pkg.id);
            }

            function handleRowKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
              if (event.key !== "Enter" && event.key !== " ") {
                return;
              }
              event.preventDefault();
              activatePackageRow();
            }

            return (
              <motion.div
                key={pkg.id}
                layout={!reducedMotion}
                className="ommm-admin-packages-table-row"
                variants={adminFilterRevealVariants(index, reducedMotion)}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div
                  className="ommm-admin-packages-table-row-layout ommm-admin-packages-table-row-layout--clickable"
                  role="button"
                  tabIndex={0}
                  aria-label={t("editPageAria", { name: packageName })}
                  onClick={activatePackageRow}
                  onKeyDown={handleRowKeyDown}
                >
                  <TableCell emphasis lead>
                    <span>{packageName}</span>
                  </TableCell>
                  <TableCell>
                    {totalSessions !== null ? totalSessions : <EmptyCell />}
                  </TableCell>
                  <TableCell>
                    {hasDiscount && originalPriceLabel !== null ? (
                      <span className="inline-flex flex-col items-center gap-0.5">
                        <span className="text-xs leading-tight text-sage-500 line-through">
                          {originalPriceLabel}
                        </span>
                        <span className="font-semibold text-sage-900">{finalPriceLabel}</span>
                      </span>
                    ) : (
                      finalPriceLabel
                    )}
                  </TableCell>
                  <TableCell>{validityLabel}</TableCell>
                  <TableCell>{guestCount !== null ? guestCount : <EmptyCell />}</TableCell>
                  <TableCell>{stockCount !== null ? stockCount : <EmptyCell />}</TableCell>
                  <TableCell>{startDateLabel !== null ? startDateLabel : <EmptyCell />}</TableCell>
                  <TableCell>
                    <AdminPackagePlanStatusBadge isActive={pkg.isActive} />
                  </TableCell>
                  <div
                    className="ommm-admin-packages-table-actions shrink-0"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <AdminPackagePlanStatusActions
                        packageId={pkg.id}
                        isActive={pkg.isActive}
                        onUpdated={onPackageStatusUpdated}
                      />
                      <AdminPackageRowMenu
                        onEdit={() => onEditPackage(pkg.id)}
                        onDeletePackage={
                          onDeletePackage ? () => onDeletePackage(pkg.id) : undefined
                        }
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      </div>
      {showPager ? (
        <OmmListPagination
          total={packages.length}
          page={page}
          pageSize={pageSize}
          offset={offset}
          onPageChange={setPage}
        />
      ) : null}
      {onAddTier ? (
        <div className="flex justify-center border-t border-[rgba(212,196,183,0.15)] px-1 py-5">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sand-300/80 bg-white text-sage-700 shadow-[0_8px_20px_-14px_rgba(45,40,35,0.35)] transition-colors hover:bg-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2"
            aria-label={t("addPageAria")}
            title={t("addPageButton")}
            onClick={onAddTier}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.9}
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M12 4v16M4 12h16" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}

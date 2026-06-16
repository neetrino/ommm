"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
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
  formatPackagePricePerSession,
  formatPackageSessionsLabel,
  formatCombinedPackageSessionsBreakdown,
  formatPackageValidityLabel,
} from "@/components/admin/admin-packages-display";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";

type AdminPackagesCategoryTableProps = {
  packages: readonly AdminPackageRow[];
  locale: string;
  onAddTier: () => void;
  onEditPackage: (packageId: string) => void;
  onDeletePackage: (packageId: string) => void;
  onPackageStatusUpdated: (saved: AdminPackageRow) => void;
};

function EmptyCell() {
  return <span className="text-[rgba(80,69,59,0.4)]">—</span>;
}

function TableCell({
  children,
  emphasis = false,
}: {
  children: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        emphasis
          ? "ommm-admin-packages-table-cell ommm-admin-packages-table-cell--emphasis"
          : "ommm-admin-packages-table-cell"
      }
    >
      {children}
    </div>
  );
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
      <div className="ommm-admin-packages-table-grid ommm-admin-packages-table-header min-w-[68rem]">
        <div>{t("tableSessionName")}</div>
        <div>{t("tableSessions")}</div>
        <div>{t("tablePrice")}</div>
        <div>{t("tablePricePerSession")}</div>
        <div>{t("tableValidity")}</div>
        <div>{t("tableGuests")}</div>
        <div>{t("colStatus")}</div>
        <div className="ommm-admin-packages-table-actions sr-only">{t("rowActionsAria")}</div>
      </div>
      <div className="min-w-[68rem]">
        <AnimatePresence mode="popLayout" initial={false}>
          {visiblePackages.map((pkg, index) => {
            const packageName = formatPackagePlanName(pkg.name, pkg.sessionsPerMonth);
            const sessions = formatPackageSessionsLabel(pkg);
            const sessionsBreakdown = formatCombinedPackageSessionsBreakdown(pkg);
            const pricePerSession = formatPackagePricePerSession(pkg, locale);
            const guestCount = formatPackageGuestCount(pkg);
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
                <div className="ommm-admin-packages-table-grid">
                  <TableCell emphasis>
                    <div className="flex flex-col gap-1">
                      <span>{packageName}</span>
                      {pkg.planType === "COMBINED" ? (
                        <span className="text-xs font-medium uppercase tracking-wide text-sand-700">
                          {t("packageKindCombined")}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell emphasis>
                    {sessions !== null ? (
                      <div className="flex flex-col gap-0.5">
                        <span>{sessions}</span>
                        {sessionsBreakdown !== null ? (
                          <span className="text-xs text-sage-500">{sessionsBreakdown}</span>
                        ) : null}
                      </div>
                    ) : (
                      <EmptyCell />
                    )}
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
                  <TableCell>{pkg.showPricePerSession === false ? null : pricePerSession ?? <EmptyCell />}</TableCell>
                  <TableCell>{validityLabel}</TableCell>
                  <TableCell>{guestCount !== null ? guestCount : <EmptyCell />}</TableCell>
                  <TableCell>
                    <AdminPackagePlanStatusBadge isActive={pkg.isActive} />
                  </TableCell>
                  <div className="ommm-admin-packages-table-actions">
                    <div className="flex items-center justify-end gap-1">
                      <AdminPackagePlanStatusActions
                        packageId={pkg.id}
                        isActive={pkg.isActive}
                        onUpdated={onPackageStatusUpdated}
                      />
                      <AdminPackageRowMenu
                        onEdit={() => onEditPackage(pkg.id)}
                        onDeletePackage={() => onDeletePackage(pkg.id)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {showPager ? (
        <div className="border-t border-[rgba(212,196,183,0.15)] px-3 py-4">
          <OmmListPagination
            total={packages.length}
            page={page}
            pageSize={pageSize}
            offset={offset}
            onPageChange={setPage}
          />
        </div>
      ) : null}
      <div className="flex justify-center border-t border-[rgba(212,196,183,0.15)] px-1 py-5">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sand-300/80 bg-white text-sage-700 shadow-[0_8px_20px_-14px_rgba(45,40,35,0.35)] transition-colors hover:bg-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2"
          aria-label={t("addTierAria")}
          title={t("addTierButton")}
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
    </div>
  );
}

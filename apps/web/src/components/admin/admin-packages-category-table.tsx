"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { adminFilterRevealVariants } from "@/components/admin/admin-filter-reveal-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { AdminPackageRowMenu } from "@/components/admin/admin-package-row-menu";
import {
  PACKAGE_CATEGORY_TABLE_PAGE_SIZE,
} from "@/components/admin/admin-packages.constants";
import {
  formatPackageGuestCount,
  formatPackagePlanName,
  formatPackagePriceLabel,
  formatPackagePricePerSession,
  formatPackageSessionsLabel,
  formatPackageValidityLabel,
} from "@/components/admin/admin-packages-display";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";

type AdminPackagesCategoryTableProps = {
  packages: readonly AdminPackageRow[];
  locale: string;
  onAddTier: () => void;
  onEditPackage: (packageId: string) => void;
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
    <div className="ommm-admin-packages-table overflow-x-auto">
      <div className="ommm-admin-packages-table-grid ommm-admin-packages-table-header min-w-[60rem]">
        <div>{t("tableSessionName")}</div>
        <div>{t("tableSessions")}</div>
        <div>{t("tablePrice")}</div>
        <div>{t("tablePricePerSession")}</div>
        <div>{t("tableValidity")}</div>
        <div>{t("tableGuests")}</div>
        <div className="ommm-admin-packages-table-actions sr-only">{t("rowActionsAria")}</div>
      </div>
      <div className="min-w-[60rem]">
        <AnimatePresence mode="popLayout" initial={false}>
          {visiblePackages.map((pkg, index) => {
            const packageName = formatPackagePlanName(pkg.name, pkg.sessionsPerMonth);
            const sessions = formatPackageSessionsLabel(pkg);
            const pricePerSession = formatPackagePricePerSession(pkg, locale);
            const guestCount = formatPackageGuestCount(pkg);
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
                  <TableCell emphasis>{packageName}</TableCell>
                  <TableCell emphasis>
                    {sessions !== null ? sessions : <EmptyCell />}
                  </TableCell>
                  <TableCell>{formatPackagePriceLabel(pkg, locale)}</TableCell>
                  <TableCell>{pricePerSession ?? <EmptyCell />}</TableCell>
                  <TableCell>{validityLabel}</TableCell>
                  <TableCell>{guestCount !== null ? guestCount : <EmptyCell />}</TableCell>
                  <div className="ommm-admin-packages-table-actions">
                    <AdminPackageRowMenu
                      packageId={pkg.id}
                      isActive={pkg.isActive}
                      onEdit={() => onEditPackage(pkg.id)}
                    />
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

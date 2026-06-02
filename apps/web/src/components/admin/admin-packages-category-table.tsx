"use client";

import { useTranslations } from "next-intl";
import { AdminPackageRowMenu } from "@/components/admin/admin-package-row-menu";
import {
  formatPackagePriceLabel,
  formatPackagePricePerSession,
  formatPackageValidityLabel,
} from "@/components/admin/admin-packages-display";
import { formatPackageSessionsLabel } from "@/components/admin/admin-packages-filter-logic";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";

type AdminPackagesCategoryTableProps = {
  packages: readonly AdminPackageRow[];
  locale: string;
  onEditPackage: (packageId: string) => void;
};

function EmptyCell() {
  return <span className="text-[rgba(80,69,59,0.4)]">—</span>;
}

export function AdminPackagesCategoryTable({
  packages,
  locale,
  onEditPackage,
}: AdminPackagesCategoryTableProps) {
  const t = useTranslations("adminPages.packages");

  return (
    <div className="ommm-admin-packages-table overflow-x-auto">
      <div className="ommm-admin-packages-table-grid ommm-admin-packages-table-header min-w-[42rem]">
        <div>{t("tableSessions")}</div>
        <div>{t("tablePrice")}</div>
        <div>{t("tablePricePerSession")}</div>
        <div>{t("tableValidity")}</div>
        <div>{t("tableGuests")}</div>
        <div className="sr-only">{t("rowActionsAria")}</div>
      </div>
      <div className="min-w-[42rem]">
        {packages.map((pkg) => {
          const sessionsLabel = formatPackageSessionsLabel(pkg, {
            unlimited: t("sessionsUnlimited"),
            sessions: (count) => t("sessionsPerMonth", { count }),
          });
          const pricePerSession = formatPackagePricePerSession(pkg, locale);
          const validity = formatPackageValidityLabel(pkg, {
            days: (count) => t("validityDays", { count }),
            months: (count) => t("validityMonths", { count }),
          });

          return (
            <div key={pkg.id} className="ommm-admin-packages-table-row">
              <div className="ommm-admin-packages-table-grid">
                <div className="font-semibold text-[#1b1c1a]">{sessionsLabel}</div>
                <div className="text-[#1b1c1a]">{formatPackagePriceLabel(pkg, locale)}</div>
                <div>{pricePerSession ?? <EmptyCell />}</div>
                <div className="text-[#1b1c1a]">{validity}</div>
                <div>
                  <EmptyCell />
                </div>
                <AdminPackageRowMenu
                  packageId={pkg.id}
                  isActive={pkg.isActive}
                  onEdit={() => onEditPackage(pkg.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

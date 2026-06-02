"use client";

import { useTranslations } from "next-intl";
import { AdminPackageRowMenu } from "@/components/admin/admin-package-row-menu";
import {
  formatPackageGuestCount,
  formatPackagePriceLabel,
  formatPackagePricePerSession,
  formatPackageValidityLabel,
} from "@/components/admin/admin-packages-display";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";

type AdminPackagesCategoryTableProps = {
  packages: readonly AdminPackageRow[];
  locale: string;
  onEditPackage: (packageId: string) => void;
  onConfigurePricing: (packageId: string) => void;
};

function EmptyCell() {
  return <span className="text-[rgba(80,69,59,0.4)]">—</span>;
}

export function AdminPackagesCategoryTable({
  packages,
  locale,
  onEditPackage,
  onConfigurePricing,
}: AdminPackagesCategoryTableProps) {
  const t = useTranslations("adminPages.packages");

  return (
    <div className="ommm-admin-packages-table overflow-x-auto">
      <div className="ommm-admin-packages-table-grid ommm-admin-packages-table-header min-w-[52rem]">
        <div>{t("colName")}</div>
        <div>{t("tableSessions")}</div>
        <div>{t("tablePrice")}</div>
        <div>{t("tablePricePerSession")}</div>
        <div>{t("tableGuests")}</div>
        <div className="sr-only">{t("rowActionsAria")}</div>
      </div>
      <div className="min-w-[52rem]">
        {packages.map((pkg) => {
          const pricePerSession = formatPackagePricePerSession(pkg, locale);
          const guestCount = formatPackageGuestCount(pkg);
          const durationLabel = formatPackageValidityLabel(pkg, {
            days: (count) => t("validityDays", { count }),
            months: (count) => t("validityMonths", { count }),
          });
          const needsPricingConfiguration = pkg.priceCents <= 0;

          return (
            <div key={pkg.id} className="ommm-admin-packages-table-row">
              <div className="ommm-admin-packages-table-grid">
                {needsPricingConfiguration ? (
                  <div className="col-span-6 flex items-center justify-center py-1">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-300/80 bg-white text-sage-700 transition-colors hover:bg-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2"
                      aria-label={t("configurePricingAria")}
                      title={t("configurePricingButton")}
                      onClick={() => onConfigurePricing(pkg.id)}
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
                ) : (
                  <>
                    <div className="font-semibold text-[#1b1c1a]">{pkg.name}</div>
                    <div className="text-[#1b1c1a]">{durationLabel}</div>
                    <div className="text-[#1b1c1a]">{formatPackagePriceLabel(pkg, locale)}</div>
                    <div>{pricePerSession ?? <EmptyCell />}</div>
                    <div className="text-[#1b1c1a]">
                      {guestCount !== null ? guestCount : <EmptyCell />}
                    </div>
                    <div className="flex items-center justify-end">
                      <AdminPackageRowMenu
                        packageId={pkg.id}
                        isActive={pkg.isActive}
                        onEdit={() => onEditPackage(pkg.id)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

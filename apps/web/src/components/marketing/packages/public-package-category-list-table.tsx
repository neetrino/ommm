"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PackageSubscribePaymentModal } from "@/components/account/package-subscribe-payment-modal";
import {
  formatPackagePriceLabel,
  formatPackageSessionsLabel,
} from "@/components/admin/admin-packages-display";
import {
  resolvePublicPackageFinalPriceCents,
  shouldShowPublicPackageTierName,
} from "@/components/marketing/packages/public-package-card-format";
import {
  formatPublicPackageValidityLabel,
} from "@/components/marketing/packages/public-package-tier-display";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { listPublicPackageCategorySubscribablePlans } from "@/components/marketing/packages/public-package-category-subscribable-plans";
import { toPackageSubscribePlanOptions } from "@/lib/package-subscribe-plan-option";
import { PublicPackageCategoryMobileTierList } from "@/components/marketing/packages/public-package-category-mobile-tier-list";
import styles from "@/components/marketing/packages/public-package-category-list-table.module.css";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type PublicPackageCategoryListTableProps = {
  locale: string;
  categoryLabel: string;
  plans: readonly PublicPackagePlan[];
  audience: PublicPackageCategoryCardsAudience;
  showGuestsColumn?: boolean;
};

function formatGuestCellValue(guestCount: number | undefined): string | null {
  const count = guestCount ?? 0;
  return count > 0 ? String(count) : null;
}

function EmptyCell() {
  return <span className="text-[rgba(80,69,59,0.4)]">—</span>;
}

function resolveDesktopTableClassName(
  showGuestsColumn: boolean,
): string {
  if (showGuestsColumn) {
    return `${styles.table} ${styles.tableWithGuestsNoPerSession}`;
  }
  return `${styles.table} ${styles.tableNoPerSession}`;
}

export function PublicPackageCategoryListTable({
  locale,
  categoryLabel,
  plans,
  audience,
  showGuestsColumn = false,
}: PublicPackageCategoryListTableProps) {
  const t = useTranslations("marketing");
  const searchParams = useSearchParams();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentPlanId, setPaymentPlanId] = useState<string | undefined>(undefined);

  const selectedPlanId = searchParams.get("plan");
  const subscribePlans = useMemo(() => {
    const categoryPlans = [...plans];
    return toPackageSubscribePlanOptions(
      listPublicPackageCategorySubscribablePlans({
        id: "",
        label: categoryLabel,
        plans: categoryPlans,
      }),
    );
  }, [categoryLabel, plans]);
  function openPayment(planId: string) {
    setPaymentPlanId(planId);
    setPaymentOpen(true);
  }

  return (
    <>
      <div className={styles.mobileTierList}>
        <PublicPackageCategoryMobileTierList
          locale={locale}
          categoryLabel={categoryLabel}
          plans={plans}
          audience={audience}
          selectedPlanId={selectedPlanId}
          onSubscribe={audience === "member" ? openPayment : undefined}
        />
      </div>

      <div
        className={`ommm-public-packages-table ${styles.desktopTable} ${resolveDesktopTableClassName(
          showGuestsColumn,
        )}`}
      >
        <div className={styles.headerRow}>
          <div className={styles.headCell}>{t("packagesTablePlan")}</div>
          <div className={styles.headCell}>{t("packagesTableSessions")}</div>
          <div className={styles.headCell}>{t("packagesTablePrice")}</div>
          <div className={styles.headCell}>{t("packagesTableValidity")}</div>
          {showGuestsColumn ? (
            <div className={styles.headCell}>{t("packagesTableGuests")}</div>
          ) : null}
          <div className={styles.headCell}>{t("packagesTableAction")}</div>
        </div>

        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const sessions = formatPackageSessionsLabel(plan);
          const validityLabel = formatPublicPackageValidityLabel(plan, {
            days: (count) => t("packagesValidityDays", { count }),
            months: (count) => t("packagesValidityMonths", { count }),
          });
          const showTierName = shouldShowPublicPackageTierName(plan.name, categoryLabel);
          const guestValue = formatGuestCellValue(plan.guestCount);
          const hasDiscount =
            typeof plan.discountedPriceCents === "number" &&
            plan.discountedPriceCents > 0 &&
            plan.discountedPriceCents < plan.priceCents;
          const originalPrice = hasDiscount
            ? formatPackagePriceLabel({ ...plan, discountedPriceCents: null }, locale)
            : null;

          return (
            <div
              key={plan.id}
              className={`ommm-admin-packages-table-row ${styles.dataRow} ${
                isSelected ? "ommm-package-table-row-selected" : ""
              }`}
              data-selected={isSelected ? "true" : "false"}
            >
              <div className={`${styles.cell} ${styles.cellEmphasis}`}>
                {showTierName ? plan.name : categoryLabel}
              </div>
              <div className={`${styles.cell} ${styles.cellEmphasis}`}>
                {sessions !== null ? (
                  sessions
                ) : plan.isUnlimited ? (
                  t("packagesSessionsUnlimitedShort")
                ) : (
                  <EmptyCell />
                )}
              </div>
              <div className={styles.cell}>
                {hasDiscount && originalPrice !== null ? (
                  <div className="flex flex-col">
                    <span className="text-xs text-sage-500 line-through">{originalPrice}</span>
                    <span className="font-semibold text-sage-900">
                      {formatPackagePriceLabel(
                        { ...plan, priceCents: resolvePublicPackageFinalPriceCents(plan) },
                        locale,
                      )}
                    </span>
                  </div>
                ) : (
                  formatPackagePriceLabel(
                    { ...plan, priceCents: resolvePublicPackageFinalPriceCents(plan) },
                    locale,
                  )
                )}
              </div>
              <div className={styles.cell}>{validityLabel ?? <EmptyCell />}</div>
              {showGuestsColumn ? (
                <div className={styles.cell}>
                  {guestValue !== null ? guestValue : <EmptyCell />}
                </div>
              ) : null}
              <div className={styles.cell}>
                {audience === "member" ? (
                  <button
                    type="button"
                    className="ommm-btn-compact-warm"
                    onClick={() => openPayment(plan.id)}
                  >
                    {t("packagesSubscribeCta")}
                  </button>
                ) : (
                  <Link href="/login" className="ommm-btn-compact-warm">
                    {t("packagesSubscribeCta")}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {audience === "member" ? (
        <PackageSubscribePaymentModal
          isOpen={paymentOpen}
          locale={locale}
          plans={subscribePlans}
          initialPlanId={paymentPlanId}
          onClose={() => setPaymentOpen(false)}
        />
      ) : null}
    </>
  );
}

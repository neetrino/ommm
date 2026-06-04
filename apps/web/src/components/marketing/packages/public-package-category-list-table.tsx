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
  formatPublicPackageTierPricePerSession,
  formatPublicPackageValidityLabel,
} from "@/components/marketing/packages/public-package-tier-display";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { shouldShowPublicPackageTierName } from "@/components/marketing/packages/public-package-card-format";
import { toPackageSubscribePlanOptions } from "@/lib/package-subscribe-plan-option";
import styles from "@/components/marketing/packages/public-package-category-list-table.module.css";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type PublicPackageCategoryListTableProps = {
  locale: string;
  categoryLabel: string;
  plans: readonly PublicPackagePlan[];
  audience: PublicPackageCategoryCardsAudience;
};

function EmptyCell() {
  return <span className="text-[rgba(80,69,59,0.4)]">—</span>;
}

export function PublicPackageCategoryListTable({
  locale,
  categoryLabel,
  plans,
  audience,
}: PublicPackageCategoryListTableProps) {
  const t = useTranslations("marketing");
  const searchParams = useSearchParams();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentPlanId, setPaymentPlanId] = useState<string | undefined>(undefined);

  const selectedPlanId = searchParams.get("plan");
  const subscribePlans = useMemo(() => toPackageSubscribePlanOptions(plans), [plans]);

  function openPayment(planId: string) {
    setPaymentPlanId(planId);
    setPaymentOpen(true);
  }

  return (
    <>
      <div className={`ommm-public-packages-table ${styles.table}`}>
        <div className={styles.headerRow}>
          <div className={styles.headCell}>{t("packagesTablePlan")}</div>
          <div className={styles.headCell}>{t("packagesTableSessions")}</div>
          <div className={styles.headCell}>{t("packagesTablePrice")}</div>
          <div className={styles.headCell}>{t("packagesTablePricePerSession")}</div>
          <div className={styles.headCell}>{t("packagesTableValidity")}</div>
          <div className={styles.headCell}>{t("packagesTableAction")}</div>
        </div>

        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const sessions = formatPackageSessionsLabel(plan);
          const pricePerSession = formatPublicPackageTierPricePerSession(plan, locale);
          const validityLabel = formatPublicPackageValidityLabel(plan, {
            days: (count) => t("packagesValidityDays", { count }),
            months: (count) => t("packagesValidityMonths", { count }),
          });
          const showTierName = shouldShowPublicPackageTierName(plan.name, categoryLabel);

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
              <div className={styles.cell}>{formatPackagePriceLabel(plan, locale)}</div>
              <div className={styles.cell}>{pricePerSession ?? <EmptyCell />}</div>
              <div className={styles.cell}>{validityLabel ?? <EmptyCell />}</div>
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

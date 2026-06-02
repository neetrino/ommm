"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PackageSubscribePaymentModal } from "@/components/account/package-subscribe-payment-modal";
import {
  formatPackageGuestCount,
  formatPackagePriceLabel,
  formatPackagePricePerSession,
  formatPackageSessionsLabel,
  formatPackageValidityLabel,
} from "@/components/admin/admin-packages-display";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { shouldShowPublicPackageTierName } from "@/components/marketing/packages/public-package-card-format";
import { toPackageSubscribePlanOptions } from "@/lib/package-subscribe-plan-option";
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
      <div className="ommm-admin-packages-table overflow-x-auto">
        <div className="ommm-public-packages-table-grid ommm-admin-packages-table-header min-w-[56rem]">
          <div>{t("packagesTablePlan")}</div>
          <div>{t("packagesTableSessions")}</div>
          <div>{t("packagesTablePrice")}</div>
          <div>{t("packagesTablePricePerSession")}</div>
          <div>{t("packagesTableValidity")}</div>
          <div>{t("packagesTableGuests")}</div>
          <div className="ommm-admin-packages-table-actions">{t("packagesTableAction")}</div>
        </div>
        <div className="min-w-[56rem]">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const sessions = formatPackageSessionsLabel(plan);
            const pricePerSession = formatPackagePricePerSession(plan, locale);
            const guestCount = formatPackageGuestCount(plan);
            const validityLabel = formatPackageValidityLabel(plan, {
              days: (count) => t("packagesValidityDays", { count }),
              months: (count) => t("packagesValidityMonths", { count }),
            });
            const showTierName = shouldShowPublicPackageTierName(plan.name, categoryLabel);

            return (
              <div
                key={plan.id}
                className={`ommm-admin-packages-table-row ${isSelected ? "ommm-package-table-row-selected" : ""}`}
                data-selected={isSelected ? "true" : "false"}
              >
                <div className="ommm-public-packages-table-grid">
                  <div className="ommm-admin-packages-table-cell ommm-admin-packages-table-cell--emphasis">
                    {showTierName ? plan.name : categoryLabel}
                  </div>
                  <div className="ommm-admin-packages-table-cell ommm-admin-packages-table-cell--emphasis">
                    {sessions !== null ? sessions : plan.isUnlimited ? t("packagesSessionsUnlimitedShort") : <EmptyCell />}
                  </div>
                  <div className="ommm-admin-packages-table-cell">
                    {formatPackagePriceLabel(plan, locale)}
                  </div>
                  <div className="ommm-admin-packages-table-cell">
                    {pricePerSession ?? <EmptyCell />}
                  </div>
                  <div className="ommm-admin-packages-table-cell">{validityLabel}</div>
                  <div className="ommm-admin-packages-table-cell">
                    {guestCount !== null ? guestCount : <EmptyCell />}
                  </div>
                  <div className="ommm-admin-packages-table-actions px-1">
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
                {plan.billingPeriod.length > 0 ? (
                  <p className="px-3 pb-2 text-center text-xs text-sage-500">
                    {plan.billingPeriod} ·{" "}
                    {t("packagesPeriodDaysShort", { days: plan.periodDays })}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
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

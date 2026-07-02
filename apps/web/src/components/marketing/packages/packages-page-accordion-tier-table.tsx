import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatPackagePlanName, formatPackagePriceLabel } from "@/components/admin/admin-packages-display";
import { resolvePublicPackageFinalPriceCents } from "@/components/marketing/packages/public-package-card-format";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import type { ExpandedTierTableProps } from "@/components/marketing/packages/packages-page-accordion.types";
import { PackagesPageAccordionTierRow } from "@/components/marketing/packages/packages-page-accordion-tier-row";

export function PackagesPageAccordionTierTable({
  locale,
  category,
  audience,
  selectedPlanId,
  onSelectPlan,
  onSubscribe,
}: ExpandedTierTableProps) {
  const t = useTranslations("marketing");
  const [expandedMixPlanId, setExpandedMixPlanId] = useState<string | null>(null);
  const tierColumnsStyle = useMemo(
    () =>
      ({
        ["--packages-page-tier-columns" as string]:
          "minmax(0, 1.05fr) minmax(0, 0.65fr) minmax(0, 0.95fr) minmax(0, 0.55fr) minmax(0, 0.45fr) minmax(0, 1.05fr)",
      }) as CSSProperties,
    [],
  );

  return (
    <div className={accordionStyles.tierTableLayout} style={tierColumnsStyle}>
      <div className={accordionStyles.columnHeaders} role="row">
        <span className={accordionStyles.columnHeaderPill}>{t("packagesTablePlan")}</span>
        <span className={accordionStyles.columnHeaderPill}>{t("packagesTableTotalSessions")}</span>
        <span className={accordionStyles.columnHeaderPill}>{t("packagesTablePrice")}</span>
        <span className={accordionStyles.columnHeaderPill}>{t("packagesTableValidity")}</span>
        <span className={accordionStyles.columnHeaderPill}>{t("packagesTableGuests")}</span>
        <span
          className={`${accordionStyles.columnHeaderPill} ${accordionStyles.columnHeaderSubscribe}`}
        >
          {t("packagesSubscribeCta")}
        </span>
      </div>

      <div className={accordionStyles.tierTable}>
        {category.plans.map((plan) => (
          <PackagesPageAccordionTierRow
            key={plan.id}
            locale={locale}
            plan={plan}
            audience={audience}
            isSelected={selectedPlanId === plan.id}
            isMixExpanded={expandedMixPlanId === plan.id}
            onSelectPlan={onSelectPlan}
            onSubscribe={onSubscribe}
            onToggleMixExpand={() =>
              setExpandedMixPlanId((current) => (current === plan.id ? null : plan.id))
            }
          />
        ))}
      </div>
    </div>
  );
}

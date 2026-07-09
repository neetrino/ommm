import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import type { ExpandedTierTableProps } from "@/components/marketing/packages/packages-page-accordion.types";
import { PackagesPageAccordionTierRow } from "@/components/marketing/packages/packages-page-accordion-tier-row";
import { PACKAGES_PAGE_TIER_TABLE_COLUMNS } from "@/components/marketing/packages/packages-page-tokens";

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
        ["--packages-page-tier-columns" as string]: PACKAGES_PAGE_TIER_TABLE_COLUMNS,
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

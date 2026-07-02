import { useTranslations } from "next-intl";
import { formatPackagePlanName, formatPackagePriceLabel } from "@/components/admin/admin-packages-display";
import { resolvePublicPackageFinalPriceCents } from "@/components/marketing/packages/public-package-card-format";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import type { ExpandedTierRowProps } from "@/components/marketing/packages/packages-page-accordion.types";
import {
  formatPublicPackageValidityLabel,
  resolvePublicPackageTotalSessions,
} from "@/components/marketing/packages/public-package-tier-display";
import { Link } from "@/i18n/navigation";
import { buildPackagesSubscribeLoginHref } from "@/lib/auth-redirect";
import {
  PublicPackageTypeSessionsBreakdown,
  PublicPackageTypeSessionsExpandButton,
} from "@/components/marketing/packages/public-package-type-sessions-breakdown";
import {
  hasPublicPackageTypeSessions,
  resolvePublicPackageTypeSessionRows,
} from "@/components/marketing/packages/public-package-type-session-rows";

function PackagesPageAccordionEmptyCell() {
  return <span className={accordionStyles.tierEmpty}>—</span>;
}

export function PackagesPageAccordionTierRow({
  locale,
  plan,
  audience,
  isSelected,
  isMixExpanded,
  onSelectPlan,
  onSubscribe,
  onToggleMixExpand,
}: ExpandedTierRowProps) {
  const t = useTranslations("marketing");
  const packageName = formatPackagePlanName(plan.name, plan.sessionsPerMonth);
  const totalSessions = resolvePublicPackageTotalSessions(plan);
  const validityLabel = formatPublicPackageValidityLabel(plan, {
    days: (count) => t("packagesValidityDays", { count }),
    months: (count) => t("packagesValidityMonths", { count }),
  });
  const guestCount = plan.guestCount ?? 0;
  const hasDiscount =
    typeof plan.discountedPriceCents === "number" &&
    plan.discountedPriceCents > 0 &&
    plan.discountedPriceCents < plan.priceCents;
  const finalPriceLabel = formatPackagePriceLabel(
    { ...plan, priceCents: resolvePublicPackageFinalPriceCents(plan) },
    locale,
  );
  const originalPriceLabel = hasDiscount
    ? formatPackagePriceLabel({ ...plan, discountedPriceCents: null }, locale)
    : null;
  const hasMixSessions = hasPublicPackageTypeSessions(plan.typeSessionAllocations);
  const mixSessionRows = resolvePublicPackageTypeSessionRows(plan.typeSessionAllocations);

  return (
    <div
      className={`${accordionStyles.tierRow} ${isSelected ? accordionStyles.tierRowSelected : ""}`}
      data-selected={isSelected ? "true" : "false"}
    >
      <div className={`${accordionStyles.tierCell} ${accordionStyles.tierPlanName}`}>
        <div className={accordionStyles.tierPlanNameColumn}>
          <div className={accordionStyles.tierPlanNameWrap}>
            <button
              type="button"
              className={accordionStyles.tierPlanNameButton}
              aria-pressed={isSelected}
              onClick={() => onSelectPlan(plan.id)}
            >
              {packageName}
            </button>
            {hasMixSessions ? (
              <PublicPackageTypeSessionsExpandButton
                expanded={isMixExpanded}
                packageName={packageName}
                onToggle={onToggleMixExpand}
              />
            ) : null}
          </div>
          {isMixExpanded ? (
            <div className={accordionStyles.tierMixBreakdown}>
              <PublicPackageTypeSessionsBreakdown rows={mixSessionRows} />
            </div>
          ) : null}
        </div>
      </div>
      <div className={`${accordionStyles.tierCell} ${accordionStyles.tierSessions}`}>
        {plan.isUnlimited ? (
          t("packagesSessionsUnlimitedShort")
        ) : totalSessions !== null ? (
          totalSessions
        ) : (
          <PackagesPageAccordionEmptyCell />
        )}
      </div>
      <div className={`${accordionStyles.tierCell} ${accordionStyles.tierPrice}`}>
        {hasDiscount && originalPriceLabel !== null ? (
          <span className={accordionStyles.tierPriceWithDiscount}>
            <span className={accordionStyles.tierPriceOriginal}>{originalPriceLabel}</span>
            <span className={accordionStyles.tierPriceFinal}>{finalPriceLabel}</span>
          </span>
        ) : (
          finalPriceLabel
        )}
      </div>
      <div className={`${accordionStyles.tierCell} ${accordionStyles.tierValidity}`}>
        {validityLabel ?? <PackagesPageAccordionEmptyCell />}
      </div>
      <div className={`${accordionStyles.tierCell} ${accordionStyles.tierGuests}`}>
        {guestCount > 0 ? guestCount : <PackagesPageAccordionEmptyCell />}
      </div>
      <div className={`${accordionStyles.tierCell} ${accordionStyles.tierActionCell}`}>
        {audience === "member" ? (
          <button
            type="button"
            className={accordionStyles.subscribeButton}
            onClick={() => onSubscribe(plan)}
          >
            {t("packagesSubscribeCta")}
          </button>
        ) : (
          <Link
            href={buildPackagesSubscribeLoginHref(plan.id)}
            className={accordionStyles.subscribeButton}
          >
            {t("packagesSubscribeCta")}
          </Link>
        )}
      </div>
    </div>
  );
}

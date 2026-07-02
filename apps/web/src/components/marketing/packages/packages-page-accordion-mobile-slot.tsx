import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import { mobilePanelStyleVars } from "@/components/marketing/packages/packages-page-accordion.helpers";
import type { MobileAccordionSlotProps } from "@/components/marketing/packages/packages-page-accordion.types";
import { PACKAGES_PAGE_MOBILE_FIGMA } from "@/components/marketing/packages/packages-page-tokens";
import { PackagesPageCardFabImage } from "@/components/marketing/packages/packages-page-card-fab";
import { PublicPackageCategoryMobileTierList } from "@/components/marketing/packages/public-package-category-mobile-tier-list";

export function PackagesPageAccordionMobileSlot({
  locale,
  category,
  isExpanded,
  detailsLabel,
  onOpen,
  onClose,
  openLabel,
  closeLabel,
  audience,
  selectedPlanId,
  onSelectPlan,
  onSubscribe,
}: MobileAccordionSlotProps) {
  return (
    <section
      className={accordionStyles.mobileAccordionItem}
      style={mobilePanelStyleVars(category.gradientStartColor)}
      data-expanded={isExpanded ? "true" : "false"}
      aria-label={category.label}
    >
      <div className={accordionStyles.mobileAccordionHeader}>
        <div className={accordionStyles.mobileCardBody}>
          <h2 className={accordionStyles.mobileCardTitle}>{category.label}</h2>
          <p className={accordionStyles.mobileCardDetails}>{detailsLabel}</p>
        </div>
        <button
          type="button"
          className={`${accordionStyles.mobileCardFab} ${accordionStyles.detailsFabInteractive}`}
          aria-label={isExpanded ? closeLabel : openLabel}
          aria-expanded={isExpanded}
          onClick={() => (isExpanded ? onClose() : onOpen(category.id))}
        >
          <PackagesPageCardFabImage
            sizePx={PACKAGES_PAGE_MOBILE_FIGMA.mobileFabSizePx}
            orientation="vertical-animated"
          />
        </button>
      </div>
      <div
        className={accordionStyles.mobileAccordionContent}
        aria-hidden={isExpanded ? undefined : true}
      >
        <div className={accordionStyles.mobileAccordionContentInner}>
          {category.plans.length > 0 ? (
            <PublicPackageCategoryMobileTierList
              locale={locale}
              categoryLabel={category.label}
              plans={category.plans}
              audience={audience}
              selectedPlanId={selectedPlanId}
              onSelectPlan={onSelectPlan}
              onSubscribe={(planId) => {
                const plan = category.plans.find((item) => item.id === planId);
                if (plan !== undefined) {
                  onSubscribe(plan);
                }
              }}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

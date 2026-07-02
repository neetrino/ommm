import cardStyles from "@/components/marketing/packages/packages-page-category-cards.module.css";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import {
  defaultCardStyleVars,
  panelStyleVars,
} from "@/components/marketing/packages/packages-page-accordion.helpers";
import type { DesktopAccordionPanelProps } from "@/components/marketing/packages/packages-page-accordion.types";
import { PackagesPageAccordionTierTable } from "@/components/marketing/packages/packages-page-accordion-tier-table";
import { PACKAGES_PAGE_VISIBLE_TIER_COUNT } from "@/components/marketing/packages/packages-page-tokens";
import { PackagesPageCardFabImage } from "@/components/marketing/packages/packages-page-card-fab";

export function PackagesPageAccordionDesktopPanel({
  locale,
  category,
  mode,
  detailsLabel,
  openLabel,
  closeLabel,
  audience,
  selectedPlanId,
  onSelectPlan,
  onSubscribe,
  onOpen,
  onClose,
}: DesktopAccordionPanelProps) {
  const isExpanded = mode === "expanded";
  const isIdle = mode === "idle";
  const tierScrollEnabled = category.plans.length > PACKAGES_PAGE_VISIBLE_TIER_COUNT;

  const panelClassName = isIdle
    ? `${cardStyles.card} ${accordionStyles.desktopAccordionPanel}`
    : `${accordionStyles.panel} ${accordionStyles.desktopAccordionPanel} ${
        isExpanded ? accordionStyles.panelExpanded : accordionStyles.panelCollapsed
      }`;

  const panelStyle = isIdle
    ? defaultCardStyleVars(category.gradientStartColor)
    : panelStyleVars(category.gradientStartColor);

  const fabFooterClassName = isIdle
    ? cardStyles.cardFooter
    : `${accordionStyles.panelFabFooter} ${
        isExpanded ? accordionStyles.expandedFooter : accordionStyles.collapsedFabWrap
      }`;

  const fabButtonClassName = isIdle
    ? cardStyles.fab
    : isExpanded
      ? accordionStyles.closeFab
      : accordionStyles.openFab;

  return (
    <div
      className={panelClassName}
      style={panelStyle}
      data-expanded={isExpanded ? "true" : "false"}
      aria-label={isIdle ? undefined : category.label}
    >
      {isIdle ? (
        <div className={cardStyles.cardTop}>
          <h2 className={cardStyles.title}>{category.label}</h2>
          {category.priceAmount !== null ? (
            <div className={cardStyles.priceBlock}>
              {category.priceFromPrefix !== undefined ? (
                <p className={cardStyles.priceFromPrefix}>{category.priceFromPrefix}</p>
              ) : null}
              <p className={cardStyles.price}>{category.priceAmount}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === "collapsed" ? (
        <div className={accordionStyles.collapsedTop}>
          <p className={accordionStyles.collapsedTitle}>{category.label}</p>
          {category.priceAmount !== null ? (
            <p className={accordionStyles.collapsedPrice}>{category.priceAmount}</p>
          ) : null}
        </div>
      ) : null}

      {isExpanded ? (
        <div
          className={accordionStyles.expandedBody}
          data-tier-scroll={tierScrollEnabled ? "enabled" : "disabled"}
        >
          <div className={accordionStyles.expandedBodyInner}>
            <h2 className={accordionStyles.expandedHeader}>{category.label}</h2>
            {category.plans.length > 0 ? (
              <PackagesPageAccordionTierTable
                locale={locale}
                category={category}
                audience={audience}
                selectedPlanId={selectedPlanId}
                onSelectPlan={onSelectPlan}
                onSubscribe={onSubscribe}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={fabFooterClassName}>
        {isIdle ? (
          <button
            type="button"
            className={cardStyles.detailsTrigger}
            aria-label={openLabel}
            onClick={() => onOpen(category.id)}
          >
            <span className={cardStyles.detailsLabel}>{detailsLabel}</span>
            <span className={cardStyles.detailsTriggerFab} aria-hidden>
              <PackagesPageCardFabImage orientation="horizontal-animated" />
            </span>
          </button>
        ) : (
          <button
            type="button"
            className={`${fabButtonClassName} ${accordionStyles.detailsFabInteractive}`}
            aria-label={isExpanded ? closeLabel : openLabel}
            aria-expanded={isExpanded}
            onClick={() => (isExpanded ? onClose() : onOpen(category.id))}
          >
            <PackagesPageCardFabImage orientation="horizontal-animated" />
          </button>
        )}
      </div>
    </div>
  );
}

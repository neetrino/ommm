"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import { formatPackagePriceLabel } from "@/components/admin/admin-packages-display";
import cardStyles from "@/components/marketing/packages/packages-page-category-cards.module.css";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import type { PackagesPageAccordionCategory } from "@/components/marketing/packages/packages-page-category-data";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { PublicPackageCategoryMobileTierList } from "@/components/marketing/packages/public-package-category-mobile-tier-list";
import { PackageSubscribePaymentModal } from "@/components/account/package-subscribe-payment-modal";
import {
  formatPublicPackageTierPricePerSession,
  formatPublicPackageTierSessionsHeadline,
  formatPublicPackageValidityLabel,
} from "@/components/marketing/packages/public-package-tier-display";
import {
  PACKAGES_PAGE_ACCORDION_FIGMA,
  PACKAGES_PAGE_CARD_FIGMA,
  PACKAGES_PAGE_LAYOUT,
  PACKAGES_PAGE_MOBILE_FIGMA,
  PACKAGES_PAGE_VISIBLE_TIER_COUNT,
  buildPackagesPageCategoryGradient,
  resolvePackagesPageAccordionRowHeightPx,
  resolvePackagesPageCategoryAccentColor,
} from "@/components/marketing/packages/packages-page-tokens";
import { PackagesPageCardFabImage } from "@/components/marketing/packages/packages-page-card-fab";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { buildPackagesSubscribeLoginHref } from "@/lib/auth-redirect";
import { usePackageSubscribeUrlState } from "@/hooks/use-package-subscribe-url-state";
import { resolvePackageSubscribeCategoryContext } from "@/lib/package-subscribe-category-plans";
import { toPackageSubscribePlanOptions } from "@/lib/package-subscribe-plan-option";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type PackagesPageAccordionProps = {
  locale: string;
  categories: readonly PackagesPageAccordionCategory[];
  audience?: PublicPackageCategoryCardsAudience;
};

/** Locates a plan (and its category) by id across all accordion categories. */
function toAccordionCategoryGroups(
  categories: readonly PackagesPageAccordionCategory[],
) {
  return categories.map((category) => ({
    id: category.id,
    label: category.label,
    plans: category.plans,
  }));
}

function panelStyleVars(categoryId: string, accentColor: string): CSSProperties {
  const figma = PACKAGES_PAGE_CARD_FIGMA;
  const accordion = PACKAGES_PAGE_ACCORDION_FIGMA;

  return {
    ["--packages-page-panel-gradient" as string]: buildPackagesPageCategoryGradient(categoryId),
    ["--packages-page-card-radius" as string]: `${figma.cardRadiusPx}px`,
    ["--packages-page-text-color" as string]: figma.textColor,
    ["--packages-page-text-color-hover" as string]: figma.textColorHover,
    ["--packages-page-fab-fill" as string]: figma.fabFill,
    ["--packages-page-fab-fill-opacity" as string]: String(figma.fabFillOpacity),
    ["--packages-page-fab-fill-hover" as string]: figma.fabFillHover,
    ["--packages-page-fab-fill-hover-opacity" as string]: String(figma.fabFillHoverOpacity),
    ["--packages-page-fab-arrow" as string]: figma.fabArrowColor,
    ["--packages-page-fab-size" as string]: `${figma.fabSizePx}px`,
    ["--packages-page-fab-fill" as string]: figma.fabFill,
    ["--packages-page-subscribe-text" as string]: accentColor,
    ["--packages-page-collapsed-title-size" as string]: `${accordion.collapsedTitleSizePx}px`,
    ["--packages-page-collapsed-price-size" as string]: `${accordion.collapsedPriceSizePx}px`,
    ["--packages-page-expanded-title-size" as string]: `${accordion.expandedTitleSizePx}px`,
    ["--packages-page-column-header-size" as string]: `${accordion.columnHeaderFontSizePx}px`,
    ["--packages-page-column-header-gap" as string]: `${accordion.columnHeaderGapPx}px`,
    ["--packages-page-tier-row-gap" as string]: `${accordion.tierRowGapPx}px`,
    ["--packages-page-tier-sessions-size" as string]: `${accordion.tierSessionsFontSizePx}px`,
    ["--packages-page-tier-meta-size" as string]: `${accordion.tierMetaFontSizePx}px`,
    ["--packages-page-sessions-color" as string]: accordion.sessionsTextColor,
    ["--packages-page-validity-color" as string]: accordion.validityTextColor,
    ["--packages-page-subscribe-height" as string]: `${accordion.subscribeButtonHeightPx}px`,
    ["--packages-page-subscribe-size" as string]: `${accordion.subscribeFontSizePx}px`,
    ["--packages-page-subscribe-offset" as string]: `${accordion.subscribeColumnOffsetPx}px`,
    ["--packages-page-fab-footer-inset" as string]: `${accordion.fabFooterInsetPx}px`,
  };
}

function layoutStyleVars(): CSSProperties {
  return {
    ["--packages-page-grid-max-width" as string]: `${PACKAGES_PAGE_LAYOUT.gridMaxWidthPx}px`,
    ["--packages-page-cards-gap" as string]: PACKAGES_PAGE_LAYOUT.cardsGap,
    ["--packages-page-accordion-gap" as string]: PACKAGES_PAGE_LAYOUT.accordionGap,
    ["--packages-page-mobile-accordion-gap" as string]: PACKAGES_PAGE_LAYOUT.mobileAccordionGap,
    ["--packages-page-mobile-collapsed-min-height" as string]:
      PACKAGES_PAGE_LAYOUT.mobileCollapsedCardMinHeight,
    ["--packages-page-mobile-fab-size" as string]: PACKAGES_PAGE_LAYOUT.mobileFabSize,
    ["--packages-page-collapsed-width" as string]: PACKAGES_PAGE_LAYOUT.collapsedPanelWidth,
    ["--packages-page-row-height" as string]: PACKAGES_PAGE_LAYOUT.rowHeight,
    ["--packages-page-expanded-scroll-height" as string]: PACKAGES_PAGE_LAYOUT.expandedScrollHeight,
    ["--packages-page-tier-row-height" as string]: PACKAGES_PAGE_LAYOUT.tierRowHeight,
    ["--packages-page-expanded-table-min-width" as string]: PACKAGES_PAGE_LAYOUT.expandedTableMinWidth,
    ["--packages-page-transition-duration" as string]: `${PACKAGES_PAGE_ACCORDION_FIGMA.transitionDurationMs}ms`,
    ["--packages-page-transition-easing" as string]: PACKAGES_PAGE_ACCORDION_FIGMA.transitionEasing,
    ["--packages-page-mobile-tier-card-radius" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.tierCardRadiusPx}px`,
    ["--packages-page-mobile-tier-card-gap" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.tierCardGapPx}px`,
    ["--packages-page-mobile-tier-title-size" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.tierTitleSizePx}px`,
    ["--packages-page-mobile-tier-meta-label-size" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.tierMetaLabelSizePx}px`,
    ["--packages-page-mobile-tier-meta-value-size" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.tierMetaValueSizePx}px`,
    ["--packages-page-mobile-subscribe-height" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.subscribeButtonHeightPx}px`,
    ["--packages-page-mobile-subscribe-size" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.subscribeFontSizePx}px`,
    ["--packages-page-mobile-card-radius" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.collapsedCardRadiusPx}px`,
  };
}

function mobilePanelStyleVars(categoryId: string): CSSProperties {
  const mobile = PACKAGES_PAGE_MOBILE_FIGMA;

  return {
    ...panelStyleVars(categoryId, resolvePackagesPageCategoryAccentColor(categoryId)),
    ["--packages-page-mobile-collapsed-title-size" as string]: `${mobile.collapsedTitleSizePx}px`,
    ["--packages-page-mobile-collapsed-details-size" as string]: `${mobile.collapsedDetailsSizePx}px`,
    ["--packages-page-mobile-expanded-padding" as string]: `${mobile.expandedPanelPaddingPx}px`,
    ["--packages-page-mobile-card-radius" as string]: `${mobile.collapsedCardRadiusPx}px`,
  };
}

function defaultCardStyleVars(categoryId: string): CSSProperties {
  const figma = PACKAGES_PAGE_CARD_FIGMA;

  return {
    ...panelStyleVars(categoryId, resolvePackagesPageCategoryAccentColor(categoryId)),
    ["--packages-page-card-aspect-ratio" as string]:
      `${figma.cardWidthPx} / ${resolvePackagesPageAccordionRowHeightPx()}`,
    ["--packages-page-title-size" as string]: `${figma.titleFontSizePx}px`,
    ["--packages-page-title-line-height" as string]: `${figma.titleLineHeightPx}px`,
    ["--packages-page-title-letter-spacing" as string]: `${figma.titleLetterSpacingPx}px`,
    ["--packages-page-price-size" as string]: `${figma.priceFontSizePx}px`,
    ["--packages-page-details-size" as string]: `${figma.detailsFontSizePx}px`,
    ["--packages-page-content-padding-left" as string]: `${figma.contentPaddingLeftPx}px`,
    ["--packages-page-details-offset-left" as string]: `${figma.detailsPaddingLeftPx}px`,
    backgroundImage: buildPackagesPageCategoryGradient(categoryId),
  };
}

function EmptyCell() {
  return <span className={accordionStyles.tierEmpty}>—</span>;
}

type ExpandedTierTableProps = {
  locale: string;
  category: PackagesPageAccordionCategory;
  audience: PublicPackageCategoryCardsAudience;
  onSubscribe: (plan: PublicPackagePlan) => void;
};

function ExpandedTierTable({
  locale,
  category,
  audience,
  onSubscribe,
}: ExpandedTierTableProps) {
  const t = useTranslations("marketing");

  return (
    <div className={accordionStyles.tierTableLayout}>
      <div className={accordionStyles.columnHeaders} role="row">
        <span className={accordionStyles.columnHeaderPill}>{t("packagesTableSessions")}</span>
        <span className={accordionStyles.columnHeaderPill}>{t("packagesTablePrice")}</span>
        <span className={accordionStyles.columnHeaderPill}>{t("packagesTablePricePerSession")}</span>
        <span className={accordionStyles.columnHeaderPill}>{t("packagesTableValidity")}</span>
        <span className={accordionStyles.columnHeaderPill}>{t("packagesTableGuests")}</span>
        <span className={accordionStyles.columnHeaderAction} aria-hidden />
      </div>

      <div className={accordionStyles.tierTable}>
        {category.plans.map((plan) => (
          <ExpandedTierRow
            key={plan.id}
            locale={locale}
            plan={plan}
            audience={audience}
            onSubscribe={onSubscribe}
          />
        ))}
      </div>
    </div>
  );
}

type ExpandedTierRowProps = {
  locale: string;
  plan: PublicPackagePlan;
  audience: PublicPackageCategoryCardsAudience;
  onSubscribe: (plan: PublicPackagePlan) => void;
};

function ExpandedTierRow({ locale, plan, audience, onSubscribe }: ExpandedTierRowProps) {
  const t = useTranslations("marketing");
  const sessions = formatPublicPackageTierSessionsHeadline(plan, {
    unlimited: t("packagesSessionsUnlimitedShort"),
    count: (values) => t("packagesTierSessionsLabel", values),
  });
  const pricePerSession = formatPublicPackageTierPricePerSession(plan, locale);
  const validityLabel = formatPublicPackageValidityLabel(plan, {
    days: (count) => t("packagesValidityDays", { count }),
    months: (count) => t("packagesValidityMonths", { count }),
  });
  const guestCount = plan.guestCount ?? 0;

  return (
    <div className={accordionStyles.tierRow}>
      <div className={`${accordionStyles.tierCell} ${accordionStyles.tierSessions}`}>{sessions}</div>
      <div className={`${accordionStyles.tierCell} ${accordionStyles.tierPrice}`}>
        {formatPackagePriceLabel(plan, locale)}
      </div>
      <div className={`${accordionStyles.tierCell} ${accordionStyles.tierPricePerSession}`}>
        {pricePerSession ?? <EmptyCell />}
      </div>
      <div className={`${accordionStyles.tierCell} ${accordionStyles.tierValidity}`}>
        {validityLabel ?? <EmptyCell />}
      </div>
      <div className={`${accordionStyles.tierCell} ${accordionStyles.tierGuests}`}>
        {guestCount > 0 ? guestCount : <EmptyCell />}
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

type DesktopPanelMode = "idle" | "collapsed" | "expanded";

function resolveDesktopPanelMode(
  isAccordionMode: boolean,
  isExpanded: boolean,
): DesktopPanelMode {
  if (!isAccordionMode) {
    return "idle";
  }
  return isExpanded ? "expanded" : "collapsed";
}

type DesktopAccordionPanelProps = {
  locale: string;
  category: PackagesPageAccordionCategory;
  mode: DesktopPanelMode;
  detailsLabel: string;
  openLabel: string;
  closeLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  onSubscribe: (plan: PublicPackagePlan) => void;
  onOpen: (categoryId: string) => void;
  onClose: () => void;
};

function DesktopAccordionPanel({
  locale,
  category,
  mode,
  detailsLabel,
  openLabel,
  closeLabel,
  audience,
  onSubscribe,
  onOpen,
  onClose,
}: DesktopAccordionPanelProps) {
  const isExpanded = mode === "expanded";
  const isIdle = mode === "idle";
  const tierScrollEnabled = category.plans.length > PACKAGES_PAGE_VISIBLE_TIER_COUNT;
  const accentColor = resolvePackagesPageCategoryAccentColor(category.id);

  const panelClassName = isIdle
    ? `${cardStyles.card} ${accordionStyles.desktopAccordionPanel}`
    : `${accordionStyles.panel} ${accordionStyles.desktopAccordionPanel} ${
        isExpanded ? accordionStyles.panelExpanded : accordionStyles.panelCollapsed
      }`;

  const panelStyle = isIdle
    ? defaultCardStyleVars(category.id)
    : panelStyleVars(category.id, accentColor);

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
              <ExpandedTierTable
                locale={locale}
                category={category}
                audience={audience}
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

type MobileAccordionSlotProps = {
  locale: string;
  category: PackagesPageAccordionCategory;
  isExpanded: boolean;
  detailsLabel: string;
  onOpen: (categoryId: string) => void;
  onClose: () => void;
  openLabel: string;
  closeLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  onSubscribe: (plan: PublicPackagePlan) => void;
};

function MobileAccordionSlot({
  locale,
  category,
  isExpanded,
  detailsLabel,
  onOpen,
  onClose,
  openLabel,
  closeLabel,
  audience,
  onSubscribe,
}: MobileAccordionSlotProps) {
  return (
    <section
      className={accordionStyles.mobileAccordionItem}
      style={mobilePanelStyleVars(category.id)}
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

function resolveAccordionSlotClass(
  isAccordionMode: boolean,
  isExpanded: boolean,
): string {
  if (!isAccordionMode) {
    return accordionStyles.accordionSlot;
  }
  return isExpanded
    ? `${accordionStyles.accordionSlot} ${accordionStyles.accordionSlotExpanded}`
    : `${accordionStyles.accordionSlot} ${accordionStyles.accordionSlotCollapsed}`;
}

type DesktopAccordionSlotProps = {
  locale: string;
  category: PackagesPageAccordionCategory;
  expandedCategory: PackagesPageAccordionCategory | null;
  detailsLabel: string;
  onOpen: (categoryId: string) => void;
  onClose: () => void;
  openLabel: string;
  closeLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  onSubscribe: (plan: PublicPackagePlan) => void;
};

function DesktopAccordionSlot({
  locale,
  category,
  expandedCategory,
  detailsLabel,
  onOpen,
  onClose,
  openLabel,
  closeLabel,
  audience,
  onSubscribe,
}: DesktopAccordionSlotProps) {
  const isAccordionMode = expandedCategory !== null;
  const isExpanded = expandedCategory?.id === category.id;
  const mode = resolveDesktopPanelMode(isAccordionMode, isExpanded);

  return (
    <div className={resolveAccordionSlotClass(isAccordionMode, isExpanded)}>
      <div className={accordionStyles.slotContent}>
        <DesktopAccordionPanel
          locale={locale}
          category={category}
          mode={mode}
          detailsLabel={detailsLabel}
          openLabel={openLabel}
          closeLabel={closeLabel}
          audience={audience}
          onSubscribe={onSubscribe}
          onOpen={onOpen}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function resolveExpandedCategoryId(
  categories: readonly PackagesPageAccordionCategory[],
  categoryParam: string | null,
): string | null {
  if (categoryParam === null || categoryParam.length === 0) {
    return null;
  }

  const normalizedParam = normalizePackageCategoryKey(decodeURIComponent(categoryParam));
  const match = categories.find(
    (category) => normalizePackageCategoryKey(category.id) === normalizedParam,
  );
  return match?.id ?? null;
}

/** Figma Packages accordion — collapsed row `395:1652`, expanded panel `395:1341`. */
export function PackagesPageAccordion({
  locale,
  categories,
  audience = "guest",
}: PackagesPageAccordionProps) {
  const t = useTranslations("marketing");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const { subscribePlanId, openSubscribe, closeSubscribe, setSubscribePlanId } =
    usePackageSubscribeUrlState();
  const expandedId = useMemo(
    () => resolveExpandedCategoryId(categories, categoryParam),
    [categories, categoryParam],
  );

  const handleSubscribe = useCallback(
    (plan: PublicPackagePlan) => {
      openSubscribe(plan.id);
    },
    [openSubscribe],
  );

  const subscribeContext = useMemo(() => {
    if (audience !== "member" || subscribePlanId === null || subscribePlanId.length === 0) {
      return null;
    }
    return resolvePackageSubscribeCategoryContext(
      toAccordionCategoryGroups(categories),
      subscribePlanId,
    );
  }, [audience, categories, subscribePlanId]);

  const subscribeModalPlans = useMemo(
    () =>
      subscribeContext !== null
        ? toPackageSubscribePlanOptions(subscribeContext.subscribablePlans)
        : [],
    [subscribeContext],
  );

  const updateExpandedCategory = useCallback(
    (categoryId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (categoryId !== null) {
        params.set("category", categoryId);
      } else {
        params.delete("category");
      }
      const query = params.toString();
      router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const expandedCategory = useMemo(
    () => categories.find((category) => category.id === expandedId) ?? null,
    [categories, expandedId],
  );

  if (categories.length === 0) {
    return (
      <p className="text-center text-sm text-sage-500" role="status">
        {t("packagesEmpty")}
      </p>
    );
  }

  const desktopContent = (
    <div className={cardStyles.desktopOnly}>
      <div className={accordionStyles.accordionRow} style={layoutStyleVars()}>
        {categories.map((category) => (
          <DesktopAccordionSlot
            key={category.id}
            locale={locale}
            category={category}
            expandedCategory={expandedCategory}
            detailsLabel={t("packagesDetailsCta")}
            openLabel={t("packagesOpenDetailsAria", { name: category.label })}
            closeLabel={t("packagesAccordionCloseAria", { name: category.label })}
            audience={audience}
            onSubscribe={handleSubscribe}
            onOpen={updateExpandedCategory}
            onClose={() => updateExpandedCategory(null)}
          />
        ))}
      </div>
    </div>
  );

  const mobileContent = (
    <div className={cardStyles.mobileOnly}>
      <div className={accordionStyles.mobileAccordionStack} style={layoutStyleVars()}>
        {categories.map((category) => (
          <MobileAccordionSlot
            key={category.id}
            locale={locale}
            category={category}
            isExpanded={expandedCategory?.id === category.id}
            detailsLabel={t("packagesDetailsCta")}
            openLabel={t("packagesOpenDetailsAria", { name: category.label })}
            closeLabel={t("packagesAccordionCloseAria", { name: category.label })}
            audience={audience}
            onSubscribe={handleSubscribe}
            onOpen={updateExpandedCategory}
            onClose={() => updateExpandedCategory(null)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {desktopContent}
      {mobileContent}
      {audience === "member" && subscribeContext !== null && subscribeModalPlans.length > 0 ? (
        <PackageSubscribePaymentModal
          isOpen
          locale={locale}
          plans={subscribeModalPlans}
          initialPlanId={subscribeContext.plan.id}
          onClose={closeSubscribe}
          onSelectedPlanIdChange={setSubscribePlanId}
        />
      ) : null}
    </>
  );
}

"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import { formatPackagePriceLabel } from "@/components/admin/admin-packages-display";
import cardStyles from "@/components/marketing/packages/packages-page-category-cards.module.css";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import type { PackagesPageAccordionCategory } from "@/components/marketing/packages/packages-page-category-data";
import { PublicPackageCategoryMobileTierList } from "@/components/marketing/packages/public-package-category-mobile-tier-list";
import {
  formatPublicPackageTierPricePerSession,
  formatPublicPackageTierSessionsHeadline,
  formatPublicPackageValidityLabel,
} from "@/components/marketing/packages/public-package-tier-display";
import {
  PACKAGES_PAGE_ACCORDION_FIGMA,
  PACKAGES_PAGE_CARD_FIGMA,
  PACKAGES_PAGE_LAYOUT,
  buildPackagesPageCategoryGradient,
  resolvePackagesPageCategoryAccentColor,
} from "@/components/marketing/packages/packages-page-tokens";
import { PackagesPageCardFab, PackagesPageCardFabImage } from "@/components/marketing/packages/packages-page-card-fab";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type PackagesPageAccordionProps = {
  locale: string;
  categories: readonly PackagesPageAccordionCategory[];
};

function panelStyleVars(categoryId: string, accentColor: string): CSSProperties {
  const figma = PACKAGES_PAGE_CARD_FIGMA;
  const accordion = PACKAGES_PAGE_ACCORDION_FIGMA;

  return {
    ["--packages-page-panel-gradient" as string]: buildPackagesPageCategoryGradient(categoryId),
    ["--packages-page-card-radius" as string]: `${figma.cardRadiusPx}px`,
    ["--packages-page-text-color" as string]: figma.textColor,
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
    ["--packages-page-collapsed-width" as string]: PACKAGES_PAGE_LAYOUT.collapsedPanelWidth,
    ["--packages-page-row-height" as string]: PACKAGES_PAGE_LAYOUT.rowHeight,
    ["--packages-page-expanded-table-min-width" as string]: PACKAGES_PAGE_LAYOUT.expandedTableMinWidth,
    ["--packages-page-transition-duration" as string]: `${PACKAGES_PAGE_ACCORDION_FIGMA.transitionDurationMs}ms`,
    ["--packages-page-transition-easing" as string]: PACKAGES_PAGE_ACCORDION_FIGMA.transitionEasing,
    ["--packages-page-mobile-card-width" as string]: PACKAGES_PAGE_LAYOUT.mobileCarouselCardWidth,
    ["--packages-page-mobile-carousel-gap" as string]: PACKAGES_PAGE_LAYOUT.mobileCarouselGap,
  };
}

function defaultCardStyleVars(categoryId: string): CSSProperties {
  const figma = PACKAGES_PAGE_CARD_FIGMA;

  return {
    ...panelStyleVars(categoryId, resolvePackagesPageCategoryAccentColor(categoryId)),
    ["--packages-page-card-aspect-ratio" as string]: `${figma.cardWidthPx} / ${figma.cardHeightPx}`,
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
};

function ExpandedTierTable({ locale, category }: ExpandedTierTableProps) {
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
          <ExpandedTierRow key={plan.id} locale={locale} plan={plan} />
        ))}
      </div>
    </div>
  );
}

type ExpandedTierRowProps = {
  locale: string;
  plan: PublicPackagePlan;
};

function ExpandedTierRow({ locale, plan }: ExpandedTierRowProps) {
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
        <Link href="/login" className={accordionStyles.subscribeButton}>
          {t("packagesSubscribeCta")}
        </Link>
      </div>
    </div>
  );
}

type CollapsedPanelProps = {
  category: PackagesPageAccordionCategory;
  onOpen: (categoryId: string) => void;
  openLabel: string;
};

function CollapsedPanel({ category, onOpen, openLabel }: CollapsedPanelProps) {
  const accentColor = resolvePackagesPageCategoryAccentColor(category.id);

  return (
    <div
      className={`${accordionStyles.panel} ${accordionStyles.panelCollapsed}`}
      style={panelStyleVars(category.id, accentColor)}
    >
      <div className={accordionStyles.collapsedTop}>
        <p className={accordionStyles.collapsedTitle}>{category.label}</p>
        {category.priceAmount !== null ? (
          <p className={accordionStyles.collapsedPrice}>{category.priceAmount}</p>
        ) : null}
      </div>
      <div className={`${accordionStyles.panelFabFooter} ${accordionStyles.collapsedFabWrap}`}>
        <PackagesPageCardFab
          direction="open"
          ariaLabel={openLabel}
          className={accordionStyles.openFab}
          onClick={() => onOpen(category.id)}
        />
      </div>
    </div>
  );
}

type ExpandedPanelProps = {
  locale: string;
  category: PackagesPageAccordionCategory;
  onClose: () => void;
  closeLabel: string;
};

function ExpandedPanel({ locale, category, onClose, closeLabel }: ExpandedPanelProps) {
  const accentColor = resolvePackagesPageCategoryAccentColor(category.id);

  return (
    <section
      className={`${accordionStyles.panel} ${accordionStyles.panelExpanded}`}
      style={panelStyleVars(category.id, accentColor)}
      aria-label={category.label}
    >
      <div className={accordionStyles.expandedBody}>
        <div className={accordionStyles.expandedBodyInner}>
          <h2 className={accordionStyles.expandedHeader}>{category.label}</h2>
          {category.plans.length > 0 ? (
            <ExpandedTierTable locale={locale} category={category} />
          ) : null}
        </div>
      </div>
      <div className={`${accordionStyles.panelFabFooter} ${accordionStyles.expandedFooter}`}>
        <button
          type="button"
          className={accordionStyles.closeFab}
          aria-label={closeLabel}
          onClick={onClose}
        >
          <PackagesPageCardFabImage direction="close" />
        </button>
      </div>
    </section>
  );
}

type DefaultCategoryCardProps = {
  category: PackagesPageAccordionCategory;
  onOpen: (categoryId: string) => void;
  openLabel: string;
  detailsLabel: string;
};

function DefaultCategoryCard({
  category,
  onOpen,
  openLabel,
  detailsLabel,
}: DefaultCategoryCardProps) {
  return (
    <div className={cardStyles.card} style={defaultCardStyleVars(category.id)}>
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
      <div className={cardStyles.cardFooter}>
        <p className={cardStyles.detailsLabel}>{detailsLabel}</p>
        <PackagesPageCardFab
          direction="open"
          ariaLabel={openLabel}
          onClick={() => onOpen(category.id)}
        />
      </div>
    </div>
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
}: DesktopAccordionSlotProps) {
  const isAccordionMode = expandedCategory !== null;
  const isExpanded = expandedCategory?.id === category.id;

  let panel = (
    <DefaultCategoryCard
      category={category}
      detailsLabel={detailsLabel}
      openLabel={openLabel}
      onOpen={onOpen}
    />
  );

  if (isAccordionMode && isExpanded) {
    panel = (
      <ExpandedPanel
        locale={locale}
        category={category}
        closeLabel={closeLabel}
        onClose={onClose}
      />
    );
  } else if (isAccordionMode) {
    panel = (
      <CollapsedPanel category={category} openLabel={openLabel} onOpen={onOpen} />
    );
  }

  return (
    <div className={resolveAccordionSlotClass(isAccordionMode, isExpanded)}>
      <div className={accordionStyles.slotContent}>
        {panel}
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
export function PackagesPageAccordion({ locale, categories }: PackagesPageAccordionProps) {
  const t = useTranslations("marketing");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [expandedId, setExpandedId] = useState<string | null>(() =>
    resolveExpandedCategoryId(categories, categoryParam),
  );

  useEffect(() => {
    setExpandedId(resolveExpandedCategoryId(categories, categoryParam));
  }, [categories, categoryParam]);

  const updateExpandedCategory = useCallback(
    (categoryId: string | null) => {
      setExpandedId(categoryId);
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
    <div
      className={`${cardStyles.desktopOnly} ${accordionStyles.accordionRow}`}
      style={layoutStyleVars()}
    >
      {categories.map((category) => (
        <DesktopAccordionSlot
          key={category.id}
          locale={locale}
          category={category}
          expandedCategory={expandedCategory}
          detailsLabel={t("packagesDetailsCta")}
          openLabel={t("packagesOpenDetailsAria", { name: category.label })}
          closeLabel={t("packagesAccordionCloseAria", { name: category.label })}
          onOpen={updateExpandedCategory}
          onClose={() => updateExpandedCategory(null)}
        />
      ))}
    </div>
  );

  const mobileContent =
    expandedCategory === null ? (
      <div
        className={`${cardStyles.mobileOnly} ${cardStyles.mobileCarouselViewport}`}
        style={layoutStyleVars()}
      >
        <div className={cardStyles.mobileCarouselTrack} aria-label={t("packagesPageTitle")} role="list">
          {categories.map((category) => (
            <div key={category.id} className={cardStyles.mobileCarouselSlide} role="listitem">
              <DefaultCategoryCard
                category={category}
                detailsLabel={t("packagesDetailsCta")}
                openLabel={t("packagesOpenDetailsAria", { name: category.label })}
                onOpen={updateExpandedCategory}
              />
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className={cardStyles.mobileOnly}>
        <div
          className={accordionStyles.mobileExpanded}
          style={panelStyleVars(
            expandedCategory.id,
            resolvePackagesPageCategoryAccentColor(expandedCategory.id),
          )}
        >
          <div className={accordionStyles.mobileExpandedHeader}>
            <h2 className={accordionStyles.expandedHeader}>{expandedCategory.label}</h2>
            <button
              type="button"
              className={accordionStyles.closeFab}
              aria-label={t("packagesAccordionCloseAria", { name: expandedCategory.label })}
              onClick={() => updateExpandedCategory(null)}
            >
              <PackagesPageCardFabImage direction="close" />
            </button>
          </div>
          <div className={accordionStyles.mobileTierList}>
            <PublicPackageCategoryMobileTierList
              locale={locale}
              categoryLabel={expandedCategory.label}
              plans={expandedCategory.plans}
              audience="guest"
            />
          </div>
        </div>
      </div>
    );

  return (
    <>
      {desktopContent}
      {mobileContent}
    </>
  );
}

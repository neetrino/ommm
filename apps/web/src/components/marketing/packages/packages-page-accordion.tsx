"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import cardStyles from "@/components/marketing/packages/packages-page-category-cards.module.css";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import { PackagesPageReveal } from "@/components/marketing/packages/packages-page-reveal";
import {
  clampDesktopCardsPerRow,
  layoutStyleVars,
  resolveExpandedCategoryId,
  splitAccordionRows,
} from "@/components/marketing/packages/packages-page-accordion.helpers";
import type { PackagesPageAccordionProps } from "@/components/marketing/packages/packages-page-accordion.types";
import { PackagesPageAccordionDesktopRow } from "@/components/marketing/packages/packages-page-accordion-desktop-row";
import { PackagesPageAccordionMobileSlot } from "@/components/marketing/packages/packages-page-accordion-mobile-slot";
import { PackagesPageAccordionSubscribeModalHost } from "@/components/marketing/packages/packages-page-accordion-subscribe-modal";
import { usePathname, useRouter } from "@/i18n/navigation";
import { usePackageSubscribeUrlState } from "@/hooks/use-package-subscribe-url-state";
import { usePackagesMobileAccordionExpand } from "@/hooks/use-packages-mobile-accordion-expand";
import { useMarketingAudience } from "@/hooks/use-marketing-audience";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

export type { PackagesPageAccordionProps } from "@/components/marketing/packages/packages-page-accordion.types";

/** Figma Packages accordion — collapsed row `395:1652`, expanded panel `395:1341`. */
export function PackagesPageAccordion({
  locale,
  categories,
  desktopCardsPerRow,
}: PackagesPageAccordionProps) {
  const t = useTranslations("marketing");
  const audience = useMarketingAudience();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const selectedPlanId = searchParams.get("plan");
  const { openSubscribe } = usePackageSubscribeUrlState();
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

  const updateExpandedCategory = useCallback(
    (categoryId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (categoryId !== null) {
        params.set("category", categoryId);
      } else {
        params.delete("category");
        params.delete("plan");
      }
      const query = params.toString();
      router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const onSelectPlan = useCallback(
    (planId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentPlanId = params.get("plan");
      if (currentPlanId === planId) {
        params.delete("plan");
      } else {
        params.set("plan", planId);
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

  const {
    expandedId: mobileExpandedId,
    openCategory: openMobileCategory,
    closeCategory: closeMobileCategory,
  } = usePackagesMobileAccordionExpand({
    urlExpandedId: expandedId,
    onUrlExpand: updateExpandedCategory,
  });

  if (categories.length === 0) {
    return (
      <PackagesPageReveal index={0}>
        <p className="text-center text-sm text-sage-500" role="status">
          {t("packagesEmpty")}
        </p>
      </PackagesPageReveal>
    );
  }

  const normalizedDesktopCardsPerRow = clampDesktopCardsPerRow(desktopCardsPerRow);
  const desktopRows = splitAccordionRows(categories, normalizedDesktopCardsPerRow);

  const desktopContent = (
    <div className={cardStyles.desktopOnly}>
      <div className={accordionStyles.accordionRows} style={layoutStyleVars()}>
        {desktopRows.map((row, rowIndex) => (
          <PackagesPageAccordionDesktopRow
            key={`row-${rowIndex}`}
            locale={locale}
            row={row}
            rowIndex={rowIndex}
            expandedCategory={expandedCategory}
            cardsPerRow={normalizedDesktopCardsPerRow}
            detailsLabel={t("packagesDetailsCta")}
            resolveOpenLabel={(name) => t("packagesOpenDetailsAria", { name })}
            resolveCloseLabel={(name) => t("packagesAccordionCloseAria", { name })}
            audience={audience}
            selectedPlanId={selectedPlanId}
            onSelectPlan={onSelectPlan}
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
          <div key={category.id} className={accordionStyles.mobileAccordionStackItem}>
            <PackagesPageAccordionMobileSlot
              locale={locale}
              category={category}
              isExpanded={mobileExpandedId === category.id}
              detailsLabel={t("packagesDetailsCta")}
              openLabel={t("packagesOpenDetailsAria", { name: category.label })}
              closeLabel={t("packagesAccordionCloseAria", { name: category.label })}
              audience={audience}
              selectedPlanId={selectedPlanId}
              onSelectPlan={onSelectPlan}
              onSubscribe={handleSubscribe}
              onOpen={openMobileCategory}
              onClose={closeMobileCategory}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {desktopContent}
      {mobileContent}
      <PackagesPageAccordionSubscribeModalHost
        locale={locale}
        categories={categories}
        audience={audience}
      />
    </>
  );
}

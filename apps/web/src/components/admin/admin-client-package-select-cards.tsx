"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "@/components/admin/admin-client-package-select-cards.module.css";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import {
  clampDesktopCardsPerRow,
  layoutStyleVars,
  splitAccordionRows,
} from "@/components/marketing/packages/packages-page-accordion.helpers";
import { PackagesPageAccordionDesktopRow } from "@/components/marketing/packages/packages-page-accordion-desktop-row";
import { buildPackagesPageAccordionCategories } from "@/components/marketing/packages/packages-page-category-data";
import {
  PACKAGES_PAGE_ACCORDION_FIGMA,
  resolvePackagesPageAccordionRowHeightPx,
} from "@/components/marketing/packages/packages-page-tokens";
import { groupVisiblePublicPackageCategories } from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

/** Fits the public desktop accordion (~1061px artboard) into the Admin nested sheet. */
const ADMIN_PACKAGES_ACCORDION_SCALE = 0.65;
const ADMIN_PACKAGES_CARDS_PER_ROW = 3;

type AdminClientPackageSelectCardsProps = {
  locale: string;
  plans: readonly PublicPackagePlan[];
  selectedPlanId: string | null;
  disabled?: boolean;
  onSelectPlan: (planId: string) => void;
  onSubscribe: (planId: string) => void;
};

export function AdminClientPackageSelectCards({
  locale,
  plans,
  selectedPlanId,
  disabled = false,
  onSelectPlan,
  onSubscribe,
}: AdminClientPackageSelectCardsProps) {
  const tMarketing = useTranslations("marketing");
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const grouped = groupVisiblePublicPackageCategories([...plans]);
    return buildPackagesPageAccordionCategories(grouped, locale, {
      priceFromPrefix: tMarketing("packagesCardPriceFromPrefix"),
      formatCardStartDateCopy: (date) => ({
        purchaseLabel: tMarketing("packagesCardStartDatePurchase"),
        attendFromPrefix: tMarketing("packagesCardStartDateAttendFromPrefix"),
        attendFromDate: tMarketing("packagesCardStartDateAttendFromDate", { date }),
      }),
    });
  }, [locale, plans, tMarketing]);

  const cardsPerRow = clampDesktopCardsPerRow(ADMIN_PACKAGES_CARDS_PER_ROW);
  const desktopRows = useMemo(
    () => splitAccordionRows(categories, cardsPerRow),
    [categories, cardsPerRow],
  );

  const expandedCategory = useMemo(
    () => categories.find((category) => category.id === expandedCategoryId) ?? null,
    [categories, expandedCategoryId],
  );

  const hostHeightPx = useMemo(() => {
    const rowHeight = resolvePackagesPageAccordionRowHeightPx();
    const gap = PACKAGES_PAGE_ACCORDION_FIGMA.accordionGapPx;
    const rowCount = Math.max(desktopRows.length, 1);
    const unscaled =
      rowHeight * rowCount + gap * Math.max(rowCount - 1, 0);
    return Math.ceil(unscaled * ADMIN_PACKAGES_ACCORDION_SCALE);
  }, [desktopRows.length]);

  function handleSelectPlan(planId: string): void {
    if (disabled) {
      return;
    }
    onSelectPlan(planId);
  }

  function handleSubscribe(plan: PublicPackagePlan): void {
    if (disabled) {
      return;
    }
    onSubscribe(plan.id);
  }

  function handleOpen(categoryId: string): void {
    if (disabled) {
      return;
    }
    setExpandedCategoryId(categoryId);
  }

  function handleClose(): void {
    if (disabled) {
      return;
    }
    setExpandedCategoryId(null);
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.scaleHost}
      style={{
        height: `${hostHeightPx}px`,
        ["--admin-packages-scale" as string]: String(ADMIN_PACKAGES_ACCORDION_SCALE),
      }}
    >
      <div
        className={[
          styles.scaleInner,
          disabled ? styles.scaleInnerDisabled : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={layoutStyleVars()}
      >
        <div className={accordionStyles.accordionRows}>
          {desktopRows.map((row, rowIndex) => (
            <PackagesPageAccordionDesktopRow
              key={`admin-packages-row-${rowIndex}`}
              locale={locale}
              row={row}
              rowIndex={rowIndex}
              expandedCategory={expandedCategory}
              cardsPerRow={cardsPerRow}
              detailsLabel={tMarketing("packagesDetailsCta")}
              resolveOpenLabel={(name) =>
                tMarketing("packagesOpenDetailsAria", { name })
              }
              resolveCloseLabel={(name) =>
                tMarketing("packagesAccordionCloseAria", { name })
              }
              audience="member"
              selectedPlanId={selectedPlanId}
              onSelectPlan={handleSelectPlan}
              onSubscribe={handleSubscribe}
              onOpen={handleOpen}
              onClose={handleClose}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminAccordionPanel } from "@/components/admin/admin-accordion-panel";
import { AdminClientPackageSelectTable } from "@/components/admin/admin-client-package-select-table";
import { adminFilterRevealVariants } from "@/components/admin/admin-filter-reveal-motion";
import { buildPackagesPageAccordionCategories } from "@/components/marketing/packages/packages-page-category-data";
import { buildPackagesPageCardGradient } from "@/components/marketing/packages/packages-page-tokens";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { groupVisiblePublicPackageCategories } from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type AdminClientPackageSelectCardsProps = {
  locale: string;
  plans: readonly PublicPackagePlan[];
  selectedPlanId: string | null;
  disabled?: boolean;
  onSelectPlan: (planId: string | null) => void;
};

function resolveInitialExpandedCategoryId(
  categories: readonly { id: string; plans: readonly PublicPackagePlan[] }[],
  selectedPlanId: string | null,
): string | null {
  if (categories.length === 0) {
    return null;
  }
  if (selectedPlanId !== null) {
    const match = categories.find((category) =>
      category.plans.some((plan) => plan.id === selectedPlanId),
    );
    if (match !== undefined) {
      return match.id;
    }
  }
  return categories[0]?.id ?? null;
}

export function AdminClientPackageSelectCards({
  locale,
  plans,
  selectedPlanId,
  disabled = false,
  onSelectPlan,
}: AdminClientPackageSelectCardsProps) {
  const t = useTranslations("adminPages.clients");
  const tMarketing = useTranslations("marketing");
  const reducedMotion = usePrefersReducedMotion();

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

  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(() =>
    resolveInitialExpandedCategoryId(categories, selectedPlanId),
  );
  const [prevCategories, setPrevCategories] = useState(categories);
  const [prevSelectedPlanId, setPrevSelectedPlanId] = useState(selectedPlanId);

  if (categories !== prevCategories) {
    setPrevCategories(categories);
    setExpandedCategoryId(resolveInitialExpandedCategoryId(categories, selectedPlanId));
  }

  if (selectedPlanId !== prevSelectedPlanId) {
    setPrevSelectedPlanId(selectedPlanId);
    if (selectedPlanId !== null) {
      const match = categories.find((category) =>
        category.plans.some((plan) => plan.id === selectedPlanId),
      );
      if (match !== undefined && match.id !== expandedCategoryId) {
        setExpandedCategoryId(match.id);
      }
    }
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div
      className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-hidden"
      role="radiogroup"
      aria-label={t("packages.selectLead")}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {categories.map((category, index) => {
          const open = expandedCategoryId === category.id;
          const surfaceBackground = buildPackagesPageCardGradient(
            category.gradientStartColor,
          );
          return (
            <motion.div
              key={category.id}
              layout={!reducedMotion}
              variants={adminFilterRevealVariants(index, reducedMotion)}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AdminAccordionPanel
                title={category.label}
                open={open}
                onOpenChange={(nextOpen) => {
                  if (disabled) {
                    return;
                  }
                  setExpandedCategoryId(nextOpen ? category.id : null);
                }}
                contentVariant="table"
                surfaceBackground={surfaceBackground}
                emptyLabel={
                  category.plans.length === 0 ? t("packages.plansEmpty") : undefined
                }
              >
                {category.plans.length > 0 ? (
                  <AdminClientPackageSelectTable
                    locale={locale}
                    plans={category.plans}
                    selectedPlanId={selectedPlanId}
                    disabled={disabled}
                    onSelectPlan={onSelectPlan}
                  />
                ) : null}
              </AdminAccordionPanel>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

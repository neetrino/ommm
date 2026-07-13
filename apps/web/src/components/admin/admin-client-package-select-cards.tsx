"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminAccordionPanel } from "@/components/admin/admin-accordion-panel";
import { AdminClientPackageSelectTable } from "@/components/admin/admin-client-package-select-table";
import { buildPackagesPageCardGradient } from "@/components/marketing/packages/packages-page-tokens";
import { assignPackageCardGradientStartColors } from "@/lib/package-card-colors";
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
  const categories = useMemo(
    () => groupVisiblePublicPackageCategories([...plans]),
    [plans],
  );
  const surfaceBackgrounds = useMemo(() => {
    const starts = assignPackageCardGradientStartColors(
      categories.map((category) => category.id),
    );
    return starts.map((startColor) => buildPackagesPageCardGradient(startColor));
  }, [categories]);

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
      {categories.map((category, index) => {
        const open = expandedCategoryId === category.id;
        const surfaceBackground = surfaceBackgrounds[index];
        return (
          <AdminAccordionPanel
            key={category.id}
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
        );
      })}
    </div>
  );
}

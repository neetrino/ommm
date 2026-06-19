"use client";

import { PublicPackageMobileTierCard } from "@/components/marketing/packages/public-package-mobile-tier-card";
import styles from "@/components/marketing/packages/public-package-category-mobile-tier-list.module.css";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type PublicPackageCategoryMobileTierListProps = {
  locale: string;
  categoryLabel: string;
  plans: readonly PublicPackagePlan[];
  audience: PublicPackageCategoryCardsAudience;
  selectedPlanId?: string | null;
  onSelectPlan?: (planId: string) => void;
  onSubscribe?: (planId: string) => void;
};

export function PublicPackageCategoryMobileTierList({
  locale,
  categoryLabel,
  plans,
  audience,
  selectedPlanId,
  onSelectPlan,
  onSubscribe,
}: PublicPackageCategoryMobileTierListProps) {
  return (
    <ul className={styles.list}>
      {plans.map((plan) => (
        <li key={plan.id} className={styles.listItem}>
          <PublicPackageMobileTierCard
            locale={locale}
            categoryLabel={categoryLabel}
            plan={plan}
            audience={audience}
            isSelected={selectedPlanId === plan.id}
            onSelectPlan={onSelectPlan}
            onSubscribe={onSubscribe}
          />
        </li>
      ))}
    </ul>
  );
}

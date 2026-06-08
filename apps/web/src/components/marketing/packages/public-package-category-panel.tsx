"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PackageSubscribePaymentModal } from "@/components/account/package-subscribe-payment-modal";
import { PackageCategoryCardFooter } from "@/components/marketing/packages/package-category-card-footer";
import styles from "@/components/marketing/packages/public-package-category-panel.module.css";
import { PublicPackageTierRow } from "@/components/marketing/packages/public-package-tier-row";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { listPublicPackageCategorySubscribablePlans } from "@/components/marketing/packages/public-package-category-subscribable-plans";
import {
  listDancesCategoryDisplayPlans,
} from "@/components/marketing/packages/public-package-dances-display-tiers";
import type { PublicPackageCategoryGroup } from "@/lib/public-package-categories";
import { buildPackageCategoryHref } from "@/lib/package-category-href";
import { toPackageSubscribePlanOptions } from "@/lib/package-subscribe-plan-option";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type PublicPackageCategoryPanelProps = {
  locale: string;
  category: PublicPackageCategoryGroup;
  audience?: PublicPackageCategoryCardsAudience;
  variant?: "list" | "detail";
};

export function PublicPackageCategoryPanel({
  locale,
  category,
  audience = "guest",
  variant = "list",
}: PublicPackageCategoryPanelProps) {
  const t = useTranslations("marketing");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentPlanId, setPaymentPlanId] = useState<string | undefined>(undefined);

  const displayPlans = listDancesCategoryDisplayPlans(category.plans);
  const subscribePlans = useMemo(
    () => toPackageSubscribePlanOptions(listPublicPackageCategorySubscribablePlans(category)),
    [category],
  );
  const categoryHref = buildPackageCategoryHref(category.id, audience);
  const isPopular = category.plans.some((plan) => plan.isPopular);

  function openPayment(planId?: string) {
    setPaymentPlanId(planId);
    setPaymentOpen(true);
  }

  return (
    <article
      className={`${marketingMontserrat.variable} ${styles.panel} ${
        isPopular ? "ring-2 ring-sand-400/70" : ""
      }`}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>{category.label}</h2>
        <hr className={styles.divider} />
      </header>

      <ul className={styles.tierList}>
        {displayPlans.map((plan) => (
          <PublicPackageTierRow
            key={plan.id}
            locale={locale}
            categoryId={category.id}
            plan={plan}
            audience={audience}
            variant={variant}
            isSelected={false}
            onSubscribe={openPayment}
          />
        ))}
      </ul>

      <PackageCategoryCardFooter
        audience={audience}
        subscribeLabel={t("packagesSubscribeCta")}
        secondaryLabel={
          audience === "member" ? t("packagesViewAllCta") : t("packagesAccountCta")
        }
        secondaryHref={audience === "member" ? categoryHref : "/user/packages"}
        hint={audience === "member" ? t("packagesMemberHint") : t("packagesLoginHint")}
        onSubscribe={audience === "member" ? () => openPayment() : undefined}
        rootClassName={styles.footer}
        actionsClassName={styles.footerActions}
        hintClassName={styles.footerHint}
      />

      {audience === "member" ? (
        <PackageSubscribePaymentModal
          isOpen={paymentOpen}
          locale={locale}
          plans={subscribePlans}
          initialPlanId={paymentPlanId}
          onClose={() => setPaymentOpen(false)}
        />
      ) : null}
    </article>
  );
}

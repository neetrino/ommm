"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buildPackagesSubscribeLoginHref } from "@/lib/auth-redirect";
import { formatPackagePriceLabel } from "@/components/admin/admin-packages-display";
import { resolvePublicPackageFinalPriceCents } from "@/components/marketing/packages/public-package-card-format";
import {
  formatPublicPackageTierSessionsHeadline,
  formatPublicPackageValidityLabel,
} from "@/components/marketing/packages/public-package-tier-display";
import styles from "@/components/marketing/packages/public-package-mobile-tier-card.module.css";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type PublicPackageMobileTierCardProps = {
  locale: string;
  categoryLabel: string;
  plan: PublicPackagePlan;
  audience: PublicPackageCategoryCardsAudience;
  isSelected?: boolean;
  onSubscribe?: (planId: string) => void;
};

function EmptyMetaValue() {
  return <span className={styles.metaEmpty}>—</span>;
}

function MetaRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className={styles.metaRow}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value ?? <EmptyMetaValue />}</span>
    </div>
  );
}

export function PublicPackageMobileTierCard({
  locale,
  categoryLabel,
  plan,
  audience,
  isSelected = false,
  onSubscribe,
}: PublicPackageMobileTierCardProps) {
  const t = useTranslations("marketing");
  const planLabel = formatPublicPackageTierSessionsHeadline(plan, {
    unlimited: t("packagesSessionsUnlimitedShort"),
    count: (values) => t("packagesTierSessionsLabel", values),
  });
  const priceLabel = formatPackagePriceLabel(
    { ...plan, priceCents: resolvePublicPackageFinalPriceCents(plan) },
    locale,
  );
  const hasDiscount =
    typeof plan.discountedPriceCents === "number" &&
    plan.discountedPriceCents > 0 &&
    plan.discountedPriceCents < plan.priceCents;
  const originalPrice = hasDiscount
    ? formatPackagePriceLabel({ ...plan, discountedPriceCents: null }, locale)
    : null;
  const validityLabel = formatPublicPackageValidityLabel(plan, {
    days: (count) => t("packagesValidityDays", { count }),
    months: (count) => t("packagesValidityMonths", { count }),
  });
  const guestCount = plan.guestCount ?? 0;
  const guestLabel = guestCount > 0 ? String(guestCount) : null;

  const subscribeButton =
    audience === "member" ? (
      <button
        type="button"
        className={styles.subscribeButton}
        onClick={() => onSubscribe?.(plan.id)}
      >
        {t("packagesSubscribeCta")}
      </button>
    ) : (
      <Link
        href={buildPackagesSubscribeLoginHref(plan.id)}
        className={styles.subscribeButton}
      >
        {t("packagesSubscribeCta")}
      </Link>
    );

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
      data-selected={isSelected ? "true" : "false"}
      aria-label={`${categoryLabel} — ${planLabel}`}
    >
      <h3 className={styles.planName}>{planLabel}</h3>

      <div className={styles.metaList}>
        <MetaRow
          label={t("packagesTablePrice")}
          value={hasDiscount && originalPrice !== null ? `${priceLabel} (${t("packagesDiscountBadge")})` : priceLabel}
        />
        {hasDiscount && originalPrice !== null ? (
          <MetaRow label={t("packagesOriginalPrice")} value={originalPrice} />
        ) : null}
        <MetaRow label={t("packagesTableValidity")} value={validityLabel} />
        <MetaRow label={t("packagesTableGuests")} value={guestLabel} />
      </div>

      {subscribeButton}
    </article>
  );
}

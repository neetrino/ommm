"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPackagePriceLabel } from "@/components/admin/admin-packages-display";
import {
  formatPublicPackageTierPricePerSession,
  formatPublicPackageValidityLabel,
} from "@/components/marketing/packages/public-package-tier-display";
import { shouldShowPublicPackageTierName } from "@/components/marketing/packages/public-package-card-format";
import styles from "@/components/marketing/packages/public-package-mobile-tier-card.module.css";
import {
  PublicPackageTierSessionIcon,
  resolvePublicPackageTierIconKey,
} from "@/components/marketing/packages/public-package-tier-session-icons";
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

function MetaBlock({
  label,
  value,
  withDivider = false,
}: {
  label: string;
  value: string | null;
  withDivider?: boolean;
}) {
  return (
    <div className={`${styles.metaBlock} ${withDivider ? styles.metaBlockWithDivider : ""}`}>
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
  const showTierName = shouldShowPublicPackageTierName(plan.name, categoryLabel);
  const planLabel = showTierName ? plan.name : categoryLabel;
  const priceLabel = formatPackagePriceLabel(plan, locale);
  const pricePerSession = formatPublicPackageTierPricePerSession(plan, locale);
  const validityLabel = formatPublicPackageValidityLabel(plan, {
    days: (count) => t("packagesValidityDays", { count }),
    months: (count) => t("packagesValidityMonths", { count }),
  });
  const guestCount = plan.guestCount ?? 0;
  const guestLabel = guestCount > 0 ? String(guestCount) : null;
  const iconKey = resolvePublicPackageTierIconKey(plan);

  const subscribeButton =
    audience === "member" ? (
      <button
        type="button"
        className={`ommm-btn-compact-warm ${styles.subscribeButton}`}
        onClick={() => onSubscribe?.(plan.id)}
      >
        {t("packagesSubscribeCta")}
      </button>
    ) : (
      <Link href="/login" className={`ommm-btn-compact-warm ${styles.subscribeButton}`}>
        {t("packagesSubscribeCta")}
      </Link>
    );

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
      data-selected={isSelected ? "true" : "false"}
    >
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h3 className={styles.planName}>{planLabel}</h3>
          <p className={styles.price}>{priceLabel}</p>
        </div>
        <div className={styles.iconWrap}>
          <PublicPackageTierSessionIcon iconKey={iconKey} />
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.metaRow}>
        <MetaBlock label={t("packagesTablePricePerSession")} value={pricePerSession} />
        <MetaBlock label={t("packagesTableValidity")} value={validityLabel} withDivider />
        <MetaBlock label={t("packagesTableGuests")} value={guestLabel} withDivider />
      </div>

      {subscribeButton}
    </article>
  );
}

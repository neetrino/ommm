"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  formatPackagePriceLabel,
  formatPackageValidityLabel,
} from "@/components/admin/admin-packages-display";
import styles from "@/components/marketing/packages/public-package-category-panel.module.css";
import { PUBLIC_PACKAGE_DANCES_ICON } from "@/components/marketing/packages/public-package-category-icons";
import {
  formatPublicPackageTierPricePerSession,
  formatPublicPackageTierSessionsHeadline,
  shouldShowPublicPackageTierDaysLimit,
} from "@/components/marketing/packages/public-package-tier-display";
import { CalendarIcon } from "@/components/marketing/schedule/schedule-view-icons";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { buildPackageCategoryHref } from "@/lib/package-category-href";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type PublicPackageTierRowProps = {
  locale: string;
  categoryId: string;
  plan: PublicPackagePlan;
  audience: PublicPackageCategoryCardsAudience;
  variant: "list" | "detail";
  isSelected?: boolean;
  onSubscribe?: (planId: string) => void;
};

function TierChevron() {
  return (
    <span className={styles.tierAction} aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          d="M9 6l6 6-6 6"
        />
      </svg>
    </span>
  );
}

function TierMetaBlock({
  label,
  value,
  withDivider = false,
  labelPrefix,
}: {
  label: string;
  value: string;
  withDivider?: boolean;
  labelPrefix?: ReactNode;
}) {
  return (
    <div
      className={`${styles.tierMetaBlock} ${withDivider ? styles.tierMetaBlockWithDivider : ""}`}
    >
      {labelPrefix ? (
        <div className={styles.tierDaysLimitLabelRow}>
          <span className={styles.tierDaysLimitIcon}>{labelPrefix}</span>
          <span className={styles.tierMetaLabel}>{label}</span>
        </div>
      ) : (
        <span className={styles.tierMetaLabel}>{label}</span>
      )}
      <span className={styles.tierMetaValue}>{value}</span>
    </div>
  );
}

function TierRowBody({
  locale,
  plan,
  actionLabel,
}: {
  locale: string;
  plan: PublicPackagePlan;
  actionLabel: string;
}) {
  const t = useTranslations("marketing");
  const sessionsHeadline = formatPublicPackageTierSessionsHeadline(plan, {
    unlimited: t("packagesTierSessionsUnlimited"),
    count: (values) => t("packagesTierSessionsLabel", values),
  });
  const totalPrice = formatPackagePriceLabel(plan, locale);
  const pricePerSession = formatPublicPackageTierPricePerSession(plan, locale);
  const showDaysLimit = shouldShowPublicPackageTierDaysLimit(plan);
  const daysLimitValue = showDaysLimit
    ? formatPackageValidityLabel(plan, {
        days: (count) => t("packagesPeriodDaysShort", { days: count }),
        months: (count) => t("packagesValidityMonths", { count }),
      })
    : null;

  return (
    <>
      <div className={styles.tierIconWrap}>
        <Image
          src={PUBLIC_PACKAGE_DANCES_ICON}
          alt=""
          width={44}
          height={44}
          className={styles.tierIcon}
          unoptimized
        />
      </div>
      <div className={styles.tierPrimary}>
        <p className={styles.tierSessions}>{sessionsHeadline}</p>
        <p className={styles.tierPrice}>{totalPrice}</p>
      </div>
      <div className={styles.tierMetaGroup}>
        {pricePerSession !== null ? (
          <TierMetaBlock
            label={t("packagesTierPricePerSessionLabel")}
            value={pricePerSession}
            withDivider
          />
        ) : null}
        {daysLimitValue !== null ? (
          <TierMetaBlock
            label={t("packagesTierDaysLimitLabel")}
            value={daysLimitValue}
            withDivider={pricePerSession !== null}
            labelPrefix={<CalendarIcon />}
          />
        ) : null}
      </div>
      <TierChevron />
      <span className="sr-only">{actionLabel}</span>
    </>
  );
}

export function PublicPackageTierRow({
  locale,
  categoryId,
  plan,
  audience,
  variant,
  isSelected = false,
  onSubscribe,
}: PublicPackageTierRowProps) {
  const t = useTranslations("marketing");
  const sessionsHeadline = formatPublicPackageTierSessionsHeadline(plan, {
    unlimited: t("packagesTierSessionsUnlimited"),
    count: (values) => t("packagesTierSessionsLabel", values),
  });
  const actionLabel = t("packagesTierSelectAria", { name: sessionsHeadline });

  if (variant === "list") {
    const href = `${buildPackageCategoryHref(categoryId, audience)}?plan=${encodeURIComponent(plan.id)}`;
    return (
      <li className={styles.tierRow} data-selected={isSelected ? "true" : "false"}>
        <Link href={href} className={styles.tierRowLink} aria-label={actionLabel}>
          <TierRowBody locale={locale} plan={plan} actionLabel={actionLabel} />
        </Link>
      </li>
    );
  }

  if (audience === "member") {
    return (
      <li className={styles.tierRow} data-selected={isSelected ? "true" : "false"}>
        <button
          type="button"
          className={`${styles.tierRowLink} cursor-pointer border-0 bg-transparent text-left`}
          aria-label={actionLabel}
          onClick={() => onSubscribe?.(plan.id)}
        >
          <TierRowBody locale={locale} plan={plan} actionLabel={actionLabel} />
        </button>
      </li>
    );
  }

  return (
    <li className={styles.tierRow} data-selected={isSelected ? "true" : "false"}>
      <Link href="/login" className={styles.tierRowLink} aria-label={actionLabel}>
        <TierRowBody locale={locale} plan={plan} actionLabel={actionLabel} />
      </Link>
    </li>
  );
}

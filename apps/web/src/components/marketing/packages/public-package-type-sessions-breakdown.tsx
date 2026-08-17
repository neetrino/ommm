"use client";

import { useTranslations } from "next-intl";
import type { PublicTypeSessionDisplayRow } from "@/components/marketing/packages/public-package-type-session-rows";
import styles from "@/components/marketing/packages/public-package-type-sessions-breakdown.module.css";

type PublicPackageTypeSessionsExpandButtonProps = {
  expanded: boolean;
  onToggle: () => void;
  packageName: string;
};

export function PublicPackageTypeSessionsExpandButton({
  expanded,
  onToggle,
  packageName,
}: PublicPackageTypeSessionsExpandButtonProps) {
  const t = useTranslations("marketing");

  return (
    <button
      type="button"
      className={styles.expandButton}
      aria-expanded={expanded}
      aria-label={
        expanded
          ? t("packagesTypeSessionsCollapseAria", { name: packageName })
          : t("packagesTypeSessionsExpandAria", { name: packageName })
      }
      onClick={onToggle}
    >
      <svg
        className={`${styles.expandArrow} ${expanded ? styles.expandArrowUp : ""}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M7 10L12 15L17 10"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

type PublicPackageTypeSessionsBreakdownProps = {
  rows: readonly PublicTypeSessionDisplayRow[];
};

export function PublicPackageTypeSessionsBreakdown({
  rows,
}: PublicPackageTypeSessionsBreakdownProps) {
  const t = useTranslations("marketing");

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className={styles.breakdown}>
      <div className={styles.breakdownHeader}>
        <span>{t("packagesTypeSessionsType")}</span>
        <span className={styles.breakdownSession}>{t("packagesTypeSessionsSession")}</span>
      </div>
      {rows.map((row) => (
        <div key={row.id} className={styles.breakdownRow}>
          <span className={styles.breakdownType}>{row.typeName}</span>
          <span className={styles.breakdownSession}>{row.sessionCount}</span>
        </div>
      ))}
    </div>
  );
}

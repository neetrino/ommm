"use client";

import { useTranslations } from "next-intl";
import styles from "@/components/marketing/schedule/schedule-package-eligibility-badge.module.css";
import type { ScheduleSessionEligibilityStatus } from "@/lib/schedule-session-eligibility";

export type SchedulePackageEligibilityBadgePlacement =
  | "aboveAction"
  | "corner";

type SchedulePackageEligibilityBadgeProps = {
  status: ScheduleSessionEligibilityStatus;
  classTypeName: string;
  placement: SchedulePackageEligibilityBadgePlacement;
};

function IncludedIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M3.5 8.25 6.5 11.25 12.5 4.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RequiredIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 7.1V11"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="8" cy="5.35" r="0.65" fill="currentColor" />
    </svg>
  );
}

/** Member-only pill — included package vs purchase required. */
export function SchedulePackageEligibilityBadge({
  status,
  classTypeName,
  placement,
}: SchedulePackageEligibilityBadgeProps) {
  const t = useTranslations("marketingPages.schedule");
  const isIncluded = status === "included";
  const label = isIncluded
    ? t("packageEligibilityIncluded")
    : t("packageEligibilityRequired", { classType: classTypeName });

  return (
    <span
      className={[
        styles.badge,
        isIncluded ? styles.included : styles.required,
        placement === "corner" ? styles.placementCorner : styles.placementAboveAction,
      ].join(" ")}
      title={label}
    >
      {isIncluded ? <IncludedIcon /> : <RequiredIcon />}
      <span className={styles.label}>{label}</span>
    </span>
  );
}

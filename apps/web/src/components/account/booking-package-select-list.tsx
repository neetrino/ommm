"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import styles from "@/components/account/booking-package-select-list.module.css";
import { buildDuplicatePlanNameSuffixes } from "@/lib/booking-package-labels";
import type { EligibleBookingPackage } from "@/lib/eligible-booking-package";

type BookingPackageSelectListProps = {
  eligiblePackages: readonly EligibleBookingPackage[];
  activeSelectedId: string;
  locale: string;
  busy: boolean;
  onSelect: (userPackageId: string) => void;
};

function formatExpiryLabel(
  locale: string,
  isoDate: string,
  fallback: string,
): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Selectable package cards for the booking package sheet. */
export function BookingPackageSelectList({
  eligiblePackages,
  activeSelectedId,
  locale,
  busy,
  onSelect,
}: BookingPackageSelectListProps) {
  const t = useTranslations("forms.bookSession");
  const duplicatePlanSuffixes = useMemo(
    () => buildDuplicatePlanNameSuffixes(eligiblePackages),
    [eligiblePackages],
  );

  return (
    <ul className="flex flex-col gap-2.5">
      {eligiblePackages.map((pkg) => {
        const isSelected = pkg.userPackageId === activeSelectedId;
        const isDisabled = busy || (!pkg.canBook && pkg.canBookGuest !== true);
        const duplicateSuffix = duplicatePlanSuffixes.get(pkg.userPackageId);
        const displayPlanName =
          duplicateSuffix !== undefined
            ? t("packageDuplicatePlanName", {
                planName: pkg.planName,
                index: duplicateSuffix,
              })
            : pkg.planName;
        const visitsLabel = pkg.isUnlimited
          ? t("packageUnlimitedVisits")
          : pkg.canBook
            ? t("packageRemainingVisits", {
                count: pkg.remainingSessions ?? 0,
              })
            : t("packageNoVisitsLeft");
        const periodStartLabel = formatExpiryLabel(
          locale,
          pkg.currentPeriodStart,
          t("packageNoStartDate"),
        );
        const periodEndLabel = formatExpiryLabel(
          locale,
          pkg.currentPeriodEnd,
          t("packageNoExpiry"),
        );

        const cardClassName = [
          styles.packageCard,
          isSelected ? styles.packageCardSelected : "",
          isDisabled ? styles.packageCardDisabled : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li key={pkg.userPackageId}>
            <button
              type="button"
              className={cardClassName}
              onClick={() => {
                if (!pkg.canBook && pkg.canBookGuest !== true) {
                  return;
                }
                onSelect(pkg.userPackageId);
              }}
              disabled={isDisabled}
              aria-disabled={!pkg.canBook && pkg.canBookGuest !== true}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-medium text-sage-900">{displayPlanName}</p>
                {isSelected ? (
                  <span className={styles.packageCardBadge}>
                    {t("packageSelectedBadge")}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-sage-600">
                <span>{visitsLabel}</span>
                {(pkg.guestSlotsTotal ?? 0) > 0 ? (
                  <span>
                    {t("packageGuestPassesRemaining", {
                      remaining: pkg.guestSlotsRemaining ?? 0,
                      total: pkg.guestSlotsTotal ?? 0,
                    })}
                  </span>
                ) : null}
                <span>
                  {t("packageValidPeriod", {
                    start: periodStartLabel,
                    end: periodEndLabel,
                  })}
                </span>
              </div>
              {pkg.includedCategories.length > 0 ? (
                <p className="mt-2 text-xs text-sage-500">
                  {t("packageIncludedCategories", {
                    categories: pkg.includedCategories.join(", "),
                  })}
                </p>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

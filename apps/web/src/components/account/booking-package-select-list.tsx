"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BookingPackageSelectCard } from "@/components/account/booking-package-select-card";
import { buildDuplicatePlanNameSuffixes } from "@/lib/booking-package-labels";
import type { EligibleBookingPackage } from "@/lib/eligible-booking-package";

type BookingPackageSelectListProps = {
  eligiblePackages: readonly EligibleBookingPackage[];
  activeSelectedId: string;
  locale: string;
  busy: boolean;
  onSelect: (userPackageId: string) => void;
};

function formatExpiryLabel(locale: string, isoDate: string, fallback: string): string {
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
    <ul className="flex flex-col gap-3">
      {eligiblePackages.map((pkg) => {
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
            ? t("packageRemainingVisits", { count: pkg.remainingSessions ?? 0 })
            : t("packageNoVisitsLeft");
        const periodLabel = t("packageValidPeriod", {
          start: formatExpiryLabel(locale, pkg.currentPeriodStart, t("packageNoStartDate")),
          end: formatExpiryLabel(locale, pkg.currentPeriodEnd, t("packageNoExpiry")),
        });

        return (
          <li key={pkg.userPackageId}>
            <BookingPackageSelectCard
              pkg={pkg}
              displayPlanName={displayPlanName}
              visitsLabel={visitsLabel}
              periodLabel={periodLabel}
              isSelected={pkg.userPackageId === activeSelectedId}
              isDisabled={busy || (!pkg.canBook && pkg.canBookGuest !== true)}
              onSelect={onSelect}
            />
          </li>
        );
      })}
    </ul>
  );
}

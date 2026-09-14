"use client";

import { useTranslations } from "next-intl";
import styles from "@/components/account/booking-package-select-list.module.css";
import {
  BookingPackageCalendarIcon,
  BookingPackageGuestsIcon,
  BookingPackageSelectedCheckIcon,
  BookingPackageVisitsIcon,
} from "@/components/account/booking-package-select-card-icons";
import type { EligibleBookingPackage } from "@/lib/eligible-booking-package";

type BookingPackageSelectCardProps = {
  pkg: EligibleBookingPackage;
  displayPlanName: string;
  visitsLabel: string;
  periodLabel: string;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (userPackageId: string) => void;
};

function BookingPackageSelectCardStats({
  visitsLabel,
  showGuests,
  guestLabel,
}: {
  visitsLabel: string;
  showGuests: boolean;
  guestLabel: string;
}) {
  return (
    <span className={showGuests ? styles.packageCardStats : styles.packageCardStatsSolo}>
      <span className={styles.packageCardStat}>
        <span className={styles.packageCardStatIcon}>
          <BookingPackageVisitsIcon />
        </span>
        <span className={styles.packageCardStatText}>{visitsLabel}</span>
      </span>
      {showGuests ? (
        <>
          <span className={styles.packageCardStatDivider} aria-hidden />
          <span className={styles.packageCardStat}>
            <span className={styles.packageCardStatIcon}>
              <BookingPackageGuestsIcon />
            </span>
            <span className={styles.packageCardStatText}>{guestLabel}</span>
          </span>
        </>
      ) : null}
    </span>
  );
}

export function BookingPackageSelectCard({
  pkg,
  displayPlanName,
  visitsLabel,
  periodLabel,
  isSelected,
  isDisabled,
  onSelect,
}: BookingPackageSelectCardProps) {
  const t = useTranslations("forms.bookSession");
  const guestTotal = pkg.guestSlotsTotal ?? 0;
  const showGuests = guestTotal > 0;
  const cardClassName = [
    styles.packageCard,
    isSelected ? styles.packageCardSelected : "",
    isDisabled ? styles.packageCardDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
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
      aria-pressed={isSelected}
    >
      <span className={styles.packageCardHeader}>
        <span className={styles.packageCardTitle}>{displayPlanName}</span>
        {isSelected ? (
          <span className={styles.packageCardBadge}>
            {t("packageSelectedBadge")}
            <BookingPackageSelectedCheckIcon />
          </span>
        ) : null}
      </span>

      <BookingPackageSelectCardStats
        visitsLabel={visitsLabel}
        showGuests={showGuests}
        guestLabel={t("packageGuestPassesRemaining", {
          remaining: pkg.guestSlotsRemaining ?? 0,
          total: guestTotal,
        })}
      />

      <span className={styles.packageCardValidity}>
        <span className={styles.packageCardStatIcon}>
          <BookingPackageCalendarIcon />
        </span>
        <span className={styles.packageCardStatText}>{periodLabel}</span>
      </span>

      {pkg.includedCategories.length > 0 ? (
        <span className={styles.packageCardIncludes}>
          {t("packageIncludedCategories", {
            categories: pkg.includedCategories.join(", "),
          })}
        </span>
      ) : null}
    </button>
  );
}

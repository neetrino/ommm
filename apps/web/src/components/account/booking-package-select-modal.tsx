"use client";

import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BookingPackageSelectGuestActions } from "@/components/account/booking-package-select-guest-actions";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { ApiError, apiFetch } from "@/lib/api";
import { buildDuplicatePlanNameSuffixes } from "@/lib/booking-package-labels";
import { pickDefaultBookingPackageId } from "@/lib/booking-package-selection";
import type { EligibleBookingPackage } from "@/lib/eligible-booking-package";

export type { EligibleBookingPackage };

type BookingPackageSelectModalProps = {
  isOpen: boolean;
  sessionId: string;
  eligiblePackages: readonly EligibleBookingPackage[];
  locale: string;
  onClose: () => void;
  /** Opens the cancellation-policy modal; resolves true when the member confirms. */
  ensurePolicyAcknowledged?: () => Promise<boolean>;
  onBooked: (bookingId: string) => void;
  onError: (message: string) => void;
};

type BookSessionResponse = {
  id: string;
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

export function BookingPackageSelectModal({
  isOpen,
  sessionId,
  eligiblePackages,
  locale,
  onClose,
  ensurePolicyAcknowledged,
  onBooked,
  onError,
}: BookingPackageSelectModalProps) {
  const t = useTranslations("forms.bookSession");
  const titleId = useId();
  const [selectedId, setSelectedId] = useState<string>(
    pickDefaultBookingPackageId(eligiblePackages),
  );
  const [busy, setBusy] = useState(false);
  const [guestName, setGuestName] = useState("");
  const duplicatePlanSuffixes = useMemo(
    () => buildDuplicatePlanNameSuffixes(eligiblePackages),
    [eligiblePackages],
  );
  const activeSelectedId = useMemo(() => {
    const selected = eligiblePackages.find((pkg) => pkg.userPackageId === selectedId);
    if (selected?.canBook || selected?.canBookGuest === true) {
      return selectedId;
    }
    return pickDefaultBookingPackageId(eligiblePackages);
  }, [eligiblePackages, selectedId]);
  const selectedPackage = eligiblePackages.find(
    (pkg) => pkg.userPackageId === activeSelectedId,
  );

  async function submitBooking(guestPassName?: string) {
    try {
      const body: { userPackageId: string; guestName?: string } = {
        userPackageId: activeSelectedId,
      };
      if (guestPassName !== undefined) {
        body.guestName = guestPassName;
      }
      const booking = await apiFetch<BookSessionResponse>(
        `/bookings/sessions/${sessionId}`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
      onBooked(booking.id);
      onClose();
    } catch (error) {
      onError(error instanceof ApiError ? error.message : t("bookFailed"));
    }
  }

  function requestSubmitBooking(guestPassName?: string): void {
    if (busy) {
      return;
    }
    void (async () => {
      setBusy(true);
      try {
        if (ensurePolicyAcknowledged) {
          const accepted = await ensurePolicyAcknowledged();
          if (!accepted) {
            return;
          }
        }
        await submitBooking(guestPassName);
      } finally {
        setBusy(false);
      }
    })();
  }

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={t("packageModalClose")}
      overlayClassName="ommm-modal-overlay z-[100]"
      panelClassName="mt-auto flex max-h-[min(92vh,640px)] w-full max-w-[min(560px,95vw)] flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white/90 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md sm:mt-0 sm:rounded-[28px]"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-white/60 px-5 py-4 sm:px-6">
          <h2 id={titleId} className="text-lg font-semibold text-sage-900">
            {t("packageModalTitle")}
          </h2>
          <p className="mt-1 text-sm text-sage-600">{t("packageModalDescription")}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <ul className="flex flex-col gap-3">
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

              return (
                <li key={pkg.userPackageId}>
                  <button
                    type="button"
                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                      isDisabled
                        ? "cursor-not-allowed border-white/60 bg-white/50 opacity-70"
                        : isSelected
                          ? "border-sand-500/50 bg-sand-50/80 shadow-sm"
                          : "border-white/70 bg-white/80 hover:border-sand-200 hover:bg-white"
                    }`}
                    onClick={() => {
                      if (!pkg.canBook && pkg.canBookGuest !== true) {
                        return;
                      }
                      setSelectedId(pkg.userPackageId);
                    }}
                    disabled={isDisabled}
                    aria-disabled={!pkg.canBook && pkg.canBookGuest !== true}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sage-900">{displayPlanName}</p>
                      </div>
                      {isSelected ? (
                        <span className="shrink-0 rounded-full bg-sand-100 px-2 py-0.5 text-xs font-medium text-sand-800">
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
        </div>

        <BookingPackageSelectGuestActions
          busy={busy}
          guestName={guestName}
          showGuestField={selectedPackage?.canBookGuest === true}
          canConfirmOwner={selectedPackage?.canBook === true}
          canConfirmGuest={
            selectedPackage?.canBookGuest === true && guestName.trim().length > 0
          }
          onGuestNameChange={setGuestName}
          onClose={onClose}
          onConfirmOwner={() => {
            if (selectedPackage?.canBook === true && !busy) {
              requestSubmitBooking();
            }
          }}
          onConfirmGuest={() => {
            if (
              selectedPackage?.canBookGuest === true &&
              guestName.trim().length > 0 &&
              !busy
            ) {
              requestSubmitBooking(guestName.trim());
            }
          }}
        />
      </div>
    </OmmModalPortal>
  );
}

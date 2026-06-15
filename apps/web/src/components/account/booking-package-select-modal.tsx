"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

export type EligibleBookingPackage = {
  userPackageId: string;
  planId: string;
  planName: string;
  planType: "SINGLE" | "COMBINED";
  remainingSessions: number | null;
  isUnlimited: boolean;
  currentPeriodEnd: string;
  includedCategories: string[];
};

type BookingPackageSelectModalProps = {
  isOpen: boolean;
  sessionId: string;
  eligiblePackages: readonly EligibleBookingPackage[];
  locale: string;
  onClose: () => void;
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
  onBooked,
  onError,
}: BookingPackageSelectModalProps) {
  const t = useTranslations("forms.bookSession");
  const titleId = useId();
  const [selectedId, setSelectedId] = useState<string>(
    eligiblePackages[0]?.userPackageId ?? "",
  );
  const [busy, setBusy] = useState(false);

  async function confirmSelection() {
    if (!selectedId || busy) {
      return;
    }
    setBusy(true);
    try {
      const booking = await apiFetch<BookSessionResponse>(
        `/bookings/sessions/${sessionId}`,
        {
          method: "POST",
          body: JSON.stringify({ userPackageId: selectedId }),
        },
      );
      onBooked(booking.id);
      onClose();
    } catch (error) {
      onError(error instanceof ApiError ? error.message : t("bookFailed"));
    } finally {
      setBusy(false);
    }
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
              const isSelected = pkg.userPackageId === selectedId;
              const planTypeLabel =
                pkg.planType === "COMBINED"
                  ? t("packageTypeCombined")
                  : t("packageTypeSingle");
              const visitsLabel = pkg.isUnlimited
                ? t("packageUnlimitedVisits")
                : t("packageRemainingVisits", {
                    count: pkg.remainingSessions ?? 0,
                  });
              const expiryLabel = formatExpiryLabel(
                locale,
                pkg.currentPeriodEnd,
                t("packageNoExpiry"),
              );

              return (
                <li key={pkg.userPackageId}>
                  <button
                    type="button"
                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-sand-500/50 bg-sand-50/80 shadow-sm"
                        : "border-white/70 bg-white/80 hover:border-sand-200 hover:bg-white"
                    }`}
                    onClick={() => setSelectedId(pkg.userPackageId)}
                    disabled={busy}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sage-900">{pkg.planName}</p>
                        <p className="mt-1 text-xs text-sage-500">{planTypeLabel}</p>
                      </div>
                      {isSelected ? (
                        <span className="shrink-0 rounded-full bg-sand-100 px-2 py-0.5 text-xs font-medium text-sand-800">
                          {t("packageSelectedBadge")}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-sage-600">
                      <span>{visitsLabel}</span>
                      <span>{t("packageExpires", { date: expiryLabel })}</span>
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

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/70 px-5 py-4 sm:px-6">
          <OmmButton type="button" variant="secondary" size="md" onClick={onClose} disabled={busy}>
            {t("packageModalCancel")}
          </OmmButton>
          <OmmButton
            type="button"
            variant="primary"
            size="md"
            disabled={busy || selectedId.length === 0}
            onClick={() => void confirmSelection()}
          >
            {busy ? t("packageModalConfirming") : t("packageModalConfirm")}
          </OmmButton>
        </div>
      </div>
    </OmmModalPortal>
  );
}

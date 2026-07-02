"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import {
  hasBookablePackage,
  resolveAutoBookPackageId,
  shouldPromptBookingPackageSelection,
} from "@/lib/booking-package-selection";
import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";
import type { EligibleBookingPackage } from "@/components/account/booking-package-select-modal";
import type { BookSessionResponse } from "@/hooks/use-session-booking.types";

type UseSessionBookingInitiateArgs = {
  busy: boolean;
  setBusy: (busy: boolean) => void;
  fetchEligiblePackages: () => Promise<readonly EligibleBookingPackage[]>;
  fetchPurchasePlans: () => Promise<readonly PackageSubscribePlanOption[]>;
  fetchFirstName: () => Promise<string>;
  openPackageModal: (packages: readonly EligibleBookingPackage[]) => void;
  showPurchaseModal: (
    packages: readonly EligibleBookingPackage[],
    plans: readonly PackageSubscribePlanOption[],
    rawFirstName: string,
  ) => void;
  bookWithOptionalPackage: (userPackageId?: string) => Promise<void>;
  onError?: (message: string) => void;
};

export function useSessionBookingInitiate({
  busy,
  setBusy,
  fetchEligiblePackages,
  fetchPurchasePlans,
  fetchFirstName,
  openPackageModal,
  showPurchaseModal,
  bookWithOptionalPackage,
  onError,
}: UseSessionBookingInitiateArgs) {
  const t = useTranslations("forms.bookSession");

  const initiateBooking = useCallback(async (): Promise<void> => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const [packages, plans, rawFirstName] = await Promise.all([
        fetchEligiblePackages(),
        fetchPurchasePlans().catch(() => [] as PackageSubscribePlanOption[]),
        fetchFirstName(),
      ]);
      if (shouldPromptBookingPackageSelection(packages)) {
        openPackageModal(packages);
        return;
      }
      const autoPackageId = resolveAutoBookPackageId(packages);
      if (!hasBookablePackage(packages) || autoPackageId === undefined) {
        showPurchaseModal(packages, plans, rawFirstName);
        return;
      }
      await bookWithOptionalPackage(autoPackageId);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t("bookFailed");
      onError?.(message);
    } finally {
      setBusy(false);
    }
  }, [
    bookWithOptionalPackage,
    busy,
    fetchEligiblePackages,
    fetchFirstName,
    fetchPurchasePlans,
    onError,
    openPackageModal,
    setBusy,
    showPurchaseModal,
    t,
  ]);

  return { initiateBooking };
}

export async function postSessionBooking(
  sessionId: string,
  userPackageId?: string,
): Promise<BookSessionResponse> {
  return apiFetch<BookSessionResponse>(`/bookings/sessions/${sessionId}`, {
    method: "POST",
    body: JSON.stringify(userPackageId !== undefined ? { userPackageId } : {}),
  });
}

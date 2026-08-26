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
  openPackageModal: (packages: readonly EligibleBookingPackage[]) => void;
  showPurchaseModal: (
    packages: readonly EligibleBookingPackage[],
    plans: readonly PackageSubscribePlanOption[],
  ) => void;
  bookWithOptionalPackage: (userPackageId?: string) => Promise<void>;
  onError?: (message: string) => void;
};

export function useSessionBookingInitiate({
  busy,
  setBusy,
  fetchEligiblePackages,
  fetchPurchasePlans,
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
      const [packages, plans] = await Promise.all([
        fetchEligiblePackages(),
        fetchPurchasePlans().catch(() => [] as PackageSubscribePlanOption[]),
      ]);
      if (shouldPromptBookingPackageSelection(packages)) {
        openPackageModal(packages);
        return;
      }
      const autoPackageId = resolveAutoBookPackageId(packages);
      if (!hasBookablePackage(packages) || autoPackageId === undefined) {
        showPurchaseModal(packages, plans);
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
  guestName?: string,
): Promise<BookSessionResponse> {
  const body: { userPackageId?: string; guestName?: string } = {};
  if (userPackageId !== undefined) {
    body.userPackageId = userPackageId;
  }
  if (guestName !== undefined && guestName.trim().length > 0) {
    body.guestName = guestName.trim();
  }
  return apiFetch<BookSessionResponse>(`/bookings/sessions/${sessionId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

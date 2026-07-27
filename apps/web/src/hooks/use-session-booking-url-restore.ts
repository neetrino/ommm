"use client";

import { useCallback, useEffect } from "react";
import { ApiError } from "@/lib/api";
import {
  clearBookPackageSessionQuery,
  clearBuyPackageSessionQuery,
  readBookPackageSessionId,
  readBuyPackageSessionId,
} from "@/lib/book-package-session-url";
import type { EligibleBookingPackage } from "@/components/account/booking-package-select-modal";
import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";
import { clearSessionBookingCachedPurchase } from "@/hooks/session-booking-cache";
import {
  hasBookablePackage,
  shouldPromptBookingPackageSelection,
} from "@/lib/booking-package-selection";

type UseSessionBookingUrlRestoreParams = {
  sessionId: string;
  urlPickSessionId: string | null;
  urlBuySessionId: string | null;
  skipNextUrlRestoreRef: React.MutableRefObject<boolean>;
  skipNextBuyUrlRestoreRef: React.MutableRefObject<boolean>;
  initialCachedPurchaseRef: React.MutableRefObject<unknown>;
  callbacksRef: React.MutableRefObject<{
    onBooked?: (bookingId: string) => void;
    onError?: (message: string) => void;
  }>;
  t: (key: string) => string;
  setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  setEligiblePackages: React.Dispatch<React.SetStateAction<readonly EligibleBookingPackage[]>>;
  setPackageModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPurchaseModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchEligiblePackages: () => Promise<EligibleBookingPackage[]>;
  fetchPurchasePlans: () => Promise<PackageSubscribePlanOption[]>;
  openPurchaseModal: (packages: readonly EligibleBookingPackage[]) => Promise<void>;
  applyPurchaseData: (
    packages: readonly EligibleBookingPackage[],
    plans: readonly PackageSubscribePlanOption[],
  ) => void;
  replaceSearchParams: (mutate: (params: URLSearchParams) => void) => void;
};

export function useSessionBookingUrlRestore({
  sessionId,
  urlPickSessionId,
  urlBuySessionId,
  skipNextUrlRestoreRef,
  skipNextBuyUrlRestoreRef,
  initialCachedPurchaseRef,
  callbacksRef,
  t,
  setBusy,
  setEligiblePackages,
  setPackageModalOpen,
  setPurchaseModalOpen,
  fetchEligiblePackages,
  fetchPurchasePlans,
  openPurchaseModal,
  applyPurchaseData,
  replaceSearchParams,
}: UseSessionBookingUrlRestoreParams) {
  const restorePackageModal = useCallback(async (): Promise<void> => {
    setBusy(true);
    try {
      const packages = await fetchEligiblePackages();
      if (shouldPromptBookingPackageSelection(packages)) {
        setEligiblePackages(packages);
        setPackageModalOpen(true);
        return;
      }
      if (!hasBookablePackage(packages)) {
        await openPurchaseModal(packages);
        return;
      }
      replaceSearchParams(clearBookPackageSessionQuery);
    } catch (error) {
      replaceSearchParams(clearBookPackageSessionQuery);
      const message = error instanceof ApiError ? error.message : t("bookFailed");
      callbacksRef.current.onError?.(message);
    } finally {
      setBusy(false);
    }
  }, [
    callbacksRef,
    fetchEligiblePackages,
    openPurchaseModal,
    replaceSearchParams,
    setBusy,
    setEligiblePackages,
    setPackageModalOpen,
    t,
  ]);

  useEffect(() => {
    if (urlPickSessionId !== sessionId) {
      return;
    }
    if (skipNextUrlRestoreRef.current) {
      skipNextUrlRestoreRef.current = false;
      return;
    }

    let cancelled = false;

    void (async () => {
      if (cancelled) {
        return;
      }
      await restorePackageModal();
    })();

    return () => {
      cancelled = true;
    };
  }, [restorePackageModal, sessionId, skipNextUrlRestoreRef, urlPickSessionId]);

  useEffect(() => {
    if (urlBuySessionId !== sessionId) {
      return;
    }
    if (skipNextBuyUrlRestoreRef.current) {
      skipNextBuyUrlRestoreRef.current = false;
      return;
    }

    let cancelled = false;
    const hasCachedData = initialCachedPurchaseRef.current !== null;
    setPurchaseModalOpen(true);

    async function restorePurchaseModal(): Promise<void> {
      try {
        const [packages, plans] = await Promise.all([
          fetchEligiblePackages(),
          fetchPurchasePlans(),
        ]);
        if (cancelled) {
          return;
        }
        if (plans.length === 0) {
          callbacksRef.current.onError?.(t("packageNoPurchasePlans"));
          setPurchaseModalOpen(false);
          clearSessionBookingCachedPurchase(sessionId);
          replaceSearchParams(clearBuyPackageSessionQuery);
          return;
        }
        applyPurchaseData(packages, plans);
      } catch (error) {
        if (cancelled || hasCachedData) {
          return;
        }
        setPurchaseModalOpen(false);
        clearSessionBookingCachedPurchase(sessionId);
        replaceSearchParams(clearBuyPackageSessionQuery);
        const message = error instanceof ApiError ? error.message : t("bookFailed");
        callbacksRef.current.onError?.(message);
      }
    }

    void restorePurchaseModal();

    return () => {
      cancelled = true;
    };
  }, [
    applyPurchaseData,
    callbacksRef,
    fetchEligiblePackages,
    fetchPurchasePlans,
    initialCachedPurchaseRef,
    replaceSearchParams,
    sessionId,
    setPurchaseModalOpen,
    skipNextBuyUrlRestoreRef,
    t,
    urlBuySessionId,
  ]);
}

export { readBookPackageSessionId, readBuyPackageSessionId };

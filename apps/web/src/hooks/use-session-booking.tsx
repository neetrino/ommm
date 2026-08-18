"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  clearBookPackageSessionQuery,
  clearBuyPackageSessionQuery,
  setBookPackageSessionQuery,
  setBuyPackageSessionQuery,
} from "@/lib/book-package-session-url";
import { usePathname, useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import {
  postSessionBooking,
  useSessionBookingInitiate,
} from "@/hooks/use-session-booking-initiate";
import {
  toPackageSubscribePlanOptions,
  type PackageSubscribePlanOption,
} from "@/lib/package-subscribe-plan-option";
import type { PublicPackagePlan } from "@/lib/public-package-plan";
import type { EligibleBookingPackage } from "@/components/account/booking-package-select-modal";
import {
  clearSessionBookingCachedPurchase,
  readSessionBookingCachedPurchase,
  writeSessionBookingCachedPurchase,
} from "@/hooks/session-booking-cache";
import { dispatchPackagesRefresh } from "@/lib/packages-refresh-event";
import { SessionBookingModals } from "@/hooks/session-booking-modals";
import {
  readBookPackageSessionId,
  readBuyPackageSessionId,
  useSessionBookingUrlRestore,
} from "@/hooks/use-session-booking-url-restore";
import type {
  UseSessionBookingOptions,
} from "@/hooks/use-session-booking.types";
import { pickSuggestedPurchasePlanId } from "@/lib/pick-suggested-purchase-plan-id";

export type { UseSessionBookingOptions } from "@/hooks/use-session-booking.types";

export function useSessionBooking({
  sessionId,
  locale,
  onBooked,
  onError,
}: UseSessionBookingOptions) {
  const t = useTranslations("forms.bookSession");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlPickSessionId = readBookPackageSessionId(searchParams);
  const urlBuySessionId = readBuyPackageSessionId(searchParams);
  const initialCachedPurchase = useMemo(
    () =>
      urlBuySessionId === sessionId
        ? readSessionBookingCachedPurchase(sessionId)
        : null,
    [sessionId, urlBuySessionId],
  );
  const [busy, setBusy] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(
    initialCachedPurchase !== null,
  );
  const [purchasePlans, setPurchasePlans] = useState<
    readonly PackageSubscribePlanOption[]
  >(initialCachedPurchase?.plans ?? []);
  const [suggestedPlanId, setSuggestedPlanId] = useState<string | undefined>(
    initialCachedPurchase?.suggestedPlanId,
  );
  const [eligiblePackages, setEligiblePackages] = useState<
    readonly EligibleBookingPackage[]
  >([]);
  const skipNextUrlRestoreRef = useRef(false);
  const skipNextBuyUrlRestoreRef = useRef(false);

  const callbacksRef = useRef({ onBooked, onError });
  useEffect(() => {
    callbacksRef.current = { onBooked, onError };
  }, [onBooked, onError]);

  const initialCachedPurchaseRef = useRef(
    urlBuySessionId === sessionId ? readSessionBookingCachedPurchase(sessionId) : null,
  );
  useEffect(() => {
    initialCachedPurchaseRef.current = initialCachedPurchase;
  }, [initialCachedPurchase]);

  const replaceSearchParams = useCallback(
    (mutate: (params: URLSearchParams) => void): void => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openPackageModal = useCallback(
    (eligible: readonly EligibleBookingPackage[]): void => {
      skipNextUrlRestoreRef.current = true;
      setEligiblePackages(eligible);
      setPackageModalOpen(true);
      replaceSearchParams((params) => {
        setBookPackageSessionQuery(params, sessionId);
      });
    },
    [replaceSearchParams, sessionId],
  );

  const closePackageModal = useCallback((): void => {
    if (busy) {
      return;
    }
    setPackageModalOpen(false);
    if (urlPickSessionId === sessionId) {
      replaceSearchParams(clearBookPackageSessionQuery);
    }
  }, [busy, replaceSearchParams, sessionId, urlPickSessionId]);

  const closePurchaseModal = useCallback((): void => {
    setPurchaseModalOpen(false);
    clearSessionBookingCachedPurchase(sessionId);
    if (urlBuySessionId === sessionId) {
      replaceSearchParams(clearBuyPackageSessionQuery);
    }
  }, [replaceSearchParams, sessionId, urlBuySessionId]);

  const fetchEligiblePackages = useCallback(
    async (): Promise<EligibleBookingPackage[]> =>
      apiFetch<EligibleBookingPackage[]>(
        `/bookings/sessions/${sessionId}/eligible-packages`,
      ),
    [sessionId],
  );

  const fetchPurchasePlans = useCallback(
    async (): Promise<PackageSubscribePlanOption[]> => {
      const plans = await apiFetch<PublicPackagePlan[]>(
        `/bookings/sessions/${sessionId}/purchase-plans`,
      );
      return toPackageSubscribePlanOptions(plans);
    },
    [sessionId],
  );

  const applyPurchaseData = useCallback(
    (
      packages: readonly EligibleBookingPackage[],
      plans: readonly PackageSubscribePlanOption[],
    ): void => {
      const suggested = pickSuggestedPurchasePlanId(packages, plans);
      setPurchasePlans(plans);
      setSuggestedPlanId(suggested);
      writeSessionBookingCachedPurchase(sessionId, {
        plans: [...plans],
        suggestedPlanId: suggested,
      });
    },
    [sessionId],
  );

  const showPurchaseModal = useCallback((
    packages: readonly EligibleBookingPackage[],
    plans: readonly PackageSubscribePlanOption[],
  ): boolean => {
    if (plans.length === 0) {
      callbacksRef.current.onError?.(t("packageNoPurchasePlans"));
      return false;
    }
    applyPurchaseData(packages, plans);
    setPurchaseModalOpen(true);
    skipNextBuyUrlRestoreRef.current = true;
    replaceSearchParams((params) => {
      clearBookPackageSessionQuery(params);
      setBuyPackageSessionQuery(params, sessionId);
    });
    return true;
  }, [applyPurchaseData, replaceSearchParams, sessionId, t]);

  const openPurchaseModal = useCallback(async (
    packages: readonly EligibleBookingPackage[],
  ): Promise<void> => {
    const plans = await fetchPurchasePlans();
    if (plans.length === 0) {
      callbacksRef.current.onError?.(t("packageNoPurchasePlans"));
      replaceSearchParams(clearBuyPackageSessionQuery);
      return;
    }
    applyPurchaseData(packages, plans);
    setPurchaseModalOpen(true);
  }, [applyPurchaseData, fetchPurchasePlans, replaceSearchParams, t]);

  const bookWithOptionalPackage = useCallback(async (userPackageId?: string): Promise<void> => {
    const booking = await postSessionBooking(sessionId, userPackageId);
    dispatchPackagesRefresh();
    callbacksRef.current.onBooked?.(booking.id);
  }, [sessionId]);

  const { initiateBooking } = useSessionBookingInitiate({
    busy,
    setBusy,
    fetchEligiblePackages,
    fetchPurchasePlans,
    openPackageModal,
    showPurchaseModal,
    bookWithOptionalPackage,
    onError: (message) => callbacksRef.current.onError?.(message),
  });

  useSessionBookingUrlRestore({
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
  });

  const bookingModals = (
    <SessionBookingModals
      locale={locale}
      sessionId={sessionId}
      packageModalOpen={packageModalOpen}
      purchaseModalOpen={purchaseModalOpen}
      eligiblePackages={eligiblePackages}
      purchasePlans={purchasePlans}
      suggestedPlanId={suggestedPlanId}
      onClosePackageModal={closePackageModal}
      onClosePurchaseModal={closePurchaseModal}
      onBooked={(bookingId) => {
        setPackageModalOpen(false);
        callbacksRef.current.onBooked?.(bookingId);
      }}
      onError={(message) => callbacksRef.current.onError?.(message)}
      replaceSearchParams={replaceSearchParams}
    />
  );

  return {
    busy,
    initiateBooking,
    packageModalOpen,
    purchaseModalOpen,
    packageModal: bookingModals,
    purchaseModal: bookingModals,
    bookingModals,
  };
}

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
import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";
import type { MeApiResponse } from "@/lib/me-api-types";
import type { EligibleBookingPackage } from "@/components/account/booking-package-select-modal";
import {
  clearSessionBookingCachedPurchase,
  readSessionBookingCachedPurchase,
  writeSessionBookingCachedPurchase,
} from "@/hooks/session-booking-cache";
import { SessionBookingModals } from "@/hooks/session-booking-modals";
import {
  readBookPackageSessionId,
  readBuyPackageSessionId,
  useSessionBookingUrlRestore,
} from "@/hooks/use-session-booking-url-restore";
import type {
  UseSessionBookingOptions,
} from "@/hooks/use-session-booking.types";

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
  const [purchaseNotice, setPurchaseNotice] = useState<string>(
    initialCachedPurchase?.notice ?? "",
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
    async (): Promise<PackageSubscribePlanOption[]> =>
      apiFetch<PackageSubscribePlanOption[]>(
        `/bookings/sessions/${sessionId}/purchase-plans`,
      ),
    [sessionId],
  );

  const fetchFirstName = useCallback(async (): Promise<string> => {
    try {
      const me = await apiFetch<MeApiResponse>("/users/me");
      return me.user?.name?.trim() ?? "";
    } catch {
      return "";
    }
  }, []);

  const applyPurchaseData = useCallback(
    (
      packages: readonly EligibleBookingPackage[],
      plans: readonly PackageSubscribePlanOption[],
      rawFirstName: string,
    ): void => {
      const firstName = rawFirstName || t("purchaseNoticeFallbackName");
      const suggested =
        packages.find((pkg) => !pkg.canBook)?.planId ?? plans[0]?.id;
      const notice =
        packages.length === 0
          ? t("purchaseNoticeMissing", { firstName })
          : t("purchaseNoticeDepleted", { firstName });
      setPurchaseNotice(notice);
      setPurchasePlans(plans);
      setSuggestedPlanId(suggested);
      writeSessionBookingCachedPurchase(sessionId, {
        plans: [...plans],
        notice,
        suggestedPlanId: suggested,
      });
    },
    [sessionId, t],
  );

  const showPurchaseModal = useCallback((
    packages: readonly EligibleBookingPackage[],
    plans: readonly PackageSubscribePlanOption[],
    rawFirstName: string,
  ): boolean => {
    if (plans.length === 0) {
      callbacksRef.current.onError?.(t("packageNoPurchasePlans"));
      return false;
    }
    applyPurchaseData(packages, plans, rawFirstName);
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
    const [plans, rawFirstName] = await Promise.all([
      fetchPurchasePlans(),
      fetchFirstName(),
    ]);
    if (plans.length === 0) {
      callbacksRef.current.onError?.(t("packageNoPurchasePlans"));
      replaceSearchParams(clearBuyPackageSessionQuery);
      return;
    }
    applyPurchaseData(packages, plans, rawFirstName);
    setPurchaseModalOpen(true);
  }, [applyPurchaseData, fetchFirstName, fetchPurchasePlans, replaceSearchParams, t]);

  const bookWithOptionalPackage = useCallback(async (userPackageId?: string): Promise<void> => {
    const booking = await postSessionBooking(sessionId, userPackageId);
    callbacksRef.current.onBooked?.(booking.id);
  }, [sessionId]);

  const { initiateBooking } = useSessionBookingInitiate({
    sessionId,
    busy,
    setBusy,
    fetchEligiblePackages,
    fetchPurchasePlans,
    fetchFirstName,
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
    fetchFirstName,
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
      purchaseNotice={purchaseNotice}
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
    packageModal: bookingModals,
    purchaseModal: bookingModals,
    bookingModals,
  };
}

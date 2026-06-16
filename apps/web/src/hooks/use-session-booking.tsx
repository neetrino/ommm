"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  BookingPackageSelectModal,
  type EligibleBookingPackage,
} from "@/components/account/booking-package-select-modal";
import {
  BookingPackagePurchaseModal,
} from "@/components/account/booking-package-purchase-modal";
import {
  clearBookPackageSessionQuery,
  clearBuyPackageSessionQuery,
  readBookPackageSessionId,
  readBuyPackageSessionId,
  setBookPackageSessionQuery,
  setBuyPackageSessionQuery,
} from "@/lib/book-package-session-url";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import {
  hasBookablePackage,
  resolveAutoBookPackageId,
  shouldPromptBookingPackageSelection,
} from "@/lib/booking-package-selection";
import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";
import type { MeApiResponse } from "@/lib/me-api-types";

type BookSessionResponse = {
  id: string;
};

type UseSessionBookingOptions = {
  sessionId: string;
  locale: string;
  onBooked?: (bookingId: string) => void;
  onError?: (message: string) => void;
};

type CachedPurchase = {
  plans: PackageSubscribePlanOption[];
  notice: string;
  suggestedPlanId?: string;
};

const PURCHASE_CACHE_PREFIX = "ommm:buyPackage:";

/** Snapshot of the open purchase modal so a refresh can restore it instantly. */
function readCachedPurchase(sessionId: string): CachedPurchase | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(PURCHASE_CACHE_PREFIX + sessionId);
    return raw ? (JSON.parse(raw) as CachedPurchase) : null;
  } catch {
    return null;
  }
}

function writeCachedPurchase(sessionId: string, value: CachedPurchase): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(
      PURCHASE_CACHE_PREFIX + sessionId,
      JSON.stringify(value),
    );
  } catch {
    // Ignore quota/serialization errors — cache is best-effort.
  }
}

function clearCachedPurchase(sessionId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.removeItem(PURCHASE_CACHE_PREFIX + sessionId);
  } catch {
    // Ignore — cache is best-effort.
  }
}

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
  const onBookedRef = useRef(onBooked);
  const onErrorRef = useRef(onError);
  onBookedRef.current = onBooked;
  onErrorRef.current = onError;

  const initialCachedPurchaseRef = useRef<CachedPurchase | null>(
    urlBuySessionId === sessionId ? readCachedPurchase(sessionId) : null,
  );
  const initialCachedPurchase = initialCachedPurchaseRef.current;

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

  function replaceSearchParams(mutate: (params: URLSearchParams) => void): void {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function openPackageModal(eligible: readonly EligibleBookingPackage[]): void {
    skipNextUrlRestoreRef.current = true;
    setEligiblePackages(eligible);
    setPackageModalOpen(true);
    replaceSearchParams((params) => {
      setBookPackageSessionQuery(params, sessionId);
    });
  }

  function closePackageModal(): void {
    if (busy) {
      return;
    }
    setPackageModalOpen(false);
    if (urlPickSessionId === sessionId) {
      replaceSearchParams(clearBookPackageSessionQuery);
    }
  }

  function closePurchaseModal(): void {
    setPurchaseModalOpen(false);
    clearCachedPurchase(sessionId);
    if (urlBuySessionId === sessionId) {
      replaceSearchParams(clearBuyPackageSessionQuery);
    }
  }

  async function fetchEligiblePackages(): Promise<EligibleBookingPackage[]> {
    return apiFetch<EligibleBookingPackage[]>(
      `/bookings/sessions/${sessionId}/eligible-packages`,
    );
  }

  async function fetchPurchasePlans(): Promise<PackageSubscribePlanOption[]> {
    return apiFetch<PackageSubscribePlanOption[]>(
      `/bookings/sessions/${sessionId}/purchase-plans`,
    );
  }

  async function fetchFirstName(): Promise<string> {
    try {
      const me = await apiFetch<MeApiResponse>("/users/me");
      return me.user?.name?.trim() ?? "";
    } catch {
      return "";
    }
  }

  function applyPurchaseData(
    packages: readonly EligibleBookingPackage[],
    plans: readonly PackageSubscribePlanOption[],
    rawFirstName: string,
  ): void {
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
    writeCachedPurchase(sessionId, {
      plans: [...plans],
      notice,
      suggestedPlanId: suggested,
    });
  }

  /** Opens the drawer in one batch (slide-in animation) from already-fetched data. */
  function showPurchaseModal(
    packages: readonly EligibleBookingPackage[],
    plans: readonly PackageSubscribePlanOption[],
    rawFirstName: string,
  ): boolean {
    if (plans.length === 0) {
      onErrorRef.current?.(t("packageNoPurchasePlans"));
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
  }

  async function openPurchaseModal(
    packages: readonly EligibleBookingPackage[],
  ): Promise<void> {
    const [plans, rawFirstName] = await Promise.all([
      fetchPurchasePlans(),
      fetchFirstName(),
    ]);
    if (plans.length === 0) {
      onErrorRef.current?.(t("packageNoPurchasePlans"));
      replaceSearchParams(clearBuyPackageSessionQuery);
      return;
    }
    applyPurchaseData(packages, plans, rawFirstName);
    setPurchaseModalOpen(true);
  }

  async function bookWithOptionalPackage(userPackageId?: string): Promise<void> {
    const booking = await apiFetch<BookSessionResponse>(
      `/bookings/sessions/${sessionId}`,
      {
        method: "POST",
        body: JSON.stringify(
          userPackageId !== undefined ? { userPackageId } : {},
        ),
      },
    );
    onBookedRef.current?.(booking.id);
  }

  async function initiateBooking(): Promise<void> {
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
      onErrorRef.current?.(message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (urlPickSessionId !== sessionId) {
      return;
    }
    if (skipNextUrlRestoreRef.current) {
      skipNextUrlRestoreRef.current = false;
      return;
    }

    let cancelled = false;

    async function restorePackageModal(): Promise<void> {
      setBusy(true);
      try {
        const packages = await fetchEligiblePackages();
        if (cancelled) {
          return;
        }
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
        if (cancelled) {
          return;
        }
        replaceSearchParams(clearBookPackageSessionQuery);
        const message = error instanceof ApiError ? error.message : t("bookFailed");
        onErrorRef.current?.(message);
      } finally {
        if (!cancelled) {
          setBusy(false);
        }
      }
    }

    void restorePackageModal();

    return () => {
      cancelled = true;
    };
  }, [sessionId, urlPickSessionId, pathname, router, searchParams, t]);

  useEffect(() => {
    if (urlBuySessionId !== sessionId) {
      return;
    }
    if (skipNextBuyUrlRestoreRef.current) {
      skipNextBuyUrlRestoreRef.current = false;
      return;
    }

    let cancelled = false;
    const hasCachedData = initialCachedPurchase !== null;
    setPurchaseModalOpen(true);

    async function restorePurchaseModal(): Promise<void> {
      try {
        const [packages, plans, rawFirstName] = await Promise.all([
          fetchEligiblePackages(),
          fetchPurchasePlans(),
          fetchFirstName(),
        ]);
        if (cancelled) {
          return;
        }
        if (plans.length === 0) {
          onErrorRef.current?.(t("packageNoPurchasePlans"));
          setPurchaseModalOpen(false);
          clearCachedPurchase(sessionId);
          replaceSearchParams(clearBuyPackageSessionQuery);
          return;
        }
        applyPurchaseData(packages, plans, rawFirstName);
      } catch (error) {
        if (cancelled || hasCachedData) {
          return;
        }
        setPurchaseModalOpen(false);
        clearCachedPurchase(sessionId);
        replaceSearchParams(clearBuyPackageSessionQuery);
        const message = error instanceof ApiError ? error.message : t("bookFailed");
        onErrorRef.current?.(message);
      }
    }

    void restorePurchaseModal();

    return () => {
      cancelled = true;
    };
  }, [sessionId, urlBuySessionId, pathname, router, searchParams, t]);

  const packageModal =
    packageModalOpen ? (
      <BookingPackageSelectModal
        isOpen={packageModalOpen}
        sessionId={sessionId}
        eligiblePackages={eligiblePackages}
        locale={locale}
        onClose={closePackageModal}
        onBooked={(bookingId) => {
          setPackageModalOpen(false);
          replaceSearchParams(clearBookPackageSessionQuery);
          onBookedRef.current?.(bookingId);
        }}
        onError={(message) => onErrorRef.current?.(message)}
      />
    ) : null;

  const purchaseModal =
    purchaseModalOpen && purchasePlans.length > 0 ? (
      <BookingPackagePurchaseModal
        isOpen={purchaseModalOpen}
        locale={locale}
        plans={purchasePlans}
        initialPlanId={suggestedPlanId}
        notice={purchaseNotice}
        onClose={closePurchaseModal}
      />
    ) : null;

  const bookingModals = (
    <>
      {packageModal}
      {purchaseModal}
    </>
  );

  return {
    busy,
    initiateBooking,
    packageModal: bookingModals,
    purchaseModal,
    bookingModals,
  };
}

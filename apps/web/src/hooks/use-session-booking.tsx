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

type BookSessionResponse = {
  id: string;
};

type UseSessionBookingOptions = {
  sessionId: string;
  locale: string;
  onBooked?: (bookingId: string) => void;
  onError?: (message: string) => void;
};

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

  const [busy, setBusy] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [purchaseNotice, setPurchaseNotice] = useState<string>("");
  const [purchasePlans, setPurchasePlans] = useState<
    readonly PackageSubscribePlanOption[]
  >([]);
  const [suggestedPlanId, setSuggestedPlanId] = useState<string | undefined>();
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

  async function openPurchaseModal(
    packages: readonly EligibleBookingPackage[],
    options: { fromUrl?: boolean } = {},
  ): Promise<void> {
    const plans = await fetchPurchasePlans();
    if (plans.length === 0) {
      onErrorRef.current?.(t("packageNoPurchasePlans"));
      if (options.fromUrl) {
        replaceSearchParams(clearBuyPackageSessionQuery);
      }
      return;
    }
    const suggested =
      packages.find((pkg) => !pkg.canBook)?.planId ?? plans[0]?.id;
    const notice =
      packages.length === 0
        ? t("purchaseNoticeMissing")
        : t("purchaseNoticeDepleted");
    setPurchaseNotice(notice);
    setPurchasePlans(plans);
    setSuggestedPlanId(suggested);
    setPurchaseModalOpen(true);
    if (!options.fromUrl) {
      skipNextBuyUrlRestoreRef.current = true;
      replaceSearchParams((params) => {
        clearBookPackageSessionQuery(params);
        setBuyPackageSessionQuery(params, sessionId);
      });
    }
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
      const packages = await fetchEligiblePackages();
      if (shouldPromptBookingPackageSelection(packages)) {
        openPackageModal(packages);
        return;
      }
      if (!hasBookablePackage(packages)) {
        await openPurchaseModal(packages);
        return;
      }
      const autoPackageId = resolveAutoBookPackageId(packages);
      if (autoPackageId === undefined) {
        await openPurchaseModal(packages);
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

    async function restorePurchaseModal(): Promise<void> {
      setBusy(true);
      try {
        const packages = await fetchEligiblePackages();
        if (cancelled) {
          return;
        }
        await openPurchaseModal(packages, { fromUrl: true });
      } catch (error) {
        if (cancelled) {
          return;
        }
        replaceSearchParams(clearBuyPackageSessionQuery);
        const message = error instanceof ApiError ? error.message : t("bookFailed");
        onErrorRef.current?.(message);
      } finally {
        if (!cancelled) {
          setBusy(false);
        }
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

  const purchaseModal = purchaseModalOpen ? (
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
